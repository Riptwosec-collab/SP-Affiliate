import {readFile, writeFile} from 'node:fs/promises';
const files=['core','dashboard','products','stories','planner','results','lab','settings','transfer','demo','workspace','product-workflow','studio-tools','controller'];
const css=await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
const js=(await Promise.all(files.map(n=>readFile(new URL('../src/'+n+'.js',import.meta.url),'utf8')))).join('\n');
const shell=await readFile(new URL('../src/shell.html',import.meta.url),'utf8');
const out=shell.replace('/*__STYLES__*/',()=>css).replace('/*__SCRIPTS__*/',()=>js);
await writeFile(new URL('../index.html',import.meta.url),out);
console.log('Built index.html ('+Buffer.byteLength(out)+' bytes)');
