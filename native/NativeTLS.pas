unit NativeTLS;
{$mode objfpc}{$H+}{$codepage utf8}
interface
procedure ConfigurarTLS(const CAFile:string='');
procedure LimparTLS;
function TLSRecusouServidor:Boolean;
implementation
uses Classes,SysUtils,Dynlibs,blcksock,ssl_openssl,ssl_openssl_lib,NativeErrors
{$IFDEF MSWINDOWS},Windows,ACBr_WinCrypt,base64{$ENDIF};
type
 TSecureOpenSSL=class(TSSLOpenSSL)
 public constructor Create(const Value:TTCPBlockSocket);override;
 function Connect:Boolean;override;
 end;
 TCheckHost=function(Cert:PX509;Name:PAnsiChar;Len:PtrUInt;Flags:Cardinal;PeerName:Pointer):Integer;cdecl;
var TrustedCA:string='';TemporaryCA:string='';Rejected:Boolean=False;
function TLSRecusouServidor:Boolean;
begin Result:=Rejected;end;
{$IFDEF MSWINDOWS}
function EnumStoreCertificate(Store:HCERTSTORE;Prev:PCCERT_CONTEXT):PCCERT_CONTEXT;stdcall;external 'crypt32.dll' name 'CertEnumCertificatesInStore';
function WindowsRoots:string;
var Store:HCERTSTORE;Cert:PCCERT_CONTEXT;Pem,Der:RawByteString;Stream:TFileStream;
begin
 Store:=CertOpenSystemStore(0,'ROOT');if Store=nil then Falhar('TLS_CONFIG_INVALIDA','Trust store do Windows indisponível.');
 Pem:='';Cert:=nil;
 try
  repeat Cert:=EnumStoreCertificate(Store,Cert);if Cert=nil then Break;SetString(Der,PAnsiChar(Cert^.pbCertEncoded),Cert^.cbCertEncoded);Pem:=Pem+'-----BEGIN CERTIFICATE-----'+#10+EncodeStringBase64(Der)+#10+'-----END CERTIFICATE-----'+#10;until False;
 finally CertCloseStore(Store,0);end;
 if Pem=''then Falhar('TLS_CONFIG_INVALIDA','Trust store do Windows vazio.');
 TemporaryCA:=SysUtils.GetTempFileName(SysUtils.GetTempDir(False),'acb');
 Stream:=TFileStream.Create(TemporaryCA,fmCreate or fmShareExclusive);
 try Stream.WriteBuffer(Pem[1],Length(Pem));finally Stream.Free;end;
 Result:=TemporaryCA;
end;
{$ENDIF}
procedure ConfigurarTLS(const CAFile:string);
begin
 Rejected:=False;TrustedCA:=CAFile;
 if TrustedCA=''then begin
 {$IFDEF MSWINDOWS}TrustedCA:=WindowsRoots;{$ELSE}
 if SysUtils.FileExists('/etc/ssl/certs/ca-certificates.crt')then TrustedCA:='/etc/ssl/certs/ca-certificates.crt'
 else if SysUtils.FileExists('/etc/pki/tls/certs/ca-bundle.crt')then TrustedCA:='/etc/pki/tls/certs/ca-bundle.crt'
 else if SysUtils.FileExists('/etc/ssl/ca-bundle.pem')then TrustedCA:='/etc/ssl/ca-bundle.pem';
 {$ENDIF}
 end;
 if(TrustedCA='')or not SysUtils.FileExists(TrustedCA)then Falhar('TLS_CONFIG_INVALIDA','Bundle de autoridades confiáveis indisponível.');
 SSLImplementation:=TSecureOpenSSL;
end;
procedure LimparTLS;
begin if TemporaryCA<>''then begin SysUtils.DeleteFile(TemporaryCA);TemporaryCA:='';end;end;
constructor TSecureOpenSSL.Create(const Value:TTCPBlockSocket);
begin inherited Create(Value);VerifyCert:=True;CertCAFile:=TrustedCA;AllowUnsafeLegacyRenegotiation:=False;SSLType:=LT_TLSv1_2;end;
function TSecureOpenSSL.Connect:Boolean;
var Peer:PX509;CheckHost:TCheckHost;
begin
 Result:=False;VerifyCert:=True;CertCAFile:=TrustedCA;AllowUnsafeLegacyRenegotiation:=False;SSLType:=LT_TLSv1_2;
 if(SNIHost='')or(Pos(#0,SNIHost)>0)or(TrustedCA='')then begin Rejected:=True;Exit;end;
 try
  Result:=inherited Connect;
  if not Result then begin Rejected:=True;Exit;end;
  Peer:=SslGetPeerCertificate(FSsl);
  try
   Pointer(CheckHost):=GetProcedureAddress(TLibHandle(SSLUtilHandle),'X509_check_host');
   Result:=(Peer<>nil)and Assigned(CheckHost)and(GetVerifyCert=0);
   if Result then Result:=CheckHost(Peer,PAnsiChar(AnsiString(SNIHost)),Length(SNIHost),0,nil)=1;
  finally if Peer<>nil then X509Free(Peer);end;
 except Result:=False;end;
 if not Result then begin Rejected:=True;DeInit;FLastError:=-1;FLastErrorDesc:='TLS do servidor recusado.';end;
end;
end.
