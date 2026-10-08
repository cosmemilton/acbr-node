// Generated from ACBr AST. LGPL-2.1-or-later. Do not edit.
export const ACBR_CONTRACT = {"sourceRevision":48590,"contractHash":"e5a497cefe8e0e350a30da5cc04e88b35c38a98535893d52f878890260d1346d"} as const;
export const SOURCE_REVISION=ACBR_CONTRACT.sourceRevision;
export const CONTRACT_HASH=ACBR_CONTRACT.contractHash;
export const TACBrProcessoEmissao = Object.freeze({"peAplicativoContribuinte":"peAplicativoContribuinte","peAvulsaFisco":"peAvulsaFisco","peAvulsaContribuinte":"peAvulsaContribuinte","peContribuinteAplicativoFisco":"peContribuinteAplicativoFisco","peProvedorAssinaturaAutorizacao":"peProvedorAssinaturaAutorizacao"} as const);
export type TACBrProcessoEmissao = typeof TACBrProcessoEmissao[keyof typeof TACBrProcessoEmissao];
export const TACBrTipoAmbiente = Object.freeze({"taProducao":"taProducao","taHomologacao":"taHomologacao"} as const);
export type TACBrTipoAmbiente = typeof TACBrTipoAmbiente[keyof typeof TACBrTipoAmbiente];
export const TACBrTipoEmissao = Object.freeze({"teNormal":"teNormal","teContingencia":"teContingencia","teSCAN":"teSCAN","teDPEC":"teDPEC","teFSDA":"teFSDA","teSVCAN":"teSVCAN","teSVCRS":"teSVCRS","teSVCSP":"teSVCSP","teOffLine":"teOffLine"} as const);
export type TACBrTipoEmissao = typeof TACBrTipoEmissao[keyof typeof TACBrTipoEmissao];
export const TACBrTipoImpressao = Object.freeze({"tiSemGeracao":"tiSemGeracao","tiRetrato":"tiRetrato","tiPaisagem":"tiPaisagem","tiSimplificado":"tiSimplificado","tiNFCe":"tiNFCe","tiMsgEletronica":"tiMsgEletronica","tiSimplificadoTipo2":"tiSimplificadoTipo2"} as const);
export type TACBrTipoImpressao = typeof TACBrTipoImpressao[keyof typeof TACBrTipoImpressao];
export type TAdiCollectionInput = TAdiCollectionItemInput[];
export class TAdiCollection extends Array<TAdiCollectionItem> {
  New(input: TAdiCollectionItemInput = {}): TAdiCollectionItem { const item=new TAdiCollectionItem(input); this.push(item); return item; }
}
export interface TAdiCollectionItemInput {
  "cFabricante"?: string;
  "nAdicao"?: number;
  "nDraw"?: string;
  "nSeqAdi"?: number;
  "vDescDI"?: string;
}
export class TAdiCollectionItem {
  "cFabricante"?: string;
  "nAdicao"?: number;
  "nDraw"?: string;
  "nSeqAdi"?: number;
  "vDescDI"?: string;
  constructor(input: TAdiCollectionItemInput = {}) {
    validateModel("TAdiCollectionItem", input);
    if (input["cFabricante"] !== undefined) this["cFabricante"] = input["cFabricante"];
    if (input["nAdicao"] !== undefined) this["nAdicao"] = input["nAdicao"];
    if (input["nDraw"] !== undefined) this["nDraw"] = input["nDraw"];
    if (input["nSeqAdi"] !== undefined) this["nSeqAdi"] = input["nSeqAdi"];
    if (input["vDescDI"] !== undefined) this["vDescDI"] = input["vDescDI"];
  }
}
export interface TagropecuarioInput {
  "defensivo"?: TdefensivoCollectionInput;
  "guiaTransito"?: TguiaTransitoInput;
}
export class Tagropecuario {
  "defensivo" = new TdefensivoCollection();
  "guiaTransito" = new TguiaTransito();
  constructor(input: TagropecuarioInput = {}) {
    validateModel("Tagropecuario", input);
    if (input["defensivo"] !== undefined) this["defensivo"] = Object.assign(new TdefensivoCollection(), input["defensivo"].map(v=>new TdefensivoCollectionItem(v)));
    if (input["guiaTransito"] !== undefined) this["guiaTransito"] = new TguiaTransito(input["guiaTransito"]);
  }
}
export type TArmaCollectionInput = TArmaCollectionItemInput[];
export class TArmaCollection extends Array<TArmaCollectionItem> {
  New(input: TArmaCollectionItemInput = {}): TArmaCollectionItem { const item=new TArmaCollectionItem(input); this.push(item); return item; }
}
export interface TArmaCollectionItemInput {
  "descr"?: string;
  "nCano"?: string;
  "nSerie"?: string;
  "tpArma"?: TpcnTipoArma;
}
export class TArmaCollectionItem {
  "descr"?: string;
  "nCano"?: string;
  "nSerie"?: string;
  /** Pascal streaming default: taUsoPermitido. Omission preserves the native constructor. */
  "tpArma"?: TpcnTipoArma;
  constructor(input: TArmaCollectionItemInput = {}) {
    validateModel("TArmaCollectionItem", input);
    if (input["descr"] !== undefined) this["descr"] = input["descr"];
    if (input["nCano"] !== undefined) this["nCano"] = input["nCano"];
    if (input["nSerie"] !== undefined) this["nSerie"] = input["nSerie"];
    if (input["tpArma"] !== undefined) this["tpArma"] = input["tpArma"];
  }
}
export type TautXMLCollectionInput = TautXMLCollectionItemInput[];
export class TautXMLCollection extends Array<TautXMLCollectionItem> {
  New(input: TautXMLCollectionItemInput = {}): TautXMLCollectionItem { const item=new TautXMLCollectionItem(input); this.push(item); return item; }
}
export interface TautXMLCollectionItemInput {
  "CNPJCPF"?: string;
}
export class TautXMLCollectionItem {
  "CNPJCPF"?: string;
  constructor(input: TautXMLCollectionItemInput = {}) {
    validateModel("TautXMLCollectionItem", input);
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
  }
}
export interface TAvulsaInput {
  "CNPJ"?: string;
  "dEmi"?: string;
  "dPag"?: string;
  "fone"?: string;
  "matr"?: string;
  "nDAR"?: string;
  "repEmi"?: string;
  "UF"?: string;
  "vDAR"?: string;
  "xAgente"?: string;
  "xOrgao"?: string;
}
export class TAvulsa {
  "CNPJ"?: string;
  "dEmi"?: string;
  "dPag"?: string;
  "fone"?: string;
  "matr"?: string;
  "nDAR"?: string;
  "repEmi"?: string;
  "UF"?: string;
  "vDAR"?: string;
  "xAgente"?: string;
  "xOrgao"?: string;
  constructor(input: TAvulsaInput = {}) {
    validateModel("TAvulsa", input);
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["dEmi"] !== undefined) this["dEmi"] = input["dEmi"];
    if (input["dPag"] !== undefined) this["dPag"] = input["dPag"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["matr"] !== undefined) this["matr"] = input["matr"];
    if (input["nDAR"] !== undefined) this["nDAR"] = input["nDAR"];
    if (input["repEmi"] !== undefined) this["repEmi"] = input["repEmi"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["vDAR"] !== undefined) this["vDAR"] = input["vDAR"];
    if (input["xAgente"] !== undefined) this["xAgente"] = input["xAgente"];
    if (input["xOrgao"] !== undefined) this["xOrgao"] = input["xOrgao"];
  }
}
export interface TcanaInput {
  "deduc"?: TDeducCollectionInput;
  "fordia"?: TForDiaCollectionInput;
  "qTotAnt"?: string;
  "qTotGer"?: string;
  "qTotMes"?: string;
  "ref"?: string;
  "safra"?: string;
  "vFor"?: string;
  "vLiqFor"?: string;
  "vTotDed"?: string;
}
export class Tcana {
  "deduc" = new TDeducCollection();
  "fordia" = new TForDiaCollection();
  "qTotAnt"?: string;
  "qTotGer"?: string;
  "qTotMes"?: string;
  "ref"?: string;
  "safra"?: string;
  "vFor"?: string;
  "vLiqFor"?: string;
  "vTotDed"?: string;
  constructor(input: TcanaInput = {}) {
    validateModel("Tcana", input);
    if (input["deduc"] !== undefined) this["deduc"] = Object.assign(new TDeducCollection(), input["deduc"].map(v=>new TDeducCollectionItem(v)));
    if (input["fordia"] !== undefined) this["fordia"] = Object.assign(new TForDiaCollection(), input["fordia"].map(v=>new TForDiaCollectionItem(v)));
    if (input["qTotAnt"] !== undefined) this["qTotAnt"] = input["qTotAnt"];
    if (input["qTotGer"] !== undefined) this["qTotGer"] = input["qTotGer"];
    if (input["qTotMes"] !== undefined) this["qTotMes"] = input["qTotMes"];
    if (input["ref"] !== undefined) this["ref"] = input["ref"];
    if (input["safra"] !== undefined) this["safra"] = input["safra"];
    if (input["vFor"] !== undefined) this["vFor"] = input["vFor"];
    if (input["vLiqFor"] !== undefined) this["vLiqFor"] = input["vLiqFor"];
    if (input["vTotDed"] !== undefined) this["vTotDed"] = input["vTotDed"];
  }
}
export const TcCredPres = Object.freeze({"cpNenhum":"cpNenhum","cp01":"cp01","cp02":"cp02","cp03":"cp03","cp04":"cp04","cp05":"cp05","cp06":"cp06","cp07":"cp07","cp08":"cp08","cp09":"cp09","cp10":"cp10","cp11":"cp11","cp12":"cp12","cp13":"cp13"} as const);
export type TcCredPres = typeof TcCredPres[keyof typeof TcCredPres];
export interface TCIDEInput {
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vCIDE"?: string;
}
export class TCIDE {
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vCIDE"?: string;
  constructor(input: TCIDEInput = {}) {
    validateModel("TCIDE", input);
    if (input["qBCProd"] !== undefined) this["qBCProd"] = input["qBCProd"];
    if (input["vAliqProd"] !== undefined) this["vAliqProd"] = input["vAliqProd"];
    if (input["vCIDE"] !== undefined) this["vCIDE"] = input["vCIDE"];
  }
}
export interface TCobrInput {
  "Dup"?: TDupCollectionInput;
  "Fat"?: TFatInput;
}
export class TCobr {
  "Dup" = new TDupCollection();
  "Fat" = new TFat();
  constructor(input: TCobrInput = {}) {
    validateModel("TCobr", input);
    if (input["Dup"] !== undefined) this["Dup"] = Object.assign(new TDupCollection(), input["Dup"].map(v=>new TDupCollectionItem(v)));
    if (input["Fat"] !== undefined) this["Fat"] = new TFat(input["Fat"]);
  }
}
export interface TCOFINSInput {
  "CST"?: TCSTCofins;
  "pCOFINS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vBCProd"?: string;
  "vCOFINS"?: string;
}
export class TCOFINS {
  /** Pascal streaming default: cof01. Omission preserves the native constructor. */
  "CST"?: TCSTCofins;
  "pCOFINS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vBCProd"?: string;
  "vCOFINS"?: string;
  constructor(input: TCOFINSInput = {}) {
    validateModel("TCOFINS", input);
    if (input["CST"] !== undefined) this["CST"] = input["CST"];
    if (input["pCOFINS"] !== undefined) this["pCOFINS"] = input["pCOFINS"];
    if (input["qBCProd"] !== undefined) this["qBCProd"] = input["qBCProd"];
    if (input["vAliqProd"] !== undefined) this["vAliqProd"] = input["vAliqProd"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vBCProd"] !== undefined) this["vBCProd"] = input["vBCProd"];
    if (input["vCOFINS"] !== undefined) this["vCOFINS"] = input["vCOFINS"];
  }
}
export interface TCOFINSSTInput {
  "indSomaCOFINSST"?: TIndSomaCOFINSST;
  "pCOFINS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vCOFINS"?: string;
}
export class TCOFINSST {
  "indSomaCOFINSST"?: TIndSomaCOFINSST;
  "pCOFINS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vCOFINS"?: string;
  constructor(input: TCOFINSSTInput = {}) {
    validateModel("TCOFINSST", input);
    if (input["indSomaCOFINSST"] !== undefined) this["indSomaCOFINSST"] = input["indSomaCOFINSST"];
    if (input["pCOFINS"] !== undefined) this["pCOFINS"] = input["pCOFINS"];
    if (input["qBCProd"] !== undefined) this["qBCProd"] = input["qBCProd"];
    if (input["vAliqProd"] !== undefined) this["vAliqProd"] = input["vAliqProd"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vCOFINS"] !== undefined) this["vCOFINS"] = input["vCOFINS"];
  }
}
export interface TCombInput {
  "CIDE"?: TCIDEInput;
  "CODIF"?: string;
  "cProdANP"?: number;
  "descANP"?: string;
  "encerrante"?: TencerranteInput;
  "ICMS"?: TICMSCombInput;
  "ICMSCons"?: TICMSConsInput;
  "ICMSInter"?: TICMSInterInput;
  "origComb"?: TorigCombCollectionInput;
  "pBio"?: string;
  "pGLP"?: string;
  "pGNi"?: string;
  "pGNn"?: string;
  "pMixGN"?: string;
  "qTemp"?: string;
  "UFcons"?: string;
  "vPart"?: string;
}
export class TComb {
  "CIDE" = new TCIDE();
  "CODIF"?: string;
  "cProdANP"?: number;
  "descANP"?: string;
  "encerrante" = new Tencerrante();
  "ICMS" = new TICMSComb();
  "ICMSCons" = new TICMSCons();
  "ICMSInter" = new TICMSInter();
  "origComb" = new TorigCombCollection();
  "pBio"?: string;
  "pGLP"?: string;
  "pGNi"?: string;
  "pGNn"?: string;
  "pMixGN"?: string;
  "qTemp"?: string;
  "UFcons"?: string;
  "vPart"?: string;
  constructor(input: TCombInput = {}) {
    validateModel("TComb", input);
    if (input["CIDE"] !== undefined) this["CIDE"] = new TCIDE(input["CIDE"]);
    if (input["CODIF"] !== undefined) this["CODIF"] = input["CODIF"];
    if (input["cProdANP"] !== undefined) this["cProdANP"] = input["cProdANP"];
    if (input["descANP"] !== undefined) this["descANP"] = input["descANP"];
    if (input["encerrante"] !== undefined) this["encerrante"] = new Tencerrante(input["encerrante"]);
    if (input["ICMS"] !== undefined) this["ICMS"] = new TICMSComb(input["ICMS"]);
    if (input["ICMSCons"] !== undefined) this["ICMSCons"] = new TICMSCons(input["ICMSCons"]);
    if (input["ICMSInter"] !== undefined) this["ICMSInter"] = new TICMSInter(input["ICMSInter"]);
    if (input["origComb"] !== undefined) this["origComb"] = Object.assign(new TorigCombCollection(), input["origComb"].map(v=>new TorigCombCollectionItem(v)));
    if (input["pBio"] !== undefined) this["pBio"] = input["pBio"];
    if (input["pGLP"] !== undefined) this["pGLP"] = input["pGLP"];
    if (input["pGNi"] !== undefined) this["pGNi"] = input["pGNi"];
    if (input["pGNn"] !== undefined) this["pGNn"] = input["pGNn"];
    if (input["pMixGN"] !== undefined) this["pMixGN"] = input["pMixGN"];
    if (input["qTemp"] !== undefined) this["qTemp"] = input["qTemp"];
    if (input["UFcons"] !== undefined) this["UFcons"] = input["UFcons"];
    if (input["vPart"] !== undefined) this["vPart"] = input["vPart"];
  }
}
export interface TCompraInput {
  "xCont"?: string;
  "xNEmp"?: string;
  "xPed"?: string;
}
export class TCompra {
  "xCont"?: string;
  "xNEmp"?: string;
  "xPed"?: string;
  constructor(input: TCompraInput = {}) {
    validateModel("TCompra", input);
    if (input["xCont"] !== undefined) this["xCont"] = input["xCont"];
    if (input["xNEmp"] !== undefined) this["xNEmp"] = input["xNEmp"];
    if (input["xPed"] !== undefined) this["xPed"] = input["xPed"];
  }
}
export interface TCredPresIBSZFMInput {
  "competApur"?: string;
  "tpCredPresIBSZFM"?: TTpCredPresIBSZFM;
  "vCredPresIBSZFM"?: string;
}
export class TCredPresIBSZFM {
  "competApur"?: string;
  "tpCredPresIBSZFM"?: TTpCredPresIBSZFM;
  "vCredPresIBSZFM"?: string;
  constructor(input: TCredPresIBSZFMInput = {}) {
    validateModel("TCredPresIBSZFM", input);
    if (input["competApur"] !== undefined) this["competApur"] = input["competApur"];
    if (input["tpCredPresIBSZFM"] !== undefined) this["tpCredPresIBSZFM"] = input["tpCredPresIBSZFM"];
    if (input["vCredPresIBSZFM"] !== undefined) this["vCredPresIBSZFM"] = input["vCredPresIBSZFM"];
  }
}
export type TCredPresumidoCollectionInput = TCredPresumidoCollectionItemInput[];
export class TCredPresumidoCollection extends Array<TCredPresumidoCollectionItem> {
  New(input: TCredPresumidoCollectionItemInput = {}): TCredPresumidoCollectionItem { const item=new TCredPresumidoCollectionItem(input); this.push(item); return item; }
}
export interface TCredPresumidoCollectionItemInput {
  "cCredPresumido"?: string;
  "pCredPresumido"?: string;
  "vCredPresumido"?: string;
}
export class TCredPresumidoCollectionItem {
  "cCredPresumido"?: string;
  "pCredPresumido"?: string;
  "vCredPresumido"?: string;
  constructor(input: TCredPresumidoCollectionItemInput = {}) {
    validateModel("TCredPresumidoCollectionItem", input);
    if (input["cCredPresumido"] !== undefined) this["cCredPresumido"] = input["cCredPresumido"];
    if (input["pCredPresumido"] !== undefined) this["pCredPresumido"] = input["pCredPresumido"];
    if (input["vCredPresumido"] !== undefined) this["vCredPresumido"] = input["vCredPresumido"];
  }
}
export const TCSOSNIcms = Object.freeze({"csosnVazio":"csosnVazio","csosn101":"csosn101","csosn102":"csosn102","csosn103":"csosn103","csosn201":"csosn201","csosn202":"csosn202","csosn203":"csosn203","csosn300":"csosn300","csosn400":"csosn400","csosn500":"csosn500","csosn900":"csosn900"} as const);
export type TCSOSNIcms = typeof TCSOSNIcms[keyof typeof TCSOSNIcms];
export const TCSTCofins = Object.freeze({"cof01":"cof01","cof02":"cof02","cof03":"cof03","cof04":"cof04","cof05":"cof05","cof06":"cof06","cof07":"cof07","cof08":"cof08","cof09":"cof09","cof49":"cof49","cof50":"cof50","cof51":"cof51","cof52":"cof52","cof53":"cof53","cof54":"cof54","cof55":"cof55","cof56":"cof56","cof60":"cof60","cof61":"cof61","cof62":"cof62","cof63":"cof63","cof64":"cof64","cof65":"cof65","cof66":"cof66","cof67":"cof67","cof70":"cof70","cof71":"cof71","cof72":"cof72","cof73":"cof73","cof74":"cof74","cof75":"cof75","cof98":"cof98","cof99":"cof99"} as const);
export type TCSTCofins = typeof TCSTCofins[keyof typeof TCSTCofins];
export const TCSTIBSCBS = Object.freeze({"cstNenhum":"cstNenhum","cst000":"cst000","cst010":"cst010","cst011":"cst011","cst200":"cst200","cst220":"cst220","cst221":"cst221","cst222":"cst222","cst400":"cst400","cst410":"cst410","cst510":"cst510","cst515":"cst515","cst550":"cst550","cst620":"cst620","cst800":"cst800","cst810":"cst810","cst811":"cst811","cst820":"cst820","cst830":"cst830"} as const);
export type TCSTIBSCBS = typeof TCSTIBSCBS[keyof typeof TCSTIBSCBS];
export const TCSTIcms = Object.freeze({"cstVazio":"cstVazio","cst00":"cst00","cst10":"cst10","cst20":"cst20","cst30":"cst30","cst40":"cst40","cst41":"cst41","cst45":"cst45","cst50":"cst50","cst51":"cst51","cst60":"cst60","cst70":"cst70","cst80":"cst80","cst81":"cst81","cst90":"cst90","cstICMSOutraUF":"cstICMSOutraUF","cstICMSSN":"cstICMSSN","cstPart10":"cstPart10","cstPart90":"cstPart90","cstRep41":"cstRep41","cstRep60":"cstRep60","cst02":"cst02","cst15":"cst15","cst53":"cst53","cst61":"cst61","cst01":"cst01","cst12":"cst12","cst13":"cst13","cst14":"cst14","cst21":"cst21","cst72":"cst72","cst73":"cst73","cst74":"cst74","cstPart20":"cstPart20"} as const);
export type TCSTIcms = typeof TCSTIcms[keyof typeof TCSTIcms];
export const TCSTPis = Object.freeze({"pis01":"pis01","pis02":"pis02","pis03":"pis03","pis04":"pis04","pis05":"pis05","pis06":"pis06","pis07":"pis07","pis08":"pis08","pis09":"pis09","pis49":"pis49","pis50":"pis50","pis51":"pis51","pis52":"pis52","pis53":"pis53","pis54":"pis54","pis55":"pis55","pis56":"pis56","pis60":"pis60","pis61":"pis61","pis62":"pis62","pis63":"pis63","pis64":"pis64","pis65":"pis65","pis66":"pis66","pis67":"pis67","pis70":"pis70","pis71":"pis71","pis72":"pis72","pis73":"pis73","pis74":"pis74","pis75":"pis75","pis98":"pis98","pis99":"pis99"} as const);
export type TCSTPis = typeof TCSTPis[keyof typeof TCSTPis];
export type TDeducCollectionInput = TDeducCollectionItemInput[];
export class TDeducCollection extends Array<TDeducCollectionItem> {
  New(input: TDeducCollectionItemInput = {}): TDeducCollectionItem { const item=new TDeducCollectionItem(input); this.push(item); return item; }
}
export interface TDeducCollectionItemInput {
  "vDed"?: string;
  "xDed"?: string;
}
export class TDeducCollectionItem {
  "vDed"?: string;
  "xDed"?: string;
  constructor(input: TDeducCollectionItemInput = {}) {
    validateModel("TDeducCollectionItem", input);
    if (input["vDed"] !== undefined) this["vDed"] = input["vDed"];
    if (input["xDed"] !== undefined) this["xDed"] = input["xDed"];
  }
}
export type TdefensivoCollectionInput = TdefensivoCollectionItemInput[];
export class TdefensivoCollection extends Array<TdefensivoCollectionItem> {
  New(input: TdefensivoCollectionItemInput = {}): TdefensivoCollectionItem { const item=new TdefensivoCollectionItem(input); this.push(item); return item; }
}
export interface TdefensivoCollectionItemInput {
  "CPFRespTec"?: string;
  "nReceituario"?: string;
}
export class TdefensivoCollectionItem {
  "CPFRespTec"?: string;
  "nReceituario"?: string;
  constructor(input: TdefensivoCollectionItemInput = {}) {
    validateModel("TdefensivoCollectionItem", input);
    if (input["CPFRespTec"] !== undefined) this["CPFRespTec"] = input["CPFRespTec"];
    if (input["nReceituario"] !== undefined) this["nReceituario"] = input["nReceituario"];
  }
}
export interface TDestInput {
  "CNPJCPF"?: string;
  "Email"?: string;
  "EnderDest"?: TEnderDestInput;
  "idEstrangeiro"?: string;
  "IE"?: string;
  "IM"?: string;
  "indIEDest"?: TindIEDest;
  "ISUF"?: string;
  "xNome"?: string;
}
export class TDest {
  "CNPJCPF"?: string;
  "Email"?: string;
  "EnderDest" = new TEnderDest();
  "idEstrangeiro"?: string;
  "IE"?: string;
  "IM"?: string;
  "indIEDest"?: TindIEDest;
  "ISUF"?: string;
  "xNome"?: string;
  constructor(input: TDestInput = {}) {
    validateModel("TDest", input);
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["Email"] !== undefined) this["Email"] = input["Email"];
    if (input["EnderDest"] !== undefined) this["EnderDest"] = new TEnderDest(input["EnderDest"]);
    if (input["idEstrangeiro"] !== undefined) this["idEstrangeiro"] = input["idEstrangeiro"];
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["IM"] !== undefined) this["IM"] = input["IM"];
    if (input["indIEDest"] !== undefined) this["indIEDest"] = input["indIEDest"];
    if (input["ISUF"] !== undefined) this["ISUF"] = input["ISUF"];
    if (input["xNome"] !== undefined) this["xNome"] = input["xNome"];
  }
}
export type TDetCollectionInput = TDetCollectionItemInput[];
export class TDetCollection extends Array<TDetCollectionItem> {
  New(input: TDetCollectionItemInput = {}): TDetCollectionItem { const item=new TDetCollectionItem(input); this.push(item); return item; }
}
export interface TDetCollectionItemInput {
  "DFeReferenciado"?: TDFeReferenciadoInput;
  "Imposto"?: TImpostoInput;
  "infAdProd"?: string;
  "obsCont"?: TobsItemInput;
  "obsFisco"?: TobsItemInput;
  "pDevol"?: string;
  "Prod"?: TProdInput;
  "vIPIDevol"?: string;
  "vItem"?: string;
}
export class TDetCollectionItem {
  "DFeReferenciado" = new TDFeReferenciado();
  "Imposto" = new TImposto();
  "infAdProd"?: string;
  "obsCont" = new TobsItem();
  "obsFisco" = new TobsItem();
  "pDevol"?: string;
  "Prod" = new TProd();
  "vIPIDevol"?: string;
  "vItem"?: string;
  constructor(input: TDetCollectionItemInput = {}) {
    validateModel("TDetCollectionItem", input);
    if (input["DFeReferenciado"] !== undefined) this["DFeReferenciado"] = new TDFeReferenciado(input["DFeReferenciado"]);
    if (input["Imposto"] !== undefined) this["Imposto"] = new TImposto(input["Imposto"]);
    if (input["infAdProd"] !== undefined) this["infAdProd"] = input["infAdProd"];
    if (input["obsCont"] !== undefined) this["obsCont"] = new TobsItem(input["obsCont"]);
    if (input["obsFisco"] !== undefined) this["obsFisco"] = new TobsItem(input["obsFisco"]);
    if (input["pDevol"] !== undefined) this["pDevol"] = input["pDevol"];
    if (input["Prod"] !== undefined) this["Prod"] = new TProd(input["Prod"]);
    if (input["vIPIDevol"] !== undefined) this["vIPIDevol"] = input["vIPIDevol"];
    if (input["vItem"] !== undefined) this["vItem"] = input["vItem"];
  }
}
export type TdetExportCollectionInput = TdetExportCollectionItemInput[];
export class TdetExportCollection extends Array<TdetExportCollectionItem> {
  New(input: TdetExportCollectionItemInput = {}): TdetExportCollectionItem { const item=new TdetExportCollectionItem(input); this.push(item); return item; }
}
export interface TdetExportCollectionItemInput {
  "chNFe"?: string;
  "nDraw"?: string;
  "nRE"?: string;
  "qExport"?: string;
}
export class TdetExportCollectionItem {
  "chNFe"?: string;
  "nDraw"?: string;
  "nRE"?: string;
  "qExport"?: string;
  constructor(input: TdetExportCollectionItemInput = {}) {
    validateModel("TdetExportCollectionItem", input);
    if (input["chNFe"] !== undefined) this["chNFe"] = input["chNFe"];
    if (input["nDraw"] !== undefined) this["nDraw"] = input["nDraw"];
    if (input["nRE"] !== undefined) this["nRE"] = input["nRE"];
    if (input["qExport"] !== undefined) this["qExport"] = input["qExport"];
  }
}
export type TDFErefCollectionInput = TDFErefCollectionItemInput[];
export class TDFErefCollection extends Array<TDFErefCollectionItem> {
  New(input: TDFErefCollectionItemInput = {}): TDFErefCollectionItem { const item=new TDFErefCollectionItem(input); this.push(item); return item; }
}
export interface TDFErefCollectionItemInput {
  "refDFeChave"?: string;
}
export class TDFErefCollectionItem {
  "refDFeChave"?: string;
  constructor(input: TDFErefCollectionItemInput = {}) {
    validateModel("TDFErefCollectionItem", input);
    if (input["refDFeChave"] !== undefined) this["refDFeChave"] = input["refDFeChave"];
  }
}
export interface TDFeReferenciadoInput {
  "chaveAcesso"?: string;
  "nItem"?: number;
}
export class TDFeReferenciado {
  "chaveAcesso"?: string;
  "nItem"?: number;
  constructor(input: TDFeReferenciadoInput = {}) {
    validateModel("TDFeReferenciado", input);
    if (input["chaveAcesso"] !== undefined) this["chaveAcesso"] = input["chaveAcesso"];
    if (input["nItem"] !== undefined) this["nItem"] = input["nItem"];
  }
}
export type TDICollectionInput = TDICollectionItemInput[];
export class TDICollection extends Array<TDICollectionItem> {
  New(input: TDICollectionItemInput = {}): TDICollectionItem { const item=new TDICollectionItem(input); this.push(item); return item; }
}
export interface TDICollectionItemInput {
  "adi"?: TAdiCollectionInput;
  "cExportador"?: string;
  "CNPJ"?: string;
  "dDesemb"?: string;
  "dDi"?: string;
  "nDi"?: string;
  "tpIntermedio"?: TpcnTipoIntermedio;
  "tpViaTransp"?: TpcnTipoViaTransp;
  "UFDesemb"?: string;
  "UFTerceiro"?: string;
  "vAFRMM"?: string;
  "xLocDesemb"?: string;
}
export class TDICollectionItem {
  "adi" = new TAdiCollection();
  "cExportador"?: string;
  "CNPJ"?: string;
  "dDesemb"?: string;
  "dDi"?: string;
  "nDi"?: string;
  "tpIntermedio"?: TpcnTipoIntermedio;
  "tpViaTransp"?: TpcnTipoViaTransp;
  "UFDesemb"?: string;
  "UFTerceiro"?: string;
  "vAFRMM"?: string;
  "xLocDesemb"?: string;
  constructor(input: TDICollectionItemInput = {}) {
    validateModel("TDICollectionItem", input);
    if (input["adi"] !== undefined) this["adi"] = Object.assign(new TAdiCollection(), input["adi"].map(v=>new TAdiCollectionItem(v)));
    if (input["cExportador"] !== undefined) this["cExportador"] = input["cExportador"];
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["dDesemb"] !== undefined) this["dDesemb"] = input["dDesemb"];
    if (input["dDi"] !== undefined) this["dDi"] = input["dDi"];
    if (input["nDi"] !== undefined) this["nDi"] = input["nDi"];
    if (input["tpIntermedio"] !== undefined) this["tpIntermedio"] = input["tpIntermedio"];
    if (input["tpViaTransp"] !== undefined) this["tpViaTransp"] = input["tpViaTransp"];
    if (input["UFDesemb"] !== undefined) this["UFDesemb"] = input["UFDesemb"];
    if (input["UFTerceiro"] !== undefined) this["UFTerceiro"] = input["UFTerceiro"];
    if (input["vAFRMM"] !== undefined) this["vAFRMM"] = input["vAFRMM"];
    if (input["xLocDesemb"] !== undefined) this["xLocDesemb"] = input["xLocDesemb"];
  }
}
export type TDupCollectionInput = TDupCollectionItemInput[];
export class TDupCollection extends Array<TDupCollectionItem> {
  New(input: TDupCollectionItemInput = {}): TDupCollectionItem { const item=new TDupCollectionItem(input); this.push(item); return item; }
}
export interface TDupCollectionItemInput {
  "dVenc"?: string;
  "nDup"?: string;
  "vDup"?: string;
}
export class TDupCollectionItem {
  "dVenc"?: string;
  "nDup"?: string;
  "vDup"?: string;
  constructor(input: TDupCollectionItemInput = {}) {
    validateModel("TDupCollectionItem", input);
    if (input["dVenc"] !== undefined) this["dVenc"] = input["dVenc"];
    if (input["nDup"] !== undefined) this["nDup"] = input["nDup"];
    if (input["vDup"] !== undefined) this["vDup"] = input["vDup"];
  }
}
export interface TEmitInput {
  "CNAE"?: string;
  "CNPJCPF"?: string;
  "CRT"?: TpcnCRT;
  "EnderEmit"?: TenderEmitInput;
  "IE"?: string;
  "IEST"?: string;
  "IM"?: string;
  "ISUFEmit"?: string;
  "xFant"?: string;
  "xNome"?: string;
}
export class TEmit {
  "CNAE"?: string;
  "CNPJCPF"?: string;
  "CRT"?: TpcnCRT;
  "EnderEmit" = new TenderEmit();
  "IE"?: string;
  "IEST"?: string;
  "IM"?: string;
  "ISUFEmit"?: string;
  "xFant"?: string;
  "xNome"?: string;
  constructor(input: TEmitInput = {}) {
    validateModel("TEmit", input);
    if (input["CNAE"] !== undefined) this["CNAE"] = input["CNAE"];
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["CRT"] !== undefined) this["CRT"] = input["CRT"];
    if (input["EnderEmit"] !== undefined) this["EnderEmit"] = new TenderEmit(input["EnderEmit"]);
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["IEST"] !== undefined) this["IEST"] = input["IEST"];
    if (input["IM"] !== undefined) this["IM"] = input["IM"];
    if (input["ISUFEmit"] !== undefined) this["ISUFEmit"] = input["ISUFEmit"];
    if (input["xFant"] !== undefined) this["xFant"] = input["xFant"];
    if (input["xNome"] !== undefined) this["xNome"] = input["xNome"];
  }
}
export interface TencerranteInput {
  "nBico"?: number;
  "nBomba"?: number;
  "nTanque"?: number;
  "vEncFin"?: string;
  "vEncIni"?: string;
}
export class Tencerrante {
  "nBico"?: number;
  "nBomba"?: number;
  "nTanque"?: number;
  "vEncFin"?: string;
  "vEncIni"?: string;
  constructor(input: TencerranteInput = {}) {
    validateModel("Tencerrante", input);
    if (input["nBico"] !== undefined) this["nBico"] = input["nBico"];
    if (input["nBomba"] !== undefined) this["nBomba"] = input["nBomba"];
    if (input["nTanque"] !== undefined) this["nTanque"] = input["nTanque"];
    if (input["vEncFin"] !== undefined) this["vEncFin"] = input["vEncFin"];
    if (input["vEncIni"] !== undefined) this["vEncIni"] = input["vEncIni"];
  }
}
export interface TEnderDestInput {
  "CEP"?: number;
  "cMun"?: number;
  "cPais"?: number;
  "fone"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xPais"?: string;
}
export class TEnderDest {
  "CEP"?: number;
  "cMun"?: number;
  "cPais"?: number;
  "fone"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xPais"?: string;
  constructor(input: TEnderDestInput = {}) {
    validateModel("TEnderDest", input);
    if (input["CEP"] !== undefined) this["CEP"] = input["CEP"];
    if (input["cMun"] !== undefined) this["cMun"] = input["cMun"];
    if (input["cPais"] !== undefined) this["cPais"] = input["cPais"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["nro"] !== undefined) this["nro"] = input["nro"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["xBairro"] !== undefined) this["xBairro"] = input["xBairro"];
    if (input["xCpl"] !== undefined) this["xCpl"] = input["xCpl"];
    if (input["xLgr"] !== undefined) this["xLgr"] = input["xLgr"];
    if (input["xMun"] !== undefined) this["xMun"] = input["xMun"];
    if (input["xPais"] !== undefined) this["xPais"] = input["xPais"];
  }
}
export interface TenderEmitInput {
  "CEP"?: number;
  "cMun"?: number;
  "cPais"?: number;
  "fone"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xPais"?: string;
}
export class TenderEmit {
  "CEP"?: number;
  "cMun"?: number;
  "cPais"?: number;
  "fone"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xPais"?: string;
  constructor(input: TenderEmitInput = {}) {
    validateModel("TenderEmit", input);
    if (input["CEP"] !== undefined) this["CEP"] = input["CEP"];
    if (input["cMun"] !== undefined) this["cMun"] = input["cMun"];
    if (input["cPais"] !== undefined) this["cPais"] = input["cPais"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["nro"] !== undefined) this["nro"] = input["nro"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["xBairro"] !== undefined) this["xBairro"] = input["xBairro"];
    if (input["xCpl"] !== undefined) this["xCpl"] = input["xCpl"];
    if (input["xLgr"] !== undefined) this["xLgr"] = input["xLgr"];
    if (input["xMun"] !== undefined) this["xMun"] = input["xMun"];
    if (input["xPais"] !== undefined) this["xPais"] = input["xPais"];
  }
}
export interface TEntregaInput {
  "CEP"?: number;
  "cMun"?: number;
  "CNPJCPF"?: string;
  "cPais"?: number;
  "Email"?: string;
  "fone"?: string;
  "IE"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xNome"?: string;
  "xPais"?: string;
}
export class TEntrega {
  "CEP"?: number;
  "cMun"?: number;
  "CNPJCPF"?: string;
  "cPais"?: number;
  "Email"?: string;
  "fone"?: string;
  "IE"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xNome"?: string;
  "xPais"?: string;
  constructor(input: TEntregaInput = {}) {
    validateModel("TEntrega", input);
    if (input["CEP"] !== undefined) this["CEP"] = input["CEP"];
    if (input["cMun"] !== undefined) this["cMun"] = input["cMun"];
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["cPais"] !== undefined) this["cPais"] = input["cPais"];
    if (input["Email"] !== undefined) this["Email"] = input["Email"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["nro"] !== undefined) this["nro"] = input["nro"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["xBairro"] !== undefined) this["xBairro"] = input["xBairro"];
    if (input["xCpl"] !== undefined) this["xCpl"] = input["xCpl"];
    if (input["xLgr"] !== undefined) this["xLgr"] = input["xLgr"];
    if (input["xMun"] !== undefined) this["xMun"] = input["xMun"];
    if (input["xNome"] !== undefined) this["xNome"] = input["xNome"];
    if (input["xPais"] !== undefined) this["xPais"] = input["xPais"];
  }
}
export interface TExportaInput {
  "UFembarq"?: string;
  "UFSaidaPais"?: string;
  "xLocDespacho"?: string;
  "xLocEmbarq"?: string;
  "xLocExporta"?: string;
}
export class TExporta {
  "UFembarq"?: string;
  "UFSaidaPais"?: string;
  "xLocDespacho"?: string;
  "xLocEmbarq"?: string;
  "xLocExporta"?: string;
  constructor(input: TExportaInput = {}) {
    validateModel("TExporta", input);
    if (input["UFembarq"] !== undefined) this["UFembarq"] = input["UFembarq"];
    if (input["UFSaidaPais"] !== undefined) this["UFSaidaPais"] = input["UFSaidaPais"];
    if (input["xLocDespacho"] !== undefined) this["xLocDespacho"] = input["xLocDespacho"];
    if (input["xLocEmbarq"] !== undefined) this["xLocEmbarq"] = input["xLocEmbarq"];
    if (input["xLocExporta"] !== undefined) this["xLocExporta"] = input["xLocExporta"];
  }
}
export interface TFatInput {
  "nFat"?: string;
  "vDesc"?: string;
  "vLiq"?: string;
  "vOrig"?: string;
}
export class TFat {
  "nFat"?: string;
  "vDesc"?: string;
  "vLiq"?: string;
  "vOrig"?: string;
  constructor(input: TFatInput = {}) {
    validateModel("TFat", input);
    if (input["nFat"] !== undefined) this["nFat"] = input["nFat"];
    if (input["vDesc"] !== undefined) this["vDesc"] = input["vDesc"];
    if (input["vLiq"] !== undefined) this["vLiq"] = input["vLiq"];
    if (input["vOrig"] !== undefined) this["vOrig"] = input["vOrig"];
  }
}
export type TForDiaCollectionInput = TForDiaCollectionItemInput[];
export class TForDiaCollection extends Array<TForDiaCollectionItem> {
  New(input: TForDiaCollectionItemInput = {}): TForDiaCollectionItem { const item=new TForDiaCollectionItem(input); this.push(item); return item; }
}
export interface TForDiaCollectionItemInput {
  "dia"?: number;
  "qtde"?: string;
}
export class TForDiaCollectionItem {
  "dia"?: number;
  "qtde"?: string;
  constructor(input: TForDiaCollectionItemInput = {}) {
    validateModel("TForDiaCollectionItem", input);
    if (input["dia"] !== undefined) this["dia"] = input["dia"];
    if (input["qtde"] !== undefined) this["qtde"] = input["qtde"];
  }
}
export interface TgAjusteCompetInput {
  "competApur"?: string;
  "vCBS"?: string;
  "vIBS"?: string;
}
export class TgAjusteCompet {
  "competApur"?: string;
  "vCBS"?: string;
  "vIBS"?: string;
  constructor(input: TgAjusteCompetInput = {}) {
    validateModel("TgAjusteCompet", input);
    if (input["competApur"] !== undefined) this["competApur"] = input["competApur"];
    if (input["vCBS"] !== undefined) this["vCBS"] = input["vCBS"];
    if (input["vIBS"] !== undefined) this["vIBS"] = input["vIBS"];
  }
}
export interface TgALCZFMCBSInput {
  "nProcSuframa"?: string;
  "pAliqEfetRegCBS"?: string;
  "tpALCZFMCBS"?: TtpALCZFMCBS;
  "vTribRegCBS"?: string;
}
export class TgALCZFMCBS {
  "nProcSuframa"?: string;
  "pAliqEfetRegCBS"?: string;
  "tpALCZFMCBS"?: TtpALCZFMCBS;
  "vTribRegCBS"?: string;
  constructor(input: TgALCZFMCBSInput = {}) {
    validateModel("TgALCZFMCBS", input);
    if (input["nProcSuframa"] !== undefined) this["nProcSuframa"] = input["nProcSuframa"];
    if (input["pAliqEfetRegCBS"] !== undefined) this["pAliqEfetRegCBS"] = input["pAliqEfetRegCBS"];
    if (input["tpALCZFMCBS"] !== undefined) this["tpALCZFMCBS"] = input["tpALCZFMCBS"];
    if (input["vTribRegCBS"] !== undefined) this["vTribRegCBS"] = input["vTribRegCBS"];
  }
}
export interface TgCBSInput {
  "vCBS"?: string;
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
  "vDevTrib"?: string;
  "vDif"?: string;
}
export class TgCBS {
  "vCBS"?: string;
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
  "vDevTrib"?: string;
  "vDif"?: string;
  constructor(input: TgCBSInput = {}) {
    validateModel("TgCBS", input);
    if (input["vCBS"] !== undefined) this["vCBS"] = input["vCBS"];
    if (input["vCredPres"] !== undefined) this["vCredPres"] = input["vCredPres"];
    if (input["vCredPresCondSus"] !== undefined) this["vCredPresCondSus"] = input["vCredPresCondSus"];
    if (input["vDevTrib"] !== undefined) this["vDevTrib"] = input["vDevTrib"];
    if (input["vDif"] !== undefined) this["vDif"] = input["vDif"];
  }
}
export interface TgCBSMonoAdRemInput {
  "gMonoPadrao"?: TgMonoPadraoCBSQtdeInput;
  "gMonoRet"?: TgMonoRetCBSInput;
  "gMonoReten"?: TgMonoRetenCBSQtdeInput;
  "gpBioDiferenca"?: TgpBioDiferencaCBSInput;
}
export class TgCBSMonoAdRem {
  "gMonoPadrao" = new TgMonoPadraoCBSQtde();
  "gMonoRet" = new TgMonoRetCBS();
  "gMonoReten" = new TgMonoRetenCBSQtde();
  "gpBioDiferenca" = new TgpBioDiferencaCBS();
  constructor(input: TgCBSMonoAdRemInput = {}) {
    validateModel("TgCBSMonoAdRem", input);
    if (input["gMonoPadrao"] !== undefined) this["gMonoPadrao"] = new TgMonoPadraoCBSQtde(input["gMonoPadrao"]);
    if (input["gMonoRet"] !== undefined) this["gMonoRet"] = new TgMonoRetCBS(input["gMonoRet"]);
    if (input["gMonoReten"] !== undefined) this["gMonoReten"] = new TgMonoRetenCBSQtde(input["gMonoReten"]);
    if (input["gpBioDiferenca"] !== undefined) this["gpBioDiferenca"] = new TgpBioDiferencaCBS(input["gpBioDiferenca"]);
  }
}
export interface TgCBSMonoAdValoremInput {
  "gMonoPadrao"?: TgMonoPadraoCBSAliqInput;
  "gMonoRet"?: TgMonoRetCBSInput;
  "gMonoReten"?: TgMonoRetenCBSAliqInput;
  "gpBioDiferenca"?: TgpBioDiferencaCBSInput;
}
export class TgCBSMonoAdValorem {
  "gMonoPadrao" = new TgMonoPadraoCBSAliq();
  "gMonoRet" = new TgMonoRetCBS();
  "gMonoReten" = new TgMonoRetenCBSAliq();
  "gpBioDiferenca" = new TgpBioDiferencaCBS();
  constructor(input: TgCBSMonoAdValoremInput = {}) {
    validateModel("TgCBSMonoAdValorem", input);
    if (input["gMonoPadrao"] !== undefined) this["gMonoPadrao"] = new TgMonoPadraoCBSAliq(input["gMonoPadrao"]);
    if (input["gMonoRet"] !== undefined) this["gMonoRet"] = new TgMonoRetCBS(input["gMonoRet"]);
    if (input["gMonoReten"] !== undefined) this["gMonoReten"] = new TgMonoRetenCBSAliq(input["gMonoReten"]);
    if (input["gpBioDiferenca"] !== undefined) this["gpBioDiferenca"] = new TgpBioDiferencaCBS(input["gpBioDiferenca"]);
  }
}
export interface TgCBSValoresInput {
  "gALCZFMCBS"?: TgALCZFMCBSInput;
  "gDevTrib"?: TgDevTribInput;
  "gDif"?: TgDifInput;
  "gRed"?: TgRedInput;
  "pCBS"?: string;
  "vCBS"?: string;
}
export class TgCBSValores {
  "gALCZFMCBS" = new TgALCZFMCBS();
  "gDevTrib" = new TgDevTrib();
  "gDif" = new TgDif();
  "gRed" = new TgRed();
  "pCBS"?: string;
  "vCBS"?: string;
  constructor(input: TgCBSValoresInput = {}) {
    validateModel("TgCBSValores", input);
    if (input["gALCZFMCBS"] !== undefined) this["gALCZFMCBS"] = new TgALCZFMCBS(input["gALCZFMCBS"]);
    if (input["gDevTrib"] !== undefined) this["gDevTrib"] = new TgDevTrib(input["gDevTrib"]);
    if (input["gDif"] !== undefined) this["gDif"] = new TgDif(input["gDif"]);
    if (input["gRed"] !== undefined) this["gRed"] = new TgRed(input["gRed"]);
    if (input["pCBS"] !== undefined) this["pCBS"] = input["pCBS"];
    if (input["vCBS"] !== undefined) this["vCBS"] = input["vCBS"];
  }
}
export interface TgCompraGovInput {
  "pRedutor"?: string;
  "refDFeAnt"?: TDFErefCollectionInput;
  "tpEnteGov"?: TtpEnteGov;
  "tpOperGov"?: TtpOperGov;
}
export class TgCompraGov {
  "pRedutor"?: string;
  "refDFeAnt" = new TDFErefCollection();
  "tpEnteGov"?: TtpEnteGov;
  "tpOperGov"?: TtpOperGov;
  constructor(input: TgCompraGovInput = {}) {
    validateModel("TgCompraGov", input);
    if (input["pRedutor"] !== undefined) this["pRedutor"] = input["pRedutor"];
    if (input["refDFeAnt"] !== undefined) this["refDFeAnt"] = Object.assign(new TDFErefCollection(), input["refDFeAnt"].map(v=>new TDFErefCollectionItem(v)));
    if (input["tpEnteGov"] !== undefined) this["tpEnteGov"] = input["tpEnteGov"];
    if (input["tpOperGov"] !== undefined) this["tpOperGov"] = input["tpOperGov"];
  }
}
export interface TgCredPresOperInput {
  "cCredPres"?: TcCredPres;
  "gCBSCredPres"?: TgIBSCBSCredPresInput;
  "gIBSCredPres"?: TgIBSCBSCredPresInput;
  "vBCCredPres"?: string;
}
export class TgCredPresOper {
  "cCredPres"?: TcCredPres;
  "gCBSCredPres" = new TgIBSCBSCredPres();
  "gIBSCredPres" = new TgIBSCBSCredPres();
  "vBCCredPres"?: string;
  constructor(input: TgCredPresOperInput = {}) {
    validateModel("TgCredPresOper", input);
    if (input["cCredPres"] !== undefined) this["cCredPres"] = input["cCredPres"];
    if (input["gCBSCredPres"] !== undefined) this["gCBSCredPres"] = new TgIBSCBSCredPres(input["gCBSCredPres"]);
    if (input["gIBSCredPres"] !== undefined) this["gIBSCredPres"] = new TgIBSCBSCredPres(input["gIBSCredPres"]);
    if (input["vBCCredPres"] !== undefined) this["vBCCredPres"] = input["vBCCredPres"];
  }
}
export interface TgDevTribInput {
  "pDevTrib"?: string;
  "vDevTrib"?: string;
}
export class TgDevTrib {
  "pDevTrib"?: string;
  "vDevTrib"?: string;
  constructor(input: TgDevTribInput = {}) {
    validateModel("TgDevTrib", input);
    if (input["pDevTrib"] !== undefined) this["pDevTrib"] = input["pDevTrib"];
    if (input["vDevTrib"] !== undefined) this["vDevTrib"] = input["vDevTrib"];
  }
}
export interface TgDifInput {
  "pDif"?: string;
  "vDif"?: string;
}
export class TgDif {
  "pDif"?: string;
  "vDif"?: string;
  constructor(input: TgDifInput = {}) {
    validateModel("TgDif", input);
    if (input["pDif"] !== undefined) this["pDif"] = input["pDif"];
    if (input["vDif"] !== undefined) this["vDif"] = input["vDif"];
  }
}
export interface TgEstornoCredInput {
  "vCBSEstCred"?: string;
  "vIBSEstCred"?: string;
}
export class TgEstornoCred {
  "vCBSEstCred"?: string;
  "vIBSEstCred"?: string;
  constructor(input: TgEstornoCredInput = {}) {
    validateModel("TgEstornoCred", input);
    if (input["vCBSEstCred"] !== undefined) this["vCBSEstCred"] = input["vCBSEstCred"];
    if (input["vIBSEstCred"] !== undefined) this["vIBSEstCred"] = input["vIBSEstCred"];
  }
}
export interface TgIBSInput {
  "gIBSMunTot"?: TgIBSMunTotInput;
  "gIBSUFTot"?: TgIBSUFTotInput;
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
  "vIBS"?: string;
}
export class TgIBS {
  "gIBSMunTot" = new TgIBSMunTot();
  "gIBSUFTot" = new TgIBSUFTot();
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
  "vIBS"?: string;
  constructor(input: TgIBSInput = {}) {
    validateModel("TgIBS", input);
    if (input["gIBSMunTot"] !== undefined) this["gIBSMunTot"] = new TgIBSMunTot(input["gIBSMunTot"]);
    if (input["gIBSUFTot"] !== undefined) this["gIBSUFTot"] = new TgIBSUFTot(input["gIBSUFTot"]);
    if (input["vCredPres"] !== undefined) this["vCredPres"] = input["vCredPres"];
    if (input["vCredPresCondSus"] !== undefined) this["vCredPresCondSus"] = input["vCredPresCondSus"];
    if (input["vIBS"] !== undefined) this["vIBS"] = input["vIBS"];
  }
}
export interface TgIBSCBSInput {
  "gCBS"?: TgCBSValoresInput;
  "gIBSMun"?: TgIBSMunValoresInput;
  "gIBSUF"?: TgIBSUFValoresInput;
  "gTribCompraGov"?: TgTribCompraGovInput;
  "gTribRegular"?: TgTribRegularInput;
  "vBC"?: string;
  "vIBS"?: string;
  "vOperacIndiv"?: string;
  "vRedAjusteIndiv"?: string;
  "vRedSocialIndiv"?: string;
  "vTornaIndiv"?: string;
}
export class TgIBSCBS {
  "gCBS" = new TgCBSValores();
  "gIBSMun" = new TgIBSMunValores();
  "gIBSUF" = new TgIBSUFValores();
  "gTribCompraGov" = new TgTribCompraGov();
  "gTribRegular" = new TgTribRegular();
  "vBC"?: string;
  "vIBS"?: string;
  "vOperacIndiv"?: string;
  "vRedAjusteIndiv"?: string;
  "vRedSocialIndiv"?: string;
  "vTornaIndiv"?: string;
  constructor(input: TgIBSCBSInput = {}) {
    validateModel("TgIBSCBS", input);
    if (input["gCBS"] !== undefined) this["gCBS"] = new TgCBSValores(input["gCBS"]);
    if (input["gIBSMun"] !== undefined) this["gIBSMun"] = new TgIBSMunValores(input["gIBSMun"]);
    if (input["gIBSUF"] !== undefined) this["gIBSUF"] = new TgIBSUFValores(input["gIBSUF"]);
    if (input["gTribCompraGov"] !== undefined) this["gTribCompraGov"] = new TgTribCompraGov(input["gTribCompraGov"]);
    if (input["gTribRegular"] !== undefined) this["gTribRegular"] = new TgTribRegular(input["gTribRegular"]);
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vIBS"] !== undefined) this["vIBS"] = input["vIBS"];
    if (input["vOperacIndiv"] !== undefined) this["vOperacIndiv"] = input["vOperacIndiv"];
    if (input["vRedAjusteIndiv"] !== undefined) this["vRedAjusteIndiv"] = input["vRedAjusteIndiv"];
    if (input["vRedSocialIndiv"] !== undefined) this["vRedSocialIndiv"] = input["vRedSocialIndiv"];
    if (input["vTornaIndiv"] !== undefined) this["vTornaIndiv"] = input["vTornaIndiv"];
  }
}
export interface TgIBSCBSCredPresInput {
  "pCredPres"?: string;
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
}
export class TgIBSCBSCredPres {
  "pCredPres"?: string;
  "vCredPres"?: string;
  "vCredPresCondSus"?: string;
  constructor(input: TgIBSCBSCredPresInput = {}) {
    validateModel("TgIBSCBSCredPres", input);
    if (input["pCredPres"] !== undefined) this["pCredPres"] = input["pCredPres"];
    if (input["vCredPres"] !== undefined) this["vCredPres"] = input["vCredPres"];
    if (input["vCredPresCondSus"] !== undefined) this["vCredPresCondSus"] = input["vCredPresCondSus"];
  }
}
export interface TgIBSCBSMonoInput {
  "gCBSMonoAdRem"?: TgCBSMonoAdRemInput;
  "gCBSMonoAdValorem"?: TgCBSMonoAdValoremInput;
  "gIBSMonoAdRem"?: TgIBSMonoAdRemInput;
  "gIBSMonoAdValorem"?: TgIBSMonoAdValoremInput;
  "vTotCBSMonoItem"?: string;
  "vTotIBSMonoItem"?: string;
}
export class TgIBSCBSMono {
  "gCBSMonoAdRem" = new TgCBSMonoAdRem();
  "gCBSMonoAdValorem" = new TgCBSMonoAdValorem();
  "gIBSMonoAdRem" = new TgIBSMonoAdRem();
  "gIBSMonoAdValorem" = new TgIBSMonoAdValorem();
  "vTotCBSMonoItem"?: string;
  "vTotIBSMonoItem"?: string;
  constructor(input: TgIBSCBSMonoInput = {}) {
    validateModel("TgIBSCBSMono", input);
    if (input["gCBSMonoAdRem"] !== undefined) this["gCBSMonoAdRem"] = new TgCBSMonoAdRem(input["gCBSMonoAdRem"]);
    if (input["gCBSMonoAdValorem"] !== undefined) this["gCBSMonoAdValorem"] = new TgCBSMonoAdValorem(input["gCBSMonoAdValorem"]);
    if (input["gIBSMonoAdRem"] !== undefined) this["gIBSMonoAdRem"] = new TgIBSMonoAdRem(input["gIBSMonoAdRem"]);
    if (input["gIBSMonoAdValorem"] !== undefined) this["gIBSMonoAdValorem"] = new TgIBSMonoAdValorem(input["gIBSMonoAdValorem"]);
    if (input["vTotCBSMonoItem"] !== undefined) this["vTotCBSMonoItem"] = input["vTotCBSMonoItem"];
    if (input["vTotIBSMonoItem"] !== undefined) this["vTotIBSMonoItem"] = input["vTotIBSMonoItem"];
  }
}
export interface TgIBSMonoAdRemInput {
  "gMonoPadrao"?: TgMonoPadraoIBSQtdeInput;
  "gMonoRet"?: TgMonoRetIBSInput;
  "gMonoReten"?: TgMonoRetenIBSQtdeInput;
  "gpBioDiferenca"?: TgpBioDiferencaIBSInput;
}
export class TgIBSMonoAdRem {
  "gMonoPadrao" = new TgMonoPadraoIBSQtde();
  "gMonoRet" = new TgMonoRetIBS();
  "gMonoReten" = new TgMonoRetenIBSQtde();
  "gpBioDiferenca" = new TgpBioDiferencaIBS();
  constructor(input: TgIBSMonoAdRemInput = {}) {
    validateModel("TgIBSMonoAdRem", input);
    if (input["gMonoPadrao"] !== undefined) this["gMonoPadrao"] = new TgMonoPadraoIBSQtde(input["gMonoPadrao"]);
    if (input["gMonoRet"] !== undefined) this["gMonoRet"] = new TgMonoRetIBS(input["gMonoRet"]);
    if (input["gMonoReten"] !== undefined) this["gMonoReten"] = new TgMonoRetenIBSQtde(input["gMonoReten"]);
    if (input["gpBioDiferenca"] !== undefined) this["gpBioDiferenca"] = new TgpBioDiferencaIBS(input["gpBioDiferenca"]);
  }
}
export interface TgIBSMonoAdValoremInput {
  "gMonoPadrao"?: TgMonoPadraoIBSAliqInput;
  "gMonoRet"?: TgMonoRetIBSInput;
  "gMonoReten"?: TgMonoRetenIBSAliqInput;
  "gpBioDiferenca"?: TgpBioDiferencaIBSInput;
}
export class TgIBSMonoAdValorem {
  "gMonoPadrao" = new TgMonoPadraoIBSAliq();
  "gMonoRet" = new TgMonoRetIBS();
  "gMonoReten" = new TgMonoRetenIBSAliq();
  "gpBioDiferenca" = new TgpBioDiferencaIBS();
  constructor(input: TgIBSMonoAdValoremInput = {}) {
    validateModel("TgIBSMonoAdValorem", input);
    if (input["gMonoPadrao"] !== undefined) this["gMonoPadrao"] = new TgMonoPadraoIBSAliq(input["gMonoPadrao"]);
    if (input["gMonoRet"] !== undefined) this["gMonoRet"] = new TgMonoRetIBS(input["gMonoRet"]);
    if (input["gMonoReten"] !== undefined) this["gMonoReten"] = new TgMonoRetenIBSAliq(input["gMonoReten"]);
    if (input["gpBioDiferenca"] !== undefined) this["gpBioDiferenca"] = new TgpBioDiferencaIBS(input["gpBioDiferenca"]);
  }
}
export interface TgIBSMunTotInput {
  "vDevTrib"?: string;
  "vDif"?: string;
  "vIBSMun"?: string;
}
export class TgIBSMunTot {
  "vDevTrib"?: string;
  "vDif"?: string;
  "vIBSMun"?: string;
  constructor(input: TgIBSMunTotInput = {}) {
    validateModel("TgIBSMunTot", input);
    if (input["vDevTrib"] !== undefined) this["vDevTrib"] = input["vDevTrib"];
    if (input["vDif"] !== undefined) this["vDif"] = input["vDif"];
    if (input["vIBSMun"] !== undefined) this["vIBSMun"] = input["vIBSMun"];
  }
}
export interface TgIBSMunValoresInput {
  "gDevTrib"?: TgDevTribInput;
  "gDif"?: TgDifInput;
  "gRed"?: TgRedInput;
  "pIBSMun"?: string;
  "vIBSMun"?: string;
}
export class TgIBSMunValores {
  "gDevTrib" = new TgDevTrib();
  "gDif" = new TgDif();
  "gRed" = new TgRed();
  "pIBSMun"?: string;
  "vIBSMun"?: string;
  constructor(input: TgIBSMunValoresInput = {}) {
    validateModel("TgIBSMunValores", input);
    if (input["gDevTrib"] !== undefined) this["gDevTrib"] = new TgDevTrib(input["gDevTrib"]);
    if (input["gDif"] !== undefined) this["gDif"] = new TgDif(input["gDif"]);
    if (input["gRed"] !== undefined) this["gRed"] = new TgRed(input["gRed"]);
    if (input["pIBSMun"] !== undefined) this["pIBSMun"] = input["pIBSMun"];
    if (input["vIBSMun"] !== undefined) this["vIBSMun"] = input["vIBSMun"];
  }
}
export interface TgIBSUFTotInput {
  "vDevTrib"?: string;
  "vDif"?: string;
  "vIBSUF"?: string;
}
export class TgIBSUFTot {
  "vDevTrib"?: string;
  "vDif"?: string;
  "vIBSUF"?: string;
  constructor(input: TgIBSUFTotInput = {}) {
    validateModel("TgIBSUFTot", input);
    if (input["vDevTrib"] !== undefined) this["vDevTrib"] = input["vDevTrib"];
    if (input["vDif"] !== undefined) this["vDif"] = input["vDif"];
    if (input["vIBSUF"] !== undefined) this["vIBSUF"] = input["vIBSUF"];
  }
}
export interface TgIBSUFValoresInput {
  "gDevTrib"?: TgDevTribInput;
  "gDif"?: TgDifInput;
  "gRed"?: TgRedInput;
  "pIBSUF"?: string;
  "vIBSUF"?: string;
}
export class TgIBSUFValores {
  "gDevTrib" = new TgDevTrib();
  "gDif" = new TgDif();
  "gRed" = new TgRed();
  "pIBSUF"?: string;
  "vIBSUF"?: string;
  constructor(input: TgIBSUFValoresInput = {}) {
    validateModel("TgIBSUFValores", input);
    if (input["gDevTrib"] !== undefined) this["gDevTrib"] = new TgDevTrib(input["gDevTrib"]);
    if (input["gDif"] !== undefined) this["gDif"] = new TgDif(input["gDif"]);
    if (input["gRed"] !== undefined) this["gRed"] = new TgRed(input["gRed"]);
    if (input["pIBSUF"] !== undefined) this["pIBSUF"] = input["pIBSUF"];
    if (input["vIBSUF"] !== undefined) this["vIBSUF"] = input["vIBSUF"];
  }
}
export interface TgISInput {
  "adRemIS"?: string;
  "cClassTribIS"?: string;
  "CSTIS"?: string;
  "pIS"?: string;
  "qTrib"?: string;
  "uTrib"?: string;
  "vBCIS"?: string;
  "vIS"?: string;
}
export class TgIS {
  "adRemIS"?: string;
  "cClassTribIS"?: string;
  "CSTIS"?: string;
  "pIS"?: string;
  "qTrib"?: string;
  "uTrib"?: string;
  "vBCIS"?: string;
  "vIS"?: string;
  constructor(input: TgISInput = {}) {
    validateModel("TgIS", input);
    if (input["adRemIS"] !== undefined) this["adRemIS"] = input["adRemIS"];
    if (input["cClassTribIS"] !== undefined) this["cClassTribIS"] = input["cClassTribIS"];
    if (input["CSTIS"] !== undefined) this["CSTIS"] = input["CSTIS"];
    if (input["pIS"] !== undefined) this["pIS"] = input["pIS"];
    if (input["qTrib"] !== undefined) this["qTrib"] = input["qTrib"];
    if (input["uTrib"] !== undefined) this["uTrib"] = input["uTrib"];
    if (input["vBCIS"] !== undefined) this["vBCIS"] = input["vBCIS"];
    if (input["vIS"] !== undefined) this["vIS"] = input["vIS"];
  }
}
export interface TgMonoInput {
  "vCBSMono"?: string;
  "vCBSMonoRet"?: string;
  "vCBSMonoReten"?: string;
  "vIBSMono"?: string;
  "vIBSMonoRet"?: string;
  "vIBSMonoReten"?: string;
}
export class TgMono {
  "vCBSMono"?: string;
  "vCBSMonoRet"?: string;
  "vCBSMonoReten"?: string;
  "vIBSMono"?: string;
  "vIBSMonoRet"?: string;
  "vIBSMonoReten"?: string;
  constructor(input: TgMonoInput = {}) {
    validateModel("TgMono", input);
    if (input["vCBSMono"] !== undefined) this["vCBSMono"] = input["vCBSMono"];
    if (input["vCBSMonoRet"] !== undefined) this["vCBSMonoRet"] = input["vCBSMonoRet"];
    if (input["vCBSMonoReten"] !== undefined) this["vCBSMonoReten"] = input["vCBSMonoReten"];
    if (input["vIBSMono"] !== undefined) this["vIBSMono"] = input["vIBSMono"];
    if (input["vIBSMonoRet"] !== undefined) this["vIBSMonoRet"] = input["vIBSMonoRet"];
    if (input["vIBSMonoReten"] !== undefined) this["vIBSMonoReten"] = input["vIBSMonoReten"];
  }
}
export interface TgMonoPadraoCBSAliqInput {
  "pAliqMonoCBS"?: string;
  "vBCMono"?: string;
  "vCBSMono"?: string;
}
export class TgMonoPadraoCBSAliq {
  "pAliqMonoCBS"?: string;
  "vBCMono"?: string;
  "vCBSMono"?: string;
  constructor(input: TgMonoPadraoCBSAliqInput = {}) {
    validateModel("TgMonoPadraoCBSAliq", input);
    if (input["pAliqMonoCBS"] !== undefined) this["pAliqMonoCBS"] = input["pAliqMonoCBS"];
    if (input["vBCMono"] !== undefined) this["vBCMono"] = input["vBCMono"];
    if (input["vCBSMono"] !== undefined) this["vCBSMono"] = input["vCBSMono"];
  }
}
export interface TgMonoPadraoCBSQtdeInput {
  "adRemCBS"?: string;
  "qBCMono"?: string;
  "vCBSMono"?: string;
}
export class TgMonoPadraoCBSQtde {
  "adRemCBS"?: string;
  "qBCMono"?: string;
  "vCBSMono"?: string;
  constructor(input: TgMonoPadraoCBSQtdeInput = {}) {
    validateModel("TgMonoPadraoCBSQtde", input);
    if (input["adRemCBS"] !== undefined) this["adRemCBS"] = input["adRemCBS"];
    if (input["qBCMono"] !== undefined) this["qBCMono"] = input["qBCMono"];
    if (input["vCBSMono"] !== undefined) this["vCBSMono"] = input["vCBSMono"];
  }
}
export interface TgMonoPadraoIBSAliqInput {
  "pAliqMonoMun"?: string;
  "pAliqMonoUF"?: string;
  "vBCMono"?: string;
  "vIBSMono"?: string;
  "vIBSMonoMun"?: string;
  "vIBSMonoUF"?: string;
}
export class TgMonoPadraoIBSAliq {
  "pAliqMonoMun"?: string;
  "pAliqMonoUF"?: string;
  "vBCMono"?: string;
  "vIBSMono"?: string;
  "vIBSMonoMun"?: string;
  "vIBSMonoUF"?: string;
  constructor(input: TgMonoPadraoIBSAliqInput = {}) {
    validateModel("TgMonoPadraoIBSAliq", input);
    if (input["pAliqMonoMun"] !== undefined) this["pAliqMonoMun"] = input["pAliqMonoMun"];
    if (input["pAliqMonoUF"] !== undefined) this["pAliqMonoUF"] = input["pAliqMonoUF"];
    if (input["vBCMono"] !== undefined) this["vBCMono"] = input["vBCMono"];
    if (input["vIBSMono"] !== undefined) this["vIBSMono"] = input["vIBSMono"];
    if (input["vIBSMonoMun"] !== undefined) this["vIBSMonoMun"] = input["vIBSMonoMun"];
    if (input["vIBSMonoUF"] !== undefined) this["vIBSMonoUF"] = input["vIBSMonoUF"];
  }
}
export interface TgMonoPadraoIBSQtdeInput {
  "adRemIBS"?: string;
  "qBCMono"?: string;
  "vIBSMono"?: string;
}
export class TgMonoPadraoIBSQtde {
  "adRemIBS"?: string;
  "qBCMono"?: string;
  "vIBSMono"?: string;
  constructor(input: TgMonoPadraoIBSQtdeInput = {}) {
    validateModel("TgMonoPadraoIBSQtde", input);
    if (input["adRemIBS"] !== undefined) this["adRemIBS"] = input["adRemIBS"];
    if (input["qBCMono"] !== undefined) this["qBCMono"] = input["qBCMono"];
    if (input["vIBSMono"] !== undefined) this["vIBSMono"] = input["vIBSMono"];
  }
}
export interface TgMonoRetCBSInput {
  "vCBSMonoRet"?: string;
}
export class TgMonoRetCBS {
  "vCBSMonoRet"?: string;
  constructor(input: TgMonoRetCBSInput = {}) {
    validateModel("TgMonoRetCBS", input);
    if (input["vCBSMonoRet"] !== undefined) this["vCBSMonoRet"] = input["vCBSMonoRet"];
  }
}
export interface TgMonoRetenCBSAliqInput {
  "pAliqMonoReten"?: string;
  "vBCMonoReten"?: string;
  "vCBSMonoReten"?: string;
}
export class TgMonoRetenCBSAliq {
  "pAliqMonoReten"?: string;
  "vBCMonoReten"?: string;
  "vCBSMonoReten"?: string;
  constructor(input: TgMonoRetenCBSAliqInput = {}) {
    validateModel("TgMonoRetenCBSAliq", input);
    if (input["pAliqMonoReten"] !== undefined) this["pAliqMonoReten"] = input["pAliqMonoReten"];
    if (input["vBCMonoReten"] !== undefined) this["vBCMonoReten"] = input["vBCMonoReten"];
    if (input["vCBSMonoReten"] !== undefined) this["vCBSMonoReten"] = input["vCBSMonoReten"];
  }
}
export interface TgMonoRetenCBSQtdeInput {
  "adRemCBSReten"?: string;
  "qBCMonoReten"?: string;
  "vCBSMonoReten"?: string;
}
export class TgMonoRetenCBSQtde {
  "adRemCBSReten"?: string;
  "qBCMonoReten"?: string;
  "vCBSMonoReten"?: string;
  constructor(input: TgMonoRetenCBSQtdeInput = {}) {
    validateModel("TgMonoRetenCBSQtde", input);
    if (input["adRemCBSReten"] !== undefined) this["adRemCBSReten"] = input["adRemCBSReten"];
    if (input["qBCMonoReten"] !== undefined) this["qBCMonoReten"] = input["qBCMonoReten"];
    if (input["vCBSMonoReten"] !== undefined) this["vCBSMonoReten"] = input["vCBSMonoReten"];
  }
}
export interface TgMonoRetenIBSAliqInput {
  "pAliqMonoReten"?: string;
  "vBCMonoReten"?: string;
  "vIBSMonoReten"?: string;
}
export class TgMonoRetenIBSAliq {
  "pAliqMonoReten"?: string;
  "vBCMonoReten"?: string;
  "vIBSMonoReten"?: string;
  constructor(input: TgMonoRetenIBSAliqInput = {}) {
    validateModel("TgMonoRetenIBSAliq", input);
    if (input["pAliqMonoReten"] !== undefined) this["pAliqMonoReten"] = input["pAliqMonoReten"];
    if (input["vBCMonoReten"] !== undefined) this["vBCMonoReten"] = input["vBCMonoReten"];
    if (input["vIBSMonoReten"] !== undefined) this["vIBSMonoReten"] = input["vIBSMonoReten"];
  }
}
export interface TgMonoRetenIBSQtdeInput {
  "adRemIBSReten"?: string;
  "qBCMonoReten"?: string;
  "vIBSMonoReten"?: string;
}
export class TgMonoRetenIBSQtde {
  "adRemIBSReten"?: string;
  "qBCMonoReten"?: string;
  "vIBSMonoReten"?: string;
  constructor(input: TgMonoRetenIBSQtdeInput = {}) {
    validateModel("TgMonoRetenIBSQtde", input);
    if (input["adRemIBSReten"] !== undefined) this["adRemIBSReten"] = input["adRemIBSReten"];
    if (input["qBCMonoReten"] !== undefined) this["qBCMonoReten"] = input["qBCMonoReten"];
    if (input["vIBSMonoReten"] !== undefined) this["vIBSMonoReten"] = input["vIBSMonoReten"];
  }
}
export interface TgMonoRetIBSInput {
  "vIBSMonoRet"?: string;
}
export class TgMonoRetIBS {
  "vIBSMonoRet"?: string;
  constructor(input: TgMonoRetIBSInput = {}) {
    validateModel("TgMonoRetIBS", input);
    if (input["vIBSMonoRet"] !== undefined) this["vIBSMonoRet"] = input["vIBSMonoRet"];
  }
}
export interface TgPagAntecipadoInput {
  "refNFe"?: TrefDFePagAntCollectionInput;
}
export class TgPagAntecipado {
  "refNFe" = new TrefDFePagAntCollection();
  constructor(input: TgPagAntecipadoInput = {}) {
    validateModel("TgPagAntecipado", input);
    if (input["refNFe"] !== undefined) this["refNFe"] = Object.assign(new TrefDFePagAntCollection(), input["refNFe"].map(v=>new TrefDFePagAntCollectionItem(v)));
  }
}
export interface TgpBioDiferencaCBSInput {
  "qBCBioComb"?: string;
  "vCBSDiferenca"?: string;
}
export class TgpBioDiferencaCBS {
  "qBCBioComb"?: string;
  "vCBSDiferenca"?: string;
  constructor(input: TgpBioDiferencaCBSInput = {}) {
    validateModel("TgpBioDiferencaCBS", input);
    if (input["qBCBioComb"] !== undefined) this["qBCBioComb"] = input["qBCBioComb"];
    if (input["vCBSDiferenca"] !== undefined) this["vCBSDiferenca"] = input["vCBSDiferenca"];
  }
}
export interface TgpBioDiferencaIBSInput {
  "qBCBioComb"?: string;
  "vIBSDiferenca"?: string;
}
export class TgpBioDiferencaIBS {
  "qBCBioComb"?: string;
  "vIBSDiferenca"?: string;
  constructor(input: TgpBioDiferencaIBSInput = {}) {
    validateModel("TgpBioDiferencaIBS", input);
    if (input["qBCBioComb"] !== undefined) this["qBCBioComb"] = input["qBCBioComb"];
    if (input["vIBSDiferenca"] !== undefined) this["vIBSDiferenca"] = input["vIBSDiferenca"];
  }
}
export interface TgRedInput {
  "pAliqEfet"?: string;
  "pRedAliq"?: string;
}
export class TgRed {
  "pAliqEfet"?: string;
  "pRedAliq"?: string;
  constructor(input: TgRedInput = {}) {
    validateModel("TgRed", input);
    if (input["pAliqEfet"] !== undefined) this["pAliqEfet"] = input["pAliqEfet"];
    if (input["pRedAliq"] !== undefined) this["pRedAliq"] = input["pRedAliq"];
  }
}
export interface TgTransfCredInput {
  "vCBS"?: string;
  "vIBS"?: string;
}
export class TgTransfCred {
  "vCBS"?: string;
  "vIBS"?: string;
  constructor(input: TgTransfCredInput = {}) {
    validateModel("TgTransfCred", input);
    if (input["vCBS"] !== undefined) this["vCBS"] = input["vCBS"];
    if (input["vIBS"] !== undefined) this["vIBS"] = input["vIBS"];
  }
}
export interface TgTribCompraGovInput {
  "pAliqCBS"?: string;
  "pAliqIBSMun"?: string;
  "pAliqIBSUF"?: string;
  "vTribCBS"?: string;
  "vTribIBSMun"?: string;
  "vTribIBSUF"?: string;
}
export class TgTribCompraGov {
  "pAliqCBS"?: string;
  "pAliqIBSMun"?: string;
  "pAliqIBSUF"?: string;
  "vTribCBS"?: string;
  "vTribIBSMun"?: string;
  "vTribIBSUF"?: string;
  constructor(input: TgTribCompraGovInput = {}) {
    validateModel("TgTribCompraGov", input);
    if (input["pAliqCBS"] !== undefined) this["pAliqCBS"] = input["pAliqCBS"];
    if (input["pAliqIBSMun"] !== undefined) this["pAliqIBSMun"] = input["pAliqIBSMun"];
    if (input["pAliqIBSUF"] !== undefined) this["pAliqIBSUF"] = input["pAliqIBSUF"];
    if (input["vTribCBS"] !== undefined) this["vTribCBS"] = input["vTribCBS"];
    if (input["vTribIBSMun"] !== undefined) this["vTribIBSMun"] = input["vTribIBSMun"];
    if (input["vTribIBSUF"] !== undefined) this["vTribIBSUF"] = input["vTribIBSUF"];
  }
}
export interface TgTribRegularInput {
  "cClassTribReg"?: string;
  "CSTReg"?: TCSTIBSCBS;
  "pAliqEfetRegCBS"?: string;
  "pAliqEfetRegIBSMun"?: string;
  "pAliqEfetRegIBSUF"?: string;
  "vTribRegCBS"?: string;
  "vTribRegIBSMun"?: string;
  "vTribRegIBSUF"?: string;
}
export class TgTribRegular {
  "cClassTribReg"?: string;
  "CSTReg"?: TCSTIBSCBS;
  "pAliqEfetRegCBS"?: string;
  "pAliqEfetRegIBSMun"?: string;
  "pAliqEfetRegIBSUF"?: string;
  "vTribRegCBS"?: string;
  "vTribRegIBSMun"?: string;
  "vTribRegIBSUF"?: string;
  constructor(input: TgTribRegularInput = {}) {
    validateModel("TgTribRegular", input);
    if (input["cClassTribReg"] !== undefined) this["cClassTribReg"] = input["cClassTribReg"];
    if (input["CSTReg"] !== undefined) this["CSTReg"] = input["CSTReg"];
    if (input["pAliqEfetRegCBS"] !== undefined) this["pAliqEfetRegCBS"] = input["pAliqEfetRegCBS"];
    if (input["pAliqEfetRegIBSMun"] !== undefined) this["pAliqEfetRegIBSMun"] = input["pAliqEfetRegIBSMun"];
    if (input["pAliqEfetRegIBSUF"] !== undefined) this["pAliqEfetRegIBSUF"] = input["pAliqEfetRegIBSUF"];
    if (input["vTribRegCBS"] !== undefined) this["vTribRegCBS"] = input["vTribRegCBS"];
    if (input["vTribRegIBSMun"] !== undefined) this["vTribRegIBSMun"] = input["vTribRegIBSMun"];
    if (input["vTribRegIBSUF"] !== undefined) this["vTribRegIBSUF"] = input["vTribRegIBSUF"];
  }
}
export interface TguiaTransitoInput {
  "nGuia"?: string;
  "serieGuia"?: string;
  "tpGuia"?: TtpGuia;
  "UFGuia"?: string;
}
export class TguiaTransito {
  "nGuia"?: string;
  "serieGuia"?: string;
  "tpGuia"?: TtpGuia;
  "UFGuia"?: string;
  constructor(input: TguiaTransitoInput = {}) {
    validateModel("TguiaTransito", input);
    if (input["nGuia"] !== undefined) this["nGuia"] = input["nGuia"];
    if (input["serieGuia"] !== undefined) this["serieGuia"] = input["serieGuia"];
    if (input["tpGuia"] !== undefined) this["tpGuia"] = input["tpGuia"];
    if (input["UFGuia"] !== undefined) this["UFGuia"] = input["UFGuia"];
  }
}
export interface TIBSCBSInput {
  "cClassTrib"?: string;
  "CST"?: TCSTIBSCBS;
  "gAjusteCompet"?: TgAjusteCompetInput;
  "gCredPresIBSZFM"?: TCredPresIBSZFMInput;
  "gCredPresOper"?: TgCredPresOperInput;
  "gEstornoCred"?: TgEstornoCredInput;
  "gIBSCBS"?: TgIBSCBSInput;
  "gIBSCBSMono"?: TgIBSCBSMonoInput;
  "gTransfCred"?: TgTransfCredInput;
  "indDoacao"?: TIndicadorEx;
}
export class TIBSCBS {
  "cClassTrib"?: string;
  "CST"?: TCSTIBSCBS;
  "gAjusteCompet" = new TgAjusteCompet();
  "gCredPresIBSZFM" = new TCredPresIBSZFM();
  "gCredPresOper" = new TgCredPresOper();
  "gEstornoCred" = new TgEstornoCred();
  "gIBSCBS" = new TgIBSCBS();
  "gIBSCBSMono" = new TgIBSCBSMono();
  "gTransfCred" = new TgTransfCred();
  "indDoacao"?: TIndicadorEx;
  constructor(input: TIBSCBSInput = {}) {
    validateModel("TIBSCBS", input);
    if (input["cClassTrib"] !== undefined) this["cClassTrib"] = input["cClassTrib"];
    if (input["CST"] !== undefined) this["CST"] = input["CST"];
    if (input["gAjusteCompet"] !== undefined) this["gAjusteCompet"] = new TgAjusteCompet(input["gAjusteCompet"]);
    if (input["gCredPresIBSZFM"] !== undefined) this["gCredPresIBSZFM"] = new TCredPresIBSZFM(input["gCredPresIBSZFM"]);
    if (input["gCredPresOper"] !== undefined) this["gCredPresOper"] = new TgCredPresOper(input["gCredPresOper"]);
    if (input["gEstornoCred"] !== undefined) this["gEstornoCred"] = new TgEstornoCred(input["gEstornoCred"]);
    if (input["gIBSCBS"] !== undefined) this["gIBSCBS"] = new TgIBSCBS(input["gIBSCBS"]);
    if (input["gIBSCBSMono"] !== undefined) this["gIBSCBSMono"] = new TgIBSCBSMono(input["gIBSCBSMono"]);
    if (input["gTransfCred"] !== undefined) this["gTransfCred"] = new TgTransfCred(input["gTransfCred"]);
    if (input["indDoacao"] !== undefined) this["indDoacao"] = input["indDoacao"];
  }
}
export interface TIBSCBSTotInput {
  "gCBS"?: TgCBSInput;
  "gEstornoCred"?: TgEstornoCredInput;
  "gIBS"?: TgIBSInput;
  "gMono"?: TgMonoInput;
  "vBCIBSCBS"?: string;
}
export class TIBSCBSTot {
  "gCBS" = new TgCBS();
  "gEstornoCred" = new TgEstornoCred();
  "gIBS" = new TgIBS();
  "gMono" = new TgMono();
  "vBCIBSCBS"?: string;
  constructor(input: TIBSCBSTotInput = {}) {
    validateModel("TIBSCBSTot", input);
    if (input["gCBS"] !== undefined) this["gCBS"] = new TgCBS(input["gCBS"]);
    if (input["gEstornoCred"] !== undefined) this["gEstornoCred"] = new TgEstornoCred(input["gEstornoCred"]);
    if (input["gIBS"] !== undefined) this["gIBS"] = new TgIBS(input["gIBS"]);
    if (input["gMono"] !== undefined) this["gMono"] = new TgMono(input["gMono"]);
    if (input["vBCIBSCBS"] !== undefined) this["vBCIBSCBS"] = input["vBCIBSCBS"];
  }
}
export interface TICMSInput {
  "adRemICMS"?: string;
  "adRemICMSDif"?: string;
  "adRemICMSRet"?: string;
  "adRemICMSReten"?: string;
  "cBenefRBC"?: string;
  "CSOSN"?: TCSOSNIcms;
  "CST"?: TCSTIcms;
  "indDeduzDeson"?: TIndicadorEx;
  "modBC"?: TpcnDeterminacaoBaseIcms;
  "modBCST"?: TpcnDeterminacaoBaseIcmsST;
  "motDesICMS"?: TpcnMotivoDesoneracaoICMS;
  "motDesICMSST"?: TpcnMotivoDesoneracaoICMS;
  "motRedAdRem"?: TmotRedAdRem;
  "orig"?: TOrigemMercadoria;
  "pBCOp"?: string;
  "pCredSN"?: string;
  "pDif"?: string;
  "pFCP"?: string;
  "pFCPDif"?: string;
  "pFCPST"?: string;
  "pFCPSTRet"?: string;
  "pICMS"?: string;
  "pICMSEfet"?: string;
  "pICMSST"?: string;
  "pMVAST"?: string;
  "pRedAdRem"?: string;
  "pRedBC"?: string;
  "pRedBCEfet"?: string;
  "pRedBCST"?: string;
  "pST"?: string;
  "qBCMono"?: string;
  "qBCMonoDif"?: string;
  "qBCMonoRet"?: string;
  "qBCMonoReten"?: string;
  "UFST"?: string;
  "vBC"?: string;
  "vBCEfet"?: string;
  "vBCFCP"?: string;
  "vBCFCPST"?: string;
  "vBCFCPSTRet"?: string;
  "vBCST"?: string;
  "vBCSTDest"?: string;
  "vBCSTRet"?: string;
  "vCredICMSSN"?: string;
  "vFCP"?: string;
  "vFCPDif"?: string;
  "vFCPEfet"?: string;
  "vFCPST"?: string;
  "vFCPSTRet"?: string;
  "vICMS"?: string;
  "vICMSDeson"?: string;
  "vICMSDif"?: string;
  "vICMSEfet"?: string;
  "vICMSMono"?: string;
  "vICMSMonoDif"?: string;
  "vICMSMonoOp"?: string;
  "vICMSMonoRet"?: string;
  "vICMSMonoReten"?: string;
  "vICMSOp"?: string;
  "vICMSST"?: string;
  "vICMSSTDeson"?: string;
  "vICMSSTDest"?: string;
  "vICMSSTRet"?: string;
  "vICMSSubstituto"?: string;
}
export class TICMS {
  "adRemICMS"?: string;
  "adRemICMSDif"?: string;
  "adRemICMSRet"?: string;
  "adRemICMSReten"?: string;
  "cBenefRBC"?: string;
  "CSOSN"?: TCSOSNIcms;
  /** Pascal streaming default: cst00. Omission preserves the native constructor. */
  "CST"?: TCSTIcms;
  /** Pascal streaming default: tieNenhum. Omission preserves the native constructor. */
  "indDeduzDeson"?: TIndicadorEx;
  /** Pascal streaming default: dbiMargemValorAgregado. Omission preserves the native constructor. */
  "modBC"?: TpcnDeterminacaoBaseIcms;
  /** Pascal streaming default: dbisPrecoTabelado. Omission preserves the native constructor. */
  "modBCST"?: TpcnDeterminacaoBaseIcmsST;
  "motDesICMS"?: TpcnMotivoDesoneracaoICMS;
  "motDesICMSST"?: TpcnMotivoDesoneracaoICMS;
  "motRedAdRem"?: TmotRedAdRem;
  /** Pascal streaming default: oeNacional. Omission preserves the native constructor. */
  "orig"?: TOrigemMercadoria;
  "pBCOp"?: string;
  "pCredSN"?: string;
  "pDif"?: string;
  "pFCP"?: string;
  "pFCPDif"?: string;
  "pFCPST"?: string;
  "pFCPSTRet"?: string;
  "pICMS"?: string;
  "pICMSEfet"?: string;
  "pICMSST"?: string;
  "pMVAST"?: string;
  "pRedAdRem"?: string;
  "pRedBC"?: string;
  "pRedBCEfet"?: string;
  "pRedBCST"?: string;
  "pST"?: string;
  "qBCMono"?: string;
  "qBCMonoDif"?: string;
  "qBCMonoRet"?: string;
  "qBCMonoReten"?: string;
  "UFST"?: string;
  "vBC"?: string;
  "vBCEfet"?: string;
  "vBCFCP"?: string;
  "vBCFCPST"?: string;
  "vBCFCPSTRet"?: string;
  "vBCST"?: string;
  "vBCSTDest"?: string;
  "vBCSTRet"?: string;
  "vCredICMSSN"?: string;
  "vFCP"?: string;
  "vFCPDif"?: string;
  "vFCPEfet"?: string;
  "vFCPST"?: string;
  "vFCPSTRet"?: string;
  "vICMS"?: string;
  "vICMSDeson"?: string;
  "vICMSDif"?: string;
  "vICMSEfet"?: string;
  "vICMSMono"?: string;
  "vICMSMonoDif"?: string;
  "vICMSMonoOp"?: string;
  "vICMSMonoRet"?: string;
  "vICMSMonoReten"?: string;
  "vICMSOp"?: string;
  "vICMSST"?: string;
  "vICMSSTDeson"?: string;
  "vICMSSTDest"?: string;
  "vICMSSTRet"?: string;
  "vICMSSubstituto"?: string;
  constructor(input: TICMSInput = {}) {
    validateModel("TICMS", input);
    if (input["adRemICMS"] !== undefined) this["adRemICMS"] = input["adRemICMS"];
    if (input["adRemICMSDif"] !== undefined) this["adRemICMSDif"] = input["adRemICMSDif"];
    if (input["adRemICMSRet"] !== undefined) this["adRemICMSRet"] = input["adRemICMSRet"];
    if (input["adRemICMSReten"] !== undefined) this["adRemICMSReten"] = input["adRemICMSReten"];
    if (input["cBenefRBC"] !== undefined) this["cBenefRBC"] = input["cBenefRBC"];
    if (input["CSOSN"] !== undefined) this["CSOSN"] = input["CSOSN"];
    if (input["CST"] !== undefined) this["CST"] = input["CST"];
    if (input["indDeduzDeson"] !== undefined) this["indDeduzDeson"] = input["indDeduzDeson"];
    if (input["modBC"] !== undefined) this["modBC"] = input["modBC"];
    if (input["modBCST"] !== undefined) this["modBCST"] = input["modBCST"];
    if (input["motDesICMS"] !== undefined) this["motDesICMS"] = input["motDesICMS"];
    if (input["motDesICMSST"] !== undefined) this["motDesICMSST"] = input["motDesICMSST"];
    if (input["motRedAdRem"] !== undefined) this["motRedAdRem"] = input["motRedAdRem"];
    if (input["orig"] !== undefined) this["orig"] = input["orig"];
    if (input["pBCOp"] !== undefined) this["pBCOp"] = input["pBCOp"];
    if (input["pCredSN"] !== undefined) this["pCredSN"] = input["pCredSN"];
    if (input["pDif"] !== undefined) this["pDif"] = input["pDif"];
    if (input["pFCP"] !== undefined) this["pFCP"] = input["pFCP"];
    if (input["pFCPDif"] !== undefined) this["pFCPDif"] = input["pFCPDif"];
    if (input["pFCPST"] !== undefined) this["pFCPST"] = input["pFCPST"];
    if (input["pFCPSTRet"] !== undefined) this["pFCPSTRet"] = input["pFCPSTRet"];
    if (input["pICMS"] !== undefined) this["pICMS"] = input["pICMS"];
    if (input["pICMSEfet"] !== undefined) this["pICMSEfet"] = input["pICMSEfet"];
    if (input["pICMSST"] !== undefined) this["pICMSST"] = input["pICMSST"];
    if (input["pMVAST"] !== undefined) this["pMVAST"] = input["pMVAST"];
    if (input["pRedAdRem"] !== undefined) this["pRedAdRem"] = input["pRedAdRem"];
    if (input["pRedBC"] !== undefined) this["pRedBC"] = input["pRedBC"];
    if (input["pRedBCEfet"] !== undefined) this["pRedBCEfet"] = input["pRedBCEfet"];
    if (input["pRedBCST"] !== undefined) this["pRedBCST"] = input["pRedBCST"];
    if (input["pST"] !== undefined) this["pST"] = input["pST"];
    if (input["qBCMono"] !== undefined) this["qBCMono"] = input["qBCMono"];
    if (input["qBCMonoDif"] !== undefined) this["qBCMonoDif"] = input["qBCMonoDif"];
    if (input["qBCMonoRet"] !== undefined) this["qBCMonoRet"] = input["qBCMonoRet"];
    if (input["qBCMonoReten"] !== undefined) this["qBCMonoReten"] = input["qBCMonoReten"];
    if (input["UFST"] !== undefined) this["UFST"] = input["UFST"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vBCEfet"] !== undefined) this["vBCEfet"] = input["vBCEfet"];
    if (input["vBCFCP"] !== undefined) this["vBCFCP"] = input["vBCFCP"];
    if (input["vBCFCPST"] !== undefined) this["vBCFCPST"] = input["vBCFCPST"];
    if (input["vBCFCPSTRet"] !== undefined) this["vBCFCPSTRet"] = input["vBCFCPSTRet"];
    if (input["vBCST"] !== undefined) this["vBCST"] = input["vBCST"];
    if (input["vBCSTDest"] !== undefined) this["vBCSTDest"] = input["vBCSTDest"];
    if (input["vBCSTRet"] !== undefined) this["vBCSTRet"] = input["vBCSTRet"];
    if (input["vCredICMSSN"] !== undefined) this["vCredICMSSN"] = input["vCredICMSSN"];
    if (input["vFCP"] !== undefined) this["vFCP"] = input["vFCP"];
    if (input["vFCPDif"] !== undefined) this["vFCPDif"] = input["vFCPDif"];
    if (input["vFCPEfet"] !== undefined) this["vFCPEfet"] = input["vFCPEfet"];
    if (input["vFCPST"] !== undefined) this["vFCPST"] = input["vFCPST"];
    if (input["vFCPSTRet"] !== undefined) this["vFCPSTRet"] = input["vFCPSTRet"];
    if (input["vICMS"] !== undefined) this["vICMS"] = input["vICMS"];
    if (input["vICMSDeson"] !== undefined) this["vICMSDeson"] = input["vICMSDeson"];
    if (input["vICMSDif"] !== undefined) this["vICMSDif"] = input["vICMSDif"];
    if (input["vICMSEfet"] !== undefined) this["vICMSEfet"] = input["vICMSEfet"];
    if (input["vICMSMono"] !== undefined) this["vICMSMono"] = input["vICMSMono"];
    if (input["vICMSMonoDif"] !== undefined) this["vICMSMonoDif"] = input["vICMSMonoDif"];
    if (input["vICMSMonoOp"] !== undefined) this["vICMSMonoOp"] = input["vICMSMonoOp"];
    if (input["vICMSMonoRet"] !== undefined) this["vICMSMonoRet"] = input["vICMSMonoRet"];
    if (input["vICMSMonoReten"] !== undefined) this["vICMSMonoReten"] = input["vICMSMonoReten"];
    if (input["vICMSOp"] !== undefined) this["vICMSOp"] = input["vICMSOp"];
    if (input["vICMSST"] !== undefined) this["vICMSST"] = input["vICMSST"];
    if (input["vICMSSTDeson"] !== undefined) this["vICMSSTDeson"] = input["vICMSSTDeson"];
    if (input["vICMSSTDest"] !== undefined) this["vICMSSTDest"] = input["vICMSSTDest"];
    if (input["vICMSSTRet"] !== undefined) this["vICMSSTRet"] = input["vICMSSTRet"];
    if (input["vICMSSubstituto"] !== undefined) this["vICMSSubstituto"] = input["vICMSSubstituto"];
  }
}
export interface TICMSCombInput {
  "vBCICMS"?: string;
  "vBCICMSST"?: string;
  "vICMS"?: string;
  "vICMSST"?: string;
}
export class TICMSComb {
  "vBCICMS"?: string;
  "vBCICMSST"?: string;
  "vICMS"?: string;
  "vICMSST"?: string;
  constructor(input: TICMSCombInput = {}) {
    validateModel("TICMSComb", input);
    if (input["vBCICMS"] !== undefined) this["vBCICMS"] = input["vBCICMS"];
    if (input["vBCICMSST"] !== undefined) this["vBCICMSST"] = input["vBCICMSST"];
    if (input["vICMS"] !== undefined) this["vICMS"] = input["vICMS"];
    if (input["vICMSST"] !== undefined) this["vICMSST"] = input["vICMSST"];
  }
}
export interface TICMSConsInput {
  "UFcons"?: string;
  "vBCICMSSTCons"?: string;
  "vICMSSTCons"?: string;
}
export class TICMSCons {
  "UFcons"?: string;
  "vBCICMSSTCons"?: string;
  "vICMSSTCons"?: string;
  constructor(input: TICMSConsInput = {}) {
    validateModel("TICMSCons", input);
    if (input["UFcons"] !== undefined) this["UFcons"] = input["UFcons"];
    if (input["vBCICMSSTCons"] !== undefined) this["vBCICMSSTCons"] = input["vBCICMSSTCons"];
    if (input["vICMSSTCons"] !== undefined) this["vICMSSTCons"] = input["vICMSSTCons"];
  }
}
export interface TICMSInterInput {
  "vBCICMSSTDest"?: string;
  "vICMSSTDest"?: string;
}
export class TICMSInter {
  "vBCICMSSTDest"?: string;
  "vICMSSTDest"?: string;
  constructor(input: TICMSInterInput = {}) {
    validateModel("TICMSInter", input);
    if (input["vBCICMSSTDest"] !== undefined) this["vBCICMSSTDest"] = input["vBCICMSSTDest"];
    if (input["vICMSSTDest"] !== undefined) this["vICMSSTDest"] = input["vICMSSTDest"];
  }
}
export interface TICMSTotInput {
  "qBCMono"?: string;
  "qBCMonoRet"?: string;
  "qBCMonoReten"?: string;
  "vBC"?: string;
  "vBCST"?: string;
  "vCOFINS"?: string;
  "vDesc"?: string;
  "vFCP"?: string;
  "vFCPST"?: string;
  "vFCPSTRet"?: string;
  "vFCPUFDest"?: string;
  "vFrete"?: string;
  "vICMS"?: string;
  "vICMSDeson"?: string;
  "vICMSMono"?: string;
  "vICMSMonoRet"?: string;
  "vICMSMonoReten"?: string;
  "vICMSUFDest"?: string;
  "vICMSUFRemet"?: string;
  "vII"?: string;
  "vIPI"?: string;
  "vIPIDevol"?: string;
  "vNF"?: string;
  "vOutro"?: string;
  "vPIS"?: string;
  "vProd"?: string;
  "vSeg"?: string;
  "vST"?: string;
  "vTotTrib"?: string;
}
export class TICMSTot {
  "qBCMono"?: string;
  "qBCMonoRet"?: string;
  "qBCMonoReten"?: string;
  "vBC"?: string;
  "vBCST"?: string;
  "vCOFINS"?: string;
  "vDesc"?: string;
  "vFCP"?: string;
  "vFCPST"?: string;
  "vFCPSTRet"?: string;
  "vFCPUFDest"?: string;
  "vFrete"?: string;
  "vICMS"?: string;
  "vICMSDeson"?: string;
  "vICMSMono"?: string;
  "vICMSMonoRet"?: string;
  "vICMSMonoReten"?: string;
  "vICMSUFDest"?: string;
  "vICMSUFRemet"?: string;
  "vII"?: string;
  "vIPI"?: string;
  "vIPIDevol"?: string;
  "vNF"?: string;
  "vOutro"?: string;
  "vPIS"?: string;
  "vProd"?: string;
  "vSeg"?: string;
  "vST"?: string;
  "vTotTrib"?: string;
  constructor(input: TICMSTotInput = {}) {
    validateModel("TICMSTot", input);
    if (input["qBCMono"] !== undefined) this["qBCMono"] = input["qBCMono"];
    if (input["qBCMonoRet"] !== undefined) this["qBCMonoRet"] = input["qBCMonoRet"];
    if (input["qBCMonoReten"] !== undefined) this["qBCMonoReten"] = input["qBCMonoReten"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vBCST"] !== undefined) this["vBCST"] = input["vBCST"];
    if (input["vCOFINS"] !== undefined) this["vCOFINS"] = input["vCOFINS"];
    if (input["vDesc"] !== undefined) this["vDesc"] = input["vDesc"];
    if (input["vFCP"] !== undefined) this["vFCP"] = input["vFCP"];
    if (input["vFCPST"] !== undefined) this["vFCPST"] = input["vFCPST"];
    if (input["vFCPSTRet"] !== undefined) this["vFCPSTRet"] = input["vFCPSTRet"];
    if (input["vFCPUFDest"] !== undefined) this["vFCPUFDest"] = input["vFCPUFDest"];
    if (input["vFrete"] !== undefined) this["vFrete"] = input["vFrete"];
    if (input["vICMS"] !== undefined) this["vICMS"] = input["vICMS"];
    if (input["vICMSDeson"] !== undefined) this["vICMSDeson"] = input["vICMSDeson"];
    if (input["vICMSMono"] !== undefined) this["vICMSMono"] = input["vICMSMono"];
    if (input["vICMSMonoRet"] !== undefined) this["vICMSMonoRet"] = input["vICMSMonoRet"];
    if (input["vICMSMonoReten"] !== undefined) this["vICMSMonoReten"] = input["vICMSMonoReten"];
    if (input["vICMSUFDest"] !== undefined) this["vICMSUFDest"] = input["vICMSUFDest"];
    if (input["vICMSUFRemet"] !== undefined) this["vICMSUFRemet"] = input["vICMSUFRemet"];
    if (input["vII"] !== undefined) this["vII"] = input["vII"];
    if (input["vIPI"] !== undefined) this["vIPI"] = input["vIPI"];
    if (input["vIPIDevol"] !== undefined) this["vIPIDevol"] = input["vIPIDevol"];
    if (input["vNF"] !== undefined) this["vNF"] = input["vNF"];
    if (input["vOutro"] !== undefined) this["vOutro"] = input["vOutro"];
    if (input["vPIS"] !== undefined) this["vPIS"] = input["vPIS"];
    if (input["vProd"] !== undefined) this["vProd"] = input["vProd"];
    if (input["vSeg"] !== undefined) this["vSeg"] = input["vSeg"];
    if (input["vST"] !== undefined) this["vST"] = input["vST"];
    if (input["vTotTrib"] !== undefined) this["vTotTrib"] = input["vTotTrib"];
  }
}
export interface TICMSUFDestInput {
  "pFCPUFDest"?: string;
  "pICMSInter"?: string;
  "pICMSInterPart"?: string;
  "pICMSUFDest"?: string;
  "vBCFCPUFDest"?: string;
  "vBCUFDest"?: string;
  "vFCPUFDest"?: string;
  "vICMSUFDest"?: string;
  "vICMSUFRemet"?: string;
}
export class TICMSUFDest {
  "pFCPUFDest"?: string;
  "pICMSInter"?: string;
  "pICMSInterPart"?: string;
  "pICMSUFDest"?: string;
  "vBCFCPUFDest"?: string;
  "vBCUFDest"?: string;
  "vFCPUFDest"?: string;
  "vICMSUFDest"?: string;
  "vICMSUFRemet"?: string;
  constructor(input: TICMSUFDestInput = {}) {
    validateModel("TICMSUFDest", input);
    if (input["pFCPUFDest"] !== undefined) this["pFCPUFDest"] = input["pFCPUFDest"];
    if (input["pICMSInter"] !== undefined) this["pICMSInter"] = input["pICMSInter"];
    if (input["pICMSInterPart"] !== undefined) this["pICMSInterPart"] = input["pICMSInterPart"];
    if (input["pICMSUFDest"] !== undefined) this["pICMSUFDest"] = input["pICMSUFDest"];
    if (input["vBCFCPUFDest"] !== undefined) this["vBCFCPUFDest"] = input["vBCFCPUFDest"];
    if (input["vBCUFDest"] !== undefined) this["vBCUFDest"] = input["vBCUFDest"];
    if (input["vFCPUFDest"] !== undefined) this["vFCPUFDest"] = input["vFCPUFDest"];
    if (input["vICMSUFDest"] !== undefined) this["vICMSUFDest"] = input["vICMSUFDest"];
    if (input["vICMSUFRemet"] !== undefined) this["vICMSUFRemet"] = input["vICMSUFRemet"];
  }
}
export interface TIdeInput {
  "cDV"?: number;
  "cIndOp"?: string;
  "cMunFG"?: number;
  "cMunFGIBS"?: number;
  "cNF"?: number;
  "cUF"?: number;
  "dEmi"?: string;
  "dhCont"?: string;
  "dPrevEntrega"?: string;
  "dSaiEnt"?: string;
  "finNFe"?: TpcnFinalidadeNFe;
  "gCompraGov"?: TgCompraGovInput;
  "gPagAntecipado"?: TgPagAntecipadoInput;
  "hSaiEnt"?: string;
  "idDest"?: TpcnDestinoOperacao;
  "indFinal"?: TpcnConsumidorFinal;
  "indIntermed"?: TindIntermed;
  "indPag"?: TpcnIndicadorPagamento;
  "indPres"?: TpcnPresencaComprador;
  "modelo"?: number;
  "natOp"?: string;
  "NFref"?: TNFrefCollectionInput;
  "nNF"?: number;
  "procEmi"?: TACBrProcessoEmissao;
  "serie"?: number;
  "tpAmb"?: TACBrTipoAmbiente;
  "tpEmis"?: TACBrTipoEmissao;
  "tpImp"?: TACBrTipoImpressao;
  "tpNF"?: TTipoNFe;
  "tpNFCredito"?: TtpNFCredito;
  "tpNFDebito"?: TtpNFDebito;
  "verProc"?: string;
  "xJust"?: string;
}
export class TIde {
  "cDV"?: number;
  "cIndOp"?: string;
  "cMunFG"?: number;
  "cMunFGIBS"?: number;
  "cNF"?: number;
  "cUF"?: number;
  "dEmi"?: string;
  "dhCont"?: string;
  "dPrevEntrega"?: string;
  "dSaiEnt"?: string;
  /** Pascal streaming default: fnNormal. Omission preserves the native constructor. */
  "finNFe"?: TpcnFinalidadeNFe;
  "gCompraGov" = new TgCompraGov();
  "gPagAntecipado" = new TgPagAntecipado();
  "hSaiEnt"?: string;
  "idDest"?: TpcnDestinoOperacao;
  "indFinal"?: TpcnConsumidorFinal;
  "indIntermed"?: TindIntermed;
  /** Pascal streaming default: ipPrazo. Omission preserves the native constructor. */
  "indPag"?: TpcnIndicadorPagamento;
  "indPres"?: TpcnPresencaComprador;
  "modelo"?: number;
  "natOp"?: string;
  "NFref" = new TNFrefCollection();
  "nNF"?: number;
  /** Pascal streaming default: peAplicativoContribuinte. Omission preserves the native constructor. */
  "procEmi"?: TACBrProcessoEmissao;
  "serie"?: number;
  /** Pascal streaming default: taHomologacao. Omission preserves the native constructor. */
  "tpAmb"?: TACBrTipoAmbiente;
  /** Pascal streaming default: teNormal. Omission preserves the native constructor. */
  "tpEmis"?: TACBrTipoEmissao;
  /** Pascal streaming default: tiPaisagem. Omission preserves the native constructor. */
  "tpImp"?: TACBrTipoImpressao;
  /** Pascal streaming default: tnSaida. Omission preserves the native constructor. */
  "tpNF"?: TTipoNFe;
  "tpNFCredito"?: TtpNFCredito;
  "tpNFDebito"?: TtpNFDebito;
  "verProc"?: string;
  "xJust"?: string;
  constructor(input: TIdeInput = {}) {
    validateModel("TIde", input);
    if (input["cDV"] !== undefined) this["cDV"] = input["cDV"];
    if (input["cIndOp"] !== undefined) this["cIndOp"] = input["cIndOp"];
    if (input["cMunFG"] !== undefined) this["cMunFG"] = input["cMunFG"];
    if (input["cMunFGIBS"] !== undefined) this["cMunFGIBS"] = input["cMunFGIBS"];
    if (input["cNF"] !== undefined) this["cNF"] = input["cNF"];
    if (input["cUF"] !== undefined) this["cUF"] = input["cUF"];
    if (input["dEmi"] !== undefined) this["dEmi"] = input["dEmi"];
    if (input["dhCont"] !== undefined) this["dhCont"] = input["dhCont"];
    if (input["dPrevEntrega"] !== undefined) this["dPrevEntrega"] = input["dPrevEntrega"];
    if (input["dSaiEnt"] !== undefined) this["dSaiEnt"] = input["dSaiEnt"];
    if (input["finNFe"] !== undefined) this["finNFe"] = input["finNFe"];
    if (input["gCompraGov"] !== undefined) this["gCompraGov"] = new TgCompraGov(input["gCompraGov"]);
    if (input["gPagAntecipado"] !== undefined) this["gPagAntecipado"] = new TgPagAntecipado(input["gPagAntecipado"]);
    if (input["hSaiEnt"] !== undefined) this["hSaiEnt"] = input["hSaiEnt"];
    if (input["idDest"] !== undefined) this["idDest"] = input["idDest"];
    if (input["indFinal"] !== undefined) this["indFinal"] = input["indFinal"];
    if (input["indIntermed"] !== undefined) this["indIntermed"] = input["indIntermed"];
    if (input["indPag"] !== undefined) this["indPag"] = input["indPag"];
    if (input["indPres"] !== undefined) this["indPres"] = input["indPres"];
    if (input["modelo"] !== undefined) this["modelo"] = input["modelo"];
    if (input["natOp"] !== undefined) this["natOp"] = input["natOp"];
    if (input["NFref"] !== undefined) this["NFref"] = Object.assign(new TNFrefCollection(), input["NFref"].map(v=>new TNFrefCollectionItem(v)));
    if (input["nNF"] !== undefined) this["nNF"] = input["nNF"];
    if (input["procEmi"] !== undefined) this["procEmi"] = input["procEmi"];
    if (input["serie"] !== undefined) this["serie"] = input["serie"];
    if (input["tpAmb"] !== undefined) this["tpAmb"] = input["tpAmb"];
    if (input["tpEmis"] !== undefined) this["tpEmis"] = input["tpEmis"];
    if (input["tpImp"] !== undefined) this["tpImp"] = input["tpImp"];
    if (input["tpNF"] !== undefined) this["tpNF"] = input["tpNF"];
    if (input["tpNFCredito"] !== undefined) this["tpNFCredito"] = input["tpNFCredito"];
    if (input["tpNFDebito"] !== undefined) this["tpNFDebito"] = input["tpNFDebito"];
    if (input["verProc"] !== undefined) this["verProc"] = input["verProc"];
    if (input["xJust"] !== undefined) this["xJust"] = input["xJust"];
  }
}
export interface TIIInput {
  "vBc"?: string;
  "vDespAdu"?: string;
  "vII"?: string;
  "vIOF"?: string;
}
export class TII {
  "vBc"?: string;
  "vDespAdu"?: string;
  "vII"?: string;
  "vIOF"?: string;
  constructor(input: TIIInput = {}) {
    validateModel("TII", input);
    if (input["vBc"] !== undefined) this["vBc"] = input["vBc"];
    if (input["vDespAdu"] !== undefined) this["vDespAdu"] = input["vDespAdu"];
    if (input["vII"] !== undefined) this["vII"] = input["vII"];
    if (input["vIOF"] !== undefined) this["vIOF"] = input["vIOF"];
  }
}
export interface TImpostoInput {
  "COFINS"?: TCOFINSInput;
  "COFINSST"?: TCOFINSSTInput;
  "IBSCBS"?: TIBSCBSInput;
  "ICMS"?: TICMSInput;
  "ICMSUFDest"?: TICMSUFDestInput;
  "II"?: TIIInput;
  "IPI"?: TIPIInput;
  "ISel"?: TgISInput;
  "ISSQN"?: TISSQNInput;
  "PIS"?: TPISInput;
  "PISST"?: TPISSTInput;
  "vTotTrib"?: string;
}
export class TImposto {
  "COFINS" = new TCOFINS();
  "COFINSST" = new TCOFINSST();
  "IBSCBS" = new TIBSCBS();
  "ICMS" = new TICMS();
  "ICMSUFDest" = new TICMSUFDest();
  "II" = new TII();
  "IPI" = new TIPI();
  "ISel" = new TgIS();
  "ISSQN" = new TISSQN();
  "PIS" = new TPIS();
  "PISST" = new TPISST();
  "vTotTrib"?: string;
  constructor(input: TImpostoInput = {}) {
    validateModel("TImposto", input);
    if (input["COFINS"] !== undefined) this["COFINS"] = new TCOFINS(input["COFINS"]);
    if (input["COFINSST"] !== undefined) this["COFINSST"] = new TCOFINSST(input["COFINSST"]);
    if (input["IBSCBS"] !== undefined) this["IBSCBS"] = new TIBSCBS(input["IBSCBS"]);
    if (input["ICMS"] !== undefined) this["ICMS"] = new TICMS(input["ICMS"]);
    if (input["ICMSUFDest"] !== undefined) this["ICMSUFDest"] = new TICMSUFDest(input["ICMSUFDest"]);
    if (input["II"] !== undefined) this["II"] = new TII(input["II"]);
    if (input["IPI"] !== undefined) this["IPI"] = new TIPI(input["IPI"]);
    if (input["ISel"] !== undefined) this["ISel"] = new TgIS(input["ISel"]);
    if (input["ISSQN"] !== undefined) this["ISSQN"] = new TISSQN(input["ISSQN"]);
    if (input["PIS"] !== undefined) this["PIS"] = new TPIS(input["PIS"]);
    if (input["PISST"] !== undefined) this["PISST"] = new TPISST(input["PISST"]);
    if (input["vTotTrib"] !== undefined) this["vTotTrib"] = input["vTotTrib"];
  }
}
export const TIndicadorEx = Object.freeze({"tieNenhum":"tieNenhum","tieSim":"tieSim","tieNao":"tieNao"} as const);
export type TIndicadorEx = typeof TIndicadorEx[keyof typeof TIndicadorEx];
export const TindIEDest = Object.freeze({"inContribuinte":"inContribuinte","inIsento":"inIsento","inNaoContribuinte":"inNaoContribuinte"} as const);
export type TindIEDest = typeof TindIEDest[keyof typeof TindIEDest];
export const TindImport = Object.freeze({"iiNacional":"iiNacional","iiImportado":"iiImportado"} as const);
export type TindImport = typeof TindImport[keyof typeof TindImport];
export const TindIncentivo = Object.freeze({"iiSim":"iiSim","iiNao":"iiNao"} as const);
export type TindIncentivo = typeof TindIncentivo[keyof typeof TindIncentivo];
export const TindIntermed = Object.freeze({"iiSemOperacao":"iiSemOperacao","iiOperacaoSemIntermediador":"iiOperacaoSemIntermediador","iiOperacaoComIntermediador":"iiOperacaoComIntermediador"} as const);
export type TindIntermed = typeof TindIntermed[keyof typeof TindIntermed];
export const TIndSomaCOFINSST = Object.freeze({"iscNenhum":"iscNenhum","iscCOFINSSTNaoCompoe":"iscCOFINSSTNaoCompoe","iscCOFINSSTCompoe":"iscCOFINSSTCompoe"} as const);
export type TIndSomaCOFINSST = typeof TIndSomaCOFINSST[keyof typeof TIndSomaCOFINSST];
export const TIndSomaPISST = Object.freeze({"ispNenhum":"ispNenhum","ispPISSTNaoCompoe":"ispPISSTNaoCompoe","ispPISSTCompoe":"ispPISSTCompoe"} as const);
export type TIndSomaPISST = typeof TIndSomaPISST[keyof typeof TIndSomaPISST];
export interface TInfAdicInput {
  "infAdFisco"?: string;
  "infCpl"?: string;
  "obsCont"?: TobsContCollectionInput;
  "obsFisco"?: TobsFiscoCollectionInput;
  "procRef"?: TprocRefCollectionInput;
}
export class TInfAdic {
  "infAdFisco"?: string;
  "infCpl"?: string;
  "obsCont" = new TobsContCollection();
  "obsFisco" = new TobsFiscoCollection();
  "procRef" = new TprocRefCollection();
  constructor(input: TInfAdicInput = {}) {
    validateModel("TInfAdic", input);
    if (input["infAdFisco"] !== undefined) this["infAdFisco"] = input["infAdFisco"];
    if (input["infCpl"] !== undefined) this["infCpl"] = input["infCpl"];
    if (input["obsCont"] !== undefined) this["obsCont"] = Object.assign(new TobsContCollection(), input["obsCont"].map(v=>new TobsContCollectionItem(v)));
    if (input["obsFisco"] !== undefined) this["obsFisco"] = Object.assign(new TobsFiscoCollection(), input["obsFisco"].map(v=>new TobsFiscoCollectionItem(v)));
    if (input["procRef"] !== undefined) this["procRef"] = Object.assign(new TprocRefCollection(), input["procRef"].map(v=>new TprocRefCollectionItem(v)));
  }
}
export interface TinfIntermedInput {
  "CNPJ"?: string;
  "idCadIntTran"?: string;
}
export class TinfIntermed {
  "CNPJ"?: string;
  "idCadIntTran"?: string;
  constructor(input: TinfIntermedInput = {}) {
    validateModel("TinfIntermed", input);
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["idCadIntTran"] !== undefined) this["idCadIntTran"] = input["idCadIntTran"];
  }
}
export interface TinfNFeInput {
  "ID"?: string;
  "Versao"?: string;
}
export class TinfNFe {
  "ID"?: string;
  "Versao"?: string;
  constructor(input: TinfNFeInput = {}) {
    validateModel("TinfNFe", input);
    if (input["ID"] !== undefined) this["ID"] = input["ID"];
    if (input["Versao"] !== undefined) this["Versao"] = input["Versao"];
  }
}
export interface TinfNFeSuplInput {
  "qrCode"?: string;
  "urlChave"?: string;
}
export class TinfNFeSupl {
  "qrCode"?: string;
  "urlChave"?: string;
  constructor(input: TinfNFeSuplInput = {}) {
    validateModel("TinfNFeSupl", input);
    if (input["qrCode"] !== undefined) this["qrCode"] = input["qrCode"];
    if (input["urlChave"] !== undefined) this["urlChave"] = input["urlChave"];
  }
}
export interface TinfPAAInput {
  "CNPJPAA"?: string;
  "Exponent"?: string;
  "Modulus"?: string;
  "SignatureValue"?: string;
}
export class TinfPAA {
  "CNPJPAA"?: string;
  "Exponent"?: string;
  "Modulus"?: string;
  "SignatureValue"?: string;
  constructor(input: TinfPAAInput = {}) {
    validateModel("TinfPAA", input);
    if (input["CNPJPAA"] !== undefined) this["CNPJPAA"] = input["CNPJPAA"];
    if (input["Exponent"] !== undefined) this["Exponent"] = input["Exponent"];
    if (input["Modulus"] !== undefined) this["Modulus"] = input["Modulus"];
    if (input["SignatureValue"] !== undefined) this["SignatureValue"] = input["SignatureValue"];
  }
}
export interface TinfRespTecInput {
  "CNPJ"?: string;
  "email"?: string;
  "fone"?: string;
  "hashCSRT"?: string;
  "idCSRT"?: number;
  "xContato"?: string;
}
export class TinfRespTec {
  "CNPJ"?: string;
  "email"?: string;
  "fone"?: string;
  "hashCSRT"?: string;
  "idCSRT"?: number;
  "xContato"?: string;
  constructor(input: TinfRespTecInput = {}) {
    validateModel("TinfRespTec", input);
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["email"] !== undefined) this["email"] = input["email"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["hashCSRT"] !== undefined) this["hashCSRT"] = input["hashCSRT"];
    if (input["idCSRT"] !== undefined) this["idCSRT"] = input["idCSRT"];
    if (input["xContato"] !== undefined) this["xContato"] = input["xContato"];
  }
}
export interface TIPIInput {
  "cEnq"?: string;
  "clEnq"?: string;
  "CNPJProd"?: string;
  "cSelo"?: string;
  "CST"?: TpcnCstIpi;
  "pIPI"?: string;
  "qSelo"?: number;
  "qUnid"?: string;
  "vBC"?: string;
  "vIPI"?: string;
  "vUnid"?: string;
}
export class TIPI {
  "cEnq"?: string;
  "clEnq"?: string;
  "CNPJProd"?: string;
  "cSelo"?: string;
  /** Pascal streaming default: ipi00. Omission preserves the native constructor. */
  "CST"?: TpcnCstIpi;
  "pIPI"?: string;
  "qSelo"?: number;
  "qUnid"?: string;
  "vBC"?: string;
  "vIPI"?: string;
  "vUnid"?: string;
  constructor(input: TIPIInput = {}) {
    validateModel("TIPI", input);
    if (input["cEnq"] !== undefined) this["cEnq"] = input["cEnq"];
    if (input["clEnq"] !== undefined) this["clEnq"] = input["clEnq"];
    if (input["CNPJProd"] !== undefined) this["CNPJProd"] = input["CNPJProd"];
    if (input["cSelo"] !== undefined) this["cSelo"] = input["cSelo"];
    if (input["CST"] !== undefined) this["CST"] = input["CST"];
    if (input["pIPI"] !== undefined) this["pIPI"] = input["pIPI"];
    if (input["qSelo"] !== undefined) this["qSelo"] = input["qSelo"];
    if (input["qUnid"] !== undefined) this["qUnid"] = input["qUnid"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vIPI"] !== undefined) this["vIPI"] = input["vIPI"];
    if (input["vUnid"] !== undefined) this["vUnid"] = input["vUnid"];
  }
}
export interface TISSQNInput {
  "cListServ"?: string;
  "cMun"?: number;
  "cMunFG"?: number;
  "cPais"?: number;
  "cServico"?: string;
  "cSitTrib"?: TpcnISSQNcSitTrib;
  "indIncentivo"?: TindIncentivo;
  "indISS"?: TpcnindISS;
  "indISSRet"?: TpcnindISSRet;
  "nProcesso"?: string;
  "vAliq"?: string;
  "vBC"?: string;
  "vDeducao"?: string;
  "vDescCond"?: string;
  "vDescIncond"?: string;
  "vISSQN"?: string;
  "vISSRet"?: string;
  "vOutro"?: string;
}
export class TISSQN {
  "cListServ"?: string;
  "cMun"?: number;
  "cMunFG"?: number;
  "cPais"?: number;
  "cServico"?: string;
  /** Pascal streaming default: ISSQNcSitTribVazio. Omission preserves the native constructor. */
  "cSitTrib"?: TpcnISSQNcSitTrib;
  "indIncentivo"?: TindIncentivo;
  "indISS"?: TpcnindISS;
  "indISSRet"?: TpcnindISSRet;
  "nProcesso"?: string;
  "vAliq"?: string;
  "vBC"?: string;
  "vDeducao"?: string;
  "vDescCond"?: string;
  "vDescIncond"?: string;
  "vISSQN"?: string;
  "vISSRet"?: string;
  "vOutro"?: string;
  constructor(input: TISSQNInput = {}) {
    validateModel("TISSQN", input);
    if (input["cListServ"] !== undefined) this["cListServ"] = input["cListServ"];
    if (input["cMun"] !== undefined) this["cMun"] = input["cMun"];
    if (input["cMunFG"] !== undefined) this["cMunFG"] = input["cMunFG"];
    if (input["cPais"] !== undefined) this["cPais"] = input["cPais"];
    if (input["cServico"] !== undefined) this["cServico"] = input["cServico"];
    if (input["cSitTrib"] !== undefined) this["cSitTrib"] = input["cSitTrib"];
    if (input["indIncentivo"] !== undefined) this["indIncentivo"] = input["indIncentivo"];
    if (input["indISS"] !== undefined) this["indISS"] = input["indISS"];
    if (input["indISSRet"] !== undefined) this["indISSRet"] = input["indISSRet"];
    if (input["nProcesso"] !== undefined) this["nProcesso"] = input["nProcesso"];
    if (input["vAliq"] !== undefined) this["vAliq"] = input["vAliq"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vDeducao"] !== undefined) this["vDeducao"] = input["vDeducao"];
    if (input["vDescCond"] !== undefined) this["vDescCond"] = input["vDescCond"];
    if (input["vDescIncond"] !== undefined) this["vDescIncond"] = input["vDescIncond"];
    if (input["vISSQN"] !== undefined) this["vISSQN"] = input["vISSQN"];
    if (input["vISSRet"] !== undefined) this["vISSRet"] = input["vISSRet"];
    if (input["vOutro"] !== undefined) this["vOutro"] = input["vOutro"];
  }
}
export interface TISSQNtotInput {
  "cRegTrib"?: TRegTribISSQN;
  "dCompet"?: string;
  "vBC"?: string;
  "vCOFINS"?: string;
  "vDeducao"?: string;
  "vDescCond"?: string;
  "vDescIncond"?: string;
  "vISS"?: string;
  "vISSRet"?: string;
  "vOutro"?: string;
  "vPIS"?: string;
  "vServ"?: string;
}
export class TISSQNtot {
  "cRegTrib"?: TRegTribISSQN;
  "dCompet"?: string;
  "vBC"?: string;
  "vCOFINS"?: string;
  "vDeducao"?: string;
  "vDescCond"?: string;
  "vDescIncond"?: string;
  "vISS"?: string;
  "vISSRet"?: string;
  "vOutro"?: string;
  "vPIS"?: string;
  "vServ"?: string;
  constructor(input: TISSQNtotInput = {}) {
    validateModel("TISSQNtot", input);
    if (input["cRegTrib"] !== undefined) this["cRegTrib"] = input["cRegTrib"];
    if (input["dCompet"] !== undefined) this["dCompet"] = input["dCompet"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vCOFINS"] !== undefined) this["vCOFINS"] = input["vCOFINS"];
    if (input["vDeducao"] !== undefined) this["vDeducao"] = input["vDeducao"];
    if (input["vDescCond"] !== undefined) this["vDescCond"] = input["vDescCond"];
    if (input["vDescIncond"] !== undefined) this["vDescIncond"] = input["vDescIncond"];
    if (input["vISS"] !== undefined) this["vISS"] = input["vISS"];
    if (input["vISSRet"] !== undefined) this["vISSRet"] = input["vISSRet"];
    if (input["vOutro"] !== undefined) this["vOutro"] = input["vOutro"];
    if (input["vPIS"] !== undefined) this["vPIS"] = input["vPIS"];
    if (input["vServ"] !== undefined) this["vServ"] = input["vServ"];
  }
}
export interface TISTotInput {
  "vIS"?: string;
}
export class TISTot {
  "vIS"?: string;
  constructor(input: TISTotInput = {}) {
    validateModel("TISTot", input);
    if (input["vIS"] !== undefined) this["vIS"] = input["vIS"];
  }
}
export type TLacresCollectionInput = TLacresCollectionItemInput[];
export class TLacresCollection extends Array<TLacresCollectionItem> {
  New(input: TLacresCollectionItemInput = {}): TLacresCollectionItem { const item=new TLacresCollectionItem(input); this.push(item); return item; }
}
export interface TLacresCollectionItemInput {
  "nLacre"?: string;
}
export class TLacresCollectionItem {
  "nLacre"?: string;
  constructor(input: TLacresCollectionItemInput = {}) {
    validateModel("TLacresCollectionItem", input);
    if (input["nLacre"] !== undefined) this["nLacre"] = input["nLacre"];
  }
}
export type TMedCollectionInput = TMedCollectionItemInput[];
export class TMedCollection extends Array<TMedCollectionItem> {
  New(input: TMedCollectionItemInput = {}): TMedCollectionItem { const item=new TMedCollectionItem(input); this.push(item); return item; }
}
export interface TMedCollectionItemInput {
  "cProdANVISA"?: string;
  "dFab"?: string;
  "dVal"?: string;
  "nLote"?: string;
  "qLote"?: string;
  "vPMC"?: string;
  "xMotivoIsencao"?: string;
}
export class TMedCollectionItem {
  "cProdANVISA"?: string;
  "dFab"?: string;
  "dVal"?: string;
  "nLote"?: string;
  "qLote"?: string;
  "vPMC"?: string;
  "xMotivoIsencao"?: string;
  constructor(input: TMedCollectionItemInput = {}) {
    validateModel("TMedCollectionItem", input);
    if (input["cProdANVISA"] !== undefined) this["cProdANVISA"] = input["cProdANVISA"];
    if (input["dFab"] !== undefined) this["dFab"] = input["dFab"];
    if (input["dVal"] !== undefined) this["dVal"] = input["dVal"];
    if (input["nLote"] !== undefined) this["nLote"] = input["nLote"];
    if (input["qLote"] !== undefined) this["qLote"] = input["qLote"];
    if (input["vPMC"] !== undefined) this["vPMC"] = input["vPMC"];
    if (input["xMotivoIsencao"] !== undefined) this["xMotivoIsencao"] = input["xMotivoIsencao"];
  }
}
export const TmotRedAdRem = Object.freeze({"motTranspColetivo":"motTranspColetivo","motOutros":"motOutros"} as const);
export type TmotRedAdRem = typeof TmotRedAdRem[keyof typeof TmotRedAdRem];
export interface TNFeInput {
  "agropecuario"?: TagropecuarioInput;
  "autXML"?: TautXMLCollectionInput;
  "Avulsa"?: TAvulsaInput;
  "cana"?: TcanaInput;
  "Cobr"?: TCobrInput;
  "compra"?: TCompraInput;
  "Dest"?: TDestInput;
  "Det"?: TDetCollectionInput;
  "Emit"?: TEmitInput;
  "Entrega"?: TEntregaInput;
  "exporta"?: TExportaInput;
  "Ide"?: TIdeInput;
  "InfAdic"?: TInfAdicInput;
  "infIntermed"?: TinfIntermedInput;
  "infNFe"?: TinfNFeInput;
  "infPAA"?: TinfPAAInput;
  "infRespTec"?: TinfRespTecInput;
  "pag"?: TpagCollectionInput;
  "Retirada"?: TRetiradaInput;
  "Total"?: TTotalInput;
  "Transp"?: TTranspInput;
}
export class TNFe {
  "agropecuario" = new Tagropecuario();
  "autXML" = new TautXMLCollection();
  "Avulsa" = new TAvulsa();
  "cana" = new Tcana();
  "Cobr" = new TCobr();
  "compra" = new TCompra();
  "Dest" = new TDest();
  "Det" = new TDetCollection();
  "Emit" = new TEmit();
  "Entrega" = new TEntrega();
  "exporta" = new TExporta();
  "Ide" = new TIde();
  "InfAdic" = new TInfAdic();
  "infIntermed" = new TinfIntermed();
  "infNFe" = new TinfNFe();
  readonly "infNFeSupl"?: TinfNFeSuplInput;
  "infPAA" = new TinfPAA();
  "infRespTec" = new TinfRespTec();
  "pag" = new TpagCollection();
  readonly "procNFe"?: TProcDFeInput;
  "Retirada" = new TRetirada();
  readonly "signature"?: TSignatureInput;
  "Total" = new TTotal();
  "Transp" = new TTransp();
  constructor(input: TNFeInput = {}) {
    validateModel("TNFe", input);
    if (input["agropecuario"] !== undefined) this["agropecuario"] = new Tagropecuario(input["agropecuario"]);
    if (input["autXML"] !== undefined) this["autXML"] = Object.assign(new TautXMLCollection(), input["autXML"].map(v=>new TautXMLCollectionItem(v)));
    if (input["Avulsa"] !== undefined) this["Avulsa"] = new TAvulsa(input["Avulsa"]);
    if (input["cana"] !== undefined) this["cana"] = new Tcana(input["cana"]);
    if (input["Cobr"] !== undefined) this["Cobr"] = new TCobr(input["Cobr"]);
    if (input["compra"] !== undefined) this["compra"] = new TCompra(input["compra"]);
    if (input["Dest"] !== undefined) this["Dest"] = new TDest(input["Dest"]);
    if (input["Det"] !== undefined) this["Det"] = Object.assign(new TDetCollection(), input["Det"].map(v=>new TDetCollectionItem(v)));
    if (input["Emit"] !== undefined) this["Emit"] = new TEmit(input["Emit"]);
    if (input["Entrega"] !== undefined) this["Entrega"] = new TEntrega(input["Entrega"]);
    if (input["exporta"] !== undefined) this["exporta"] = new TExporta(input["exporta"]);
    if (input["Ide"] !== undefined) this["Ide"] = new TIde(input["Ide"]);
    if (input["InfAdic"] !== undefined) this["InfAdic"] = new TInfAdic(input["InfAdic"]);
    if (input["infIntermed"] !== undefined) this["infIntermed"] = new TinfIntermed(input["infIntermed"]);
    if (input["infNFe"] !== undefined) this["infNFe"] = new TinfNFe(input["infNFe"]);
    if (input["infPAA"] !== undefined) this["infPAA"] = new TinfPAA(input["infPAA"]);
    if (input["infRespTec"] !== undefined) this["infRespTec"] = new TinfRespTec(input["infRespTec"]);
    if (input["pag"] !== undefined) this["pag"] = Object.assign(new TpagCollection(), input["pag"].map(v=>new TpagCollectionItem(v)));
    if (input["Retirada"] !== undefined) this["Retirada"] = new TRetirada(input["Retirada"]);
    if (input["Total"] !== undefined) this["Total"] = new TTotal(input["Total"]);
    if (input["Transp"] !== undefined) this["Transp"] = new TTransp(input["Transp"]);
  }
}
export type TNFrefCollectionInput = TNFrefCollectionItemInput[];
export class TNFrefCollection extends Array<TNFrefCollectionItem> {
  New(input: TNFrefCollectionItemInput = {}): TNFrefCollectionItem { const item=new TNFrefCollectionItem(input); this.push(item); return item; }
}
export interface TNFrefCollectionItemInput {
  "refCTe"?: string;
  "RefECF"?: TRefECFInput;
  "RefNF"?: TRefNFInput;
  "refNFe"?: string;
  "refNFeSig"?: string;
  "RefNFP"?: TRefNFPInput;
}
export class TNFrefCollectionItem {
  "refCTe"?: string;
  "RefECF" = new TRefECF();
  "RefNF" = new TRefNF();
  "refNFe"?: string;
  "refNFeSig"?: string;
  "RefNFP" = new TRefNFP();
  constructor(input: TNFrefCollectionItemInput = {}) {
    validateModel("TNFrefCollectionItem", input);
    if (input["refCTe"] !== undefined) this["refCTe"] = input["refCTe"];
    if (input["RefECF"] !== undefined) this["RefECF"] = new TRefECF(input["RefECF"]);
    if (input["RefNF"] !== undefined) this["RefNF"] = new TRefNF(input["RefNF"]);
    if (input["refNFe"] !== undefined) this["refNFe"] = input["refNFe"];
    if (input["refNFeSig"] !== undefined) this["refNFeSig"] = input["refNFeSig"];
    if (input["RefNFP"] !== undefined) this["RefNFP"] = new TRefNFP(input["RefNFP"]);
  }
}
export type TNVECollectionInput = TNVECollectionItemInput[];
export class TNVECollection extends Array<TNVECollectionItem> {
  New(input: TNVECollectionItemInput = {}): TNVECollectionItem { const item=new TNVECollectionItem(input); this.push(item); return item; }
}
export interface TNVECollectionItemInput {
  "NVE"?: string;
}
export class TNVECollectionItem {
  "NVE"?: string;
  constructor(input: TNVECollectionItemInput = {}) {
    validateModel("TNVECollectionItem", input);
    if (input["NVE"] !== undefined) this["NVE"] = input["NVE"];
  }
}
export type TobsContCollectionInput = TobsContCollectionItemInput[];
export class TobsContCollection extends Array<TobsContCollectionItem> {
  New(input: TobsContCollectionItemInput = {}): TobsContCollectionItem { const item=new TobsContCollectionItem(input); this.push(item); return item; }
}
export interface TobsContCollectionItemInput {
  "xCampo"?: string;
  "xTexto"?: string;
}
export class TobsContCollectionItem {
  "xCampo"?: string;
  "xTexto"?: string;
  constructor(input: TobsContCollectionItemInput = {}) {
    validateModel("TobsContCollectionItem", input);
    if (input["xCampo"] !== undefined) this["xCampo"] = input["xCampo"];
    if (input["xTexto"] !== undefined) this["xTexto"] = input["xTexto"];
  }
}
export type TobsFiscoCollectionInput = TobsFiscoCollectionItemInput[];
export class TobsFiscoCollection extends Array<TobsFiscoCollectionItem> {
  New(input: TobsFiscoCollectionItemInput = {}): TobsFiscoCollectionItem { const item=new TobsFiscoCollectionItem(input); this.push(item); return item; }
}
export interface TobsFiscoCollectionItemInput {
  "xCampo"?: string;
  "xTexto"?: string;
}
export class TobsFiscoCollectionItem {
  "xCampo"?: string;
  "xTexto"?: string;
  constructor(input: TobsFiscoCollectionItemInput = {}) {
    validateModel("TobsFiscoCollectionItem", input);
    if (input["xCampo"] !== undefined) this["xCampo"] = input["xCampo"];
    if (input["xTexto"] !== undefined) this["xTexto"] = input["xTexto"];
  }
}
export interface TobsItemInput {
  "xCampo"?: string;
  "xTexto"?: string;
}
export class TobsItem {
  "xCampo"?: string;
  "xTexto"?: string;
  constructor(input: TobsItemInput = {}) {
    validateModel("TobsItem", input);
    if (input["xCampo"] !== undefined) this["xCampo"] = input["xCampo"];
    if (input["xTexto"] !== undefined) this["xTexto"] = input["xTexto"];
  }
}
export type TorigCombCollectionInput = TorigCombCollectionItemInput[];
export class TorigCombCollection extends Array<TorigCombCollectionItem> {
  New(input: TorigCombCollectionItemInput = {}): TorigCombCollectionItem { const item=new TorigCombCollectionItem(input); this.push(item); return item; }
}
export interface TorigCombCollectionItemInput {
  "cUFOrig"?: number;
  "indImport"?: TindImport;
  "pOrig"?: string;
}
export class TorigCombCollectionItem {
  "cUFOrig"?: number;
  "indImport"?: TindImport;
  "pOrig"?: string;
  constructor(input: TorigCombCollectionItemInput = {}) {
    validateModel("TorigCombCollectionItem", input);
    if (input["cUFOrig"] !== undefined) this["cUFOrig"] = input["cUFOrig"];
    if (input["indImport"] !== undefined) this["indImport"] = input["indImport"];
    if (input["pOrig"] !== undefined) this["pOrig"] = input["pOrig"];
  }
}
export const TOrigemMercadoria = Object.freeze({"oeNacional":"oeNacional","oeEstrangeiraImportacaoDireta":"oeEstrangeiraImportacaoDireta","oeEstrangeiraAdquiridaBrasil":"oeEstrangeiraAdquiridaBrasil","oeNacionalConteudoImportacaoSuperior40":"oeNacionalConteudoImportacaoSuperior40","oeNacionalProcessosBasicos":"oeNacionalProcessosBasicos","oeNacionalConteudoImportacaoInferiorIgual40":"oeNacionalConteudoImportacaoInferiorIgual40","oeEstrangeiraImportacaoDiretaSemSimilar":"oeEstrangeiraImportacaoDiretaSemSimilar","oeEstrangeiraAdquiridaBrasilSemSimilar":"oeEstrangeiraAdquiridaBrasilSemSimilar","oeNacionalConteudoImportacaoSuperior70":"oeNacionalConteudoImportacaoSuperior70","oeReservadoParaUsoFuturo":"oeReservadoParaUsoFuturo","oeVazio":"oeVazio"} as const);
export type TOrigemMercadoria = typeof TOrigemMercadoria[keyof typeof TOrigemMercadoria];
export type TpagCollectionInput = TpagCollectionItemInput[];
export class TpagCollection extends Array<TpagCollectionItem> {
  New(input: TpagCollectionItemInput = {}): TpagCollectionItem { const item=new TpagCollectionItem(input); this.push(item); return item; }
}
export interface TpagCollectionItemInput {
  "cAut"?: string;
  "CNPJ"?: string;
  "CNPJPag"?: string;
  "CNPJReceb"?: string;
  "dPag"?: string;
  "idTermPag"?: string;
  "indPag"?: TpcnIndicadorPagamento;
  "tBand"?: TpcnBandeiraCartao;
  "tPag"?: TpcnFormaPagamento;
  "tpIntegra"?: TtpIntegra;
  "UFPag"?: string;
  "vPag"?: string;
  "xPag"?: string;
}
export class TpagCollectionItem {
  "cAut"?: string;
  "CNPJ"?: string;
  "CNPJPag"?: string;
  "CNPJReceb"?: string;
  "dPag"?: string;
  "idTermPag"?: string;
  /** Pascal streaming default: ipNenhum. Omission preserves the native constructor. */
  "indPag"?: TpcnIndicadorPagamento;
  "tBand"?: TpcnBandeiraCartao;
  "tPag"?: TpcnFormaPagamento;
  "tpIntegra"?: TtpIntegra;
  "UFPag"?: string;
  "vPag"?: string;
  "xPag"?: string;
  constructor(input: TpagCollectionItemInput = {}) {
    validateModel("TpagCollectionItem", input);
    if (input["cAut"] !== undefined) this["cAut"] = input["cAut"];
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["CNPJPag"] !== undefined) this["CNPJPag"] = input["CNPJPag"];
    if (input["CNPJReceb"] !== undefined) this["CNPJReceb"] = input["CNPJReceb"];
    if (input["dPag"] !== undefined) this["dPag"] = input["dPag"];
    if (input["idTermPag"] !== undefined) this["idTermPag"] = input["idTermPag"];
    if (input["indPag"] !== undefined) this["indPag"] = input["indPag"];
    if (input["tBand"] !== undefined) this["tBand"] = input["tBand"];
    if (input["tPag"] !== undefined) this["tPag"] = input["tPag"];
    if (input["tpIntegra"] !== undefined) this["tpIntegra"] = input["tpIntegra"];
    if (input["UFPag"] !== undefined) this["UFPag"] = input["UFPag"];
    if (input["vPag"] !== undefined) this["vPag"] = input["vPag"];
    if (input["xPag"] !== undefined) this["xPag"] = input["xPag"];
  }
}
export const TpcnBandeiraCartao = Object.freeze({"bcVisa":"bcVisa","bcMasterCard":"bcMasterCard","bcAmericanExpress":"bcAmericanExpress","bcSorocred":"bcSorocred","bcDinersClub":"bcDinersClub","bcElo":"bcElo","bcHipercard":"bcHipercard","bcAura":"bcAura","bcCabal":"bcCabal","bcAlelo":"bcAlelo","bcBanesCard":"bcBanesCard","bcCalCard":"bcCalCard","bcCredz":"bcCredz","bcDiscover":"bcDiscover","bcGoodCard":"bcGoodCard","bcGreenCard":"bcGreenCard","bcHiper":"bcHiper","bcJcB":"bcJcB","bcMais":"bcMais","bcMaxVan":"bcMaxVan","bcPolicard":"bcPolicard","bcRedeCompras":"bcRedeCompras","bcSodexo":"bcSodexo","bcValeCard":"bcValeCard","bcVerocheque":"bcVerocheque","bcVR":"bcVR","bcTicket":"bcTicket","bcOutros":"bcOutros"} as const);
export type TpcnBandeiraCartao = typeof TpcnBandeiraCartao[keyof typeof TpcnBandeiraCartao];
export const TpcnCondicaoVeiculo = Object.freeze({"cvAcabado":"cvAcabado","cvInacabado":"cvInacabado","cvSemiAcabado":"cvSemiAcabado"} as const);
export type TpcnCondicaoVeiculo = typeof TpcnCondicaoVeiculo[keyof typeof TpcnCondicaoVeiculo];
export const TpcnConsumidorFinal = Object.freeze({"cfNao":"cfNao","cfConsumidorFinal":"cfConsumidorFinal"} as const);
export type TpcnConsumidorFinal = typeof TpcnConsumidorFinal[keyof typeof TpcnConsumidorFinal];
export const TpcnCRT = Object.freeze({"crtSimplesNacional":"crtSimplesNacional","crtSimplesExcessoReceita":"crtSimplesExcessoReceita","crtRegimeNormal":"crtRegimeNormal","crtMEI":"crtMEI"} as const);
export type TpcnCRT = typeof TpcnCRT[keyof typeof TpcnCRT];
export const TpcnCstIpi = Object.freeze({"ipi00":"ipi00","ipi49":"ipi49","ipi50":"ipi50","ipi99":"ipi99","ipi01":"ipi01","ipi02":"ipi02","ipi03":"ipi03","ipi04":"ipi04","ipi05":"ipi05","ipi51":"ipi51","ipi52":"ipi52","ipi53":"ipi53","ipi54":"ipi54","ipi55":"ipi55"} as const);
export type TpcnCstIpi = typeof TpcnCstIpi[keyof typeof TpcnCstIpi];
export const TpcnDestinoOperacao = Object.freeze({"doInterna":"doInterna","doInterestadual":"doInterestadual","doExterior":"doExterior"} as const);
export type TpcnDestinoOperacao = typeof TpcnDestinoOperacao[keyof typeof TpcnDestinoOperacao];
export const TpcnDeterminacaoBaseIcms = Object.freeze({"dbiMargemValorAgregado":"dbiMargemValorAgregado","dbiPauta":"dbiPauta","dbiPrecoTabelado":"dbiPrecoTabelado","dbiValorOperacao":"dbiValorOperacao","dbiNenhum":"dbiNenhum"} as const);
export type TpcnDeterminacaoBaseIcms = typeof TpcnDeterminacaoBaseIcms[keyof typeof TpcnDeterminacaoBaseIcms];
export const TpcnDeterminacaoBaseIcmsST = Object.freeze({"dbisPrecoTabelado":"dbisPrecoTabelado","dbisListaNegativa":"dbisListaNegativa","dbisListaPositiva":"dbisListaPositiva","dbisListaNeutra":"dbisListaNeutra","dbisMargemValorAgregado":"dbisMargemValorAgregado","dbisPauta":"dbisPauta","dbisValordaOperacao":"dbisValordaOperacao"} as const);
export type TpcnDeterminacaoBaseIcmsST = typeof TpcnDeterminacaoBaseIcmsST[keyof typeof TpcnDeterminacaoBaseIcmsST];
export const TpcnECFModRef = Object.freeze({"ECFModRefVazio":"ECFModRefVazio","ECFModRef2B":"ECFModRef2B","ECFModRef2C":"ECFModRef2C","ECFModRef2D":"ECFModRef2D"} as const);
export type TpcnECFModRef = typeof TpcnECFModRef[keyof typeof TpcnECFModRef];
export const TpcnFinalidadeNFe = Object.freeze({"fnNormal":"fnNormal","fnComplementar":"fnComplementar","fnAjuste":"fnAjuste","fnDevolucao":"fnDevolucao","fnCredito":"fnCredito","fnDebito":"fnDebito"} as const);
export type TpcnFinalidadeNFe = typeof TpcnFinalidadeNFe[keyof typeof TpcnFinalidadeNFe];
export const TpcnFormaPagamento = Object.freeze({"fpDinheiro":"fpDinheiro","fpCheque":"fpCheque","fpCartaoCredito":"fpCartaoCredito","fpCartaoDebito":"fpCartaoDebito","fpCreditoLoja":"fpCreditoLoja","fpValeAlimentacao":"fpValeAlimentacao","fpValeRefeicao":"fpValeRefeicao","fpValePresente":"fpValePresente","fpValeCombustivel":"fpValeCombustivel","fpDuplicataMercantil":"fpDuplicataMercantil","fpBoletoBancario":"fpBoletoBancario","fpDepositoBancario":"fpDepositoBancario","fpPagamentoInstantaneo":"fpPagamentoInstantaneo","fpTransfBancario":"fpTransfBancario","fpProgramaFidelidade":"fpProgramaFidelidade","fpSemPagamento":"fpSemPagamento","fpRegimeEspecial":"fpRegimeEspecial","fpOutro":"fpOutro","fpPagamentoInstantaneoEstatico":"fpPagamentoInstantaneoEstatico","fpCreditoEmLojaPorDevolucao":"fpCreditoEmLojaPorDevolucao","fpFalhaHardware":"fpFalhaHardware","fpPagamentoPosterior":"fpPagamentoPosterior","fpPagInstantaneoPIXAutomatico":"fpPagInstantaneoPIXAutomatico","fpTEFBookTransfer":"fpTEFBookTransfer"} as const);
export type TpcnFormaPagamento = typeof TpcnFormaPagamento[keyof typeof TpcnFormaPagamento];
export const TpcnIndEscala = Object.freeze({"ieRelevante":"ieRelevante","ieNaoRelevante":"ieNaoRelevante","ieNenhum":"ieNenhum"} as const);
export type TpcnIndEscala = typeof TpcnIndEscala[keyof typeof TpcnIndEscala];
export const TpcnIndicadorPagamento = Object.freeze({"ipVista":"ipVista","ipPrazo":"ipPrazo","ipOutras":"ipOutras","ipNenhum":"ipNenhum"} as const);
export type TpcnIndicadorPagamento = typeof TpcnIndicadorPagamento[keyof typeof TpcnIndicadorPagamento];
export const TpcnIndicadorProcesso = Object.freeze({"ipSEFAZ":"ipSEFAZ","ipJusticaFederal":"ipJusticaFederal","ipJusticaEstadual":"ipJusticaEstadual","ipSecexRFB":"ipSecexRFB","ipCONFAZ":"ipCONFAZ","ipOutros":"ipOutros"} as const);
export type TpcnIndicadorProcesso = typeof TpcnIndicadorProcesso[keyof typeof TpcnIndicadorProcesso];
export const TpcnIndicadorTotal = Object.freeze({"itSomaTotalNFe":"itSomaTotalNFe","itNaoSomaTotalNFe":"itNaoSomaTotalNFe"} as const);
export type TpcnIndicadorTotal = typeof TpcnIndicadorTotal[keyof typeof TpcnIndicadorTotal];
export const TpcnindISS = Object.freeze({"iiExigivel":"iiExigivel","iiNaoIncidencia":"iiNaoIncidencia","iiIsencao":"iiIsencao","iiExportacao":"iiExportacao","iiImunidade":"iiImunidade","iiExigSuspDecisaoJudicial":"iiExigSuspDecisaoJudicial","iiExigSuspProcessoAdm":"iiExigSuspProcessoAdm"} as const);
export type TpcnindISS = typeof TpcnindISS[keyof typeof TpcnindISS];
export const TpcnindISSRet = Object.freeze({"iirSim":"iirSim","iirNao":"iirNao"} as const);
export type TpcnindISSRet = typeof TpcnindISSRet[keyof typeof TpcnindISSRet];
export const TpcnISSQNcSitTrib = Object.freeze({"ISSQNcSitTribVazio":"ISSQNcSitTribVazio","ISSQNcSitTribNORMAL":"ISSQNcSitTribNORMAL","ISSQNcSitTribRETIDA":"ISSQNcSitTribRETIDA","ISSQNcSitTribSUBSTITUTA":"ISSQNcSitTribSUBSTITUTA","ISSQNcSitTribISENTA":"ISSQNcSitTribISENTA"} as const);
export type TpcnISSQNcSitTrib = typeof TpcnISSQNcSitTrib[keyof typeof TpcnISSQNcSitTrib];
export const TpcnModalidadeFrete = Object.freeze({"mfContaEmitente":"mfContaEmitente","mfContaDestinatario":"mfContaDestinatario","mfContaTerceiros":"mfContaTerceiros","mfProprioRemetente":"mfProprioRemetente","mfProprioDestinatario":"mfProprioDestinatario","mfSemFrete":"mfSemFrete"} as const);
export type TpcnModalidadeFrete = typeof TpcnModalidadeFrete[keyof typeof TpcnModalidadeFrete];
export const TpcnMotivoDesoneracaoICMS = Object.freeze({"mdiTaxi":"mdiTaxi","mdiDeficienteFisico":"mdiDeficienteFisico","mdiProdutorAgropecuario":"mdiProdutorAgropecuario","mdiFrotistaLocadora":"mdiFrotistaLocadora","mdiDiplomaticoConsular":"mdiDiplomaticoConsular","mdiAmazoniaLivreComercio":"mdiAmazoniaLivreComercio","mdiSuframa":"mdiSuframa","mdiVendaOrgaosPublicos":"mdiVendaOrgaosPublicos","mdiOutros":"mdiOutros","mdiDeficienteCondutor":"mdiDeficienteCondutor","mdiDeficienteNaoCondutor":"mdiDeficienteNaoCondutor","mdiOrgaoFomento":"mdiOrgaoFomento","mdiOlimpiadaRio2016":"mdiOlimpiadaRio2016","mdiSolicitadoFisco":"mdiSolicitadoFisco"} as const);
export type TpcnMotivoDesoneracaoICMS = typeof TpcnMotivoDesoneracaoICMS[keyof typeof TpcnMotivoDesoneracaoICMS];
export const TpcnPresencaComprador = Object.freeze({"pcNao":"pcNao","pcPresencial":"pcPresencial","pcInternet":"pcInternet","pcTeleatendimento":"pcTeleatendimento","pcEntregaDomicilio":"pcEntregaDomicilio","pcPresencialForaEstabelecimento":"pcPresencialForaEstabelecimento","pcOutros":"pcOutros"} as const);
export type TpcnPresencaComprador = typeof TpcnPresencaComprador[keyof typeof TpcnPresencaComprador];
export const TpcnTipoArma = Object.freeze({"taUsoPermitido":"taUsoPermitido","taUsoRestrito":"taUsoRestrito"} as const);
export type TpcnTipoArma = typeof TpcnTipoArma[keyof typeof TpcnTipoArma];
export const TpcnTipoIntermedio = Object.freeze({"tiContaPropria":"tiContaPropria","tiContaOrdem":"tiContaOrdem","tiEncomenda":"tiEncomenda"} as const);
export type TpcnTipoIntermedio = typeof TpcnTipoIntermedio[keyof typeof TpcnTipoIntermedio];
export const TpcnTipoOperacao = Object.freeze({"toVendaConcessionaria":"toVendaConcessionaria","toFaturamentoDireto":"toFaturamentoDireto","toVendaDireta":"toVendaDireta","toOutros":"toOutros"} as const);
export type TpcnTipoOperacao = typeof TpcnTipoOperacao[keyof typeof TpcnTipoOperacao];
export const TpcnTipoViaTransp = Object.freeze({"tvMaritima":"tvMaritima","tvFluvial":"tvFluvial","tvLacustre":"tvLacustre","tvAerea":"tvAerea","tvPostal":"tvPostal","tvFerroviaria":"tvFerroviaria","tvRodoviaria":"tvRodoviaria","tvConduto":"tvConduto","tvMeiosProprios":"tvMeiosProprios","tvEntradaSaidaFicta":"tvEntradaSaidaFicta","tvCourier":"tvCourier","tvEmMaos":"tvEmMaos","tvPorReboque":"tvPorReboque"} as const);
export type TpcnTipoViaTransp = typeof TpcnTipoViaTransp[keyof typeof TpcnTipoViaTransp];
export interface TPISInput {
  "CST"?: TCSTPis;
  "pPIS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vPIS"?: string;
}
export class TPIS {
  /** Pascal streaming default: pis01. Omission preserves the native constructor. */
  "CST"?: TCSTPis;
  "pPIS"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBC"?: string;
  "vPIS"?: string;
  constructor(input: TPISInput = {}) {
    validateModel("TPIS", input);
    if (input["CST"] !== undefined) this["CST"] = input["CST"];
    if (input["pPIS"] !== undefined) this["pPIS"] = input["pPIS"];
    if (input["qBCProd"] !== undefined) this["qBCProd"] = input["qBCProd"];
    if (input["vAliqProd"] !== undefined) this["vAliqProd"] = input["vAliqProd"];
    if (input["vBC"] !== undefined) this["vBC"] = input["vBC"];
    if (input["vPIS"] !== undefined) this["vPIS"] = input["vPIS"];
  }
}
export interface TPISSTInput {
  "indSomaPISST"?: TIndSomaPISST;
  "pPis"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBc"?: string;
  "vPIS"?: string;
}
export class TPISST {
  "indSomaPISST"?: TIndSomaPISST;
  "pPis"?: string;
  "qBCProd"?: string;
  "vAliqProd"?: string;
  "vBc"?: string;
  "vPIS"?: string;
  constructor(input: TPISSTInput = {}) {
    validateModel("TPISST", input);
    if (input["indSomaPISST"] !== undefined) this["indSomaPISST"] = input["indSomaPISST"];
    if (input["pPis"] !== undefined) this["pPis"] = input["pPis"];
    if (input["qBCProd"] !== undefined) this["qBCProd"] = input["qBCProd"];
    if (input["vAliqProd"] !== undefined) this["vAliqProd"] = input["vAliqProd"];
    if (input["vBc"] !== undefined) this["vBc"] = input["vBc"];
    if (input["vPIS"] !== undefined) this["vPIS"] = input["vPIS"];
  }
}
export interface TProcDFeInput {
  "chDFe"?: string;
  "cMsg"?: number;
  "cStat"?: number;
  "dhRecbto"?: string;
  "digVal"?: string;
  "Id"?: string;
  "nProt"?: string;
  "PathDFe"?: string;
  "PathRetConsReciDFe"?: string;
  "PathRetConsSitDFe"?: string;
  "tpAmb"?: TACBrTipoAmbiente;
  "verAplic"?: string;
  "XML_DFe"?: string;
  "XML_prot"?: string;
  "xMotivo"?: string;
  "xMsg"?: string;
}
export class TProcDFe {
  "chDFe"?: string;
  "cMsg"?: number;
  "cStat"?: number;
  "dhRecbto"?: string;
  "digVal"?: string;
  "Id"?: string;
  "nProt"?: string;
  "PathDFe"?: string;
  "PathRetConsReciDFe"?: string;
  "PathRetConsSitDFe"?: string;
  "tpAmb"?: TACBrTipoAmbiente;
  "verAplic"?: string;
  "XML_DFe"?: string;
  "XML_prot"?: string;
  "xMotivo"?: string;
  "xMsg"?: string;
  constructor(input: TProcDFeInput = {}) {
    validateModel("TProcDFe", input);
    if (input["chDFe"] !== undefined) this["chDFe"] = input["chDFe"];
    if (input["cMsg"] !== undefined) this["cMsg"] = input["cMsg"];
    if (input["cStat"] !== undefined) this["cStat"] = input["cStat"];
    if (input["dhRecbto"] !== undefined) this["dhRecbto"] = input["dhRecbto"];
    if (input["digVal"] !== undefined) this["digVal"] = input["digVal"];
    if (input["Id"] !== undefined) this["Id"] = input["Id"];
    if (input["nProt"] !== undefined) this["nProt"] = input["nProt"];
    if (input["PathDFe"] !== undefined) this["PathDFe"] = input["PathDFe"];
    if (input["PathRetConsReciDFe"] !== undefined) this["PathRetConsReciDFe"] = input["PathRetConsReciDFe"];
    if (input["PathRetConsSitDFe"] !== undefined) this["PathRetConsSitDFe"] = input["PathRetConsSitDFe"];
    if (input["tpAmb"] !== undefined) this["tpAmb"] = input["tpAmb"];
    if (input["verAplic"] !== undefined) this["verAplic"] = input["verAplic"];
    if (input["XML_DFe"] !== undefined) this["XML_DFe"] = input["XML_DFe"];
    if (input["XML_prot"] !== undefined) this["XML_prot"] = input["XML_prot"];
    if (input["xMotivo"] !== undefined) this["xMotivo"] = input["xMotivo"];
    if (input["xMsg"] !== undefined) this["xMsg"] = input["xMsg"];
  }
}
export type TprocRefCollectionInput = TprocRefCollectionItemInput[];
export class TprocRefCollection extends Array<TprocRefCollectionItem> {
  New(input: TprocRefCollectionItemInput = {}): TprocRefCollectionItem { const item=new TprocRefCollectionItem(input); this.push(item); return item; }
}
export interface TprocRefCollectionItemInput {
  "indProc"?: TpcnIndicadorProcesso;
  "nProc"?: string;
  "tpAto"?: TtpAto;
}
export class TprocRefCollectionItem {
  /** Pascal streaming default: ipSEFAZ. Omission preserves the native constructor. */
  "indProc"?: TpcnIndicadorProcesso;
  "nProc"?: string;
  "tpAto"?: TtpAto;
  constructor(input: TprocRefCollectionItemInput = {}) {
    validateModel("TprocRefCollectionItem", input);
    if (input["indProc"] !== undefined) this["indProc"] = input["indProc"];
    if (input["nProc"] !== undefined) this["nProc"] = input["nProc"];
    if (input["tpAto"] !== undefined) this["tpAto"] = input["tpAto"];
  }
}
export interface TProdInput {
  "arma"?: TArmaCollectionInput;
  "cBarra"?: string;
  "cBarraTrib"?: string;
  "cBenef"?: string;
  "cEAN"?: string;
  "cEANTrib"?: string;
  "CEST"?: string;
  "CFOP"?: string;
  "CNPJFab"?: string;
  "comb"?: TCombInput;
  "cProd"?: string;
  "CredPresumido"?: TCredPresumidoCollectionInput;
  "detExport"?: TdetExportCollectionInput;
  "DI"?: TDICollectionInput;
  "EXTIPI"?: string;
  "indBemMovelUsado"?: TIndicadorEx;
  "indEscala"?: TpcnIndEscala;
  "IndTot"?: TpcnIndicadorTotal;
  "med"?: TMedCollectionInput;
  "NCM"?: string;
  "nFCI"?: string;
  "nItem"?: number;
  "nItemPed"?: string;
  "nRECOPI"?: string;
  "NVE"?: TNVECollectionInput;
  "qCom"?: string;
  "qTrib"?: string;
  "rastro"?: TRastroCollectionInput;
  "tpCredPresIBSZFM"?: TTpCredPresIBSZFM;
  "uCom"?: string;
  "uTrib"?: string;
  "vDesc"?: string;
  "veicProd"?: TveicProdInput;
  "vFrete"?: string;
  "vOutro"?: string;
  "vProd"?: string;
  "vSeg"?: string;
  "vUnCom"?: string;
  "vUnTrib"?: string;
  "xPed"?: string;
  "xProd"?: string;
}
export class TProd {
  "arma" = new TArmaCollection();
  "cBarra"?: string;
  "cBarraTrib"?: string;
  "cBenef"?: string;
  "cEAN"?: string;
  "cEANTrib"?: string;
  "CEST"?: string;
  "CFOP"?: string;
  "CNPJFab"?: string;
  "comb" = new TComb();
  "cProd"?: string;
  "CredPresumido" = new TCredPresumidoCollection();
  "detExport" = new TdetExportCollection();
  "DI" = new TDICollection();
  "EXTIPI"?: string;
  /** Pascal streaming default: tieNenhum. Omission preserves the native constructor. */
  "indBemMovelUsado"?: TIndicadorEx;
  /** Pascal streaming default: ieNenhum. Omission preserves the native constructor. */
  "indEscala"?: TpcnIndEscala;
  /** Pascal streaming default: itSomaTotalNFe. Omission preserves the native constructor. */
  "IndTot"?: TpcnIndicadorTotal;
  "med" = new TMedCollection();
  "NCM"?: string;
  "nFCI"?: string;
  "nItem"?: number;
  "nItemPed"?: string;
  "nRECOPI"?: string;
  "NVE" = new TNVECollection();
  "qCom"?: string;
  "qTrib"?: string;
  "rastro" = new TRastroCollection();
  "tpCredPresIBSZFM"?: TTpCredPresIBSZFM;
  "uCom"?: string;
  "uTrib"?: string;
  "vDesc"?: string;
  "veicProd" = new TveicProd();
  "vFrete"?: string;
  "vOutro"?: string;
  "vProd"?: string;
  "vSeg"?: string;
  "vUnCom"?: string;
  "vUnTrib"?: string;
  "xPed"?: string;
  "xProd"?: string;
  constructor(input: TProdInput = {}) {
    validateModel("TProd", input);
    if (input["arma"] !== undefined) this["arma"] = Object.assign(new TArmaCollection(), input["arma"].map(v=>new TArmaCollectionItem(v)));
    if (input["cBarra"] !== undefined) this["cBarra"] = input["cBarra"];
    if (input["cBarraTrib"] !== undefined) this["cBarraTrib"] = input["cBarraTrib"];
    if (input["cBenef"] !== undefined) this["cBenef"] = input["cBenef"];
    if (input["cEAN"] !== undefined) this["cEAN"] = input["cEAN"];
    if (input["cEANTrib"] !== undefined) this["cEANTrib"] = input["cEANTrib"];
    if (input["CEST"] !== undefined) this["CEST"] = input["CEST"];
    if (input["CFOP"] !== undefined) this["CFOP"] = input["CFOP"];
    if (input["CNPJFab"] !== undefined) this["CNPJFab"] = input["CNPJFab"];
    if (input["comb"] !== undefined) this["comb"] = new TComb(input["comb"]);
    if (input["cProd"] !== undefined) this["cProd"] = input["cProd"];
    if (input["CredPresumido"] !== undefined) this["CredPresumido"] = Object.assign(new TCredPresumidoCollection(), input["CredPresumido"].map(v=>new TCredPresumidoCollectionItem(v)));
    if (input["detExport"] !== undefined) this["detExport"] = Object.assign(new TdetExportCollection(), input["detExport"].map(v=>new TdetExportCollectionItem(v)));
    if (input["DI"] !== undefined) this["DI"] = Object.assign(new TDICollection(), input["DI"].map(v=>new TDICollectionItem(v)));
    if (input["EXTIPI"] !== undefined) this["EXTIPI"] = input["EXTIPI"];
    if (input["indBemMovelUsado"] !== undefined) this["indBemMovelUsado"] = input["indBemMovelUsado"];
    if (input["indEscala"] !== undefined) this["indEscala"] = input["indEscala"];
    if (input["IndTot"] !== undefined) this["IndTot"] = input["IndTot"];
    if (input["med"] !== undefined) this["med"] = Object.assign(new TMedCollection(), input["med"].map(v=>new TMedCollectionItem(v)));
    if (input["NCM"] !== undefined) this["NCM"] = input["NCM"];
    if (input["nFCI"] !== undefined) this["nFCI"] = input["nFCI"];
    if (input["nItem"] !== undefined) this["nItem"] = input["nItem"];
    if (input["nItemPed"] !== undefined) this["nItemPed"] = input["nItemPed"];
    if (input["nRECOPI"] !== undefined) this["nRECOPI"] = input["nRECOPI"];
    if (input["NVE"] !== undefined) this["NVE"] = Object.assign(new TNVECollection(), input["NVE"].map(v=>new TNVECollectionItem(v)));
    if (input["qCom"] !== undefined) this["qCom"] = input["qCom"];
    if (input["qTrib"] !== undefined) this["qTrib"] = input["qTrib"];
    if (input["rastro"] !== undefined) this["rastro"] = Object.assign(new TRastroCollection(), input["rastro"].map(v=>new TRastroCollectionItem(v)));
    if (input["tpCredPresIBSZFM"] !== undefined) this["tpCredPresIBSZFM"] = input["tpCredPresIBSZFM"];
    if (input["uCom"] !== undefined) this["uCom"] = input["uCom"];
    if (input["uTrib"] !== undefined) this["uTrib"] = input["uTrib"];
    if (input["vDesc"] !== undefined) this["vDesc"] = input["vDesc"];
    if (input["veicProd"] !== undefined) this["veicProd"] = new TveicProd(input["veicProd"]);
    if (input["vFrete"] !== undefined) this["vFrete"] = input["vFrete"];
    if (input["vOutro"] !== undefined) this["vOutro"] = input["vOutro"];
    if (input["vProd"] !== undefined) this["vProd"] = input["vProd"];
    if (input["vSeg"] !== undefined) this["vSeg"] = input["vSeg"];
    if (input["vUnCom"] !== undefined) this["vUnCom"] = input["vUnCom"];
    if (input["vUnTrib"] !== undefined) this["vUnTrib"] = input["vUnTrib"];
    if (input["xPed"] !== undefined) this["xPed"] = input["xPed"];
    if (input["xProd"] !== undefined) this["xProd"] = input["xProd"];
  }
}
export type TRastroCollectionInput = TRastroCollectionItemInput[];
export class TRastroCollection extends Array<TRastroCollectionItem> {
  New(input: TRastroCollectionItemInput = {}): TRastroCollectionItem { const item=new TRastroCollectionItem(input); this.push(item); return item; }
}
export interface TRastroCollectionItemInput {
  "cAgreg"?: string;
  "dFab"?: string;
  "dVal"?: string;
  "nLote"?: string;
  "qLote"?: string;
}
export class TRastroCollectionItem {
  "cAgreg"?: string;
  "dFab"?: string;
  "dVal"?: string;
  "nLote"?: string;
  "qLote"?: string;
  constructor(input: TRastroCollectionItemInput = {}) {
    validateModel("TRastroCollectionItem", input);
    if (input["cAgreg"] !== undefined) this["cAgreg"] = input["cAgreg"];
    if (input["dFab"] !== undefined) this["dFab"] = input["dFab"];
    if (input["dVal"] !== undefined) this["dVal"] = input["dVal"];
    if (input["nLote"] !== undefined) this["nLote"] = input["nLote"];
    if (input["qLote"] !== undefined) this["qLote"] = input["qLote"];
  }
}
export type TReboqueCollectionInput = TReboqueCollectionItemInput[];
export class TReboqueCollection extends Array<TReboqueCollectionItem> {
  New(input: TReboqueCollectionItemInput = {}): TReboqueCollectionItem { const item=new TReboqueCollectionItem(input); this.push(item); return item; }
}
export interface TReboqueCollectionItemInput {
  "placa"?: string;
  "RNTC"?: string;
  "UF"?: string;
}
export class TReboqueCollectionItem {
  "placa"?: string;
  "RNTC"?: string;
  "UF"?: string;
  constructor(input: TReboqueCollectionItemInput = {}) {
    validateModel("TReboqueCollectionItem", input);
    if (input["placa"] !== undefined) this["placa"] = input["placa"];
    if (input["RNTC"] !== undefined) this["RNTC"] = input["RNTC"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
  }
}
export type TrefDFePagAntCollectionInput = TrefDFePagAntCollectionItemInput[];
export class TrefDFePagAntCollection extends Array<TrefDFePagAntCollectionItem> {
  New(input: TrefDFePagAntCollectionItemInput = {}): TrefDFePagAntCollectionItem { const item=new TrefDFePagAntCollectionItem(input); this.push(item); return item; }
}
export interface TrefDFePagAntCollectionItemInput {
  "refDFEChave"?: string;
}
export class TrefDFePagAntCollectionItem {
  "refDFEChave"?: string;
  constructor(input: TrefDFePagAntCollectionItemInput = {}) {
    validateModel("TrefDFePagAntCollectionItem", input);
    if (input["refDFEChave"] !== undefined) this["refDFEChave"] = input["refDFEChave"];
  }
}
export interface TRefECFInput {
  "modelo"?: TpcnECFModRef;
  "nCOO"?: string;
  "nECF"?: string;
}
export class TRefECF {
  /** Pascal streaming default: ECFModRefVazio. Omission preserves the native constructor. */
  "modelo"?: TpcnECFModRef;
  "nCOO"?: string;
  "nECF"?: string;
  constructor(input: TRefECFInput = {}) {
    validateModel("TRefECF", input);
    if (input["modelo"] !== undefined) this["modelo"] = input["modelo"];
    if (input["nCOO"] !== undefined) this["nCOO"] = input["nCOO"];
    if (input["nECF"] !== undefined) this["nECF"] = input["nECF"];
  }
}
export interface TRefNFInput {
  "AAMM"?: string;
  "CNPJ"?: string;
  "cUF"?: number;
  "modelo"?: number;
  "nNF"?: number;
  "serie"?: number;
}
export class TRefNF {
  "AAMM"?: string;
  "CNPJ"?: string;
  "cUF"?: number;
  "modelo"?: number;
  "nNF"?: number;
  "serie"?: number;
  constructor(input: TRefNFInput = {}) {
    validateModel("TRefNF", input);
    if (input["AAMM"] !== undefined) this["AAMM"] = input["AAMM"];
    if (input["CNPJ"] !== undefined) this["CNPJ"] = input["CNPJ"];
    if (input["cUF"] !== undefined) this["cUF"] = input["cUF"];
    if (input["modelo"] !== undefined) this["modelo"] = input["modelo"];
    if (input["nNF"] !== undefined) this["nNF"] = input["nNF"];
    if (input["serie"] !== undefined) this["serie"] = input["serie"];
  }
}
export interface TRefNFPInput {
  "AAMM"?: string;
  "CNPJCPF"?: string;
  "cUF"?: number;
  "IE"?: string;
  "modelo"?: string;
  "nNF"?: number;
  "serie"?: number;
}
export class TRefNFP {
  "AAMM"?: string;
  "CNPJCPF"?: string;
  "cUF"?: number;
  "IE"?: string;
  "modelo"?: string;
  "nNF"?: number;
  "serie"?: number;
  constructor(input: TRefNFPInput = {}) {
    validateModel("TRefNFP", input);
    if (input["AAMM"] !== undefined) this["AAMM"] = input["AAMM"];
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["cUF"] !== undefined) this["cUF"] = input["cUF"];
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["modelo"] !== undefined) this["modelo"] = input["modelo"];
    if (input["nNF"] !== undefined) this["nNF"] = input["nNF"];
    if (input["serie"] !== undefined) this["serie"] = input["serie"];
  }
}
export const TRegTribISSQN = Object.freeze({"RTISSMicroempresaMunicipal":"RTISSMicroempresaMunicipal","RTISSEstimativa":"RTISSEstimativa","RTISSSociedadeProfissionais":"RTISSSociedadeProfissionais","RTISSCooperativa":"RTISSCooperativa","RTISSMEI":"RTISSMEI","RTISSMEEPP":"RTISSMEEPP","RTISSNenhum":"RTISSNenhum"} as const);
export type TRegTribISSQN = typeof TRegTribISSQN[keyof typeof TRegTribISSQN];
export interface TRetiradaInput {
  "CEP"?: number;
  "cMun"?: number;
  "CNPJCPF"?: string;
  "cPais"?: number;
  "Email"?: string;
  "fone"?: string;
  "IE"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xNome"?: string;
  "xPais"?: string;
}
export class TRetirada {
  "CEP"?: number;
  "cMun"?: number;
  "CNPJCPF"?: string;
  "cPais"?: number;
  "Email"?: string;
  "fone"?: string;
  "IE"?: string;
  "nro"?: string;
  "UF"?: string;
  "xBairro"?: string;
  "xCpl"?: string;
  "xLgr"?: string;
  "xMun"?: string;
  "xNome"?: string;
  "xPais"?: string;
  constructor(input: TRetiradaInput = {}) {
    validateModel("TRetirada", input);
    if (input["CEP"] !== undefined) this["CEP"] = input["CEP"];
    if (input["cMun"] !== undefined) this["cMun"] = input["cMun"];
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["cPais"] !== undefined) this["cPais"] = input["cPais"];
    if (input["Email"] !== undefined) this["Email"] = input["Email"];
    if (input["fone"] !== undefined) this["fone"] = input["fone"];
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["nro"] !== undefined) this["nro"] = input["nro"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["xBairro"] !== undefined) this["xBairro"] = input["xBairro"];
    if (input["xCpl"] !== undefined) this["xCpl"] = input["xCpl"];
    if (input["xLgr"] !== undefined) this["xLgr"] = input["xLgr"];
    if (input["xMun"] !== undefined) this["xMun"] = input["xMun"];
    if (input["xNome"] !== undefined) this["xNome"] = input["xNome"];
    if (input["xPais"] !== undefined) this["xPais"] = input["xPais"];
  }
}
export interface TretTranspInput {
  "CFOP"?: string;
  "cMunFG"?: number;
  "pICMSRet"?: string;
  "vBCRet"?: string;
  "vICMSRet"?: string;
  "vServ"?: string;
}
export class TretTransp {
  "CFOP"?: string;
  "cMunFG"?: number;
  "pICMSRet"?: string;
  "vBCRet"?: string;
  "vICMSRet"?: string;
  "vServ"?: string;
  constructor(input: TretTranspInput = {}) {
    validateModel("TretTransp", input);
    if (input["CFOP"] !== undefined) this["CFOP"] = input["CFOP"];
    if (input["cMunFG"] !== undefined) this["cMunFG"] = input["cMunFG"];
    if (input["pICMSRet"] !== undefined) this["pICMSRet"] = input["pICMSRet"];
    if (input["vBCRet"] !== undefined) this["vBCRet"] = input["vBCRet"];
    if (input["vICMSRet"] !== undefined) this["vICMSRet"] = input["vICMSRet"];
    if (input["vServ"] !== undefined) this["vServ"] = input["vServ"];
  }
}
export interface TretTribInput {
  "vBCIRRF"?: string;
  "vBCRetPrev"?: string;
  "vIRRF"?: string;
  "vRetCOFINS"?: string;
  "vRetCSLL"?: string;
  "vRetPIS"?: string;
  "vRetPrev"?: string;
}
export class TretTrib {
  "vBCIRRF"?: string;
  "vBCRetPrev"?: string;
  "vIRRF"?: string;
  "vRetCOFINS"?: string;
  "vRetCSLL"?: string;
  "vRetPIS"?: string;
  "vRetPrev"?: string;
  constructor(input: TretTribInput = {}) {
    validateModel("TretTrib", input);
    if (input["vBCIRRF"] !== undefined) this["vBCIRRF"] = input["vBCIRRF"];
    if (input["vBCRetPrev"] !== undefined) this["vBCRetPrev"] = input["vBCRetPrev"];
    if (input["vIRRF"] !== undefined) this["vIRRF"] = input["vIRRF"];
    if (input["vRetCOFINS"] !== undefined) this["vRetCOFINS"] = input["vRetCOFINS"];
    if (input["vRetCSLL"] !== undefined) this["vRetCSLL"] = input["vRetCSLL"];
    if (input["vRetPIS"] !== undefined) this["vRetPIS"] = input["vRetPIS"];
    if (input["vRetPrev"] !== undefined) this["vRetPrev"] = input["vRetPrev"];
  }
}
export interface TSignatureInput {
  "DigestValue"?: string;
  "IdSignature"?: string;
  "IdSignatureValue"?: string;
  "SignatureValue"?: string;
  "URI"?: string;
  "X509Certificate"?: string;
}
export class TSignature {
  "DigestValue"?: string;
  "IdSignature"?: string;
  "IdSignatureValue"?: string;
  "SignatureValue"?: string;
  "URI"?: string;
  "X509Certificate"?: string;
  constructor(input: TSignatureInput = {}) {
    validateModel("TSignature", input);
    if (input["DigestValue"] !== undefined) this["DigestValue"] = input["DigestValue"];
    if (input["IdSignature"] !== undefined) this["IdSignature"] = input["IdSignature"];
    if (input["IdSignatureValue"] !== undefined) this["IdSignatureValue"] = input["IdSignatureValue"];
    if (input["SignatureValue"] !== undefined) this["SignatureValue"] = input["SignatureValue"];
    if (input["URI"] !== undefined) this["URI"] = input["URI"];
    if (input["X509Certificate"] !== undefined) this["X509Certificate"] = input["X509Certificate"];
  }
}
export const TTipoNFe = Object.freeze({"tnEntrada":"tnEntrada","tnSaida":"tnSaida"} as const);
export type TTipoNFe = typeof TTipoNFe[keyof typeof TTipoNFe];
export interface TTotalInput {
  "IBSCBSTot"?: TIBSCBSTotInput;
  "ICMSTot"?: TICMSTotInput;
  "ISSQNtot"?: TISSQNtotInput;
  "ISTot"?: TISTotInput;
  "retTrib"?: TretTribInput;
  "vNFTot"?: string;
}
export class TTotal {
  "IBSCBSTot" = new TIBSCBSTot();
  "ICMSTot" = new TICMSTot();
  "ISSQNtot" = new TISSQNtot();
  "ISTot" = new TISTot();
  "retTrib" = new TretTrib();
  "vNFTot"?: string;
  constructor(input: TTotalInput = {}) {
    validateModel("TTotal", input);
    if (input["IBSCBSTot"] !== undefined) this["IBSCBSTot"] = new TIBSCBSTot(input["IBSCBSTot"]);
    if (input["ICMSTot"] !== undefined) this["ICMSTot"] = new TICMSTot(input["ICMSTot"]);
    if (input["ISSQNtot"] !== undefined) this["ISSQNtot"] = new TISSQNtot(input["ISSQNtot"]);
    if (input["ISTot"] !== undefined) this["ISTot"] = new TISTot(input["ISTot"]);
    if (input["retTrib"] !== undefined) this["retTrib"] = new TretTrib(input["retTrib"]);
    if (input["vNFTot"] !== undefined) this["vNFTot"] = input["vNFTot"];
  }
}
export const TtpALCZFMCBS = Object.freeze({"tpALCZFMCBSnOpInd":"tpALCZFMCBSnOpInd","tpALCZFMCBSOpInd":"tpALCZFMCBSOpInd"} as const);
export type TtpALCZFMCBS = typeof TtpALCZFMCBS[keyof typeof TtpALCZFMCBS];
export const TtpAto = Object.freeze({"taNenhum":"taNenhum","taTermoAcordo":"taTermoAcordo","taRegimeEspecial":"taRegimeEspecial","taAutorizacaoEspecifica":"taAutorizacaoEspecifica","taAjusteSNIEF":"taAjusteSNIEF","taConvenioICMS":"taConvenioICMS"} as const);
export type TtpAto = typeof TtpAto[keyof typeof TtpAto];
export const TTpCredPresIBSZFM = Object.freeze({"tcpNenhum":"tcpNenhum","tcpSemCredito":"tcpSemCredito","tcpBensConsumoFinal":"tcpBensConsumoFinal","tcpBensCapital":"tcpBensCapital","tcpBensIntermediarios":"tcpBensIntermediarios","tcpBensInformaticaOutros":"tcpBensInformaticaOutros"} as const);
export type TTpCredPresIBSZFM = typeof TTpCredPresIBSZFM[keyof typeof TTpCredPresIBSZFM];
export const TtpEnteGov = Object.freeze({"tcgNenhum":"tcgNenhum","tcgUniao":"tcgUniao","tcgEstados":"tcgEstados","tcgDistritoFederal":"tcgDistritoFederal","tcgMunicipios":"tcgMunicipios","tcgConsorcioPublico":"tcgConsorcioPublico","tcgComiteGestorIBS":"tcgComiteGestorIBS"} as const);
export type TtpEnteGov = typeof TtpEnteGov[keyof typeof TtpEnteGov];
export const TtpGuia = Object.freeze({"tpgNenhum":"tpgNenhum","tpgGTA":"tpgGTA","tpgTTA":"tpgTTA","tpgDTA":"tpgDTA","tpgATV":"tpgATV","tpgPTV":"tpgPTV","tpgGTV":"tpgGTV","tpgGuiaFlorestal":"tpgGuiaFlorestal"} as const);
export type TtpGuia = typeof TtpGuia[keyof typeof TtpGuia];
export const TtpIntegra = Object.freeze({"tiNaoInformado":"tiNaoInformado","tiPagIntegrado":"tiPagIntegrado","tiPagNaoIntegrado":"tiPagNaoIntegrado"} as const);
export type TtpIntegra = typeof TtpIntegra[keyof typeof TtpIntegra];
export const TtpNFCredito = Object.freeze({"tcNenhum":"tcNenhum","tcMultaJuros":"tcMultaJuros","tcApropriacaoCreditoPresumido":"tcApropriacaoCreditoPresumido","tcRetorno":"tcRetorno","tcReducaoValores":"tcReducaoValores","tcTransferenciaCreditoSucessao":"tcTransferenciaCreditoSucessao","tcRetornoRecusaParcial":"tcRetornoRecusaParcial"} as const);
export type TtpNFCredito = typeof TtpNFCredito[keyof typeof TtpNFCredito];
export const TtpNFDebito = Object.freeze({"tdNenhum":"tdNenhum","tdTransferenciaCreditoCooperativa":"tdTransferenciaCreditoCooperativa","tdAnulacao":"tdAnulacao","tdDebitosNaoProcessadas":"tdDebitosNaoProcessadas","tdMultaJuros":"tdMultaJuros","tdTransferenciaCreditoSucessao":"tdTransferenciaCreditoSucessao","tdPagamentoAntecipado":"tdPagamentoAntecipado","tdPerdaEmEstoque":"tdPerdaEmEstoque","tdDesenquadramentodoSN":"tdDesenquadramentodoSN"} as const);
export type TtpNFDebito = typeof TtpNFDebito[keyof typeof TtpNFDebito];
export const TtpOperGov = Object.freeze({"togNenhum":"togNenhum","togFornecimento":"togFornecimento","togRecebimentoPag":"togRecebimentoPag","togFornecimentoPagRealizado":"togFornecimentoPagRealizado","togRecebimentoPagFornecPosterior":"togRecebimentoPagFornecPosterior"} as const);
export type TtpOperGov = typeof TtpOperGov[keyof typeof TtpOperGov];
export interface TTranspInput {
  "balsa"?: string;
  "modFrete"?: TpcnModalidadeFrete;
  "Reboque"?: TReboqueCollectionInput;
  "retTransp"?: TretTranspInput;
  "Transporta"?: TTransportaInput;
  "vagao"?: string;
  "veicTransp"?: TveicTranspInput;
  "Vol"?: TVolCollectionInput;
}
export class TTransp {
  "balsa"?: string;
  "modFrete"?: TpcnModalidadeFrete;
  "Reboque" = new TReboqueCollection();
  "retTransp" = new TretTransp();
  "Transporta" = new TTransporta();
  "vagao"?: string;
  "veicTransp" = new TveicTransp();
  "Vol" = new TVolCollection();
  constructor(input: TTranspInput = {}) {
    validateModel("TTransp", input);
    if (input["balsa"] !== undefined) this["balsa"] = input["balsa"];
    if (input["modFrete"] !== undefined) this["modFrete"] = input["modFrete"];
    if (input["Reboque"] !== undefined) this["Reboque"] = Object.assign(new TReboqueCollection(), input["Reboque"].map(v=>new TReboqueCollectionItem(v)));
    if (input["retTransp"] !== undefined) this["retTransp"] = new TretTransp(input["retTransp"]);
    if (input["Transporta"] !== undefined) this["Transporta"] = new TTransporta(input["Transporta"]);
    if (input["vagao"] !== undefined) this["vagao"] = input["vagao"];
    if (input["veicTransp"] !== undefined) this["veicTransp"] = new TveicTransp(input["veicTransp"]);
    if (input["Vol"] !== undefined) this["Vol"] = Object.assign(new TVolCollection(), input["Vol"].map(v=>new TVolCollectionItem(v)));
  }
}
export interface TTransportaInput {
  "CNPJCPF"?: string;
  "IE"?: string;
  "UF"?: string;
  "xEnder"?: string;
  "xMun"?: string;
  "xNome"?: string;
}
export class TTransporta {
  "CNPJCPF"?: string;
  "IE"?: string;
  "UF"?: string;
  "xEnder"?: string;
  "xMun"?: string;
  "xNome"?: string;
  constructor(input: TTransportaInput = {}) {
    validateModel("TTransporta", input);
    if (input["CNPJCPF"] !== undefined) this["CNPJCPF"] = input["CNPJCPF"];
    if (input["IE"] !== undefined) this["IE"] = input["IE"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
    if (input["xEnder"] !== undefined) this["xEnder"] = input["xEnder"];
    if (input["xMun"] !== undefined) this["xMun"] = input["xMun"];
    if (input["xNome"] !== undefined) this["xNome"] = input["xNome"];
  }
}
export interface TveicProdInput {
  "anoFab"?: number;
  "anoMod"?: number;
  "cCor"?: string;
  "cCorDENATRAN"?: string;
  "chassi"?: string;
  "Cilin"?: string;
  "cMod"?: string;
  "CMT"?: string;
  "condVeic"?: TpcnCondicaoVeiculo;
  "dist"?: string;
  "espVeic"?: number;
  "lota"?: number;
  "nMotor"?: string;
  "nSerie"?: string;
  "pesoB"?: string;
  "pesoL"?: string;
  "pot"?: string;
  "tpComb"?: string;
  "tpOP"?: TpcnTipoOperacao;
  "tpPint"?: string;
  "tpRest"?: number;
  "tpVeic"?: number;
  "VIN"?: string;
  "xCor"?: string;
}
export class TveicProd {
  "anoFab"?: number;
  "anoMod"?: number;
  "cCor"?: string;
  "cCorDENATRAN"?: string;
  "chassi"?: string;
  "Cilin"?: string;
  "cMod"?: string;
  "CMT"?: string;
  readonly "CombDescricao"?: string;
  "condVeic"?: TpcnCondicaoVeiculo;
  "dist"?: string;
  "espVeic"?: number;
  "lota"?: number;
  "nMotor"?: string;
  "nSerie"?: string;
  "pesoB"?: string;
  "pesoL"?: string;
  "pot"?: string;
  "tpComb"?: string;
  "tpOP"?: TpcnTipoOperacao;
  "tpPint"?: string;
  "tpRest"?: number;
  "tpVeic"?: number;
  "VIN"?: string;
  "xCor"?: string;
  constructor(input: TveicProdInput = {}) {
    validateModel("TveicProd", input);
    if (input["anoFab"] !== undefined) this["anoFab"] = input["anoFab"];
    if (input["anoMod"] !== undefined) this["anoMod"] = input["anoMod"];
    if (input["cCor"] !== undefined) this["cCor"] = input["cCor"];
    if (input["cCorDENATRAN"] !== undefined) this["cCorDENATRAN"] = input["cCorDENATRAN"];
    if (input["chassi"] !== undefined) this["chassi"] = input["chassi"];
    if (input["Cilin"] !== undefined) this["Cilin"] = input["Cilin"];
    if (input["cMod"] !== undefined) this["cMod"] = input["cMod"];
    if (input["CMT"] !== undefined) this["CMT"] = input["CMT"];
    if (input["condVeic"] !== undefined) this["condVeic"] = input["condVeic"];
    if (input["dist"] !== undefined) this["dist"] = input["dist"];
    if (input["espVeic"] !== undefined) this["espVeic"] = input["espVeic"];
    if (input["lota"] !== undefined) this["lota"] = input["lota"];
    if (input["nMotor"] !== undefined) this["nMotor"] = input["nMotor"];
    if (input["nSerie"] !== undefined) this["nSerie"] = input["nSerie"];
    if (input["pesoB"] !== undefined) this["pesoB"] = input["pesoB"];
    if (input["pesoL"] !== undefined) this["pesoL"] = input["pesoL"];
    if (input["pot"] !== undefined) this["pot"] = input["pot"];
    if (input["tpComb"] !== undefined) this["tpComb"] = input["tpComb"];
    if (input["tpOP"] !== undefined) this["tpOP"] = input["tpOP"];
    if (input["tpPint"] !== undefined) this["tpPint"] = input["tpPint"];
    if (input["tpRest"] !== undefined) this["tpRest"] = input["tpRest"];
    if (input["tpVeic"] !== undefined) this["tpVeic"] = input["tpVeic"];
    if (input["VIN"] !== undefined) this["VIN"] = input["VIN"];
    if (input["xCor"] !== undefined) this["xCor"] = input["xCor"];
  }
}
export interface TveicTranspInput {
  "placa"?: string;
  "RNTC"?: string;
  "UF"?: string;
}
export class TveicTransp {
  "placa"?: string;
  "RNTC"?: string;
  "UF"?: string;
  constructor(input: TveicTranspInput = {}) {
    validateModel("TveicTransp", input);
    if (input["placa"] !== undefined) this["placa"] = input["placa"];
    if (input["RNTC"] !== undefined) this["RNTC"] = input["RNTC"];
    if (input["UF"] !== undefined) this["UF"] = input["UF"];
  }
}
export type TVolCollectionInput = TVolCollectionItemInput[];
export class TVolCollection extends Array<TVolCollectionItem> {
  New(input: TVolCollectionItemInput = {}): TVolCollectionItem { const item=new TVolCollectionItem(input); this.push(item); return item; }
}
export interface TVolCollectionItemInput {
  "esp"?: string;
  "Lacres"?: TLacresCollectionInput;
  "marca"?: string;
  "nVol"?: string;
  "pesoB"?: string;
  "pesoL"?: string;
  "qVol"?: number;
}
export class TVolCollectionItem {
  "esp"?: string;
  "Lacres" = new TLacresCollection();
  "marca"?: string;
  "nVol"?: string;
  "pesoB"?: string;
  "pesoL"?: string;
  "qVol"?: number;
  constructor(input: TVolCollectionItemInput = {}) {
    validateModel("TVolCollectionItem", input);
    if (input["esp"] !== undefined) this["esp"] = input["esp"];
    if (input["Lacres"] !== undefined) this["Lacres"] = Object.assign(new TLacresCollection(), input["Lacres"].map(v=>new TLacresCollectionItem(v)));
    if (input["marca"] !== undefined) this["marca"] = input["marca"];
    if (input["nVol"] !== undefined) this["nVol"] = input["nVol"];
    if (input["pesoB"] !== undefined) this["pesoB"] = input["pesoB"];
    if (input["pesoL"] !== undefined) this["pesoL"] = input["pesoL"];
    if (input["qVol"] !== undefined) this["qVol"] = input["qVol"];
  }
}
const MODEL_SCHEMA: Record<string, any> = {"TACBrProcessoEmissao":{"name":"TACBrProcessoEmissao","unit":"ACBrDFe.Conversao","kind":"enum","values":["peAplicativoContribuinte","peAvulsaFisco","peAvulsaContribuinte","peContribuinteAplicativoFisco","peProvedorAssinaturaAutorizacao"]},"TACBrTipoAmbiente":{"name":"TACBrTipoAmbiente","unit":"ACBrDFe.Conversao","kind":"enum","values":["taProducao","taHomologacao"]},"TACBrTipoEmissao":{"name":"TACBrTipoEmissao","unit":"ACBrDFe.Conversao","kind":"enum","values":["teNormal","teContingencia","teSCAN","teDPEC","teFSDA","teSVCAN","teSVCRS","teSVCSP","teOffLine"]},"TACBrTipoImpressao":{"name":"TACBrTipoImpressao","unit":"ACBrDFe.Conversao","kind":"enum","values":["tiSemGeracao","tiRetrato","tiPaisagem","tiSimplificado","tiNFCe","tiMsgEletronica","tiSimplificadoTipo2"]},"TAdiCollection":{"name":"TAdiCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TAdiCollectionItem","factory":"New"},"TAdiCollectionItem":{"name":"TAdiCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cFabricante","type":"string","kind":"string","readonly":false},{"name":"nAdicao","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nDraw","type":"string","kind":"string","readonly":false},{"name":"nSeqAdi","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"vDescDI","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"Tagropecuario":{"name":"Tagropecuario","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"defensivo","type":"TdefensivoCollection","kind":"list","ref":"TdefensivoCollection","readonly":false},{"name":"guiaTransito","type":"TguiaTransito","kind":"object","ref":"TguiaTransito","readonly":false}]},"TArmaCollection":{"name":"TArmaCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TArmaCollectionItem","factory":"New"},"TArmaCollectionItem":{"name":"TArmaCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"descr","type":"string","kind":"string","readonly":false},{"name":"nCano","type":"string","kind":"string","readonly":false},{"name":"nSerie","type":"string","kind":"string","readonly":false},{"name":"tpArma","type":"TpcnTipoArma","kind":"enum","ref":"TpcnTipoArma","readonly":false,"declaredDefault":"taUsoPermitido"}]},"TautXMLCollection":{"name":"TautXMLCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TautXMLCollectionItem","factory":"New"},"TautXMLCollectionItem":{"name":"TautXMLCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJCPF","type":"string","kind":"string","readonly":false}]},"TAvulsa":{"name":"TAvulsa","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"dEmi","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dPag","type":"TDateTime","kind":"datetime","readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"matr","type":"string","kind":"string","readonly":false},{"name":"nDAR","type":"string","kind":"string","readonly":false},{"name":"repEmi","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"vDAR","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"xAgente","type":"string","kind":"string","readonly":false},{"name":"xOrgao","type":"string","kind":"string","readonly":false}]},"Tcana":{"name":"Tcana","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"deduc","type":"TDeducCollection","kind":"list","ref":"TDeducCollection","readonly":false},{"name":"fordia","type":"TForDiaCollection","kind":"list","ref":"TForDiaCollection","readonly":false},{"name":"qTotAnt","type":"Double","kind":"decimal","readonly":false},{"name":"qTotGer","type":"Double","kind":"decimal","readonly":false},{"name":"qTotMes","type":"Double","kind":"decimal","readonly":false},{"name":"ref","type":"string","kind":"string","readonly":false},{"name":"safra","type":"string","kind":"string","readonly":false},{"name":"vFor","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vLiqFor","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vTotDed","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TcCredPres":{"name":"TcCredPres","unit":"ACBrDFe.Conversao","kind":"enum","values":["cpNenhum","cp01","cp02","cp03","cp04","cp05","cp06","cp07","cp08","cp09","cp10","cp11","cp12","cp13"]},"TCIDE":{"name":"TCIDE","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"qBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vAliqProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCIDE","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TCobr":{"name":"TCobr","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"Dup","type":"TDupCollection","kind":"list","ref":"TDupCollection","readonly":false},{"name":"Fat","type":"TFat","kind":"object","ref":"TFat","readonly":false}]},"TCOFINS":{"name":"TCOFINS","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CST","type":"TCstCofins","kind":"enum","ref":"TCSTCofins","readonly":false,"declaredDefault":"cof01"},{"name":"pCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vAliqProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TCOFINSST":{"name":"TCOFINSST","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"indSomaCOFINSST","type":"TIndSomaCOFINSST","kind":"enum","ref":"TIndSomaCOFINSST","readonly":false},{"name":"pCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vAliqProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TComb":{"name":"TComb","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CIDE","type":"TCIDE","kind":"object","ref":"TCIDE","readonly":false},{"name":"CODIF","type":"string","kind":"string","readonly":false},{"name":"cProdANP","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"descANP","type":"string","kind":"string","readonly":false},{"name":"encerrante","type":"Tencerrante","kind":"object","ref":"Tencerrante","readonly":false},{"name":"ICMS","type":"TICMSComb","kind":"object","ref":"TICMSComb","readonly":false},{"name":"ICMSCons","type":"TICMSCons","kind":"object","ref":"TICMSCons","readonly":false},{"name":"ICMSInter","type":"TICMSInter","kind":"object","ref":"TICMSInter","readonly":false},{"name":"origComb","type":"TorigCombCollection","kind":"list","ref":"TorigCombCollection","readonly":false},{"name":"pBio","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pGLP","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pGNi","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pGNn","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pMixGN","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qTemp","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"UFcons","type":"string","kind":"string","readonly":false},{"name":"vPart","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TCompra":{"name":"TCompra","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"xCont","type":"string","kind":"string","readonly":false},{"name":"xNEmp","type":"string","kind":"string","readonly":false},{"name":"xPed","type":"string","kind":"string","readonly":false}]},"TCredPresIBSZFM":{"name":"TCredPresIBSZFM","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"competApur","type":"TDateTime","kind":"datetime","readonly":false},{"name":"tpCredPresIBSZFM","type":"TTpCredPresIBSZFM","kind":"enum","ref":"TTpCredPresIBSZFM","readonly":false},{"name":"vCredPresIBSZFM","type":"Double","kind":"decimal","readonly":false}]},"TCredPresumidoCollection":{"name":"TCredPresumidoCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TCredPresumidoCollectionItem","factory":"New"},"TCredPresumidoCollectionItem":{"name":"TCredPresumidoCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cCredPresumido","type":"string","kind":"string","readonly":false},{"name":"pCredPresumido","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPresumido","type":"Double","kind":"decimal","readonly":false}]},"TCSOSNIcms":{"name":"TCSOSNIcms","unit":"ACBrDFe.Conversao","kind":"enum","values":["csosnVazio","csosn101","csosn102","csosn103","csosn201","csosn202","csosn203","csosn300","csosn400","csosn500","csosn900"]},"TCSTCofins":{"name":"TCSTCofins","unit":"ACBrDFe.Conversao","kind":"enum","values":["cof01","cof02","cof03","cof04","cof05","cof06","cof07","cof08","cof09","cof49","cof50","cof51","cof52","cof53","cof54","cof55","cof56","cof60","cof61","cof62","cof63","cof64","cof65","cof66","cof67","cof70","cof71","cof72","cof73","cof74","cof75","cof98","cof99"]},"TCSTIBSCBS":{"name":"TCSTIBSCBS","unit":"ACBrDFe.Conversao","kind":"enum","values":["cstNenhum","cst000","cst010","cst011","cst200","cst220","cst221","cst222","cst400","cst410","cst510","cst515","cst550","cst620","cst800","cst810","cst811","cst820","cst830"]},"TCSTIcms":{"name":"TCSTIcms","unit":"ACBrDFe.Conversao","kind":"enum","values":["cstVazio","cst00","cst10","cst20","cst30","cst40","cst41","cst45","cst50","cst51","cst60","cst70","cst80","cst81","cst90","cstICMSOutraUF","cstICMSSN","cstPart10","cstPart90","cstRep41","cstRep60","cst02","cst15","cst53","cst61","cst01","cst12","cst13","cst14","cst21","cst72","cst73","cst74","cstPart20"]},"TCSTPis":{"name":"TCSTPis","unit":"ACBrDFe.Conversao","kind":"enum","values":["pis01","pis02","pis03","pis04","pis05","pis06","pis07","pis08","pis09","pis49","pis50","pis51","pis52","pis53","pis54","pis55","pis56","pis60","pis61","pis62","pis63","pis64","pis65","pis66","pis67","pis70","pis71","pis72","pis73","pis74","pis75","pis98","pis99"]},"TDeducCollection":{"name":"TDeducCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TDeducCollectionItem","factory":"New"},"TDeducCollectionItem":{"name":"TDeducCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"vDed","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"xDed","type":"string","kind":"string","readonly":false}]},"TdefensivoCollection":{"name":"TdefensivoCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TdefensivoCollectionItem","factory":"New"},"TdefensivoCollectionItem":{"name":"TdefensivoCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CPFRespTec","type":"string","kind":"string","readonly":false},{"name":"nReceituario","type":"string","kind":"string","readonly":false}]},"TDest":{"name":"TDest","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"Email","type":"string","kind":"string","readonly":false},{"name":"EnderDest","type":"TEnderDest","kind":"object","ref":"TEnderDest","readonly":false},{"name":"idEstrangeiro","type":"string","kind":"string","readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"IM","type":"string","kind":"string","readonly":false},{"name":"indIEDest","type":"TindIEDest","kind":"enum","ref":"TindIEDest","readonly":false},{"name":"ISUF","type":"string","kind":"string","readonly":false},{"name":"xNome","type":"string","kind":"string","readonly":false}]},"TDetCollection":{"name":"TDetCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TDetCollectionItem","factory":"New"},"TDetCollectionItem":{"name":"TDetCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"DFeReferenciado","type":"TDFeReferenciado","kind":"object","ref":"TDFeReferenciado","readonly":false},{"name":"Imposto","type":"TImposto","kind":"object","ref":"TImposto","readonly":false},{"name":"infAdProd","type":"string","kind":"string","readonly":false},{"name":"obsCont","type":"TobsItem","kind":"object","ref":"TobsItem","readonly":false},{"name":"obsFisco","type":"TobsItem","kind":"object","ref":"TobsItem","readonly":false},{"name":"pDevol","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"Prod","type":"TProd","kind":"object","ref":"TProd","readonly":false},{"name":"vIPIDevol","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vItem","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TdetExportCollection":{"name":"TdetExportCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TdetExportCollectionItem","factory":"New"},"TdetExportCollectionItem":{"name":"TdetExportCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"chNFe","type":"string","kind":"string","readonly":false},{"name":"nDraw","type":"string","kind":"string","readonly":false},{"name":"nRE","type":"string","kind":"string","readonly":false},{"name":"qExport","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TDFErefCollection":{"name":"TDFErefCollection","unit":"ACBrDFe.RTC.Classes","kind":"list","item":"TDFErefCollectionItem","factory":"New"},"TDFErefCollectionItem":{"name":"TDFErefCollectionItem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"refDFeChave","type":"string","kind":"string","readonly":false}]},"TDFeReferenciado":{"name":"TDFeReferenciado","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"chaveAcesso","type":"string","kind":"string","readonly":false},{"name":"nItem","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false}]},"TDICollection":{"name":"TDICollection","unit":"ACBrNFe.Classes","kind":"list","item":"TDICollectionItem","factory":"New"},"TDICollectionItem":{"name":"TDICollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"adi","type":"TAdiCollection","kind":"list","ref":"TAdiCollection","readonly":false},{"name":"cExportador","type":"string","kind":"string","readonly":false},{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"dDesemb","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dDi","type":"TDateTime","kind":"datetime","readonly":false},{"name":"nDi","type":"string","kind":"string","readonly":false},{"name":"tpIntermedio","type":"TpcnTipoIntermedio","kind":"enum","ref":"TpcnTipoIntermedio","readonly":false},{"name":"tpViaTransp","type":"TpcnTipoViaTransp","kind":"enum","ref":"TpcnTipoViaTransp","readonly":false},{"name":"UFDesemb","type":"string","kind":"string","readonly":false},{"name":"UFTerceiro","type":"string","kind":"string","readonly":false},{"name":"vAFRMM","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"xLocDesemb","type":"string","kind":"string","readonly":false}]},"TDupCollection":{"name":"TDupCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TDupCollectionItem","factory":"New"},"TDupCollectionItem":{"name":"TDupCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"dVenc","type":"TDateTime","kind":"datetime","readonly":false},{"name":"nDup","type":"string","kind":"string","readonly":false},{"name":"vDup","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TEmit":{"name":"TEmit","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNAE","type":"string","kind":"string","readonly":false},{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"CRT","type":"TpcnCRT","kind":"enum","ref":"TpcnCRT","readonly":false},{"name":"EnderEmit","type":"TEnderEmit","kind":"object","ref":"TenderEmit","readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"IEST","type":"string","kind":"string","readonly":false},{"name":"IM","type":"string","kind":"string","readonly":false},{"name":"ISUFEmit","type":"string","kind":"string","readonly":false},{"name":"xFant","type":"string","kind":"string","readonly":false},{"name":"xNome","type":"string","kind":"string","readonly":false}]},"Tencerrante":{"name":"Tencerrante","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"nBico","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nBomba","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nTanque","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"vEncFin","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vEncIni","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TEnderDest":{"name":"TEnderDest","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CEP","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMun","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cPais","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"nro","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"xBairro","type":"string","kind":"string","readonly":false},{"name":"xCpl","type":"string","kind":"string","readonly":false},{"name":"xLgr","type":"string","kind":"string","readonly":false},{"name":"xMun","type":"string","kind":"string","readonly":false},{"name":"xPais","type":"string","kind":"string","readonly":false}]},"TenderEmit":{"name":"TenderEmit","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CEP","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMun","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cPais","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"nro","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"xBairro","type":"string","kind":"string","readonly":false},{"name":"xCpl","type":"string","kind":"string","readonly":false},{"name":"xLgr","type":"string","kind":"string","readonly":false},{"name":"xMun","type":"string","kind":"string","readonly":false},{"name":"xPais","type":"string","kind":"string","readonly":false}]},"TEntrega":{"name":"TEntrega","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CEP","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMun","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"cPais","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"Email","type":"string","kind":"string","readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"nro","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"xBairro","type":"string","kind":"string","readonly":false},{"name":"xCpl","type":"string","kind":"string","readonly":false},{"name":"xLgr","type":"string","kind":"string","readonly":false},{"name":"xMun","type":"string","kind":"string","readonly":false},{"name":"xNome","type":"string","kind":"string","readonly":false},{"name":"xPais","type":"string","kind":"string","readonly":false}]},"TExporta":{"name":"TExporta","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"UFembarq","type":"string","kind":"string","readonly":false},{"name":"UFSaidaPais","type":"string","kind":"string","readonly":false},{"name":"xLocDespacho","type":"string","kind":"string","readonly":false},{"name":"xLocEmbarq","type":"string","kind":"string","readonly":false},{"name":"xLocExporta","type":"string","kind":"string","readonly":false}]},"TFat":{"name":"TFat","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"nFat","type":"string","kind":"string","readonly":false},{"name":"vDesc","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vLiq","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vOrig","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TForDiaCollection":{"name":"TForDiaCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TForDiaCollectionItem","factory":"New"},"TForDiaCollectionItem":{"name":"TForDiaCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"dia","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"qtde","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TgAjusteCompet":{"name":"TgAjusteCompet","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"competApur","type":"TDateTime","kind":"datetime","readonly":false},{"name":"vCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vIBS","type":"Double","kind":"decimal","readonly":false}]},"TgALCZFMCBS":{"name":"TgALCZFMCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"nProcSuframa","type":"string","kind":"string","readonly":false},{"name":"pAliqEfetRegCBS","type":"Double","kind":"decimal","readonly":false},{"name":"tpALCZFMCBS","type":"TtpALCZFMCBS","kind":"enum","ref":"TtpALCZFMCBS","readonly":false},{"name":"vTribRegCBS","type":"Double","kind":"decimal","readonly":false}]},"TgCBS":{"name":"TgCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPres","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPresCondSus","type":"Double","kind":"decimal","readonly":false},{"name":"vDevTrib","type":"Double","kind":"decimal","readonly":false},{"name":"vDif","type":"Double","kind":"decimal","readonly":false}]},"TgCBSMonoAdRem":{"name":"TgCBSMonoAdRem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gMonoPadrao","type":"TgMonoPadraoCBSQtde","kind":"object","ref":"TgMonoPadraoCBSQtde","readonly":false},{"name":"gMonoRet","type":"TgMonoRetCBS","kind":"object","ref":"TgMonoRetCBS","readonly":false},{"name":"gMonoReten","type":"TgMonoRetenCBSQtde","kind":"object","ref":"TgMonoRetenCBSQtde","readonly":false},{"name":"gpBioDiferenca","type":"TgpBioDiferencaCBS","kind":"object","ref":"TgpBioDiferencaCBS","readonly":false}]},"TgCBSMonoAdValorem":{"name":"TgCBSMonoAdValorem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gMonoPadrao","type":"TgMonoPadraoCBSAliq","kind":"object","ref":"TgMonoPadraoCBSAliq","readonly":false},{"name":"gMonoRet","type":"TgMonoRetCBS","kind":"object","ref":"TgMonoRetCBS","readonly":false},{"name":"gMonoReten","type":"TgMonoRetenCBSAliq","kind":"object","ref":"TgMonoRetenCBSAliq","readonly":false},{"name":"gpBioDiferenca","type":"TgpBioDiferencaCBS","kind":"object","ref":"TgpBioDiferencaCBS","readonly":false}]},"TgCBSValores":{"name":"TgCBSValores","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gALCZFMCBS","type":"TgALCZFMCBS","kind":"object","ref":"TgALCZFMCBS","readonly":false},{"name":"gDevTrib","type":"TgDevTrib","kind":"object","ref":"TgDevTrib","readonly":false},{"name":"gDif","type":"TgDif","kind":"object","ref":"TgDif","readonly":false},{"name":"gRed","type":"TgRed","kind":"object","ref":"TgRed","readonly":false},{"name":"pCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vCBS","type":"Double","kind":"decimal","readonly":false}]},"TgCompraGov":{"name":"TgCompraGov","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pRedutor","type":"Double","kind":"decimal","readonly":false},{"name":"refDFeAnt","type":"TDFerefCollection","kind":"list","ref":"TDFErefCollection","readonly":false},{"name":"tpEnteGov","type":"TtpEnteGov","kind":"enum","ref":"TtpEnteGov","readonly":false},{"name":"tpOperGov","type":"TtpOperGov","kind":"enum","ref":"TtpOperGov","readonly":false}]},"TgCredPresOper":{"name":"TgCredPresOper","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"cCredPres","type":"TcCredPres","kind":"enum","ref":"TcCredPres","readonly":false},{"name":"gCBSCredPres","type":"TgIBSCBSCredPres","kind":"object","ref":"TgIBSCBSCredPres","readonly":false},{"name":"gIBSCredPres","type":"TgIBSCBSCredPres","kind":"object","ref":"TgIBSCBSCredPres","readonly":false},{"name":"vBCCredPres","type":"Double","kind":"decimal","readonly":false}]},"TgDevTrib":{"name":"TgDevTrib","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pDevTrib","type":"Double","kind":"decimal","readonly":false},{"name":"vDevTrib","type":"Double","kind":"decimal","readonly":false}]},"TgDif":{"name":"TgDif","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pDif","type":"Double","kind":"decimal","readonly":false},{"name":"vDif","type":"Double","kind":"decimal","readonly":false}]},"TgEstornoCred":{"name":"TgEstornoCred","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vCBSEstCred","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSEstCred","type":"Double","kind":"decimal","readonly":false}]},"TgIBS":{"name":"TgIBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gIBSMunTot","type":"TgIBSMunTot","kind":"object","ref":"TgIBSMunTot","readonly":false},{"name":"gIBSUFTot","type":"TgIBSUFTot","kind":"object","ref":"TgIBSUFTot","readonly":false},{"name":"vCredPres","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPresCondSus","type":"Double","kind":"decimal","readonly":false},{"name":"vIBS","type":"Double","kind":"decimal","readonly":false}]},"TgIBSCBS":{"name":"TgIBSCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gCBS","type":"TgCBSValores","kind":"object","ref":"TgCBSValores","readonly":false},{"name":"gIBSMun","type":"TgIBSMunValores","kind":"object","ref":"TgIBSMunValores","readonly":false},{"name":"gIBSUF","type":"TgIBSUFValores","kind":"object","ref":"TgIBSUFValores","readonly":false},{"name":"gTribCompraGov","type":"TgTribCompraGov","kind":"object","ref":"TgTribCompraGov","readonly":false},{"name":"gTribRegular","type":"TgTribRegular","kind":"object","ref":"TgTribRegular","readonly":false},{"name":"vBC","type":"Double","kind":"decimal","readonly":false},{"name":"vIBS","type":"Double","kind":"decimal","readonly":false},{"name":"vOperacIndiv","type":"Double","kind":"decimal","readonly":false},{"name":"vRedAjusteIndiv","type":"Double","kind":"decimal","readonly":false},{"name":"vRedSocialIndiv","type":"Double","kind":"decimal","readonly":false},{"name":"vTornaIndiv","type":"Double","kind":"decimal","readonly":false}]},"TgIBSCBSCredPres":{"name":"TgIBSCBSCredPres","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pCredPres","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPres","type":"Double","kind":"decimal","readonly":false},{"name":"vCredPresCondSus","type":"Double","kind":"decimal","readonly":false}]},"TgIBSCBSMono":{"name":"TgIBSCBSMono","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gCBSMonoAdRem","type":"TgCBSMonoAdRem","kind":"object","ref":"TgCBSMonoAdRem","readonly":false},{"name":"gCBSMonoAdValorem","type":"TgCBSMonoAdValorem","kind":"object","ref":"TgCBSMonoAdValorem","readonly":false},{"name":"gIBSMonoAdRem","type":"TgIBSMonoAdRem","kind":"object","ref":"TgIBSMonoAdRem","readonly":false},{"name":"gIBSMonoAdValorem","type":"TgIBSMonoAdValorem","kind":"object","ref":"TgIBSMonoAdValorem","readonly":false},{"name":"vTotCBSMonoItem","type":"Double","kind":"decimal","readonly":false},{"name":"vTotIBSMonoItem","type":"Double","kind":"decimal","readonly":false}]},"TgIBSMonoAdRem":{"name":"TgIBSMonoAdRem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gMonoPadrao","type":"TgMonoPadraoIBSQtde","kind":"object","ref":"TgMonoPadraoIBSQtde","readonly":false},{"name":"gMonoRet","type":"TgMonoRetIBS","kind":"object","ref":"TgMonoRetIBS","readonly":false},{"name":"gMonoReten","type":"TgMonoRetenIBSQtde","kind":"object","ref":"TgMonoRetenIBSQtde","readonly":false},{"name":"gpBioDiferenca","type":"TgpBioDiferencaIBS","kind":"object","ref":"TgpBioDiferencaIBS","readonly":false}]},"TgIBSMonoAdValorem":{"name":"TgIBSMonoAdValorem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gMonoPadrao","type":"TgMonoPadraoIBSAliq","kind":"object","ref":"TgMonoPadraoIBSAliq","readonly":false},{"name":"gMonoRet","type":"TgMonoRetIBS","kind":"object","ref":"TgMonoRetIBS","readonly":false},{"name":"gMonoReten","type":"TgMonoRetenIBSAliq","kind":"object","ref":"TgMonoRetenIBSAliq","readonly":false},{"name":"gpBioDiferenca","type":"TgpBioDiferencaIBS","kind":"object","ref":"TgpBioDiferencaIBS","readonly":false}]},"TgIBSMunTot":{"name":"TgIBSMunTot","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vDevTrib","type":"Double","kind":"decimal","readonly":false},{"name":"vDif","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMun","type":"Double","kind":"decimal","readonly":false}]},"TgIBSMunValores":{"name":"TgIBSMunValores","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gDevTrib","type":"TgDevTrib","kind":"object","ref":"TgDevTrib","readonly":false},{"name":"gDif","type":"TgDif","kind":"object","ref":"TgDif","readonly":false},{"name":"gRed","type":"TgRed","kind":"object","ref":"TgRed","readonly":false},{"name":"pIBSMun","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMun","type":"Double","kind":"decimal","readonly":false}]},"TgIBSUFTot":{"name":"TgIBSUFTot","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vDevTrib","type":"Double","kind":"decimal","readonly":false},{"name":"vDif","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSUF","type":"Double","kind":"decimal","readonly":false}]},"TgIBSUFValores":{"name":"TgIBSUFValores","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gDevTrib","type":"TgDevTrib","kind":"object","ref":"TgDevTrib","readonly":false},{"name":"gDif","type":"TgDif","kind":"object","ref":"TgDif","readonly":false},{"name":"gRed","type":"TgRed","kind":"object","ref":"TgRed","readonly":false},{"name":"pIBSUF","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSUF","type":"Double","kind":"decimal","readonly":false}]},"TgIS":{"name":"TgIS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"adRemIS","type":"Double","kind":"decimal","readonly":false},{"name":"cClassTribIS","type":"string","kind":"string","readonly":false},{"name":"CSTIS","type":"string","kind":"string","readonly":false},{"name":"pIS","type":"Double","kind":"decimal","readonly":false},{"name":"qTrib","type":"Double","kind":"decimal","readonly":false},{"name":"uTrib","type":"string","kind":"string","readonly":false},{"name":"vBCIS","type":"Double","kind":"decimal","readonly":false},{"name":"vIS","type":"Double","kind":"decimal","readonly":false}]},"TgMono":{"name":"TgMono","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vCBSMono","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMonoRet","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMono","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoRet","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoReten","type":"Double","kind":"decimal","readonly":false}]},"TgMonoPadraoCBSAliq":{"name":"TgMonoPadraoCBSAliq","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqMonoCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vBCMono","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMono","type":"Double","kind":"decimal","readonly":false}]},"TgMonoPadraoCBSQtde":{"name":"TgMonoPadraoCBSQtde","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"adRemCBS","type":"Double","kind":"decimal","readonly":false},{"name":"qBCMono","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMono","type":"Double","kind":"decimal","readonly":false}]},"TgMonoPadraoIBSAliq":{"name":"TgMonoPadraoIBSAliq","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqMonoMun","type":"Double","kind":"decimal","readonly":false},{"name":"pAliqMonoUF","type":"Double","kind":"decimal","readonly":false},{"name":"vBCMono","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMono","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoMun","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoUF","type":"Double","kind":"decimal","readonly":false}]},"TgMonoPadraoIBSQtde":{"name":"TgMonoPadraoIBSQtde","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"adRemIBS","type":"Double","kind":"decimal","readonly":false},{"name":"qBCMono","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMono","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetCBS":{"name":"TgMonoRetCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vCBSMonoRet","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetenCBSAliq":{"name":"TgMonoRetenCBSAliq","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vBCMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMonoReten","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetenCBSQtde":{"name":"TgMonoRetenCBSQtde","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"adRemCBSReten","type":"Double","kind":"decimal","readonly":false},{"name":"qBCMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSMonoReten","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetenIBSAliq":{"name":"TgMonoRetenIBSAliq","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vBCMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoReten","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetenIBSQtde":{"name":"TgMonoRetenIBSQtde","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"adRemIBSReten","type":"Double","kind":"decimal","readonly":false},{"name":"qBCMonoReten","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSMonoReten","type":"Double","kind":"decimal","readonly":false}]},"TgMonoRetIBS":{"name":"TgMonoRetIBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vIBSMonoRet","type":"Double","kind":"decimal","readonly":false}]},"TgPagAntecipado":{"name":"TgPagAntecipado","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"refNFe","type":"TrefDFePagAntCollection","kind":"list","ref":"TrefDFePagAntCollection","readonly":false}]},"TgpBioDiferencaCBS":{"name":"TgpBioDiferencaCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"qBCBioComb","type":"Double","kind":"decimal","readonly":false},{"name":"vCBSDiferenca","type":"Double","kind":"decimal","readonly":false}]},"TgpBioDiferencaIBS":{"name":"TgpBioDiferencaIBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"qBCBioComb","type":"Double","kind":"decimal","readonly":false},{"name":"vIBSDiferenca","type":"Double","kind":"decimal","readonly":false}]},"TgRed":{"name":"TgRed","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqEfet","type":"Double","kind":"decimal","readonly":false},{"name":"pRedAliq","type":"Double","kind":"decimal","readonly":false}]},"TgTransfCred":{"name":"TgTransfCred","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vIBS","type":"Double","kind":"decimal","readonly":false}]},"TgTribCompraGov":{"name":"TgTribCompraGov","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"pAliqCBS","type":"Double","kind":"decimal","readonly":false},{"name":"pAliqIBSMun","type":"Double","kind":"decimal","readonly":false},{"name":"pAliqIBSUF","type":"Double","kind":"decimal","readonly":false},{"name":"vTribCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vTribIBSMun","type":"Double","kind":"decimal","readonly":false},{"name":"vTribIBSUF","type":"Double","kind":"decimal","readonly":false}]},"TgTribRegular":{"name":"TgTribRegular","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"cClassTribReg","type":"string","kind":"string","readonly":false},{"name":"CSTReg","type":"TCSTIBSCBS","kind":"enum","ref":"TCSTIBSCBS","readonly":false},{"name":"pAliqEfetRegCBS","type":"Double","kind":"decimal","readonly":false},{"name":"pAliqEfetRegIBSMun","type":"Double","kind":"decimal","readonly":false},{"name":"pAliqEfetRegIBSUF","type":"Double","kind":"decimal","readonly":false},{"name":"vTribRegCBS","type":"Double","kind":"decimal","readonly":false},{"name":"vTribRegIBSMun","type":"Double","kind":"decimal","readonly":false},{"name":"vTribRegIBSUF","type":"Double","kind":"decimal","readonly":false}]},"TguiaTransito":{"name":"TguiaTransito","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"nGuia","type":"string","kind":"string","readonly":false},{"name":"serieGuia","type":"string","kind":"string","readonly":false},{"name":"tpGuia","type":"TtpGuia","kind":"enum","ref":"TtpGuia","readonly":false},{"name":"UFGuia","type":"string","kind":"string","readonly":false}]},"TIBSCBS":{"name":"TIBSCBS","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"cClassTrib","type":"string","kind":"string","readonly":false},{"name":"CST","type":"TCSTIBSCBS","kind":"enum","ref":"TCSTIBSCBS","readonly":false},{"name":"gAjusteCompet","type":"TgAjusteCompet","kind":"object","ref":"TgAjusteCompet","readonly":false},{"name":"gCredPresIBSZFM","type":"TCredPresIBSZFM","kind":"object","ref":"TCredPresIBSZFM","readonly":false},{"name":"gCredPresOper","type":"TgCredPresOper","kind":"object","ref":"TgCredPresOper","readonly":false},{"name":"gEstornoCred","type":"TgEstornoCred","kind":"object","ref":"TgEstornoCred","readonly":false},{"name":"gIBSCBS","type":"TgIBSCBS","kind":"object","ref":"TgIBSCBS","readonly":false},{"name":"gIBSCBSMono","type":"TgIBSCBSMono","kind":"object","ref":"TgIBSCBSMono","readonly":false},{"name":"gTransfCred","type":"TgTransfCred","kind":"object","ref":"TgTransfCred","readonly":false},{"name":"indDoacao","type":"TIndicadorEx","kind":"enum","ref":"TIndicadorEx","readonly":false}]},"TIBSCBSTot":{"name":"TIBSCBSTot","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"gCBS","type":"TgCBS","kind":"object","ref":"TgCBS","readonly":false},{"name":"gEstornoCred","type":"TgEstornoCred","kind":"object","ref":"TgEstornoCred","readonly":false},{"name":"gIBS","type":"TgIBS","kind":"object","ref":"TgIBS","readonly":false},{"name":"gMono","type":"TgMono","kind":"object","ref":"TgMono","readonly":false},{"name":"vBCIBSCBS","type":"Double","kind":"decimal","readonly":false}]},"TICMS":{"name":"TICMS","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"adRemICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"adRemICMSDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"adRemICMSRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"adRemICMSReten","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"cBenefRBC","type":"string","kind":"string","readonly":false},{"name":"CSOSN","type":"TCSOSNIcms","kind":"enum","ref":"TCSOSNIcms","readonly":false},{"name":"CST","type":"TCSTIcms","kind":"enum","ref":"TCSTIcms","readonly":false,"declaredDefault":"cst00"},{"name":"indDeduzDeson","type":"TIndicadorEx","kind":"enum","ref":"TIndicadorEx","readonly":false,"declaredDefault":"tieNenhum"},{"name":"modBC","type":"TpcnDeterminacaoBaseIcms","kind":"enum","ref":"TpcnDeterminacaoBaseIcms","readonly":false,"declaredDefault":"dbiMargemValorAgregado"},{"name":"modBCST","type":"TpcnDeterminacaoBaseIcmsST","kind":"enum","ref":"TpcnDeterminacaoBaseIcmsST","readonly":false,"declaredDefault":"dbisPrecoTabelado"},{"name":"motDesICMS","type":"TpcnMotivoDesoneracaoICMS","kind":"enum","ref":"TpcnMotivoDesoneracaoICMS","readonly":false},{"name":"motDesICMSST","type":"TpcnMotivoDesoneracaoICMS","kind":"enum","ref":"TpcnMotivoDesoneracaoICMS","readonly":false},{"name":"motRedAdRem","type":"TmotRedAdRem","kind":"enum","ref":"TmotRedAdRem","readonly":false},{"name":"orig","type":"TOrigemMercadoria","kind":"enum","ref":"TOrigemMercadoria","readonly":false,"declaredDefault":"oeNacional"},{"name":"pBCOp","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pCredSN","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pFCP","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pFCPDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pFCPST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pFCPSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMSEfet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMSST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pMVAST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pRedAdRem","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pRedBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pRedBCEfet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pRedBCST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMono","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMonoDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMonoRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMonoReten","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"UFST","type":"string","kind":"string","readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCEfet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCFCP","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCFCPST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCFCPSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCSTDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCredICMSSN","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCP","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPEfet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSDeson","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSEfet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMono","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoDif","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoOp","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoReten","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSOp","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSTDeson","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSTDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSubstituto","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TICMSComb":{"name":"TICMSComb","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"vBCICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCICMSST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSST","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TICMSCons":{"name":"TICMSCons","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"UFcons","type":"string","kind":"string","readonly":false},{"name":"vBCICMSSTCons","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSTCons","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TICMSInter":{"name":"TICMSInter","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"vBCICMSSTDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSSTDest","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TICMSTot":{"name":"TICMSTot","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"qBCMono","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMonoRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCMonoReten","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDesc","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCP","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPSTRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFrete","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSDeson","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMono","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSMonoReten","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSUFRemet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vII","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vIPI","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vIPIDevol","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vNF","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vOutro","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vSeg","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vST","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vTotTrib","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TICMSUFDest":{"name":"TICMSUFDest","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"pFCPUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMSInter","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMSInterPart","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pICMSUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCFCPUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vFCPUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSUFDest","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSUFRemet","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TIde":{"name":"TIde","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cDV","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cIndOp","type":"string","kind":"string","readonly":false},{"name":"cMunFG","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMunFGIBS","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cNF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cUF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"dEmi","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dhCont","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dPrevEntrega","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dSaiEnt","type":"TDateTime","kind":"datetime","readonly":false},{"name":"finNFe","type":"TpcnFinalidadeNFe","kind":"enum","ref":"TpcnFinalidadeNFe","readonly":false,"declaredDefault":"fnNormal"},{"name":"gCompraGov","type":"TgCompraGov","kind":"object","ref":"TgCompraGov","readonly":false},{"name":"gPagAntecipado","type":"TgPagAntecipado","kind":"object","ref":"TgPagAntecipado","readonly":false},{"name":"hSaiEnt","type":"TDateTime","kind":"datetime","readonly":false},{"name":"idDest","type":"TpcnDestinoOperacao","kind":"enum","ref":"TpcnDestinoOperacao","readonly":false},{"name":"indFinal","type":"TpcnConsumidorFinal","kind":"enum","ref":"TpcnConsumidorFinal","readonly":false},{"name":"indIntermed","type":"TindIntermed","kind":"enum","ref":"TindIntermed","readonly":false},{"name":"indPag","type":"TpcnIndicadorPagamento","kind":"enum","ref":"TpcnIndicadorPagamento","readonly":false,"declaredDefault":"ipPrazo"},{"name":"indPres","type":"TpcnPresencaComprador","kind":"enum","ref":"TpcnPresencaComprador","readonly":false},{"name":"modelo","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"natOp","type":"string","kind":"string","readonly":false},{"name":"NFref","type":"TNFrefCollection","kind":"list","ref":"TNFrefCollection","readonly":false},{"name":"nNF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"procEmi","type":"TACBrProcessoEmissao","kind":"enum","ref":"TACBrProcessoEmissao","readonly":false,"declaredDefault":"peAplicativoContribuinte"},{"name":"serie","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"tpAmb","type":"TACBrTipoAmbiente","kind":"enum","ref":"TACBrTipoAmbiente","readonly":false,"declaredDefault":"taHomologacao"},{"name":"tpEmis","type":"TACBrTipoEmissao","kind":"enum","ref":"TACBrTipoEmissao","readonly":false,"declaredDefault":"teNormal"},{"name":"tpImp","type":"TACBrTipoImpressao","kind":"enum","ref":"TACBrTipoImpressao","readonly":false,"declaredDefault":"tiPaisagem"},{"name":"tpNF","type":"TTipoNFe","kind":"enum","ref":"TTipoNFe","readonly":false,"declaredDefault":"tnSaida"},{"name":"tpNFCredito","type":"TtpNFCredito","kind":"enum","ref":"TtpNFCredito","readonly":false},{"name":"tpNFDebito","type":"TtpNFDebito","kind":"enum","ref":"TtpNFDebito","readonly":false},{"name":"verProc","type":"string","kind":"string","readonly":false},{"name":"xJust","type":"string","kind":"string","readonly":false}]},"TII":{"name":"TII","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"vBc","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDespAdu","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vII","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vIOF","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TImposto":{"name":"TImposto","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"COFINS","type":"TCOFINS","kind":"object","ref":"TCOFINS","readonly":false},{"name":"COFINSST","type":"TCOFINSST","kind":"object","ref":"TCOFINSST","readonly":false},{"name":"IBSCBS","type":"TIBSCBS","kind":"object","ref":"TIBSCBS","readonly":false},{"name":"ICMS","type":"TICMS","kind":"object","ref":"TICMS","readonly":false},{"name":"ICMSUFDest","type":"TICMSUFDest","kind":"object","ref":"TICMSUFDest","readonly":false},{"name":"II","type":"TII","kind":"object","ref":"TII","readonly":false},{"name":"IPI","type":"TIPI","kind":"object","ref":"TIPI","readonly":false},{"name":"ISel","type":"TgIS","kind":"object","ref":"TgIS","readonly":false},{"name":"ISSQN","type":"TISSQN","kind":"object","ref":"TISSQN","readonly":false},{"name":"PIS","type":"TPIS","kind":"object","ref":"TPIS","readonly":false},{"name":"PISST","type":"TPISST","kind":"object","ref":"TPISST","readonly":false},{"name":"vTotTrib","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TIndicadorEx":{"name":"TIndicadorEx","unit":"ACBrDFe.Conversao","kind":"enum","values":["tieNenhum","tieSim","tieNao"]},"TindIEDest":{"name":"TindIEDest","unit":"ACBrDFe.Conversao","kind":"enum","values":["inContribuinte","inIsento","inNaoContribuinte"]},"TindImport":{"name":"TindImport","unit":"pcnConversaoNFe","kind":"enum","values":["iiNacional","iiImportado"]},"TindIncentivo":{"name":"TindIncentivo","unit":"ACBrDFe.Conversao","kind":"enum","values":["iiSim","iiNao"]},"TindIntermed":{"name":"TindIntermed","unit":"pcnConversaoNFe","kind":"enum","values":["iiSemOperacao","iiOperacaoSemIntermediador","iiOperacaoComIntermediador"]},"TIndSomaCOFINSST":{"name":"TIndSomaCOFINSST","unit":"pcnConversaoNFe","kind":"enum","values":["iscNenhum","iscCOFINSSTNaoCompoe","iscCOFINSSTCompoe"]},"TIndSomaPISST":{"name":"TIndSomaPISST","unit":"pcnConversaoNFe","kind":"enum","values":["ispNenhum","ispPISSTNaoCompoe","ispPISSTCompoe"]},"TInfAdic":{"name":"TInfAdic","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"infAdFisco","type":"string","kind":"string","readonly":false},{"name":"infCpl","type":"string","kind":"string","readonly":false},{"name":"obsCont","type":"TobsContCollection","kind":"list","ref":"TobsContCollection","readonly":false},{"name":"obsFisco","type":"TobsFiscoCollection","kind":"list","ref":"TobsFiscoCollection","readonly":false},{"name":"procRef","type":"TprocRefCollection","kind":"list","ref":"TprocRefCollection","readonly":false}]},"TinfIntermed":{"name":"TinfIntermed","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"idCadIntTran","type":"string","kind":"string","readonly":false}]},"TinfNFe":{"name":"TinfNFe","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"ID","type":"string","kind":"string","readonly":false},{"name":"Versao","type":"Double","kind":"decimal","readonly":false}]},"TinfNFeSupl":{"name":"TinfNFeSupl","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"qrCode","type":"string","kind":"string","readonly":false},{"name":"urlChave","type":"string","kind":"string","readonly":false}]},"TinfPAA":{"name":"TinfPAA","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJPAA","type":"string","kind":"string","readonly":false},{"name":"Exponent","type":"string","kind":"string","readonly":false},{"name":"Modulus","type":"string","kind":"string","readonly":false},{"name":"SignatureValue","type":"string","kind":"string","readonly":false}]},"TinfRespTec":{"name":"TinfRespTec","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"email","type":"string","kind":"string","readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"hashCSRT","type":"string","kind":"string","readonly":false},{"name":"idCSRT","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"xContato","type":"string","kind":"string","readonly":false}]},"TIPI":{"name":"TIPI","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cEnq","type":"string","kind":"string","readonly":false},{"name":"clEnq","type":"string","kind":"string","readonly":false},{"name":"CNPJProd","type":"string","kind":"string","readonly":false},{"name":"cSelo","type":"string","kind":"string","readonly":false},{"name":"CST","type":"TpcnCstIpi","kind":"enum","ref":"TpcnCstIpi","readonly":false,"declaredDefault":"ipi00"},{"name":"pIPI","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qSelo","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"qUnid","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vIPI","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vUnid","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TISSQN":{"name":"TISSQN","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cListServ","type":"string","kind":"string","readonly":false},{"name":"cMun","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMunFG","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cPais","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cServico","type":"string","kind":"string","readonly":false},{"name":"cSitTrib","type":"TpcnISSQNcSitTrib","kind":"enum","ref":"TpcnISSQNcSitTrib","readonly":false,"declaredDefault":"ISSQNcSitTribVazio"},{"name":"indIncentivo","type":"TindIncentivo","kind":"enum","ref":"TindIncentivo","readonly":false},{"name":"indISS","type":"TpcnindISS","kind":"enum","ref":"TpcnindISS","readonly":false},{"name":"indISSRet","type":"TpcnindISSRet","kind":"enum","ref":"TpcnindISSRet","readonly":false},{"name":"nProcesso","type":"string","kind":"string","readonly":false},{"name":"vAliq","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDeducao","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDescCond","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDescIncond","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vISSQN","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vISSRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vOutro","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TISSQNtot":{"name":"TISSQNtot","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cRegTrib","type":"TRegTribISSQN","kind":"enum","ref":"TRegTribISSQN","readonly":false},{"name":"dCompet","type":"TDateTime","kind":"datetime","readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDeducao","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDescCond","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vDescIncond","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vISS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vISSRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vOutro","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vServ","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TISTot":{"name":"TISTot","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"vIS","type":"Double","kind":"decimal","readonly":false}]},"TLacresCollection":{"name":"TLacresCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TLacresCollectionItem","factory":"New"},"TLacresCollectionItem":{"name":"TLacresCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"nLacre","type":"string","kind":"string","readonly":false}]},"TMedCollection":{"name":"TMedCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TMedCollectionItem","factory":"New"},"TMedCollectionItem":{"name":"TMedCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cProdANVISA","type":"string","kind":"string","readonly":false},{"name":"dFab","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dVal","type":"TDateTime","kind":"datetime","readonly":false},{"name":"nLote","type":"string","kind":"string","readonly":false},{"name":"qLote","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vPMC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"xMotivoIsencao","type":"string","kind":"string","readonly":false}]},"TmotRedAdRem":{"name":"TmotRedAdRem","unit":"pcnConversaoNFe","kind":"enum","values":["motTranspColetivo","motOutros"]},"TNFe":{"name":"TNFe","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"agropecuario","type":"Tagropecuario","kind":"object","ref":"Tagropecuario","readonly":false},{"name":"autXML","type":"TautXMLCollection","kind":"list","ref":"TautXMLCollection","readonly":false},{"name":"Avulsa","type":"TAvulsa","kind":"object","ref":"TAvulsa","readonly":false},{"name":"cana","type":"Tcana","kind":"object","ref":"Tcana","readonly":false},{"name":"Cobr","type":"TCobr","kind":"object","ref":"TCobr","readonly":false},{"name":"compra","type":"Tcompra","kind":"object","ref":"TCompra","readonly":false},{"name":"Dest","type":"TDest","kind":"object","ref":"TDest","readonly":false},{"name":"Det","type":"TDetCollection","kind":"list","ref":"TDetCollection","readonly":false},{"name":"Emit","type":"TEmit","kind":"object","ref":"TEmit","readonly":false},{"name":"Entrega","type":"TEntrega","kind":"object","ref":"TEntrega","readonly":false},{"name":"exporta","type":"Texporta","kind":"object","ref":"TExporta","readonly":false},{"name":"Ide","type":"TIde","kind":"object","ref":"TIde","readonly":false},{"name":"InfAdic","type":"TInfAdic","kind":"object","ref":"TInfAdic","readonly":false},{"name":"infIntermed","type":"TinfIntermed","kind":"object","ref":"TinfIntermed","readonly":false},{"name":"infNFe","type":"TinfNFe","kind":"object","ref":"TinfNFe","readonly":false},{"name":"infNFeSupl","type":"TinfNFeSupl","kind":"object","ref":"TinfNFeSupl","readonly":true},{"name":"infPAA","type":"TinfPAA","kind":"object","ref":"TinfPAA","readonly":false},{"name":"infRespTec","type":"TinfRespTec","kind":"object","ref":"TinfRespTec","readonly":false},{"name":"pag","type":"TpagCollection","kind":"list","ref":"TpagCollection","readonly":false},{"name":"procNFe","type":"TProcDFe","kind":"object","ref":"TProcDFe","readonly":true},{"name":"Retirada","type":"TRetirada","kind":"object","ref":"TRetirada","readonly":false},{"name":"signature","type":"Tsignature","kind":"object","ref":"TSignature","readonly":true},{"name":"Total","type":"TTotal","kind":"object","ref":"TTotal","readonly":false},{"name":"Transp","type":"TTransp","kind":"object","ref":"TTransp","readonly":false}]},"TNFrefCollection":{"name":"TNFrefCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TNFrefCollectionItem","factory":"New"},"TNFrefCollectionItem":{"name":"TNFrefCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"refCTe","type":"string","kind":"string","readonly":false},{"name":"RefECF","type":"TRefECF","kind":"object","ref":"TRefECF","readonly":false},{"name":"RefNF","type":"TRefNF","kind":"object","ref":"TRefNF","readonly":false},{"name":"refNFe","type":"string","kind":"string","readonly":false},{"name":"refNFeSig","type":"string","kind":"string","readonly":false},{"name":"RefNFP","type":"TRefNFP","kind":"object","ref":"TRefNFP","readonly":false}]},"TNVECollection":{"name":"TNVECollection","unit":"ACBrNFe.Classes","kind":"list","item":"TNVECollectionItem","factory":"New"},"TNVECollectionItem":{"name":"TNVECollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"NVE","type":"string","kind":"string","readonly":false}]},"TobsContCollection":{"name":"TobsContCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TobsContCollectionItem","factory":"New"},"TobsContCollectionItem":{"name":"TobsContCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"xCampo","type":"string","kind":"string","readonly":false},{"name":"xTexto","type":"string","kind":"string","readonly":false}]},"TobsFiscoCollection":{"name":"TobsFiscoCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TobsFiscoCollectionItem","factory":"New"},"TobsFiscoCollectionItem":{"name":"TobsFiscoCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"xCampo","type":"string","kind":"string","readonly":false},{"name":"xTexto","type":"string","kind":"string","readonly":false}]},"TobsItem":{"name":"TobsItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"xCampo","type":"string","kind":"string","readonly":false},{"name":"xTexto","type":"string","kind":"string","readonly":false}]},"TorigCombCollection":{"name":"TorigCombCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TorigCombCollectionItem","factory":"New"},"TorigCombCollectionItem":{"name":"TorigCombCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cUFOrig","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"indImport","type":"TindImport","kind":"enum","ref":"TindImport","readonly":false},{"name":"pOrig","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TOrigemMercadoria":{"name":"TOrigemMercadoria","unit":"ACBrDFe.Conversao","kind":"enum","values":["oeNacional","oeEstrangeiraImportacaoDireta","oeEstrangeiraAdquiridaBrasil","oeNacionalConteudoImportacaoSuperior40","oeNacionalProcessosBasicos","oeNacionalConteudoImportacaoInferiorIgual40","oeEstrangeiraImportacaoDiretaSemSimilar","oeEstrangeiraAdquiridaBrasilSemSimilar","oeNacionalConteudoImportacaoSuperior70","oeReservadoParaUsoFuturo","oeVazio"]},"TpagCollection":{"name":"TpagCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TpagCollectionItem","factory":"New"},"TpagCollectionItem":{"name":"TpagCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cAut","type":"string","kind":"string","readonly":false},{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"CNPJPag","type":"string","kind":"string","readonly":false},{"name":"CNPJReceb","type":"string","kind":"string","readonly":false},{"name":"dPag","type":"TDateTime","kind":"datetime","readonly":false},{"name":"idTermPag","type":"string","kind":"string","readonly":false},{"name":"indPag","type":"TpcnIndicadorPagamento","kind":"enum","ref":"TpcnIndicadorPagamento","readonly":false,"declaredDefault":"ipNenhum"},{"name":"tBand","type":"TpcnBandeiraCartao","kind":"enum","ref":"TpcnBandeiraCartao","readonly":false},{"name":"tPag","type":"TpcnFormaPagamento","kind":"enum","ref":"TpcnFormaPagamento","readonly":false},{"name":"tpIntegra","type":"TtpIntegra","kind":"enum","ref":"TtpIntegra","readonly":false},{"name":"UFPag","type":"string","kind":"string","readonly":false},{"name":"vPag","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"xPag","type":"string","kind":"string","readonly":false}]},"TpcnBandeiraCartao":{"name":"TpcnBandeiraCartao","unit":"pcnConversaoNFe","kind":"enum","values":["bcVisa","bcMasterCard","bcAmericanExpress","bcSorocred","bcDinersClub","bcElo","bcHipercard","bcAura","bcCabal","bcAlelo","bcBanesCard","bcCalCard","bcCredz","bcDiscover","bcGoodCard","bcGreenCard","bcHiper","bcJcB","bcMais","bcMaxVan","bcPolicard","bcRedeCompras","bcSodexo","bcValeCard","bcVerocheque","bcVR","bcTicket","bcOutros"]},"TpcnCondicaoVeiculo":{"name":"TpcnCondicaoVeiculo","unit":"pcnConversaoNFe","kind":"enum","values":["cvAcabado","cvInacabado","cvSemiAcabado"]},"TpcnConsumidorFinal":{"name":"TpcnConsumidorFinal","unit":"pcnConversaoNFe","kind":"enum","values":["cfNao","cfConsumidorFinal"]},"TpcnCRT":{"name":"TpcnCRT","unit":"pcnConversaoNFe","kind":"enum","values":["crtSimplesNacional","crtSimplesExcessoReceita","crtRegimeNormal","crtMEI"]},"TpcnCstIpi":{"name":"TpcnCstIpi","unit":"pcnConversaoNFe","kind":"enum","values":["ipi00","ipi49","ipi50","ipi99","ipi01","ipi02","ipi03","ipi04","ipi05","ipi51","ipi52","ipi53","ipi54","ipi55"]},"TpcnDestinoOperacao":{"name":"TpcnDestinoOperacao","unit":"pcnConversaoNFe","kind":"enum","values":["doInterna","doInterestadual","doExterior"]},"TpcnDeterminacaoBaseIcms":{"name":"TpcnDeterminacaoBaseIcms","unit":"pcnConversaoNFe","kind":"enum","values":["dbiMargemValorAgregado","dbiPauta","dbiPrecoTabelado","dbiValorOperacao","dbiNenhum"]},"TpcnDeterminacaoBaseIcmsST":{"name":"TpcnDeterminacaoBaseIcmsST","unit":"pcnConversaoNFe","kind":"enum","values":["dbisPrecoTabelado","dbisListaNegativa","dbisListaPositiva","dbisListaNeutra","dbisMargemValorAgregado","dbisPauta","dbisValordaOperacao"]},"TpcnECFModRef":{"name":"TpcnECFModRef","unit":"pcnConversaoNFe","kind":"enum","values":["ECFModRefVazio","ECFModRef2B","ECFModRef2C","ECFModRef2D"]},"TpcnFinalidadeNFe":{"name":"TpcnFinalidadeNFe","unit":"pcnConversaoNFe","kind":"enum","values":["fnNormal","fnComplementar","fnAjuste","fnDevolucao","fnCredito","fnDebito"]},"TpcnFormaPagamento":{"name":"TpcnFormaPagamento","unit":"pcnConversaoNFe","kind":"enum","values":["fpDinheiro","fpCheque","fpCartaoCredito","fpCartaoDebito","fpCreditoLoja","fpValeAlimentacao","fpValeRefeicao","fpValePresente","fpValeCombustivel","fpDuplicataMercantil","fpBoletoBancario","fpDepositoBancario","fpPagamentoInstantaneo","fpTransfBancario","fpProgramaFidelidade","fpSemPagamento","fpRegimeEspecial","fpOutro","fpPagamentoInstantaneoEstatico","fpCreditoEmLojaPorDevolucao","fpFalhaHardware","fpPagamentoPosterior","fpPagInstantaneoPIXAutomatico","fpTEFBookTransfer"]},"TpcnIndEscala":{"name":"TpcnIndEscala","unit":"pcnConversaoNFe","kind":"enum","values":["ieRelevante","ieNaoRelevante","ieNenhum"]},"TpcnIndicadorPagamento":{"name":"TpcnIndicadorPagamento","unit":"pcnConversaoNFe","kind":"enum","values":["ipVista","ipPrazo","ipOutras","ipNenhum"]},"TpcnIndicadorProcesso":{"name":"TpcnIndicadorProcesso","unit":"pcnConversaoNFe","kind":"enum","values":["ipSEFAZ","ipJusticaFederal","ipJusticaEstadual","ipSecexRFB","ipCONFAZ","ipOutros"]},"TpcnIndicadorTotal":{"name":"TpcnIndicadorTotal","unit":"pcnConversaoNFe","kind":"enum","values":["itSomaTotalNFe","itNaoSomaTotalNFe"]},"TpcnindISS":{"name":"TpcnindISS","unit":"pcnConversaoNFe","kind":"enum","values":["iiExigivel","iiNaoIncidencia","iiIsencao","iiExportacao","iiImunidade","iiExigSuspDecisaoJudicial","iiExigSuspProcessoAdm"]},"TpcnindISSRet":{"name":"TpcnindISSRet","unit":"pcnConversaoNFe","kind":"enum","values":["iirSim","iirNao"]},"TpcnISSQNcSitTrib":{"name":"TpcnISSQNcSitTrib","unit":"pcnConversaoNFe","kind":"enum","values":["ISSQNcSitTribVazio","ISSQNcSitTribNORMAL","ISSQNcSitTribRETIDA","ISSQNcSitTribSUBSTITUTA","ISSQNcSitTribISENTA"]},"TpcnModalidadeFrete":{"name":"TpcnModalidadeFrete","unit":"pcnConversaoNFe","kind":"enum","values":["mfContaEmitente","mfContaDestinatario","mfContaTerceiros","mfProprioRemetente","mfProprioDestinatario","mfSemFrete"]},"TpcnMotivoDesoneracaoICMS":{"name":"TpcnMotivoDesoneracaoICMS","unit":"pcnConversaoNFe","kind":"enum","values":["mdiTaxi","mdiDeficienteFisico","mdiProdutorAgropecuario","mdiFrotistaLocadora","mdiDiplomaticoConsular","mdiAmazoniaLivreComercio","mdiSuframa","mdiVendaOrgaosPublicos","mdiOutros","mdiDeficienteCondutor","mdiDeficienteNaoCondutor","mdiOrgaoFomento","mdiOlimpiadaRio2016","mdiSolicitadoFisco"]},"TpcnPresencaComprador":{"name":"TpcnPresencaComprador","unit":"pcnConversaoNFe","kind":"enum","values":["pcNao","pcPresencial","pcInternet","pcTeleatendimento","pcEntregaDomicilio","pcPresencialForaEstabelecimento","pcOutros"]},"TpcnTipoArma":{"name":"TpcnTipoArma","unit":"pcnConversaoNFe","kind":"enum","values":["taUsoPermitido","taUsoRestrito"]},"TpcnTipoIntermedio":{"name":"TpcnTipoIntermedio","unit":"pcnConversaoNFe","kind":"enum","values":["tiContaPropria","tiContaOrdem","tiEncomenda"]},"TpcnTipoOperacao":{"name":"TpcnTipoOperacao","unit":"pcnConversaoNFe","kind":"enum","values":["toVendaConcessionaria","toFaturamentoDireto","toVendaDireta","toOutros"]},"TpcnTipoViaTransp":{"name":"TpcnTipoViaTransp","unit":"pcnConversaoNFe","kind":"enum","values":["tvMaritima","tvFluvial","tvLacustre","tvAerea","tvPostal","tvFerroviaria","tvRodoviaria","tvConduto","tvMeiosProprios","tvEntradaSaidaFicta","tvCourier","tvEmMaos","tvPorReboque"]},"TPIS":{"name":"TPIS","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CST","type":"TCstPis","kind":"enum","ref":"TCSTPis","readonly":false,"declaredDefault":"pis01"},{"name":"pPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vAliqProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBC","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TPISST":{"name":"TPISST","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"indSomaPISST","type":"TIndSomaPISST","kind":"enum","ref":"TIndSomaPISST","readonly":false},{"name":"pPis","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qBCProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vAliqProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBc","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TProcDFe":{"name":"TProcDFe","unit":"ACBrDFeComum.Proc","kind":"object","properties":[{"name":"chDFe","type":"string","kind":"string","readonly":false},{"name":"cMsg","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cStat","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"dhRecbto","type":"TDateTime","kind":"datetime","readonly":false},{"name":"digVal","type":"string","kind":"string","readonly":false},{"name":"Id","type":"string","kind":"string","readonly":false},{"name":"nProt","type":"string","kind":"string","readonly":false},{"name":"PathDFe","type":"string","kind":"string","readonly":false},{"name":"PathRetConsReciDFe","type":"string","kind":"string","readonly":false},{"name":"PathRetConsSitDFe","type":"string","kind":"string","readonly":false},{"name":"tpAmb","type":"TACBrTipoAmbiente","kind":"enum","ref":"TACBrTipoAmbiente","readonly":false},{"name":"verAplic","type":"string","kind":"string","readonly":false},{"name":"XML_DFe","type":"string","kind":"string","readonly":false},{"name":"XML_prot","type":"string","kind":"string","readonly":false},{"name":"xMotivo","type":"string","kind":"string","readonly":false},{"name":"xMsg","type":"string","kind":"string","readonly":false}]},"TprocRefCollection":{"name":"TprocRefCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TprocRefCollectionItem","factory":"New"},"TprocRefCollectionItem":{"name":"TprocRefCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"indProc","type":"TpcnIndicadorProcesso","kind":"enum","ref":"TpcnIndicadorProcesso","readonly":false,"declaredDefault":"ipSEFAZ"},{"name":"nProc","type":"string","kind":"string","readonly":false},{"name":"tpAto","type":"TtpAto","kind":"enum","ref":"TtpAto","readonly":false}]},"TProd":{"name":"TProd","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"arma","type":"TarmaCollection","kind":"list","ref":"TArmaCollection","readonly":false},{"name":"cBarra","type":"string","kind":"string","readonly":false},{"name":"cBarraTrib","type":"string","kind":"string","readonly":false},{"name":"cBenef","type":"string","kind":"string","readonly":false},{"name":"cEAN","type":"string","kind":"string","readonly":false},{"name":"cEANTrib","type":"string","kind":"string","readonly":false},{"name":"CEST","type":"string","kind":"string","readonly":false},{"name":"CFOP","type":"string","kind":"string","readonly":false},{"name":"CNPJFab","type":"string","kind":"string","readonly":false},{"name":"comb","type":"TComb","kind":"object","ref":"TComb","readonly":false},{"name":"cProd","type":"string","kind":"string","readonly":false},{"name":"CredPresumido","type":"TCredPresumidoCollection","kind":"list","ref":"TCredPresumidoCollection","readonly":false},{"name":"detExport","type":"TdetExportCollection","kind":"list","ref":"TdetExportCollection","readonly":false},{"name":"DI","type":"TDICollection","kind":"list","ref":"TDICollection","readonly":false},{"name":"EXTIPI","type":"string","kind":"string","readonly":false},{"name":"indBemMovelUsado","type":"TIndicadorEx","kind":"enum","ref":"TIndicadorEx","readonly":false,"declaredDefault":"tieNenhum"},{"name":"indEscala","type":"TpcnIndEscala","kind":"enum","ref":"TpcnIndEscala","readonly":false,"declaredDefault":"ieNenhum"},{"name":"IndTot","type":"TpcnIndicadorTotal","kind":"enum","ref":"TpcnIndicadorTotal","readonly":false,"declaredDefault":"itSomaTotalNFe"},{"name":"med","type":"TMedCollection","kind":"list","ref":"TMedCollection","readonly":false},{"name":"NCM","type":"string","kind":"string","readonly":false},{"name":"nFCI","type":"string","kind":"string","readonly":false},{"name":"nItem","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nItemPed","type":"string","kind":"string","readonly":false},{"name":"nRECOPI","type":"string","kind":"string","readonly":false},{"name":"NVE","type":"TNVECollection","kind":"list","ref":"TNVECollection","readonly":false},{"name":"qCom","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qTrib","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"rastro","type":"TRastroCollection","kind":"list","ref":"TRastroCollection","readonly":false},{"name":"tpCredPresIBSZFM","type":"TtpCredPresIBSZFM","kind":"enum","ref":"TTpCredPresIBSZFM","readonly":false},{"name":"uCom","type":"string","kind":"string","readonly":false},{"name":"uTrib","type":"string","kind":"string","readonly":false},{"name":"vDesc","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"veicProd","type":"TveicProd","kind":"object","ref":"TveicProd","readonly":false},{"name":"vFrete","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vOutro","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vProd","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vSeg","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vUnCom","type":"Double","kind":"decimal","readonly":false},{"name":"vUnTrib","type":"Double","kind":"decimal","readonly":false},{"name":"xPed","type":"string","kind":"string","readonly":false},{"name":"xProd","type":"string","kind":"string","readonly":false}]},"TRastroCollection":{"name":"TRastroCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TRastroCollectionItem","factory":"New"},"TRastroCollectionItem":{"name":"TRastroCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"cAgreg","type":"string","kind":"string","readonly":false},{"name":"dFab","type":"TDateTime","kind":"datetime","readonly":false},{"name":"dVal","type":"TDateTime","kind":"datetime","readonly":false},{"name":"nLote","type":"string","kind":"string","readonly":false},{"name":"qLote","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TReboqueCollection":{"name":"TReboqueCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TReboqueCollectionItem","factory":"New"},"TReboqueCollectionItem":{"name":"TReboqueCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"placa","type":"string","kind":"string","readonly":false},{"name":"RNTC","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false}]},"TrefDFePagAntCollection":{"name":"TrefDFePagAntCollection","unit":"ACBrDFe.RTC.Classes","kind":"list","item":"TrefDFePagAntCollectionItem","factory":"New"},"TrefDFePagAntCollectionItem":{"name":"TrefDFePagAntCollectionItem","unit":"ACBrDFe.RTC.Classes","kind":"object","properties":[{"name":"refDFEChave","type":"string","kind":"string","readonly":false}]},"TRefECF":{"name":"TRefECF","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"modelo","type":"TpcnECFModRef","kind":"enum","ref":"TpcnECFModRef","readonly":false,"declaredDefault":"ECFModRefVazio"},{"name":"nCOO","type":"string","kind":"string","readonly":false},{"name":"nECF","type":"string","kind":"string","readonly":false}]},"TRefNF":{"name":"TRefNF","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"AAMM","type":"string","kind":"string","readonly":false},{"name":"CNPJ","type":"string","kind":"string","readonly":false},{"name":"cUF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"modelo","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nNF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"serie","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false}]},"TRefNFP":{"name":"TRefNFP","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"AAMM","type":"string","kind":"string","readonly":false},{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"cUF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"modelo","type":"string","kind":"string","readonly":false},{"name":"nNF","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"serie","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false}]},"TRegTribISSQN":{"name":"TRegTribISSQN","unit":"ACBrDFe.Conversao","kind":"enum","values":["RTISSMicroempresaMunicipal","RTISSEstimativa","RTISSSociedadeProfissionais","RTISSCooperativa","RTISSMEI","RTISSMEEPP","RTISSNenhum"]},"TRetirada":{"name":"TRetirada","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CEP","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cMun","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"cPais","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"Email","type":"string","kind":"string","readonly":false},{"name":"fone","type":"string","kind":"string","readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"nro","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"xBairro","type":"string","kind":"string","readonly":false},{"name":"xCpl","type":"string","kind":"string","readonly":false},{"name":"xLgr","type":"string","kind":"string","readonly":false},{"name":"xMun","type":"string","kind":"string","readonly":false},{"name":"xNome","type":"string","kind":"string","readonly":false},{"name":"xPais","type":"string","kind":"string","readonly":false}]},"TretTransp":{"name":"TretTransp","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CFOP","type":"string","kind":"string","readonly":false},{"name":"cMunFG","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"pICMSRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vICMSRet","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vServ","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TretTrib":{"name":"TretTrib","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"vBCIRRF","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vBCRetPrev","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vIRRF","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vRetCOFINS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vRetCSLL","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vRetPIS","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"vRetPrev","type":"Currency","kind":"decimal","scale":4,"readonly":false}]},"TSignature":{"name":"TSignature","unit":"ACBrXmlBase","kind":"object","properties":[{"name":"DigestValue","type":"string","kind":"string","readonly":false},{"name":"IdSignature","type":"string","kind":"string","readonly":false},{"name":"IdSignatureValue","type":"string","kind":"string","readonly":false},{"name":"SignatureValue","type":"string","kind":"string","readonly":false},{"name":"URI","type":"string","kind":"string","readonly":false},{"name":"X509Certificate","type":"string","kind":"string","readonly":false}]},"TTipoNFe":{"name":"TTipoNFe","unit":"ACBrDFe.Conversao","kind":"enum","values":["tnEntrada","tnSaida"]},"TTotal":{"name":"TTotal","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"IBSCBSTot","type":"TIBSCBSTot","kind":"object","ref":"TIBSCBSTot","readonly":false},{"name":"ICMSTot","type":"TICMSTot","kind":"object","ref":"TICMSTot","readonly":false},{"name":"ISSQNtot","type":"TISSQNtot","kind":"object","ref":"TISSQNtot","readonly":false},{"name":"ISTot","type":"TISTot","kind":"object","ref":"TISTot","readonly":false},{"name":"retTrib","type":"TretTrib","kind":"object","ref":"TretTrib","readonly":false},{"name":"vNFTot","type":"Double","kind":"decimal","readonly":false}]},"TtpALCZFMCBS":{"name":"TtpALCZFMCBS","unit":"ACBrDFe.Conversao","kind":"enum","values":["tpALCZFMCBSnOpInd","tpALCZFMCBSOpInd"]},"TtpAto":{"name":"TtpAto","unit":"pcnConversaoNFe","kind":"enum","values":["taNenhum","taTermoAcordo","taRegimeEspecial","taAutorizacaoEspecifica","taAjusteSNIEF","taConvenioICMS"]},"TTpCredPresIBSZFM":{"name":"TTpCredPresIBSZFM","unit":"ACBrDFe.Conversao","kind":"enum","values":["tcpNenhum","tcpSemCredito","tcpBensConsumoFinal","tcpBensCapital","tcpBensIntermediarios","tcpBensInformaticaOutros"]},"TtpEnteGov":{"name":"TtpEnteGov","unit":"ACBrDFe.Conversao","kind":"enum","values":["tcgNenhum","tcgUniao","tcgEstados","tcgDistritoFederal","tcgMunicipios","tcgConsorcioPublico","tcgComiteGestorIBS"]},"TtpGuia":{"name":"TtpGuia","unit":"pcnConversaoNFe","kind":"enum","values":["tpgNenhum","tpgGTA","tpgTTA","tpgDTA","tpgATV","tpgPTV","tpgGTV","tpgGuiaFlorestal"]},"TtpIntegra":{"name":"TtpIntegra","unit":"ACBrDFe.Conversao","kind":"enum","values":["tiNaoInformado","tiPagIntegrado","tiPagNaoIntegrado"]},"TtpNFCredito":{"name":"TtpNFCredito","unit":"pcnConversaoNFe","kind":"enum","values":["tcNenhum","tcMultaJuros","tcApropriacaoCreditoPresumido","tcRetorno","tcReducaoValores","tcTransferenciaCreditoSucessao","tcRetornoRecusaParcial"]},"TtpNFDebito":{"name":"TtpNFDebito","unit":"ACBrDFe.Conversao","kind":"enum","values":["tdNenhum","tdTransferenciaCreditoCooperativa","tdAnulacao","tdDebitosNaoProcessadas","tdMultaJuros","tdTransferenciaCreditoSucessao","tdPagamentoAntecipado","tdPerdaEmEstoque","tdDesenquadramentodoSN"]},"TtpOperGov":{"name":"TtpOperGov","unit":"ACBrDFe.Conversao","kind":"enum","values":["togNenhum","togFornecimento","togRecebimentoPag","togFornecimentoPagRealizado","togRecebimentoPagFornecPosterior"]},"TTransp":{"name":"TTransp","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"balsa","type":"string","kind":"string","readonly":false},{"name":"modFrete","type":"TpcnModalidadeFrete","kind":"enum","ref":"TpcnModalidadeFrete","readonly":false},{"name":"Reboque","type":"TReboqueCollection","kind":"list","ref":"TReboqueCollection","readonly":false},{"name":"retTransp","type":"TretTransp","kind":"object","ref":"TretTransp","readonly":false},{"name":"Transporta","type":"TTransporta","kind":"object","ref":"TTransporta","readonly":false},{"name":"vagao","type":"string","kind":"string","readonly":false},{"name":"veicTransp","type":"TveicTransp","kind":"object","ref":"TveicTransp","readonly":false},{"name":"Vol","type":"TVolCollection","kind":"list","ref":"TVolCollection","readonly":false}]},"TTransporta":{"name":"TTransporta","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"CNPJCPF","type":"string","kind":"string","readonly":false},{"name":"IE","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false},{"name":"xEnder","type":"string","kind":"string","readonly":false},{"name":"xMun","type":"string","kind":"string","readonly":false},{"name":"xNome","type":"string","kind":"string","readonly":false}]},"TveicProd":{"name":"TveicProd","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"anoFab","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"anoMod","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"cCor","type":"string","kind":"string","readonly":false},{"name":"cCorDENATRAN","type":"string","kind":"string","readonly":false},{"name":"chassi","type":"string","kind":"string","readonly":false},{"name":"Cilin","type":"string","kind":"string","readonly":false},{"name":"cMod","type":"string","kind":"string","readonly":false},{"name":"CMT","type":"string","kind":"string","readonly":false},{"name":"CombDescricao","type":"string","kind":"string","readonly":true},{"name":"condVeic","type":"TpcnCondicaoVeiculo","kind":"enum","ref":"TpcnCondicaoVeiculo","readonly":false},{"name":"dist","type":"string","kind":"string","readonly":false},{"name":"espVeic","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"lota","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"nMotor","type":"string","kind":"string","readonly":false},{"name":"nSerie","type":"string","kind":"string","readonly":false},{"name":"pesoB","type":"string","kind":"string","readonly":false},{"name":"pesoL","type":"string","kind":"string","readonly":false},{"name":"pot","type":"string","kind":"string","readonly":false},{"name":"tpComb","type":"string","kind":"string","readonly":false},{"name":"tpOP","type":"TpcnTipoOperacao","kind":"enum","ref":"TpcnTipoOperacao","readonly":false},{"name":"tpPint","type":"string","kind":"string","readonly":false},{"name":"tpRest","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"tpVeic","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false},{"name":"VIN","type":"string","kind":"string","readonly":false},{"name":"xCor","type":"string","kind":"string","readonly":false}]},"TveicTransp":{"name":"TveicTransp","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"placa","type":"string","kind":"string","readonly":false},{"name":"RNTC","type":"string","kind":"string","readonly":false},{"name":"UF","type":"string","kind":"string","readonly":false}]},"TVolCollection":{"name":"TVolCollection","unit":"ACBrNFe.Classes","kind":"list","item":"TVolCollectionItem","factory":"New"},"TVolCollectionItem":{"name":"TVolCollectionItem","unit":"ACBrNFe.Classes","kind":"object","properties":[{"name":"esp","type":"string","kind":"string","readonly":false},{"name":"Lacres","type":"TLacresCollection","kind":"list","ref":"TLacresCollection","readonly":false},{"name":"marca","type":"string","kind":"string","readonly":false},{"name":"nVol","type":"string","kind":"string","readonly":false},{"name":"pesoB","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"pesoL","type":"Currency","kind":"decimal","scale":4,"readonly":false},{"name":"qVol","type":"Integer","kind":"integer","min":-2147483648,"max":2147483647,"readonly":false}]}};

export function validateModel(model: string, value: unknown, at=model): void {
 const schema=MODEL_SCHEMA[model]; if(!schema)throw new TypeError('Modelo desconhecido: '+model);
 if(schema.kind==='enum'){ if(typeof value!=='string'||!schema.values.includes(value))throw new TypeError(at+': enum inválido'); return; }
 if(schema.kind==='list'){ if(!Array.isArray(value))throw new TypeError(at+': esperado array'); value.forEach((item,index)=>validateModel(schema.item,item,at+'['+index+']'));return; }
 if(value===null||typeof value!=='object'||Array.isArray(value))throw new TypeError(at+': esperado objeto');
 const fields=new Map<string,any>(schema.properties.filter((p:any)=>!p.readonly).map((p:any)=>[p.name,p]));
 for(const [name,v] of Object.entries(value)){
  if(v===undefined)continue;
  const p=fields.get(name);if(!p)throw new TypeError(at+'.'+name+': propriedade desconhecida ou somente leitura');
  if(v===undefined)continue;
  const field=at+'.'+name;
  if(p.ref){validateModel(p.ref,v,field);continue;}
  if(p.kind==='integer'){if(typeof v!=='number'||!Number.isSafeInteger(v)||v<p.min||v>p.max)throw new TypeError(field+': inteiro fora do intervalo');}
  else if(p.kind==='boolean'){if(typeof v!=='boolean')throw new TypeError(field+': esperado boolean');}
  else if(p.kind==='decimal'){if(typeof v!=='string'||v.length>64||! /^-?\d+(?:\.\d+)?$/.test(v)||p.scale!==undefined&&(v.split('.')[1]?.length??0)>p.scale)throw new TypeError(field+': esperado decimal em string'+(p.scale!==undefined?' de até '+p.scale+' casas':''));}
  else if(p.kind==='datetime'){
   if(typeof v!=='string'||! /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)?$/.test(v)||Number.isNaN(Date.parse(v+(v.length===10?'T00:00:00Z':'Z'))))throw new TypeError(field+': esperado data/hora civil ISO (sem timezone)');
   const date=new Date(v+(v.length===10?'T00:00:00Z':'Z'));if(date.toISOString().slice(0,10)!==v.slice(0,10))throw new TypeError(field+': data inválida');
  }else if(typeof v!=='string')throw new TypeError(field+': esperado string');
 }
}
export function validateTNFe(value: unknown): asserts value is TNFeInput { validateModel('TNFe',value); }

