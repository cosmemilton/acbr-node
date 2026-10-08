import { readFile } from 'node:fs/promises';
const p=JSON.parse(await readFile('.acbr/package-preview.json','utf8'))[0];
console.log(p.filename, p.size, p.files.length);
console.log(p.files.map(f=>f.path).join('\n'));
