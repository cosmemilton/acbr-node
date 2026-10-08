unit NativeMotor;
{$mode objfpc}{$H+}{$codepage utf8}
interface
uses fpjson;
procedure Executar(Q,R:TJSONObject);
implementation
uses Classes,SysUtils,DateUtils,base64,ACBrNFe,ACBrDFeSSL,ACBrNFeNotasFiscais,
 ACBrDFe.Conversao,pcnConversao,pcnConversaoNFe,ACBrUtil.Strings,
 AcbrModels,NativeProtocol,NativeTLS,OpenSSLExt,ACBrDFeComum.RetEnvio,ACBrNFe.RetInut;
procedure Estado(R:TJSONObject;const S:string);
begin R.Strings['estado']:=S;R.Booleans['sucesso']:=not(S='ERRO')and not(S='REJEITADO')and not(S='PENDENTE')and not(S='INDETERMINADO')and not(S='DENEGADO');end;
procedure ChaveValida(const Key:string;C:TJSONObject;M:TACBrNFe);
var I,Sum,Weight,DV:Integer;
begin
 if Length(Key)<>44 then Falhar('IDENTIDADE_DIVERGENTE','Chave fiscal inválida.');
 for I:=1 to 44 do if not(Key[I]in['0'..'9'])then Falhar('IDENTIDADE_DIVERGENTE','Chave fiscal inválida.');
 Sum:=0;Weight:=2;for I:=43 downto 1 do begin Inc(Sum,(Ord(Key[I])-Ord('0'))*Weight);Inc(Weight);if Weight=10 then Weight:=2;end;DV:=11-(Sum mod 11);if DV>9 then DV:=0;
 if DV<>Ord(Key[44])-Ord('0')then Falhar('IDENTIDADE_DIVERGENTE','Digito verificador da chave fiscal invalido.');
 if(Copy(Key,7,14)<>Texto(C,'cnpj'))or(StrToIntDef(Copy(Key,1,2),0)<>M.Configuracoes.WebServices.UFCodigo)or(StrToIntDef(Copy(Key,21,2),0)<>Inteiro(C,'modelo'))then Falhar('IDENTIDADE_DIVERGENTE','Chave divergente do emitente, modelo ou UF.');
end;
procedure Identidade(M:TACBrNFe;C:TJSONObject);
begin
 with M.NotasFiscais.Items[0].NFe do
 if(Emit.CNPJCPF<>Texto(C,'cnpj'))or(Ide.modelo<>Inteiro(C,'modelo'))or(Ide.tpAmb<>M.Configuracoes.WebServices.Ambiente)or(Ide.cUF<>M.Configuracoes.WebServices.UFCodigo)or(Ide.tpEmis<>teNormal)or(Abs(infNFe.Versao-4.0)>0.001)then Falhar('IDENTIDADE_DIVERGENTE','Documento divergente da configuração fiscal.');
end;
{$IFDEF ACBR_NODE_TEST}
function TestServices:string;
var Lines:TStringList;I,P:Integer;Value:string;
begin
 Result:=GetEnvironmentVariable('ACBR_NODE_TEST_SERVICES');
 if(Result='')or not FileExists(Result)then Falhar('TEST_CONFIG_INVALIDA','Servicos locais de teste obrigatorios.');
 Lines:=TStringList.Create;
 try
  Lines.LoadFromFile(Result);
  for I:=0 to Lines.Count-1 do begin
   P:=Pos('=',Lines[I]);if P=0 then Continue;Value:=LowerCase(Trim(Copy(Lines[I],P+1,MaxInt)));
   if (Pos('://',Value)>0)and(Pos('https://localhost:',Value)<>1)then Falhar('TEST_CONFIG_INVALIDA','A variante de testes aceita apenas HTTPS localhost.');
  end;
 finally Lines.Free;end;
end;
{$ENDIF}
procedure Configurar(M:TACBrNFe;Q:TJSONObject;const Base:string);
var C,Cert,CSC:TJSONObject;Cmd,CNPJCert:string;
begin
 C:=Objeto(Q,'config');Cmd:=Texto(Q,'comando');
 if not FileExists(Base+'schemas/nfe_v4.00.xsd')then Falhar('SCHEMAS_AUSENTES','Schemas fiscais indisponíveis.');
 if not FileExists(Base+'ACBrNFeServicos.ini')then Falhar('SERVICOS_AUSENTES','Serviços fiscais indisponíveis.');
 M.Configuracoes.Geral.SSLLib:=libOpenSSL;M.Configuracoes.Geral.SSLCryptLib:=cryOpenSSL;M.Configuracoes.Geral.SSLHttpLib:=httpOpenSSL;M.Configuracoes.Geral.SSLXmlSignLib:=xsLibXml2;
 M.Configuracoes.Geral.Salvar:=False;M.Configuracoes.Geral.VersaoDF:=ve400;M.Configuracoes.Geral.FormaEmissao:=teNormal;M.Configuracoes.Geral.ValidarDigest:=True;M.Configuracoes.Geral.RetirarAcentos:=False;
 if Inteiro(C,'modelo')=65 then M.Configuracoes.Geral.ModeloDF:=moNFCe else M.Configuracoes.Geral.ModeloDF:=moNFe;
 if Inteiro(C,'ambiente')=1 then M.Configuracoes.WebServices.Ambiente:=taProducao else M.Configuracoes.WebServices.Ambiente:=taHomologacao;
 M.Configuracoes.WebServices.UF:=Texto(C,'uf');M.Configuracoes.WebServices.TimeOut:=60000;M.Configuracoes.WebServices.TimeOutPorThread:=False;M.Configuracoes.WebServices.Tentativas:=1;M.Configuracoes.WebServices.AguardarConsultaRet:=0;M.Configuracoes.WebServices.Salvar:=False;
 M.Configuracoes.Arquivos.Salvar:=False;M.Configuracoes.Arquivos.SalvarEvento:=False;M.Configuracoes.Arquivos.PathSchemas:=Base+'schemas';M.Configuracoes.Arquivos.IniServicos:=Base+'ACBrNFeServicos.ini';
 {$IFDEF ACBR_NODE_TEST}
 M.Configuracoes.Arquivos.IniServicos:=TestServices;
 M.Configuracoes.WebServices.TimeOut:=1000;
 {$ENDIF}
 if C.Find('csc')<>nil then begin CSC:=Objeto(C,'csc');M.Configuracoes.Geral.IdCSC:=Texto(CSC,'id');M.Configuracoes.Geral.CSC:=Texto(CSC,'valor');end;
 if(Cmd<>'gerarXml')and(Cmd<>'validar')then begin
  Cert:=Objeto(C,'certificado');M.Configuracoes.Certificados.DadosPFX:=Decodificar(Texto(Cert,'pfxBase64'),2*1024*1024);M.Configuracoes.Certificados.Senha:=Texto(Cert,'senha',False);
  try
   M.SSL.CarregarCertificado;CNPJCert:=OnlyNumber(M.SSL.CertCNPJ);
   if(Length(CNPJCert)<>14)or(Copy(CNPJCert,1,8)<>Copy(Texto(C,'cnpj'),1,8))then Falhar('CERTIFICADO_DIVERGENTE','Certificado não corresponde à raiz CNPJ do emitente.');
   if(M.SSL.CertTipo<>tpcA1)or(M.SSL.SSLCryptClass.DadosCertificado.DataInicioValidade>Now)or(M.SSL.CertDataVenc<Now)then Falhar('CERTIFICADO_INVALIDO','Certificado A1 fora da validade ou inválido.');
  except on E:EFiscal do raise;on E:Exception do Falhar('CERTIFICADO_INVALIDO','Certificado A1 ou senha inválidos.');end;
 end;
end;
procedure CarregarXML(M:TACBrNFe;Q,C:TJSONObject;out XML:string);
begin
 XML:=Decodificar(Texto(Q,'xmlBase64'),4*1024*1024);
 if(Pos('<!DOCTYPE',UpperCase(XML))>0)or(Pos('<!ENTITY',UpperCase(XML))>0)or(Pos(#0,XML)>0)or(Pos('<nfeProc',XML)>0)or(Pos('<enviNFe',XML)>0)then Falhar('XML_INVALIDO','Informe um XML NFe sem envelope, DTD ou entidades externas.');
 if not M.NotasFiscais.LoadFromString(XML,False)or(M.NotasFiscais.Count<>1)then Falhar('XML_INVALIDO','XML deve conter uma única NF-e 4.00.');
 Identidade(M,C);ChaveValida(M.NotasFiscais.Items[0].NumID,C,M);
 with M.NotasFiscais.Items[0].NFe.Ide do if(StrToIntDef(Copy(M.NotasFiscais.Items[0].NumID,23,3),-1)<>serie)or(StrToIntDef(Copy(M.NotasFiscais.Items[0].NumID,26,9),-1)<>nNF)or(Copy(M.NotasFiscais.Items[0].NumID,35,1)<>'1')or(StrToIntDef(Copy(M.NotasFiscais.Items[0].NumID,36,8),-1)<>cNF)then Falhar('IDENTIDADE_DIVERGENTE','Chave fiscal divergente dos dados do documento.');
 if(Texto(Q,'chave',False)<>'')and(Texto(Q,'chave')<>M.NotasFiscais.Items[0].NumID)then Falhar('IDENTIDADE_DIVERGENTE','Chave do XML divergente.');
end;
procedure Schema(M:TACBrNFe);
begin
 try M.NotasFiscais.Validar;except Falhar('XML_SCHEMA_INVALIDO','XML nao atende aos schemas fiscais.');end;
end;
procedure ProtocoloValido(const P:string);
var I:Integer;
begin
 if Length(P)<>15 then Falhar('RETORNO_INVALIDO','Protocolo fiscal invalido.');
 for I:=1 to Length(P)do if not(P[I]in['0'..'9'])then Falhar('RETORNO_INVALIDO','Protocolo fiscal invalido.');
end;
function OrgaoConhecido(Code:Integer):Boolean;
begin Result:=(Code in[11,12,13,14,15,16,17,21,22,23,24,25,26,27,28,29,31,32,33,35,41,42,43,50,51,52,53,91]);end;
procedure CorrelacionarInutilizacao(M:TACBrNFe;Q:TJSONObject);
var Ret:TRetInutNFe;C,F:TJSONObject;
begin
 if M.WebServices.Inutilizacao.cStat<>102 then Exit;
 C:=Objeto(Q,'config');F:=Objeto(Q,'inutilizacao');Ret:=TRetInutNFe.Create;
 try
  Ret.XmlRetorno:=M.WebServices.Inutilizacao.RetWS;
  if not Ret.LerXml or(Ret.cStat<>102)or(Ret.tpAmb<>M.Configuracoes.WebServices.Ambiente)or(Ret.CNPJ<>Texto(C,'cnpj'))or(Ret.cUF<>M.Configuracoes.WebServices.UFCodigo)or(Ret.Modelo<>Inteiro(C,'modelo'))or(Ret.Serie<>Inteiro(F,'serie'))or(Ret.ano<>Inteiro(F,'ano'))or(Ret.nNFIni<>Inteiro(F,'numeroInicial'))or(Ret.nNFFin<>Inteiro(F,'numeroFinal'))or(Ret.nProt<>M.WebServices.Inutilizacao.Protocolo)then Falhar('IDENTIDADE_DIVERGENTE','Inutilizacao retornou outra faixa fiscal.');
  ProtocoloValido(Ret.nProt);
 finally Ret.Free;end;
end;
function ReciboEnvio(M:TACBrNFe):string;
var Ret:TretEnvDFe;I:Integer;
begin
 Result:=M.WebServices.Enviar.Recibo;
 { ACBr's synchronous reader expects nRec directly under the response. A 103
   asynchronous acceptance has infRec/nRec even when indSinc was requested. }
 if(Result='')and(M.WebServices.Enviar.cStat=103)then begin
  Ret:=TretEnvDFe.Create;
  try
   Ret.XmlRetorno:=M.WebServices.Enviar.RetWS;
   if not Ret.LerXml or(Ret.cStat<>103)or(Ret.cUF<>M.Configuracoes.WebServices.UFCodigo)or(Ret.tpAmb<>M.Configuracoes.WebServices.Ambiente)then Falhar('RETORNO_INVALIDO','Recibo fiscal sem identidade valida.');
   Result:=Ret.infRec.nRec;
  finally Ret.Free;end;
 end;
 if Result<>''then begin
  if Length(Result)<>15 then Falhar('RETORNO_INVALIDO','Recibo fiscal invalido.');
  for I:=1 to Length(Result)do if not(Result[I]in['0'..'9'])then Falhar('RETORNO_INVALIDO','Recibo fiscal invalido.');
 end else if M.WebServices.Enviar.cStat=103 then Falhar('RETORNO_INVALIDO','Lote recebido sem recibo fiscal.');
end;
procedure Resultado(R:TJSONObject;const Cmd:string;Code:Integer;const Motivo,Key,Prot,Receipt,XML:string);
var S:string;
begin
 if (Code=100)or(Code=150)or((Cmd='cancelar')and(Code in[135,136]))or((Cmd='cartaCorrecao')and(Code=135))or((Cmd='inutilizar')and(Code=102))then ProtocoloValido(Prot);
 R.Add('cStat',Code);DefinirTexto(R,'xMotivo',Motivo);DefinirTexto(R,'chave',Key);DefinirTexto(R,'protocolo',Prot);DefinirTexto(R,'recibo',Receipt);if XML<>''then DefinirTexto(R,'xmlBase64',EncodeStringBase64(XML));
 S:='REJEITADO';
 if Code in[100,150]then begin if(Key='')or(Prot='')then Falhar('RETORNO_INVALIDO','Autorização sem identidade e protocolo.');S:='AUTORIZADO';end
 else if (Code=110)or(Code=301)or(Code=302)then S:='DENEGADO'
 else if Code in[101,151,155]then S:='CANCELADO'
 else if (Code=103)or(Code=104)or(Code=105)or(Code=108)or(Code=109)or(Code=204)or(Code=539)or(Code=573)then S:='PENDENTE'
 else if(Cmd='cancelar')and(Code in[135,136])then S:='CANCELADO'
 else if(Cmd='cartaCorrecao')and(Code=135)then S:='EVENTO_REGISTRADO'
 else if(Cmd='inutilizar')and(Code=102)then S:='INUTILIZADO'
 else if(Cmd='consultar')and(Code=217)then S:='CONSULTADO';
 Estado(R,S);
end;
procedure Executar(Q,R:TJSONObject);
var M:TACBrNFe;C,Inut:TJSONObject;Base,Cmd,XML,Key,Receipt,Err,J:string;Sending:Boolean;I,Found:Integer;
 procedure InicioEnvio;
 begin Sending:=True;R.Booleans['envioIniciado']:=True;MarcadorEnvio(Texto(Q,'id'));end;
begin
 Base:=IncludeTrailingPathDelimiter(ExtractFilePath(ExpandFileName(ParamStr(0))));C:=Objeto(Q,'config');Cmd:=Texto(Q,'comando');Sending:=False;
 {$IFDEF ACBR_NODE_TEST}
 ConfigurarTLS(GetEnvironmentVariable('ACBR_NODE_TEST_CA_FILE'));
 {$ELSE}ConfigurarTLS;{$ENDIF}
 if not OpenSSLExt.InitSSLInterface then Falhar('DEPENDENCIA_AUSENTE','OpenSSL indisponivel.');
 if OpenSSLExt.OSSL_PROVIDER_load(nil,'default')=nil then Falhar('DEPENDENCIA_AUSENTE','Provider OpenSSL default indisponivel.');
 M:=TACBrNFe.Create(nil);
 try
  Configurar(M,Q,Base);
  try
   if Cmd='gerarXml'then begin
    M.NotasFiscais.Add;
    try preencherTNFe(Objeto(Q,'documento'),M.NotasFiscais.Items[0].NFe);except Falhar('DOCUMENTO_INVALIDO','Documento não corresponde ao modelo ACBr gerado.');end;
    Identidade(M,C);XML:=M.NotasFiscais.Items[0].GerarXML;
    if(XML='')or(Length(XML)>4*1024*1024)then Falhar('XML_INVALIDO','XML fiscal vazio ou acima do limite.');
    ChaveValida(M.NotasFiscais.Items[0].NumID,C,M);DefinirTexto(R,'chave',M.NotasFiscais.Items[0].NumID);DefinirTexto(R,'xmlBase64',EncodeStringBase64(XML));Estado(R,'XML_GERADO');
   end else if(Cmd='validar')or(Cmd='assinar')or(Cmd='transmitir')then begin
    CarregarXML(M,Q,C,XML);Key:=M.NotasFiscais.Items[0].NumID;DefinirTexto(R,'chave',Key);
    if Cmd='assinar'then begin
     if(Inteiro(C,'modelo')=65)and(C.Find('csc')=nil)then Falhar('CSC_AUSENTE','NFC-e exige CSC.');
     M.NotasFiscais.Assinar;if M.NotasFiscais.Items[0].NumID<>Key then Falhar('IDENTIDADE_DIVERGENTE','Assinatura alterou a identidade do documento.');Schema(M);DefinirTexto(R,'xmlBase64',EncodeStringBase64(M.NotasFiscais.Items[0].XMLAssinado));Estado(R,'ASSINADO');
    end else if Cmd='validar'then begin
     Schema(M);if(M.NotasFiscais.Items[0].NFe.signature.SignatureValue<>'')and not M.NotasFiscais.VerificarAssinatura(Err)then Falhar('ASSINATURA_INVALIDA','Assinatura fiscal inválida.');Estado(R,'VALIDADO');
    end else begin
     if M.NotasFiscais.Items[0].NFe.signature.SignatureValue=''then Falhar('XML_NAO_ASSINADO','Transmissão exige XML previamente assinado e persistido.');
     M.NotasFiscais.Items[0].XMLAssinado:=XML;Schema(M);
     if not M.NotasFiscais.VerificarAssinatura(Err)then Falhar('ASSINATURA_INVALIDA','Assinatura fiscal inválida.');
     if M.NotasFiscais.Items[0].XMLAssinado<>XML then Falhar('XML_ALTERADO','XML assinado foi alterado.');
     M.WebServices.Enviar.Lote:=FormatDateTime('yymmddhhnnsszzz',Now);M.WebServices.Enviar.Sincrono:=True;
     InicioEnvio;M.WebServices.Enviar.Executar;
     if(M.WebServices.Enviar.cStat=100)or(M.WebServices.Enviar.cStat=150)then
      with M.NotasFiscais.Items[0].NFe.procNFe do
       if(chDFe<>Key)or(nProt='')or(nProt<>M.WebServices.Enviar.Protocolo)or(tpAmb<>M.Configuracoes.WebServices.Ambiente)then Falhar('IDENTIDADE_DIVERGENTE','Autorizacao retornou outro documento.');
     Resultado(R,Cmd,M.WebServices.Enviar.cStat,M.WebServices.Enviar.xMotivo,Key,M.WebServices.Enviar.Protocolo,ReciboEnvio(M),M.NotasFiscais.Items[0].XMLOriginal);
    end;
   end else if Cmd='inutilizar'then begin
    Inut:=Objeto(Q,'inutilizacao');J:=Texto(Q,'justificativa');if(Length(J)<15)or(Length(J)>255)then Falhar('REQUISICAO_INVALIDA','Justificativa inválida.');
    if(Inteiro(Inut,'ano')<0)or(Inteiro(Inut,'ano')>99)or(2000+Inteiro(Inut,'ano')>YearOf(Now))or(Inteiro(Inut,'serie')<0)or(Inteiro(Inut,'serie')>999)or(Inteiro(Inut,'numeroInicial')<1)or(Inteiro(Inut,'numeroFinal')<Inteiro(Inut,'numeroInicial'))or(Inteiro(Inut,'numeroFinal')>999999999)then Falhar('REQUISICAO_INVALIDA','Faixa de inutilização inválida.');
    InicioEnvio;M.WebServices.Inutiliza(Texto(C,'cnpj'),J,2000+Inteiro(Inut,'ano'),Inteiro(C,'modelo'),Inteiro(Inut,'serie'),Inteiro(Inut,'numeroInicial'),Inteiro(Inut,'numeroFinal'));
    CorrelacionarInutilizacao(M,Q);
    with M.WebServices.Inutilizacao do Resultado(R,Cmd,cStat,xMotivo,'',Protocolo,'',XML_ProcInutNFe);
   end else begin
    Key:=Texto(Q,'chave');ChaveValida(Key,C,M);DefinirTexto(R,'chave',Key);
    if Cmd='consultar'then begin
     Receipt:=Texto(Q,'recibo',False);
     if Receipt<>''then begin
      M.WebServices.Retorno.Recibo:=Receipt;M.WebServices.Retorno.Executar;Found:=-1;
      for I:=0 to M.WebServices.Retorno.NFeRetorno.ProtDFe.Count-1 do if M.WebServices.Retorno.NFeRetorno.ProtDFe.Items[I].chDFe=Key then Found:=I;
      if M.WebServices.Retorno.NFeRetorno.ProtDFe.Count>0 then begin if Found<0 then Falhar('IDENTIDADE_DIVERGENTE','Recibo retornou outro documento.');with M.WebServices.Retorno.NFeRetorno.ProtDFe.Items[Found]do Resultado(R,Cmd,cStat,xMotivo,chDFe,nProt,Receipt,XMLprotDFe);end
      else Resultado(R,Cmd,M.WebServices.Retorno.cStat,M.WebServices.Retorno.xMotivo,Key,'',Receipt,M.WebServices.Retorno.RetWS);
     end else begin
      M.WebServices.Consulta.NFeChave:=Key;M.WebServices.Consulta.Executar;
      if(M.WebServices.Consulta.protNFe.chDFe<>'')and(M.WebServices.Consulta.protNFe.chDFe<>Key)then Falhar('IDENTIDADE_DIVERGENTE','Consulta retornou outro documento.');
      Resultado(R,Cmd,M.WebServices.Consulta.cStat,M.WebServices.Consulta.xMotivo,Key,M.WebServices.Consulta.Protocolo,'',M.WebServices.Consulta.RetWS);
     end;
    end else begin
     M.EventoNFe.Evento.Clear;
     with M.EventoNFe.Evento.Add.InfEvento do begin
      cOrgao:=M.Configuracoes.WebServices.UFCodigo;tpAmb:=M.Configuracoes.WebServices.Ambiente;CNPJ:=Texto(C,'cnpj');chNFe:=Key;dhEvento:=Now;
      if Cmd='cancelar'then begin J:=Texto(Q,'justificativa');if(Length(J)<15)or(Length(J)>255)then Falhar('REQUISICAO_INVALIDA','Justificativa inválida.');tpEvento:=teCancelamento;nSeqEvento:=1;detEvento.nProt:=Texto(Q,'protocolo');detEvento.xJust:=J;end
      else begin J:=Texto(Q,'correcao');if(Length(J)<15)or(Length(J)>1000)or(Inteiro(Q,'sequenciaEvento')<1)or(Inteiro(Q,'sequenciaEvento')>20)then Falhar('REQUISICAO_INVALIDA','Carta de correção inválida.');tpEvento:=teCCe;nSeqEvento:=Inteiro(Q,'sequenciaEvento');detEvento.xCorrecao:=J;end;
     end;
     InicioEnvio;M.EnviarEvento(StrToInt64(FormatDateTime('yymmddhhnnsszzz',Now)));
     if M.WebServices.EnvEvento.EventoRetorno.retEvento.Count=1 then with M.WebServices.EnvEvento.EventoRetorno.retEvento[0].RetInfEvento do begin
      if(chNFe<>Key)or(tpAmb<>M.Configuracoes.WebServices.Ambiente)or(tpEvento<>M.EventoNFe.Evento[0].InfEvento.tpEvento)or(nSeqEvento<>M.EventoNFe.Evento[0].InfEvento.nSeqEvento)or not OrgaoConhecido(cOrgao)then Falhar('IDENTIDADE_DIVERGENTE','Evento retornou outro documento ou sequência.');
      Resultado(R,Cmd,cStat,xMotivo,chNFe,nProt,'',M.EventoNFe.Evento[0].RetInfEvento.XML);
     end else Resultado(R,Cmd,M.WebServices.EnvEvento.cStat,M.WebServices.EnvEvento.xMotivo,Key,'','',M.WebServices.EnvEvento.RetWS);
    end;
   end;
  except
   on E:Exception do begin
    if Sending then begin Estado(R,'INDETERMINADO');R.Delete('cStat');R.Delete('protocolo');R.Delete('xmlBase64');R.Delete('recibo');
     if(Cmd='transmitir')and(XML<>'')then DefinirTexto(R,'xmlBase64',EncodeStringBase64(XML));DefinirTexto(R,'codigo','RESULTADO_INDETERMINADO');DefinirTexto(R,'xMotivo','Resultado fiscal desconhecido; consulte antes de repetir a operação.');end
    else if E is EFiscal then raise
    else if TLSRecusouServidor then Falhar('TLS_SERVIDOR_INVALIDO','TLS do servidor fiscal recusado.')
    else Falhar('OPERACAO_FISCAL_FALHOU','Operação fiscal não concluída.');
   end;
  end;
 finally M.Free;end;
end;
end.
