unit NativeRecovery;
{$mode objfpc}{$H+}{$codepage utf8}
interface

function ChaveAlvoRecuperacao(const XML:string):string;
procedure InspecionarAlvoRecuperacao(const XML,Key:string;out Documento,Digest:string);
procedure InspecionarConsultaRecuperacao(const XML,Key,Digest:string;
 Ambiente,UFCodigo:Integer;out Code:Integer;out Motivo,Protocolo,XMLProtocolo:string);
function ComporRecuperacao(const Documento,XMLProtocolo:string):string;
procedure ConferirRecuperacao(const XML,Documento,XMLProtocolo:string);

implementation
uses Classes,SysUtils,DOM,XMLRead,NativeErrors;

const NFeNS='http://www.portalfiscal.inf.br/nfe';
 DSigNS='http://www.w3.org/2000/09/xmldsig#';
 MaxXMLBytes=4*1024*1024;

function Nome(N:TDOMNode):string;
begin Result:=UTF8Encode(N.LocalName);if Result=''then Result:=UTF8Encode(N.NodeName);end;

function Atributo(N:TDOMNode;const Name:string):string;
var A:TDOMNode;
begin Result:='';if N.Attributes=nil then Exit;A:=N.Attributes.GetNamedItem(UTF8Decode(Name));if A<>nil then Result:=UTF8Encode(A.NodeValue);end;

procedure Invalido;
begin Falhar('RETORNO_INVALIDO','XML fiscal de recuperacao invalido.');end;

procedure Seguro(const XML:string);
var U:string;
begin
 U:=UpperCase(XML);
 if(XML='')or(Length(XML)>MaxXMLBytes)or(Pos(#0,XML)>0)or
  (Pos('<!DOCTYPE',U)>0)or(Pos('<!ENTITY',U)>0)then Invalido;
 if UTF8Encode(UTF8Decode(XML))<>XML then Invalido;
end;

function Ler(const XML:string):TXMLDocument;
var S:TStringStream;Parser:TDOMParser;Source:TXMLInputSource;
begin
 Seguro(XML);Result:=nil;S:=TStringStream.Create(XML);Parser:=TDOMParser.Create;Source:=TXMLInputSource.Create(S);
 try
  Parser.Options.Namespaces:=True;Parser.Options.DisallowDoctype:=True;
  Parser.Options.ExpandEntities:=False;Parser.Options.MaxChars:=MaxXMLBytes;
  try Parser.Parse(Source,Result);except Result.Free;Result:=nil;Invalido;end;
 finally Source.Free;Parser.Free;S.Free;end;
 if(Result=nil)or(Result.DocumentElement=nil)then begin Result.Free;Invalido;end;
end;

procedure Raiz(D:TXMLDocument;const Name,Version:string);
begin
 if(Nome(D.DocumentElement)<>Name)or(UTF8Encode(D.DocumentElement.NamespaceURI)<>NFeNS)or
  ((Version<>'')and(Atributo(D.DocumentElement,'versao')<>Version))then Invalido;
end;

function Filho(N:TDOMNode;const Name,NS:string;Required:Boolean=True):TDOMNode;
var C:TDOMNode;
begin
 Result:=nil;C:=N.FirstChild;
 while C<>nil do begin
  if(C.NodeType=ELEMENT_NODE)and(Nome(C)=Name)then begin
   if(Result<>nil)or(UTF8Encode(C.NamespaceURI)<>NS)then Invalido;Result:=C;
  end;
  C:=C.NextSibling;
 end;
 if Required and(Result=nil)then Invalido;
end;

function Valor(N:TDOMNode;const Name:string;Required:Boolean=True):string;
var C,V:TDOMNode;
begin
 C:=Filho(N,Name,NFeNS,Required);Result:='';
 if C<>nil then begin
  V:=C.FirstChild;while V<>nil do begin if V.NodeType=ELEMENT_NODE then Invalido;V:=V.NextSibling;end;
  Result:=UTF8Encode(C.TextContent);
  if Required and(Result='')then Invalido;
 end;
end;

procedure SemEnvelope(N:TDOMNode;Depth:Integer=0);
var C:TDOMNode;S:string;
begin
 if Depth>128 then Invalido;
 C:=N.FirstChild;
 while C<>nil do begin
  if C.NodeType=ELEMENT_NODE then begin
   S:=Nome(C);
   if(S='NFe')or(S='nfeProc')or(S='protNFe')or(S='enviNFe')then Invalido;
   SemEnvelope(C,Depth+1);
  end;
  C:=C.NextSibling;
 end;
end;

function Branco(C:Char):Boolean;
begin Result:=C in[#9,#10,#13,' '];end;

{ The DOM establishes well-formedness, cardinality and namespaces. This scanner
  only locates byte ranges in that already parsed document; it never interprets
  fiscal values or rewrites signed content. }
function Fragmento(const XML,ChildName:string):string;
var I,J,K,Depth,Start,Last,RootStart,RootEnd,Count:Integer;
 Quote:Char;Tag,Local:string;Closing,Empty:Boolean;
begin
 I:=1;Depth:=0;Start:=0;Last:=0;RootStart:=0;RootEnd:=0;Count:=0;
 while I<=Length(XML)do begin
  if XML[I]<>'<'then begin Inc(I);Continue;end;
  if Copy(XML,I,4)='<!--'then begin
   J:=I+4;while(J<=Length(XML)-2)and(Copy(XML,J,3)<>'-->')do Inc(J);
   I:=J+3;Continue;
  end;
  if Copy(XML,I,9)='<![CDATA['then begin
   J:=I+9;while(J<=Length(XML)-2)and(Copy(XML,J,3)<>']]>')do Inc(J);
   I:=J+3;Continue;
  end;
  if Copy(XML,I,2)='<?'then begin
   J:=I+2;while(J<=Length(XML)-1)and(Copy(XML,J,2)<>'?>')do Inc(J);
   I:=J+2;Continue;
  end;
  J:=I+1;Quote:=#0;
  while J<=Length(XML)do begin
   if Quote<>#0 then begin if XML[J]=Quote then Quote:=#0;end
   else if XML[J]in['"',#39]then Quote:=XML[J]
   else if XML[J]='>'then Break;
   Inc(J);
  end;
  if J>Length(XML)then Invalido;
  K:=I+1;Closing:=XML[K]='/';if Closing then Inc(K);
  Tag:='';while(K<J)and not Branco(XML[K])and not(XML[K]in['/','>'])do begin Tag:=Tag+XML[K];Inc(K);end;
  Local:=Copy(Tag,Pos(':',Tag)+1,MaxInt);K:=J-1;
  while(K>I)and Branco(XML[K])do Dec(K);Empty:=XML[K]='/';
  if Closing then begin
   Dec(Depth);
   if(ChildName<>'')and(Depth=1)and(Start>0)and(Last=0)then Last:=J;
   if Depth=0 then RootEnd:=J;
  end else begin
   if Depth=0 then begin if RootStart<>0 then Invalido;RootStart:=I;end;
   if(ChildName<>'')and(Depth=1)and(Local=ChildName)then begin
    Inc(Count);if Count<>1 then Invalido;Start:=I;if Empty then Last:=J;
   end;
   if not Empty then Inc(Depth)else if Depth=0 then RootEnd:=J;
  end;
  I:=J+1;
 end;
 if ChildName=''then begin Start:=RootStart;Last:=RootEnd;end;
 if(Start=0)or(Last<Start)then Invalido;
 Result:=Copy(XML,Start,Last-Start+1);
end;

function Escapar(const S:string):string;
begin
 Result:=StringReplace(S,'&','&amp;',[rfReplaceAll]);
 Result:=StringReplace(Result,'"','&quot;',[rfReplaceAll]);
 Result:=StringReplace(Result,'<','&lt;',[rfReplaceAll]);
end;

function ProtocoloFechado(const XML:string;Root,Prot:TDOMNode):string;
var I,P:Integer;A:TDOMNode;Name,Extra:string;
begin
 Result:=Fragmento(XML,'protNFe');Extra:='';
 { A direct child can inherit namespace bindings from retConsSitNFe. Copy only
   those declarations, onto that protocol alone, so the NFe signature context
   cannot acquire new prefix bindings from the consultation. }
 for I:=0 to Root.Attributes.Length-1 do begin
  A:=Root.Attributes.Item[I];Name:=UTF8Encode(A.NodeName);
  if((Name='xmlns')or(Copy(Name,1,6)='xmlns:'))and(Atributo(Prot,Name)='')then
   Extra:=Extra+' '+Name+'="'+Escapar(UTF8Encode(A.NodeValue))+'"';
 end;
 if Extra<>''then begin
  P:=2;while(P<=Length(Result))and not Branco(Result[P])and not(Result[P]in['/','>'])do Inc(P);
  Insert(Extra,Result,P);
 end;
end;

function ChaveAlvoRecuperacao(const XML:string):string;
var D:TXMLDocument;Info:TDOMNode;Id:string;
begin
 D:=Ler(XML);
 try
  Raiz(D,'NFe','');SemEnvelope(D.DocumentElement);
  Info:=Filho(D.DocumentElement,'infNFe',NFeNS);Id:=Atributo(Info,'Id');
  if(Length(Id)<>47)or(Copy(Id,1,3)<>'NFe')then Invalido;
  Result:=Copy(Id,4,44);
 finally D.Free;end;
end;

procedure InspecionarAlvoRecuperacao(const XML,Key:string;out Documento,Digest:string);
var D:TXMLDocument;R,Info,Sig,SignedInfo,Ref,DigestNode,C:TDOMNode;
begin
 D:=Ler(XML);
 try
  Raiz(D,'NFe','');R:=D.DocumentElement;SemEnvelope(R);
  Info:=Filho(R,'infNFe',NFeNS);if(Atributo(Info,'Id')<>'NFe'+Key)or(Atributo(Info,'versao')<>'4.00')then Invalido;
  Sig:=Filho(R,'Signature',DSigNS,False);
  if Sig=nil then Falhar('XML_NAO_ASSINADO','Recuperacao exige a NFe original assinada.');
  C:=R.FirstChild;while C<>nil do begin
   if(C.NodeType=ELEMENT_NODE)and(C<>Info)and(C<>Sig)and(C<>Filho(R,'infNFeSupl',NFeNS,False))then Invalido;
   C:=C.NextSibling;
  end;
  SignedInfo:=Filho(Sig,'SignedInfo',DSigNS);Ref:=Filho(SignedInfo,'Reference',DSigNS);
  if Atributo(Ref,'URI')<>'#NFe'+Key then Falhar('ASSINATURA_INVALIDA','Assinatura nao referencia a NFe original.');
  DigestNode:=Filho(Ref,'DigestValue',DSigNS);Digest:=UTF8Encode(DigestNode.TextContent);
  if Digest=''then Falhar('ASSINATURA_INVALIDA','Assinatura fiscal sem digest.');
  Documento:=Fragmento(XML,'');
 finally D.Free;end;
end;

procedure InspecionarConsultaRecuperacao(const XML,Key,Digest:string;
 Ambiente,UFCodigo:Integer;out Code:Integer;out Motivo,Protocolo,XMLProtocolo:string);
var D:TXMLDocument;R,Prot,Info:TDOMNode;ReturnedDigest:string;I:Integer;
begin
 Protocolo:='';XMLProtocolo:='';D:=Ler(XML);
 try
  Raiz(D,'retConsSitNFe','4.00');R:=D.DocumentElement;
  if(Valor(R,'chNFe')<>Key)or(Valor(R,'tpAmb')<>IntToStr(Ambiente))or(Valor(R,'cUF')<>IntToStr(UFCodigo))then
   Falhar('IDENTIDADE_DIVERGENTE','Consulta retornou outro documento ou ambiente.');
  Code:=StrToIntDef(Valor(R,'cStat'),0);Motivo:=Valor(R,'xMotivo');
  Prot:=Filho(R,'protNFe',NFeNS,False);
  if Code<>100 then Exit;
  if(Filho(R,'retCancNFe',NFeNS,False)<>nil)or(Filho(R,'procEventoNFe',NFeNS,False)<>nil)then
   Falhar('RECUPERACAO_NAO_COMPROVADA','Consulta contem evento que exige analise separada.');
  if Prot=nil then Falhar('RECUPERACAO_NAO_COMPROVADA','Consulta autorizada sem protocolo completo.');
  if Atributo(Prot,'versao')<>'4.00'then Invalido;
  { The pinned signature verifier resolves SignedInfo globally. It cannot
    establish both signatures independently in a two-signature process. Do not
    return a process whose optional protocol signature has not been proved. }
  if Filho(Prot,'Signature',DSigNS,False)<>nil then
   Falhar('RECUPERACAO_NAO_COMPROVADA','Protocolo com assinatura adicional exige verificacao independente.');
  Info:=Filho(Prot,'infProt',NFeNS);
  if(Valor(Info,'chNFe')<>Key)or(Valor(Info,'tpAmb')<>IntToStr(Ambiente))or(Valor(Info,'cStat')<>'100')then
   Falhar('IDENTIDADE_DIVERGENTE','Protocolo retornou outro documento, ambiente ou situacao.');
  Protocolo:=Valor(Info,'nProt',False);
  if Length(Protocolo)<>15 then Falhar('RECUPERACAO_NAO_COMPROVADA','Consulta autorizada sem protocolo completo.');
  for I:=1 to Length(Protocolo)do if not(Protocolo[I]in['0'..'9'])then Invalido;
  ReturnedDigest:=Valor(Info,'digVal',False);
  if(ReturnedDigest='')or(Digest='')then Falhar('RECUPERACAO_NAO_COMPROVADA','Consulta sem digest para comprovar a NFe original.');
  if ReturnedDigest<>Digest then Falhar('IDENTIDADE_DIVERGENTE','Digest da consulta diverge da NFe original assinada.');
  XMLProtocolo:=ProtocoloFechado(XML,R,Prot);
 finally D.Free;end;
end;

function ComporRecuperacao(const Documento,XMLProtocolo:string):string;
var D:TXMLDocument;QName,Prefix,ProcessName,Declaration:string;P:Integer;
begin
 { Only a fixed process envelope is written here. Neither the signed NFe nor
   fiscal protocol fields are generated from scalar values. Reuse the NFe's
   namespace prefix: introducing a different binding on an ancestor can change
   inclusive canonicalization even while all signed source bytes stay equal. }
 D:=Ler(Documento);
 try
  Raiz(D,'NFe','');QName:=UTF8Encode(D.DocumentElement.NodeName);P:=Pos(':',QName);
  Prefix:='';if P>0 then Prefix:=Copy(QName,1,P-1);
  ProcessName:='nfeProc';Declaration:='xmlns';
  if Prefix<>''then begin ProcessName:=Prefix+':nfeProc';Declaration:=Declaration+':'+Prefix;end;
  Result:='<?xml version="1.0" encoding="UTF-8"?><'+ProcessName+' '+Declaration+'="'+NFeNS+'" versao="4.00">'+Documento+XMLProtocolo+'</'+ProcessName+'>';
 finally D.Free;end;
 if Length(Result)>MaxXMLBytes then Invalido;
end;

procedure ConferirRecuperacao(const XML,Documento,XMLProtocolo:string);
var D:TXMLDocument;R,C,N,P:TDOMNode;
begin
 D:=Ler(XML);
 try
  Raiz(D,'nfeProc','4.00');R:=D.DocumentElement;
  N:=Filho(R,'NFe',NFeNS);P:=Filho(R,'protNFe',NFeNS);
  C:=R.FirstChild;while C<>nil do begin
   if(C.NodeType=ELEMENT_NODE)and(C<>N)and(C<>P)then Invalido;C:=C.NextSibling;
  end;
  if(Fragmento(XML,'NFe')<>Documento)or(Fragmento(XML,'protNFe')<>XMLProtocolo)then
   Falhar('XML_ALTERADO','Recuperacao alterou o documento ou protocolo original.');
 finally D.Free;end;
end;
end.
