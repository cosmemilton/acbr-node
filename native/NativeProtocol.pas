unit NativeProtocol;
{$mode objfpc}{$H+}{$codepage utf8}
interface
uses Classes,SysUtils,fpjson,NativeErrors;
const MaxMessageBytes=8*1024*1024;
type EFiscal=NativeErrors.EFiscal;
function Texto(O:TJSONObject;const Key:string;Required:Boolean=True):string;
function Inteiro(O:TJSONObject;const Key:string):Int64;
function Objeto(O:TJSONObject;const Key:string):TJSONObject;
function LerLinha:string;
function Decodificar(const Value:string;Limit:Integer):RawByteString;
procedure DefinirTexto(O:TJSONObject;const Key,Value:string);
procedure Falhar(const Code,MessageText:string);
procedure ValidarEntrada(O:TJSONObject);
procedure MarcadorEnvio(const Id:string);
implementation
uses base64,AcbrModels;
procedure Falhar(const Code,MessageText:string);
begin raise EFiscal.Create(Code,MessageText);end;
function Texto(O:TJSONObject;const Key:string;Required:Boolean):string;
var D:TJSONData;
begin D:=O.Find(Key);Result:='';if D=nil then begin if Required then Falhar('REQUISICAO_INVALIDA','Campo obrigatório ausente.');Exit;end;if D.JSONType<>jtString then Falhar('REQUISICAO_INVALIDA','Tipo de campo inválido.');Result:=D.AsString;if Required and(Result='')then Falhar('REQUISICAO_INVALIDA','Campo obrigatório vazio.');end;
function Inteiro(O:TJSONObject;const Key:string):Int64;
var D:TJSONData;
begin D:=O.Find(Key);if(D=nil)or(D.JSONType<>jtNumber)then Falhar('REQUISICAO_INVALIDA','Número inteiro obrigatório.');if D.AsFloat<>Trunc(D.AsFloat)then Falhar('REQUISICAO_INVALIDA','Número inteiro inválido.');Result:=D.AsInt64;end;
function Objeto(O:TJSONObject;const Key:string):TJSONObject;
var D:TJSONData;
begin D:=O.Find(Key);if(D=nil)or(D.JSONType<>jtObject)then Falhar('REQUISICAO_INVALIDA','Objeto obrigatório ausente.');Result:=TJSONObject(D);end;
function LerLinha:string;
var C:Char;L:Integer;S:TStringStream;
begin
 L:=0;S:=TStringStream.Create('');
 try while not EOF(Input)do begin Read(Input,C);if C=#10 then Break;if C=#13 then Continue;Inc(L);if L>MaxMessageBytes then Falhar('LIMITE_EXCEDIDO','Mensagem fiscal excede o limite.');S.WriteBuffer(C,1);end;Result:=S.DataString;finally S.Free;end;
 if Result=''then Falhar('REQUISICAO_INVALIDA','Mensagem fiscal vazia.');
end;
function Decodificar(const Value:string;Limit:Integer):RawByteString;
var I:Integer;
begin if(Value='')or(Length(Value)mod 4<>0)or(Length(Value)>((Limit+2)div 3)*4)then Falhar('REQUISICAO_INVALIDA','Base64 inválido.');for I:=1 to Length(Value)do if not(Value[I]in['A'..'Z','a'..'z','0'..'9','+','/','='])then Falhar('REQUISICAO_INVALIDA','Base64 inválido.');try Result:=DecodeStringBase64(Value);except Falhar('REQUISICAO_INVALIDA','Base64 inválido.');end;if(Length(Result)>Limit)or(EncodeStringBase64(Result)<>Value)then Falhar('REQUISICAO_INVALIDA','Base64 inválido.');end;
procedure DefinirTexto(O:TJSONObject;const Key,Value:string);
begin if Value<>''then begin if O.Find(Key)<>nil then O.Delete(Key);O.Add(Key,Value);end;end;
procedure OnlyKeys(O:TJSONObject;const Allowed:string);
var I:Integer;
begin for I:=0 to O.Count-1 do if Pos('|'+O.Names[I]+'|',Allowed)=0 then Falhar('REQUISICAO_INVALIDA','Campo desconhecido no protocolo.');end;
procedure ValidarEntrada(O:TJSONObject);
var C,Cert:TJSONObject;Cmd,S:string;I:Integer;
begin
 OnlyKeys(O,'|versao|id|comando|sourceRevision|contractHash|config|documento|xmlBase64|chave|recibo|protocolo|justificativa|correcao|sequenciaEvento|inutilizacao|');
 if(Inteiro(O,'versao')<>1)or(Inteiro(O,'sourceRevision')<>SourceRevision)or(Texto(O,'contractHash')<>ContractHash)then Falhar('CONTRATO_INCOMPATIVEL','Contrato ou revisão ACBr incompatível.');
 S:=Texto(O,'id');if Length(S)>100 then Falhar('REQUISICAO_INVALIDA','Identificador inválido.');for I:=1 to Length(S)do if not(S[I]in['A'..'Z','a'..'z','0'..'9','_','-'])then Falhar('REQUISICAO_INVALIDA','Identificador inválido.');
 Cmd:=Texto(O,'comando');if Pos('|'+Cmd+'|','|gerarXml|validar|assinar|transmitir|consultar|cancelar|cartaCorrecao|inutilizar|')=0 then Falhar('REQUISICAO_INVALIDA','Comando fiscal inválido.');
 C:=Objeto(O,'config');OnlyKeys(C,'|cnpj|uf|modelo|ambiente|certificado|csc|');
 S:=Texto(C,'cnpj');if Length(S)<>14 then Falhar('REQUISICAO_INVALIDA','CNPJ inválido.');for I:=1 to Length(S)do if not(S[I]in['0'..'9'])then Falhar('REQUISICAO_INVALIDA','CNPJ inválido.');
 if not(Inteiro(C,'modelo')in[55,65])or not(Inteiro(C,'ambiente')in[1,2])then Falhar('REQUISICAO_INVALIDA','Modelo ou ambiente inválido.');
 S:=Texto(C,'uf');if Pos('|'+S+'|','|AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO|')=0 then Falhar('REQUISICAO_INVALIDA','UF inválida.');
 if C.Find('certificado')<>nil then begin Cert:=Objeto(C,'certificado');OnlyKeys(Cert,'|pfxBase64|senha|');Decodificar(Texto(Cert,'pfxBase64'),2*1024*1024);Texto(Cert,'senha',False);end;
 if C.Find('csc')<>nil then begin Cert:=Objeto(C,'csc');OnlyKeys(Cert,'|id|valor|');S:=Texto(Cert,'id');if Length(S)>6 then Falhar('REQUISICAO_INVALIDA','CSC inválido.');for I:=1 to Length(S)do if not(S[I]in['0'..'9'])then Falhar('REQUISICAO_INVALIDA','CSC inválido.');if Length(Texto(Cert,'valor'))>256 then Falhar('REQUISICAO_INVALIDA','CSC inválido.');end;
 if(Cmd='cartaCorrecao')and(Inteiro(C,'modelo')<>55)then Falhar('REQUISICAO_INVALIDA','Carta de correção restrita à NF-e.');
 if(Cmd='gerarXml')and(O.Find('documento')=nil)then Falhar('REQUISICAO_INVALIDA','Documento obrigatório para gerar XML.');
 if(Pos('|'+Cmd+'|','|validar|assinar|transmitir|')>0)and(O.Find('xmlBase64')=nil)then Falhar('REQUISICAO_INVALIDA','XML obrigatório.');
end;
procedure MarcadorEnvio(const Id:string);
var O:TJSONObject;
begin O:=TJSONObject.Create;try O.Add('tipo','envioIniciado');O.Add('id',Id);WriteLn(O.AsJSON);Flush(Output);finally O.Free;end;end;
end.
