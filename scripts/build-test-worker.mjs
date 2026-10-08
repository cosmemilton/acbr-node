import { loadConfig } from '../src/config.ts';
import { buildNative } from '../src/native-build.ts';
const config=await loadConfig(process.argv[2]??'acbr.config.json');
const result=await buildNative(config,{testOnly:true});
console.log(JSON.stringify({directory:config.projectRoot+'/.acbr/test-runtime/'+process.platform+'-'+process.arch,manifest:result},null,2));
