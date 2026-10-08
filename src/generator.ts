import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const execute = promisify(execFile);
interface RawProperty { name:string; type:string; indexed:boolean; readable:boolean; writable:boolean; default:string; line:number }
interface RawType { name:string; kind:string; ancestor?:string; properties?:RawProperty[]; methods?:{name:string;result:string;arguments:number}[]; target?:string; values?:{name:string;assigned:string}[]; min?:string; max?:string; declarationKind?:string; line:number }
interface RawUnit { name:string; file:string; uses:string[]; types:RawType[] }
export interface RawModel { schemaVersion:number; root:string; units:RawUnit[] }
export interface ModelProperty { name:string; type:string; kind:'string'|'integer'|'decimal'|'datetime'|'boolean'|'enum'|'object'|'list'; ref?:string; readonly:boolean; declaredDefault?:string; min?:number; max?:number; scale?:number }
export interface ModelType { name:string; unit:string; kind:'object'|'list'|'enum'; properties?:ModelProperty[]; item?:string; values?:string[]; factory?:string }
export interface ModelIR { schemaVersion:1; root:string; types:ModelType[] }
export interface GenerateOptions { acbrRoot:string; outputDir:string; revision:string|number; sourceHash?:string; modelOutputDir?:string; nativeOutputDir?:string; extractorPath?:string; fpcPath?:string }
const bases = new Set(['tobject','tpersistent','tacbrobjectlist']);
const primitives:Record<string,{kind:ModelProperty['kind'];min?:number;max?:number;scale?:number}>={
 string:{kind:'string'},ansistring:{kind:'string'},unicodestring:{kind:'string'},widestring:{kind:'string'},
 boolean:{kind:'boolean'},byte:{kind:'integer',min:0,max:255},word:{kind:'integer',min:0,max:65535},
 integer:{kind:'integer',min:-2147483648,max:2147483647},longint:{kind:'integer',min:-2147483648,max:2147483647},
 smallint:{kind:'integer',min:-32768,max:32767},shortint:{kind:'integer',min:-128,max:127},
 cardinal:{kind:'integer',min:0,max:4294967295},longword:{kind:'integer',min:0,max:4294967295},
 int64:{kind:'integer',min:Number.MIN_SAFE_INTEGER,max:Number.MAX_SAFE_INTEGER},qword:{kind:'integer',min:0,max:Number.MAX_SAFE_INTEGER},
 double:{kind:'decimal'},extended:{kind:'decimal'},single:{kind:'decimal'},currency:{kind:'decimal',scale:4},
 tdatetime:{kind:'datetime'},tdate:{kind:'datetime'},ttime:{kind:'datetime'}
};
const stable = (value:unknown):string => JSON.stringify(value);
const hash = (value:string|Buffer):string => createHash('sha256').update(value).digest('hex');
export function buildModelIR(raw:RawModel):ModelIR {
 const declarations=new Map<string,{unit:RawUnit;type:RawType}>();
 for(const unit of raw.units)for(const type of unit.types)declarations.set((unit.name+'.'+type.name).toLowerCase(),{unit,type});
 function find(name:string,unit:RawUnit):{unit:RawUnit;type:RawType}{
  for(const key of [unit.name+'.'+name,...[...unit.uses].reverse().map(u=>u+'.'+name),name]){const item=declarations.get(key.toLowerCase());if(item)return item;}
  throw new Error('Tipo Pascal não resolvido: '+unit.name+'.'+name);
 }
 function resolve(name:string,unit:RawUnit,trail=new Set<string>()):{unit:RawUnit;type:RawType}|{primitive:string}{
  if(primitives[name.toLowerCase()])return {primitive:name.toLowerCase()};
  const found=find(name,unit),key=(found.unit.name+'.'+found.type.name).toLowerCase();
  if(trail.has(key))throw new Error('Alias Pascal cíclico: '+key);
  if(found.type.kind==='alias'){trail.add(key);return resolve(found.type.target!,found.unit,trail);}
  return found;
 }
 const rootUnit=raw.units.find(u=>u.types.some(t=>t.name===raw.root));
 if(!rootUnit)throw new Error('Modelo raiz ausente: '+raw.root);
 const generated=new Map<string,ModelType>();
 function visit(name:string,unit:RawUnit):{kind:ModelProperty['kind'];ref?:string;min?:number;max?:number;scale?:number}{
  const found=resolve(name,unit);if('primitive'in found)return primitives[found.primitive];
  const {type,unit:declUnit}=found,key=type.name;
  if(generated.has(key)){const node=generated.get(key)!;if(node.unit!==declUnit.name)throw new Error('Tipos homônimos incompatíveis: '+key);return {kind:node.kind==='object'?'object':node.kind==='list'?'list':'enum',ref:key};}
  if(type.kind==='enum'){
   const values=type.values!.map(v=>v.name);if(!values.length)throw new Error('Enum sem valores: '+key);
   generated.set(key,{name:key,unit:declUnit.name,kind:'enum',values});return {kind:'enum',ref:key};
  }
  if(type.kind!=='class')throw new Error('Declaração Pascal não suportada: '+declUnit.name+'.'+key+' ('+(type.declarationKind??type.kind)+')');
  const creator=type.methods?.find(m=>m.name.toLowerCase()==='new'&&m.arguments===0);
  const indexed=type.properties?.find(p=>p.indexed&&p.name.toLowerCase()==='items');
  if(creator||indexed){
   if(!creator||!indexed||!indexed.readable)throw new Error('Coleção sem contrato New/Items tipado: '+key);
   const item=resolve(creator.result,declUnit),itemProperty=resolve(indexed.type,declUnit);
   if('primitive'in item||'primitive'in itemProperty||item.type.name!==itemProperty.type.name)throw new Error('Coleção com tipos New/Items divergentes: '+key);
   generated.set(key,{name:key,unit:declUnit.name,kind:'list',item:item.type.name,factory:creator.name});
   if(visit(creator.result,declUnit).kind!=='object')throw new Error('Item de coleção não é objeto: '+key);
   return {kind:'list',ref:key};
  }
  const node:ModelType={name:key,unit:declUnit.name,kind:'object',properties:[]};generated.set(key,node);
  let inherited:ModelProperty[]=[];
  if(type.ancestor&&!bases.has(type.ancestor.toLowerCase())){
   const ancestor=visit(type.ancestor,declUnit);if(ancestor.kind!=='object')throw new Error('Herança não suportada: '+key);
   inherited=generated.get(ancestor.ref!)!.properties!;
  }
  const props=new Map(inherited.map(p=>[p.name.toLowerCase(),p]));
  for(const p of type.properties??[]){
   if(p.indexed)throw new Error('Propriedade indexada fora de coleção: '+key+'.'+p.name);
   if(!p.readable)throw new Error('Propriedade sem leitura: '+key+'.'+p.name);
   const resolved=visit(p.type,declUnit);
   const readonly=(!p.writable&&!['object','list'].includes(resolved.kind))||(key===raw.root&&['signature','procnfe','infnfesupl'].includes(p.name.toLowerCase()));
   props.set(p.name.toLowerCase(),{name:p.name,type:p.type,...resolved,readonly,...(p.default?{declaredDefault:p.default}:{})});
  }
  node.properties=[...props.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'));return {kind:'object',ref:key};
 }
 visit(raw.root,rootUnit);return {schemaVersion:1,root:raw.root,types:[...generated.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'))};
}
export function compareContracts(previous:ModelIR|undefined,current:ModelIR){
 const old=new Map(previous?.types.map(t=>[t.name,t])??[]),now=new Map(current.types.map(t=>[t.name,t]));
 const additions:string[]=[],removals:string[]=[],changes:string[]=[];
 for(const [name,type]of now){
  const before=old.get(name);if(!before){additions.push(name);continue;}
  if(type.kind!==before.kind){changes.push(name+':kind');continue;}
  if(type.kind==='object'){
   const a=new Map(before.properties!.map(p=>[p.name,p])),b=new Map(type.properties!.map(p=>[p.name,p]));
   for(const [field,p]of b){if(!a.has(field))additions.push(name+'.'+field);else if(stable(a.get(field))!==stable(p))changes.push(name+'.'+field);}
   for(const field of a.keys())if(!b.has(field))removals.push(name+'.'+field);
  }else if(type.kind==='enum'){
   for(const v of type.values!)if(!before.values!.includes(v))additions.push(name+'.'+v);
   for(const v of before.values!)if(!type.values!.includes(v))removals.push(name+'.'+v);
  }else if(type.item!==before.item)changes.push(name+':item');
 }
 for(const name of old.keys())if(!now.has(name))removals.push(name);
 return {additions:additions.sort(),removals:removals.sort(),changes:changes.sort(),breaking:removals.length>0||changes.length>0};
}
const tsType=(p:ModelProperty):string=>p.kind==='object'?p.ref+'Input':p.kind==='list'?p.ref+'Input':p.kind==='enum'?p.ref!:p.kind==='integer'?'number':p.kind==='boolean'?'boolean':'string';
export function renderTypeScript(ir:ModelIR,revision:number,contractHash:string):string {
 const out=['// Generated from ACBr AST. LGPL-2.1-or-later. Do not edit.','export const ACBR_CONTRACT = '+stable({sourceRevision:revision,contractHash})+' as const;','export const SOURCE_REVISION=ACBR_CONTRACT.sourceRevision;','export const CONTRACT_HASH=ACBR_CONTRACT.contractHash;'];
 for(const t of ir.types){
  if(t.kind==='enum'){
   out.push('export const '+t.name+' = Object.freeze('+stable(Object.fromEntries(t.values!.map(v=>[v,v])))+' as const);','export type '+t.name+' = typeof '+t.name+'[keyof typeof '+t.name+'];');
  }else if(t.kind==='list'){
   out.push('export type '+t.name+'Input = '+t.item+'Input[];','export class '+t.name+' extends Array<'+t.item+'> {','  New(input: '+t.item+'Input = {}): '+t.item+' { const item=new '+t.item+'(input); this.push(item); return item; }','}');
  }else {
   out.push('export interface '+t.name+'Input {');
   for(const p of t.properties!.filter(p=>!p.readonly))out.push('  '+JSON.stringify(p.name)+'?: '+tsType(p)+';');
   out.push('}','export class '+t.name+' {');
   for(const p of t.properties!){
    if(p.readonly){out.push('  readonly '+JSON.stringify(p.name)+'?: '+tsType(p)+';');continue;}
    if(p.declaredDefault)out.push('  /** Pascal streaming default: '+p.declaredDefault.replaceAll('*/','')+'. Omission preserves the native constructor. */');
    if(p.kind==='object'||p.kind==='list')out.push('  '+JSON.stringify(p.name)+' = new '+p.ref+'();');
    else out.push('  '+JSON.stringify(p.name)+'?: '+tsType(p)+';');
   }
   out.push('  constructor(input: '+t.name+'Input = {}) {','    validateModel('+JSON.stringify(t.name)+', input);');
   for(const p of t.properties!.filter(p=>!p.readonly)){
    const access='input['+JSON.stringify(p.name)+']',target='this['+JSON.stringify(p.name)+']';
    out.push('    if ('+access+' !== undefined) '+target+' = '+(p.kind==='object'?'new '+p.ref+'('+access+')':p.kind==='list'?'Object.assign(new '+p.ref+'(), '+access+'.map(v=>new '+ir.types.find(t=>t.name===p.ref)!.item+'(v)))':access)+';');
   }
   out.push('  }','}');
  }
 }
 out.push('const MODEL_SCHEMA: Record<string, any> = '+stable(Object.fromEntries(ir.types.map(t=>[t.name,t])))+';');
 out.push(String.raw`
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
`);
 return out.join('\n')+'\n';
}

export function renderPascal(ir:ModelIR,revision:number,contractHash:string):string {
 const classes=ir.types.filter(t=>t.kind==='object'),byName=new Map(ir.types.map(t=>[t.name,t]));
 const units=[...new Set(ir.types.map(t=>t.unit))].sort();
 const out=['{ Generated from ACBr AST. LGPL-2.1-or-later. Do not edit. }','unit AcbrModels;','{$mode delphi}{$H+}','interface','uses SysUtils, Classes, fpjson, DateUtils, Math, '+units.join(', ')+';','const SourceRevision = '+revision+';',"      ContractHash = '"+contractHash+"';",'procedure preencherTNFe(documento:TJSONObject; destino:TNFe);','implementation'];
 out.push(String.raw`
procedure Bad(const P,M:string); begin raise Exception.Create(P+': '+M) end;
function Obj(D:TJSONData;const P:string):TJSONObject;
begin if (D=nil) or (D.JSONType<>jtObject) then Bad(P,'esperado objeto');Result:=TJSONObject(D) end;
function Arr(D:TJSONData;const P:string):TJSONArray;
begin if (D=nil) or (D.JSONType<>jtArray) then Bad(P,'esperado array');Result:=TJSONArray(D) end;
function Text(D:TJSONData;const P:string):string;
begin if (D=nil) or (D.JSONType<>jtString) then Bad(P,'esperado string');Result:=D.AsString end;
function IntValue(D:TJSONData;const P:string;MinV,MaxV:Int64):Int64;
var V:Extended;
begin
 if (D=nil) or (D.JSONType<>jtNumber) then Bad(P,'esperado inteiro');
 V:=D.AsFloat;if IsNan(V) or IsInfinite(V) or (Frac(V)<>0) or (V<MinV) or (V>MaxV) then Bad(P,'inteiro fora do intervalo');
 Result:=D.AsInt64;
end;
function BoolValue(D:TJSONData;const P:string):boolean;
begin if (D=nil) or (D.JSONType<>jtBoolean) then Bad(P,'esperado boolean');Result:=D.AsBoolean end;
function DecimalText(D:TJSONData;const P:string;Scale:integer):string;
var I,PointPos:integer;
begin
 Result:=Text(D,P);PointPos:=0;
 if (Result='') or (Length(Result)>64) then Bad(P,'decimal inválido');
 for I:=1 to Length(Result) do begin
  if Result[I]='.' then begin if (PointPos>0) or (I=1) or ((I=2) and (Result[1]='-')) or (I=Length(Result)) then Bad(P,'decimal inválido');PointPos:=I end
  else if (Result[I]='-') and (I=1) then begin if Length(Result)=1 then Bad(P,'decimal inválido') end
  else if not (Result[I] in ['0'..'9']) then Bad(P,'decimal inválido');
 end;
 if (PointPos>0) and (Scale>=0) and (Length(Result)-PointPos>Scale) then Bad(P,'casas decimais excedidas');
end;
function FloatValue(D:TJSONData;const P:string):Extended;
var F:TFormatSettings;S:string;
begin F:=DefaultFormatSettings;F.DecimalSeparator:='.';F.ThousandSeparator:=#0;S:=DecimalText(D,P,-1);
 if not TryStrToFloat(S,Result,F) or IsNan(Result) or IsInfinite(Result) then Bad(P,'decimal fora do intervalo');
end;
function CurrencyValue(D:TJSONData;const P:string):Currency;
var F:TFormatSettings;S:string;
begin F:=DefaultFormatSettings;F.DecimalSeparator:='.';F.ThousandSeparator:=#0;S:=DecimalText(D,P,4);
 if not TryStrToCurr(S,Result,F) then Bad(P,'currency fora do intervalo');
end;
function DateValue(D:TJSONData;const P:string):TDateTime;
var S:string;I:integer;
begin
 S:=Text(D,P);
 if not (Length(S) in [10,19,21,22,23]) then Bad(P,'esperado data/hora civil ISO sem timezone');
 for I:=1 to Length(S) do if not ((S[I] in ['0'..'9']) or ((I in [5,8]) and (S[I]='-')) or ((I=11) and (S[I]='T')) or ((I in [14,17]) and (S[I]=':')) or ((I=20) and (S[I]='.'))) then Bad(P,'data ISO inválida');
 if not TryISO8601ToDate(S,Result,true) then Bad(P,'data ISO inválida');
end;
`);
 const q=(s:string)=>"'"+s.replaceAll("'","''")+"'";
 for(const t of classes)out.push('procedure Load_'+t.name+'(D:TJSONObject;destino:'+t.unit+'.'+t.name+';const P:string); forward;');
 for(const t of classes){
  out.push('procedure Load_'+t.name+'(D:TJSONObject;destino:'+t.unit+'.'+t.name+';const P:string);','var I,J:integer;V:TJSONData;A:TJSONArray;K,At:string;','begin'," if destino=nil then Bad(P,'objeto ACBr não inicializado');",' for I:=0 to D.Count-1 do begin','  K:=D.Names[I];V:=D.Items[I];At:=P+\'.\'+K;');
  let index=0;
  for(const p of t.properties!.filter(p=>!p.readonly)){
   out.push('  '+(index++?'else ':'')+'if K='+q(p.name)+' then begin');const target='destino.'+p.name;
   if(p.kind==='object')out.push('   Load_'+p.ref+'(Obj(V,At),'+target+',At);');
   else if(p.kind==='list'){
    const list=byName.get(p.ref!)!;
    out.push('   A:=Arr(V,At);if '+target+'=nil then Bad(At,\'coleção não inicializada\');'+target+'.Clear;','   for J:=0 to A.Count-1 do Load_'+list.item+'(Obj(A.Items[J],At+\'[\'+IntToStr(J)+\']\'),'+target+'.'+list.factory+',At+\'[\'+IntToStr(J)+\']\');');
   }else if(p.kind==='enum'){
    const enumeration=byName.get(p.ref!)!;
    out.push(...enumeration.values!.map((v,i)=>'   '+(i?'else ':'')+'if Text(V,At)='+q(v)+' then '+target+':='+enumeration.unit+'.'+v),"   else Bad(At,'enum inválido');");
   }else out.push('   '+target+':='+({string:'Text(V,At)',integer:'IntValue(V,At,'+p.min+','+p.max+')',boolean:'BoolValue(V,At)',datetime:'DateValue(V,At)',decimal:p.scale===4?'CurrencyValue(V,At)':'FloatValue(V,At)'}[p.kind])+';');
   out.push('  end');
  }
  out.push((index?"  else ":"  ")+"Bad(At,'propriedade desconhecida ou somente leitura');",' end;','end;');
 }
 out.push('procedure preencherTNFe(documento:TJSONObject;destino:TNFe);',"begin if documento=nil then Bad('TNFe','esperado objeto');Load_TNFe(documento,destino,'TNFe') end;",'end.');
 return out.join('\n')+'\n';
}
export function renderClientIndex():string{
 return [
  '// Generated client bound to its own ACBr contract. Do not edit.',
  'import { criarEmissor as criarRuntime, type OpcoesEmissor, type OpcoesOperacao } from '+JSON.stringify('@cosmemilton/acbr-node/runtime')+';',
  'import { ACBR_CONTRACT, validateTNFe, type TNFeInput } from '+JSON.stringify('./models.js')+';',
  'export * from '+JSON.stringify('./models.js')+';',
  'export function criarEmissor(options: Omit<OpcoesEmissor, '+JSON.stringify('contrato')+' | '+JSON.stringify('validaDocumento')+'>) {',
  ' const emissor=criarRuntime({...options, contrato:ACBR_CONTRACT, validaDocumento:validateTNFe});',
  ' return {...emissor, gerarXml(documento:TNFeInput, opcoes?:OpcoesOperacao) { return emissor.gerarXml(documento as unknown as Record<string,unknown>, opcoes); }};',
  '}'
 ].join('\n')+'\n';
}
async function fingerprint(dir:string):Promise<string>{
 const files:string[]=[];
 async function walk(d:string){for(const entry of await readdir(d,{withFileTypes:true})){const f=path.join(d,entry.name);if(entry.isDirectory())await walk(f);else if(/\.(pas|pp|inc|xsd)$/i.test(entry.name))files.push(f);}}
 await walk(dir);const digest=createHash('sha256');
 for(const f of files.sort()){digest.update(path.relative(dir,f).replaceAll('\\','/'));digest.update(await readFile(f));}return digest.digest('hex');
}
export async function generateModel(options:GenerateOptions){
 const root=path.resolve(options.outputDir),cache=path.join(root,'.acbr/generated'),bin=path.join(root,'.acbr/bin');
 const models=path.resolve(root,options.modelOutputDir??'generated/acbr'),native=path.resolve(root,options.nativeOutputDir??'native/generated');
 await Promise.all([mkdir(cache,{recursive:true}),mkdir(bin,{recursive:true}),mkdir(models,{recursive:true}),mkdir(native,{recursive:true})]);
 const extractor=options.extractorPath??fileURLToPath(new URL('../tools/extract-model.lpr',import.meta.url));
 const executable=path.join(bin,'extract-model'+(process.platform==='win32'?'.exe':''));
 try{
  await execute(options.fpcPath??'fpc',['-Mobjfpc','-Sh','-FU'+bin,'-FE'+bin,extractor],{cwd:root,maxBuffer:8*1024*1024});
  await execute(executable,[path.resolve(options.acbrRoot),path.join(cache,'raw-model.json'),process.platform==='win32'?'win64':'linux'],{cwd:root,maxBuffer:8*1024*1024});
 }catch(error){const e=error as Error&{stdout?:string;stderr?:string};throw new Error('Extração FCL-passrc falhou: '+(e.stderr??'')+(e.stdout??'')+e.message);}
 const raw=JSON.parse(await readFile(path.join(cache,'raw-model.json'),'utf8')) as RawModel;
 const ir=buildModelIR(raw),sourceRevision=Number(options.revision);
 if(!Number.isSafeInteger(sourceRevision)||sourceRevision<1)throw new Error('Revisão SVN inválida');
 const sourceHash=options.sourceHash??await fingerprint(options.acbrRoot),contractHash=hash(stable({sourceRevision,sourceHash,ir}));
 let previous:ModelIR|undefined;try{previous=JSON.parse(await readFile(path.join(cache,'model.ir.json'),'utf8'));}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
 const report=compareContracts(previous,ir),reportPath=path.join(cache,'changes.json'),manifestPath=path.join(cache,'manifest.json');
 const files=[path.relative(root,path.join(models,'models.ts')),path.relative(root,path.join(models,'index.ts')),path.relative(root,path.join(native,'AcbrModels.pas'))].map(f=>f.replaceAll('\\','/'));
 const content=[renderTypeScript(ir,sourceRevision,contractHash),renderClientIndex(),renderPascal(ir,sourceRevision,contractHash)];
 const fileHashes=Object.fromEntries(files.map((file,index)=>[file,hash(content[index])]));
 await Promise.all([
  ...files.map((file,index)=>writeFile(path.resolve(root,file),content[index],'utf8')),
  writeFile(path.join(cache,'model.ir.json'),JSON.stringify(ir,null,2)+'\n','utf8'),
  writeFile(reportPath,JSON.stringify(report,null,2)+'\n','utf8'),
  writeFile(manifestPath,JSON.stringify({schemaVersion:1,sourceRevision,sourceHash,contractHash,root:ir.root,models:ir.types.length,files,fileHashes},null,2)+'\n','utf8')
 ]);return {contractHash,sourceHash,models:ir.types.length,reportPath,manifestPath};
}
