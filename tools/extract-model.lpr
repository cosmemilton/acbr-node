program ExtractModel;
{$mode objfpc}{$H+}
uses Classes, SysUtils, Contnrs, fpjson, PScanner, PParser, PasTree;
type
  TContainer = class(TPasTreeContainer)
    function CreateElement(C: TPTreeElement; const N: string; P: TPasElement;
      V: TPasMemberVisibility; const F: string; L: Integer): TPasElement; override;
    function FindElement(const N: string): TPasElement; override;
  end;
function TContainer.CreateElement(C: TPTreeElement; const N: string; P: TPasElement;
  V: TPasMemberVisibility; const F: string; L: Integer): TPasElement;
begin Result:=C.Create(N,P); Result.Visibility:=V; Result.SourceFilename:=F; Result.SourceLinenumber:=L end;
function TContainer.FindElement(const N: string): TPasElement;
begin Result:=nil end;
var Root,IncDir:string; Files,Queue,Seen:TStringList; Modules:TObjectList; Units:TJSONArray;
procedure IndexDir(const D:string);
var S:TSearchRec; F:string;
begin
  if FindFirst(IncludeTrailingPathDelimiter(D)+'*',faAnyFile,S)=0 then begin
    repeat
      if (S.Name='.') or (S.Name='..') then continue;
      F:=IncludeTrailingPathDelimiter(D)+S.Name;
      if (S.Attr and faDirectory)<>0 then IndexDir(F)
      else if SameText(ExtractFileExt(F),'.pas') or SameText(ExtractFileExt(F),'.pp') then
        Files.Values[LowerCase(ChangeFileExt(S.Name,''))]:=F;
    until FindNext(S)<>0; FindClose(S);
  end;
end;
function TypeName(T:TPasType):string;
begin if T=nil then Result:='' else Result:=T.Name end;
function Expr(E:TPasExpr):string;
begin if E=nil then Result:='' else Result:=E.GetDeclaration(true) end;
function PublicMember(E:TPasElement):boolean;
begin Result:=E.Visibility in [visDefault,visPublic,visPublished] end;
function Node(E:TPasElement):TJSONObject;
var A,B:TJSONArray; C:TPasClassType; P:TPasProperty; I:integer; M:TPasElement; O:TJSONObject;
begin
  Result:=TJSONObject.Create(['name',E.Name,'line',E.SourceLinenumber]);
  if E is TPasClassType then begin
    C:=TPasClassType(E); Result.Add('kind','class'); Result.Add('ancestor',TypeName(C.AncestorType));
    A:=TJSONArray.Create; B:=TJSONArray.Create; Result.Add('properties',A);Result.Add('methods',B);
    for I:=0 to C.Members.Count-1 do begin
      M:=TPasElement(C.Members[I]); if not PublicMember(M) then continue;
      if M is TPasProperty then begin
        P:=TPasProperty(M);
        O:=TJSONObject.Create(['name',P.Name,'type',TypeName(P.VarType),'indexed',P.Args.Count>0,
          'readable',Assigned(P.ReadAccessor) or (P.ReadAccessorName<>''),'writable',Assigned(P.WriteAccessor) or (P.WriteAccessorName<>''),
          'default',P.DefaultValue,'line',P.SourceLinenumber]); A.Add(O);
      end else if M is TPasProcedure then begin
        O:=TJSONObject.Create(['name',M.Name,'result','','arguments',TPasProcedure(M).ProcType.Args.Count]);
        if TPasProcedure(M).ProcType is TPasFunctionType then
          O.Strings['result']:=TypeName(TPasFunctionType(TPasProcedure(M).ProcType).ResultEl.ResultType);
        B.Add(O);
      end;
    end;
  end else if E is TPasEnumType then begin
    Result.Add('kind','enum'); A:=TJSONArray.Create;Result.Add('values',A);
    for I:=0 to TPasEnumType(E).Values.Count-1 do begin
      M:=TPasElement(TPasEnumType(E).Values[I]);
      A.Add(TJSONObject.Create(['name',M.Name,'assigned',TPasEnumValue(M).AssignedValue]));
    end;
  end else if E is TPasAliasType then begin
    Result.Add('kind','alias');Result.Add('target',TypeName(TPasAliasType(E).DestType));
  end else if E is TPasRangeType then begin
    Result.Add('kind','range');Result.Add('min',TPasRangeType(E).RangeStart);Result.Add('max',TPasRangeType(E).RangeEnd);
  end else if E is TPasType then begin
    Result.Add('kind','unsupported');Result.Add('declarationKind',E.ClassName);
  end else begin Result.Free; Result:=nil end;
end;
procedure ParseUnitFile(const N:string);
var F:string; R:TFileResolver; S:TPascalScanner; P:TPasParser; C:TContainer;
    M:TPasModule; U:TJSONObject; A,B:TJSONArray; I:integer; O:TJSONObject; E:TPasElement;
begin
  if Seen.IndexOf(LowerCase(N))>=0 then exit;Seen.Add(LowerCase(N));
  F:=Files.Values[LowerCase(N)];if F='' then exit;
  R:=TFileResolver.Create; S:=nil;P:=nil;C:=nil;M:=nil;
  try
    R.BaseDirectory:=ExtractFilePath(F);R.AddIncludePath(IncDir);R.AddIncludePath(ExtractFilePath(F));
    S:=TPascalScanner.Create(R); S.AddDefine('FPC');S.AddDefine('FPK');
    if SameText(ParamStr(3),'win64') then begin S.AddDefine('MSWINDOWS');S.AddDefine('WINDOWS');S.AddDefine('WIN64') end
    else begin S.AddDefine('LINUX');S.AddDefine('UNIX') end;
    S.AddDefine('CPUX86_64');S.AddDefine('CPU64');S.AddMacro('FPC_FULLVERSION','30202');S.AddDefine('VER3_2');S.AddDefine('NOGUI');S.AddDefine('NOREPORT');
    S.OpenFile(F);C:=TContainer.Create;P:=TPasParser.Create(S,R,C);
    P.Options:=P.Options+[po_IgnoreUnknownResource,po_NoOverloadedProcs,po_AsmWhole];
    P.ParseMain(M);Modules.Add(M);
    U:=TJSONObject.Create(['name',M.Name,'file',Copy(F,Length(Root)+2,MaxInt)]);
    A:=TJSONArray.Create;B:=TJSONArray.Create;U.Add('uses',A);U.Add('types',B);
    for I:=0 to High(M.InterfaceSection.UsesClause) do begin
      E:=M.InterfaceSection.UsesClause[I]; A.Add(E.Name);
      if not SameText(E.Name,'ACBrBase') and not (Pos('ACBrUtil.',E.Name)=1) then Queue.Add(E.Name);
    end;
    for I:=0 to M.InterfaceSection.Types.Count-1 do begin
      O:=Node(TPasElement(M.InterfaceSection.Types[I]));if O<>nil then B.Add(O);
    end;
    for I:=0 to M.InterfaceSection.Classes.Count-1 do begin
      O:=Node(TPasElement(M.InterfaceSection.Classes[I]));if O<>nil then B.Add(O);
    end;
    Units.Add(U);
  except on Ex:Exception do begin
    WriteLn(StdErr,'Cannot parse ',F,': ',Ex.Message);Halt(2);
  end end;
  P.Free;S.Free;C.Free;R.Free;
end;
var I:integer; Output:TJSONObject; OutText:TStringList;
begin
  if ParamCount<2 then begin WriteLn(StdErr,'Usage: extract-model SOURCE_ROOT OUTPUT_JSON');Halt(1) end;
  Root:=ExcludeTrailingPathDelimiter(ExpandFileName(ParamStr(1)));
  IncDir:=Root+'/Fontes/ACBrComum';
  Files:=TStringList.Create;Files.CaseSensitive:=false;Queue:=TStringList.Create;
  Seen:=TStringList.Create;Modules:=TObjectList.Create(true);Units:=TJSONArray.Create;
  try
    IndexDir(Root+'/Fontes');Queue.Add('ACBrNFe.Classes');I:=0;
    while I<Queue.Count do begin ParseUnitFile(Queue[I]);Inc(I) end;
    if Units.Count=0 then raise Exception.Create('ACBrNFe.Classes source was not found');
    Output:=TJSONObject.Create(['schemaVersion',1,'root','TNFe']);Output.Add('units',Units);
    OutText:=TStringList.Create;OutText.Text:=Output.FormatJSON;OutText.SaveToFile(ParamStr(2));
    OutText.Free;Output.Free;
  finally Modules.Free;Seen.Free;Queue.Free;Files.Free end;
end.
