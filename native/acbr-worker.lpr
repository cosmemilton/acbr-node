program AcbrWorker;
{$mode objfpc}{$H+}{$codepage utf8}
{$IFDEF MSWINDOWS}{$APPTYPE CONSOLE}{$ENDIF}
uses {$IFDEF UNIX}cthreads,{$ENDIF}
 Classes,SysUtils,Math,fpjson,jsonparser,AcbrModels,NativeProtocol,NativeParent,NativeMotor,NativeTLS;
var D:TJSONData;R:TJSONObject;Id,Line:string;
begin
 { Foreign C libraries use the platform's default masked IEEE exceptions. }
 SetExceptionMask([exInvalidOp,exDenormalized,exZeroDivide,exOverflow,exUnderflow,exPrecision]);
 SetTextCodePage(Input,65001);SetTextCodePage(Output,65001);
 D:=nil;R:=TJSONObject.Create;
 R.Add('versao',1);R.Add('id','');R.Add('sourceRevision',SourceRevision);R.Add('contractHash',ContractHash);R.Add('sucesso',False);R.Add('estado','ERRO');R.Add('envioIniciado',False);
 try
  try
   VigiarPai;Line:=LerLinha;
   try D:=GetJSON(Line,True);except Falhar('REQUISICAO_INVALIDA','JSON inválido.');end;
   Line:='';if D.JSONType<>jtObject then Falhar('REQUISICAO_INVALIDA','Objeto JSON obrigatório.');
   Id:=Texto(TJSONObject(D),'id');R.Strings['id']:=Id;
   ValidarEntrada(TJSONObject(D));Executar(TJSONObject(D),R);
  except
   on E:EFiscal do begin R.Booleans['sucesso']:=False;R.Strings['estado']:='ERRO';DefinirTexto(R,'codigo',E.Codigo);DefinirTexto(R,'xMotivo',E.Message);end;
   on E:Exception do begin R.Booleans['sucesso']:=False;R.Strings['estado']:='ERRO';DefinirTexto(R,'codigo','FALHA_MOTOR');DefinirTexto(R,'xMotivo','Não foi possível concluir a operação fiscal.');end;
  end;
  WriteLn(R.AsJSON);Flush(Output);
 finally D.Free;R.Free;LimparTLS;end;
end.
