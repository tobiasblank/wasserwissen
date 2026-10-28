const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const html=fs.readFileSync('index.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function app(initial){
 const nodes=new Map();const storage=new Map(initial===undefined?[]:[['wasserwissen-progress-v1',initial]]);
 const ctx=vm.createContext({console,TextEncoder,TextDecoder,Uint8Array,URL,Blob,Date,Math,JSON,Set,Number,confirm:()=>true,alert:()=>{},setTimeout:()=>1,clearTimeout:()=>{},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),navigator:{onLine:true},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null},window:{addEventListener(){}},document:{hidden:false,querySelector(s){if(!nodes.has(s))nodes.set(s,{value:s==='#mode'?'adaptive':'',dataset:{},style:{},addEventListener(){},scrollIntoView(){}});return nodes.get(s)},querySelectorAll:()=>[],addEventListener(){}}});
 vm.runInContext(code,ctx);return {ctx,run:s=>vm.runInContext(s,ctx),storage};
}
const row={n:1,right:1,wrong:0,streak:1,due:1,last:10,lastGrade:'good'};
test('579 Originaldatensätze bytegenau, eindeutige IDs, acht Themen',()=>{
 const raw=html.match(/const DATA=(.*?);const STORE=/)[1];const data=JSON.parse(raw);
 assert.equal(data.length,579);assert.equal(new Set(data.map(x=>x.id)).size,579);assert.equal(new Set(data.map(x=>x.topic)).size,8);
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),fs.readFileSync('tests/catalog.sha256','utf8').trim());
 assert.ok(data.every(x=>typeof x.q==='string'&&typeof x.a==='string'));
});
test('Leere Eingabe und fehlende Musterantwort können gerendert werden',()=>{
 const a=app();for(const expression of ["scoreAnswer('Frage','Antwort','')","scoreAnswer('Frage','','Antwort')"]){a.run('assessment='+expression);assert.doesNotThrow(()=>a.run('assessmentHtml()'));}
});
test('Exakte Antwort erhält hohe Abdeckung; Unicode-Backup roundtrip',()=>{
 const a=app();assert.ok(a.run("scoreAnswer('Was?','Grundwasser schützen und Menschen vor Hochwasser schützen.','Grundwasser schützen und Menschen vor Hochwasser schützen.').score")>=78);
 assert.equal(a.run("ghDecode(ghEncode('ÄÖÜ § Wasser 💧'))"),'ÄÖÜ § Wasser 💧');
});
test('Validierung verhindert negative, gebrochene und unbekannte Cloudwerte',()=>{
 const a=app();for(const p of [{...row,n:-1},{...row,n:1.5},{...row,wrong:1},{...row,last:-1}]){a.ctx.raw=JSON.stringify({app:'Wasserwissen',version:2,progress:{'1-2':p}});assert.throws(()=>a.run('validateBackup(raw)'));}
 a.ctx.raw=JSON.stringify({app:'Wasserwissen',version:2,progress:{unknown:row}});assert.throws(()=>a.run('validateBackup(raw,true)'));
});
test('Merge erhält beide Fragen, neuere Werte und deterministische Gleichstände',()=>{
 const a=app();a.ctx.a={'1-2':row};a.ctx.b={'1-2':{...row,n:2,right:2},'1-3':row};
 assert.equal(a.run('ghSame(ghMerge(a,b),ghMerge(b,a))'),true);
 assert.equal(a.run('Object.keys(ghMerge(a,b)).length'),2);
 a.ctx.b={'1-2':{...row,last:20}};assert.equal(a.run("ghMerge(a,b)['1-2'].last"),20);
});
test('Wiederholungsintervalle und lokale Sicherung',()=>{
 const a=app();a.run("active=DATA[0];grade('good')");assert.equal(a.run("progress['1-2'].n"),1);assert.ok(Math.abs(a.run("progress['1-2'].due-progress['1-2'].last")-86400000)<10);
 a.run("active=DATA[0];grade('bad')");assert.equal(a.run("progress['1-2'].streak"),0);assert.equal(a.run("progress['1-2'].due-progress['1-2'].last"),7200000);assert.ok(a.storage.has('wasserwissen-progress-v1'));
});
test('Öffentliches Repository blockiert vor jedem Contents-Zugriff',async()=>{
 const a=app();let calls=0;a.ctx.fetch=async()=>{calls++;return {ok:true,json:async()=>({private:false})}};a.run("ghToken='test-token'");await a.run('syncGitHub()');assert.equal(calls,1);
});
test('SHA-Konflikt liest erneut; lokaler Fortschritt während PUT bleibt erhalten',async()=>{
 const a=app();const calls=[];let puts=0;
 a.ctx.fetch=async(url,opts)=>{calls.push(opts.method||'GET');if(!url.includes('/contents/'))return {ok:true,json:async()=>({private:true})};if(opts.method==='GET')return {ok:true,status:200,json:async()=>({sha:'test-sha',content:Buffer.from(JSON.stringify({app:'Wasserwissen',version:2,progress:{}})).toString('base64')})};assert.equal(JSON.parse(opts.body).sha,'test-sha');puts++;if(puts===1)return {ok:false,status:409,json:async()=>({})};a.run("progress['1-3']={n:1,right:1,wrong:0,streak:1,due:1,last:30}");return {ok:true,status:200,json:async()=>({})}};
 a.ctx.sample=row;a.run("progress={'1-2':sample};ghToken='test-token'");await a.run('syncGitHub()');assert.equal(puts,2);assert.equal(a.run("progress['1-3'].last"),30);
});
test('Abmelden während GET verhindert PUT',async()=>{
 const a=app();let calls=0;a.ctx.fetch=async()=>{calls++;a.run("ghToken=''");return {ok:true,json:async()=>({private:true})}};a.run("ghToken='test-token'");await a.run('syncGitHub()');assert.equal(calls,1);
});

test('Beschädigter lokaler Speicher wird nicht überschrieben oder synchronisiert',async()=>{
 const original='{"broken":';const a=app(original);a.run("active=DATA[0];grade('good')");assert.equal(a.storage.get('wasserwissen-progress-v1'),original);assert.equal(a.run('storageBlocked'),true);a.ctx.fetch=()=>assert.fail('Netzwerkzugriff');a.run("ghToken='test-token'");await a.run('syncGitHub()');
});
