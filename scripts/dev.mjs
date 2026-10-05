// Minimal static development server; deploy and standalone builds are unchanged.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const args=process.argv.slice(2),value=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const port=Number(value('--port','4173')),host=value('--host','0.0.0.0');
const server=createServer(async(req,res)=>{
 try{if(!['/','/index.html'].includes(new URL(req.url,'http://preview').pathname)){res.writeHead(404);res.end('Not found');return}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await readFile(new URL('../index.html',import.meta.url)));
 }catch{res.writeHead(500);res.end('Run npm run build:site before preview.');}
});
server.listen(port,host,()=>console.log('SP-Affiliate preview on port '+port));
