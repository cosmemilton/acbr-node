program NativeTLSProbe;
{$mode objfpc}{$H+}{$codepage utf8}
uses {$IFDEF UNIX}cthreads,{$ENDIF}SysUtils,Classes,fpjson,jsonparser,blcksock,NativeTLS;
var Q:TJSONObject;S:TTCPBlockSocket;Line,CA:string;OK:Boolean;
begin
 SetTextCodePage(Input,65001);SetTextCodePage(Output,65001);ReadLn(Line);Q:=TJSONObject(GetJSON(Line,True));S:=nil;OK:=False;
 try
  CA:=Q.Get('caFile','');ConfigurarTLS(CA);S:=TTCPBlockSocket.Create;S.ConnectionTimeout:=5000;S.SetTimeout(5000);S.Connect('127.0.0.1',Q.Get('port',''));
  if S.LastError=0 then begin S.SSL.SNIHost:=Q.Get('host','localhost');S.SSLDoConnect;OK:=S.LastError=0;if OK then S.SendString('SYNTHETIC-OFFLINE-PROBE');end;
  if OK then WriteLn('{"accepted":true}')else WriteLn('{"accepted":false}');Flush(Output);
 finally S.Free;Q.Free;LimparTLS;end;
end.
