{ Offline test fixture signer. No fiscal service, file path, or production
  command is exposed: synthetic PFX and XML enter through stdin only. }
program NativeRecoverySign;
{$mode objfpc}{$H+}{$codepage utf8}
uses {$IFDEF UNIX}cthreads,{$ENDIF}Classes,SysUtils,Math,fpjson,jsonparser,base64,DOM,XMLRead,
 ACBrNFe,ACBrDFeSSL,ACBrDFe.Conversao,OpenSSLExt;
const MaxInput=8*1024*1024;
var InputText,XML,SignedXML,DocType,DocName,InfoName,Err,Stage:string;
 InputJSON:TJSONData;Q,R:TJSONObject;M:TACBrNFe;D:TXMLDocument;
 Parser:TDOMParser;Source:TXMLInputSource;XMLStream:TStringStream;Node,Info,Selected:TDOMNode;C:Char;Valid,VerifyOnly:Boolean;

function TextValue(const Name:string):string;
var V:TJSONData;
begin
 V:=Q.Find(Name);if(V=nil)or(V.JSONType<>jtString)then raise Exception.Create('input');
 Result:=V.AsString;
end;

function Decode(const S:string;Limit:Integer):string;
begin
 if(S='')or(Length(S)>((Limit+2)div 3)*4)then raise Exception.Create('limit');
 Result:=DecodeStringBase64(S);
 if(Length(Result)>Limit)or(EncodeStringBase64(Result)<>S)then raise Exception.Create('base64');
end;

begin
 { Match the worker's IEEE environment before loading foreign C libraries. }
 SetExceptionMask([exInvalidOp,exDenormalized,exZeroDivide,exOverflow,exUnderflow,exPrecision]);
 SetTextCodePage(Input,65001);SetTextCodePage(Output,65001);
 M:=nil;D:=nil;InputJSON:=nil;R:=TJSONObject.Create;
 try
  try
   Stage:='entrada';
   InputText:='';
   while not EOF(Input)do begin
    Read(Input,C);if C=#10 then Break;if C=#13 then Continue;
    if Length(InputText)>=MaxInput then raise Exception.Create('limit');InputText:=InputText+C;
   end;
   InputJSON:=GetJSON(InputText);if InputJSON.JSONType<>jtObject then raise Exception.Create('input');Q:=TJSONObject(InputJSON);
   VerifyOnly:=False;
   if Q.Find('verificarOnly')<>nil then begin
    if Q.Find('verificarOnly').JSONType<>jtBoolean then raise Exception.Create('input');
    VerifyOnly:=Q.Find('verificarOnly').AsBoolean;
   end;
   DocType:='NFe';if Q.Find('documento')<>nil then DocType:=TextValue('documento');
   if(DocType<>'NFe')and(DocType<>'protNFe')then raise Exception.Create('scope');
   XML:=Decode(TextValue('xmlBase64'),4*1024*1024);
   Stage:='xml';
   if(Pos('<!DOCTYPE',UpperCase(XML))>0)or(Pos('<!ENTITY',UpperCase(XML))>0)or(Pos(#0,XML)>0)then raise Exception.Create('xml');
   Stage:='xml_parse';
   Parser:=TDOMParser.Create;XMLStream:=TStringStream.Create(XML);Source:=TXMLInputSource.Create(XMLStream);
   try
    Parser.Options.Namespaces:=True;Parser.Options.DisallowDoctype:=True;
    Parser.Options.ExpandEntities:=False;Parser.Options.MaxChars:=4*1024*1024;Parser.Parse(Source,D);
   finally Source.Free;XMLStream.Free;Parser.Free;end;
   Stage:='xml_raiz';
   Node:=D.DocumentElement;
   if VerifyOnly and(DocType='NFe')and(UTF8Encode(Node.LocalName)='nfeProc')then begin
    if UTF8Encode(Node.NamespaceURI)<>'http://www.portalfiscal.inf.br/nfe'then raise Exception.Create('root');
    Selected:=nil;Node:=Node.FirstChild;
    while Node<>nil do begin
     if(Node.NodeType=ELEMENT_NODE)and(UTF8Encode(Node.LocalName)='NFe')and(UTF8Encode(Node.NamespaceURI)='http://www.portalfiscal.inf.br/nfe')then begin
      if Selected<>nil then raise Exception.Create('duplicate');Selected:=Node;
     end;
     Node:=Node.NextSibling;
    end;
    if Selected=nil then raise Exception.Create('root');Node:=Selected;
   end;
   if(UTF8Encode(Node.LocalName)<>DocType)or(UTF8Encode(Node.NamespaceURI)<>'http://www.portalfiscal.inf.br/nfe')then raise Exception.Create('root');
   DocName:=UTF8Encode(Node.NodeName);Info:=nil;
   Stage:='xml_inf';
   if DocType='NFe'then InfoName:='infNFe'else InfoName:='infProt';
   Node:=Node.FirstChild;
   while Node<>nil do begin
    if(Node.NodeType=ELEMENT_NODE)and(UTF8Encode(Node.LocalName)=InfoName)then begin
     if Info<>nil then raise Exception.Create('duplicate');Info:=Node;
    end;
    Node:=Node.NextSibling;
   end;
   if Info=nil then raise Exception.Create('info');InfoName:=UTF8Encode(Info.NodeName);
   Stage:='xml_id';
   if Info.Attributes.GetNamedItem('Id')=nil then raise Exception.Create('id');
   Stage:='openssl';
   M:=TACBrNFe.Create(nil);
   M.Configuracoes.Geral.SSLLib:=libOpenSSL;M.Configuracoes.Geral.SSLCryptLib:=cryOpenSSL;
   M.Configuracoes.Geral.SSLHttpLib:=httpOpenSSL;M.Configuracoes.Geral.SSLXmlSignLib:=xsLibXml2;
   M.Configuracoes.Geral.Salvar:=False;M.Configuracoes.Arquivos.Salvar:=False;
   if not OpenSSLExt.InitSSLInterface then raise Exception.Create('openssl');
   if OpenSSLExt.OSSL_PROVIDER_load(nil,'default')=nil then raise Exception.Create('provider');
   if VerifyOnly then SignedXML:=XML else begin
    Stage:='certificado';
    M.Configuracoes.Certificados.DadosPFX:=Decode(TextValue('pfxBase64'),2*1024*1024);
    M.Configuracoes.Certificados.Senha:=TextValue('senha');M.SSL.CarregarCertificado;
    Stage:='assinar';
    SignedXML:=M.SSL.Assinar(XML,DocName,InfoName);
   end;
   Stage:='verificar';
   Valid:=M.SSL.VerificarAssinatura(SignedXML,Err,InfoName);
   if not VerifyOnly and not Valid then begin
    if Pos('DIGESTVALUE',UpperCase(Err))>0 then Stage:='verificar_digest'else Stage:='verificar_assinatura';
    raise Exception.Create('signature');
   end;
   if not VerifyOnly then R.Add('xmlBase64',EncodeStringBase64(SignedXML));R.Add('assinaturaValida',Valid);
  except
   R.Clear;R.Add('codigo','FIXTURE_ASSINATURA_FALHOU');R.Add('assinaturaValida',False);R.Add('etapa',Stage);
  end;
  WriteLn(R.AsJSON);
 finally M.Free;D.Free;InputJSON.Free;R.Free;end;
end.
