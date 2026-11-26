// Offline consolidation. Reads the real window; never starts or shortens observation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {protocol,summarizeIntervals,intervalAt} from '../../../../tests/availability/eq05-policy.mjs';
const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../..');
const m=JSON.parse(fs.readFileSync(JSON.parse(fs.readFileSync(path.join(root,'.artifacts/eq05/current.json'))).manifest));
assert.ok(m.windowFinishedAt,'WINDOW_NOT_FINISHED');
const readLines=name=>fs.existsSync(path.join(m.dir,name))?fs.readFileSync(path.join(m.dir,name),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
const input=readLines('intervals.jsonl'),resources=readLines('resources.jsonl').map((r,i)=>({...r,cpuObservedPercent:i===0?null:r.cpu})),events=readLines('events.jsonl');
const summary=summarizeIntervals(input),integrity=JSON.parse(fs.readFileSync(path.join(m.dir,'integridad-sanitizada.json')));
const recorded=JSON.parse(fs.readFileSync(path.join(m.dir,'window-summary.json')));
for(const key of Object.keys(summary))assert.deepEqual(summary[key],recorded[key],key);
assert.equal(input.length,360,'Incomplete ledger; account explicitly before consolidating');
const startMs=Date.parse(m.windowStartedAt);
const records=Array.from({length:360},(_,i)=>input.find(r=>r.index===i)||{index:i,status:'no-data'}).map(r=>{
  const p=intervalAt(r.index);
  return {...r,scheduledAt:new Date(startMs+p.startMs).toISOString(),intervalEnd:new Date(startMs+p.endMs).toISOString()};
});
const durations=records.map(r=>r.durationMs).filter(Number.isFinite).sort((a,b)=>a-b);
const percentile=(a,p)=>a.length?a[Math.min(a.length-1,Math.floor((a.length-1)*p))]:null;
const operations=[...new Set(records.flatMap(r=>(r.steps||[]).map(s=>s.step)))].map(step=>{
  const samples=records.flatMap(r=>r.steps||[]).filter(s=>s.step===step),values=samples.map(s=>s.ms).filter(Number.isFinite).sort((a,b)=>a-b);
  return {operation:step,samples:samples.length,failed:samples.filter(s=>s.error).length,meanMs:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,p50Ms:percentile(values,.5),p95Ms:percentile(values,.95),p99Ms:percentile(values,.99),maxMs:values.at(-1)??null};
});
const resourceStats=Object.fromEntries(['freeMiB','ramPercent','cpu'].map(key=>{
  const values=resources.map(r=>key==='cpu'?r.cpuObservedPercent:r[key]).filter(Number.isFinite);
  return [key,{samples:values.length,min:Math.min(...values),mean:values.reduce((a,b)=>a+b,0)/values.length,max:Math.max(...values)}];
}));
const pgSessions=resources.map(r=>r.connections.sessions);
resourceStats.pgSessions={samples:pgSessions.length,min:Math.min(...pgSessions),max:Math.max(...pgSessions),limit:Math.max(...resources.map(r=>r.connections.max))};
const period=p=>({...p,start:new Date(startMs+p.startIndex*protocol.intervalMs).toISOString(),end:new Date(startMs+(p.endIndex+1)*protocol.intervalMs).toISOString()});
const safe={generatedAt:new Date().toISOString(),runId:m.id,adaptation:'One-hour local evaluation; teacher acceptance required. Original monthly scenario preserved.',
  start:m.windowStartedAt,end:m.windowFinishedAt,actualElapsedMs:m.windowElapsedMs,scheduledEnd:new Date(startMs+protocol.durationMs).toISOString(),stopReason:m.windowStopReason,
  protocol,summary,interruptions:summary.interruptions.map(period),missingPeriods:summary.missingPeriods.map(period),
  recoveries:events.filter(e=>e.event==='recovery_observed'),maintenanceDeclarations:[],maintenanceNote:'No maintenance declared by the operator. No deliberate outage injected; this does not prove absence of unobserved maintenance.',
  meanFlowMs:durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:null,p50FlowMs:percentile(durations,.5),p95FlowMs:percentile(durations,.95),p99FlowMs:percentile(durations,.99),maxFlowMs:durations.at(-1)??null,
  operations,integrity,records,resources,resourceStats,httpRequests:operations.reduce((n,o)=>n+o.samples,0),
  limitations:['10-second sampling estimates intervals; not continuous observation.','Single-host local service, no published environment or external observer.','One hour does not establish monthly >=99.5%; adaptation requires teacher acceptance.','Logical cancellation preserves synthetic history; no data of prior tests removed.'],
  originalEq05Status:'No acreditado mensualmente; evaluación local preliminar',k6Executed:false,cloudModified:false};
fs.writeFileSync(path.join(out,'resultados.json'),JSON.stringify(safe,null,2)+'\n');
const cell=v=>v===undefined||v===null?'':/[",\n]/.test(String(v))?'"'+String(v).replaceAll('"','""')+'"':String(v);
const csv=(name,rows,emptyKeys=[])=>{const keys=rows.length?Object.keys(rows[0]):emptyKeys;assert.ok(keys.length,'CSV_SCHEMA_REQUIRED');fs.writeFileSync(path.join(out,name),[keys.join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\n')+'\n');};
csv('sondeos.csv',records.map(r=>({index:r.index,scheduled_at:r.scheduledAt,interval_end:r.intervalEnd,actual_start:r.at,status:r.status,flow_ms:r.durationMs??null,late_ms:r.lateMs??null,failed_step:r.failure?.step??null,failure:r.failure?.code??null,created:r.created??null,cleanup_confirmed:r.cleanupConfirmed??null})));
csv('operaciones.csv',operations);
csv('peticiones.csv',records.flatMap(r=>(r.steps||[]).map(s=>({index:r.index,...s}))));
csv('recursos.csv',resources.map(r=>({at:r.at,free_mib:r.freeMiB,ram_percent:r.ramPercent,cpu_percent:r.cpuObservedPercent,raw_cpu_percent:r.cpu,pg_sessions:r.connections.sessions,pg_max:r.connections.max})));
csv('interrupciones.csv',safe.interruptions.map(p=>({kind:'unavailable',...p})).concat(safe.missingPeriods.map(p=>({kind:'no-data',...p}))),['kind','startIndex','endIndex','estimatedMs','start','end']);
const partialId='0bcde763-0e44-41dd-ba75-798c943d0dd3';
const partial=JSON.parse(fs.readFileSync(path.join(root,'.artifacts/eq05',partialId,'window-summary.json')));
fs.writeFileSync(path.join(out,'parcial-anterior.json'),JSON.stringify({runId:partialId,...partial,countsExcludedFromApprovedHour:true},null,2)+'\n');
const windows=[{runId:m.id,classification:'complete-local-hour',start:safe.start,end:safe.end,elapsedMs:safe.actualElapsedMs,available:summary.available,unavailable:summary.unavailable,noData:summary.noData,availabilityPercent:summary.availabilityPercent,coveragePercent:summary.coveragePercent},
 {runId:partialId,classification:'interrupted-partial-excluded',start:partial.start,end:partial.finish,elapsedMs:partial.elapsedMs,available:partial.available,unavailable:partial.unavailable,noData:partial.noData,availabilityPercent:partial.availabilityPercent,coveragePercent:partial.coveragePercent}];
csv('ventanas.csv',windows);
fs.writeFileSync(path.join(out,'resumen.json'),JSON.stringify({runId:m.id,start:safe.start,end:safe.end,elapsedMs:safe.actualElapsedMs,summary,httpRequests:safe.httpRequests,flow:{meanMs:safe.meanFlowMs,p50Ms:safe.p50FlowMs,p95Ms:safe.p95FlowMs,p99Ms:safe.p99FlowMs,maxMs:safe.maxFlowMs},operations,resourceStats,integrity:{own:integrity.ownReservations,active:integrity.activeOwnReservations,prior:integrity.priorReservations,total:integrity.integrity.reservations},monthlyAccredited:false,partialExcluded:partialId},null,2)+'\n');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
fs.writeFileSync(path.join(out,'fuentes-sha256.json'),JSON.stringify(Object.fromEntries(['intervals.jsonl','resources.jsonl','events.jsonl','write-ledger.jsonl','window-summary.json','preflight.json','post-window-audit.json'].map(n=>[n,sha(path.join(m.dir,n))])),null,2)+'\n');
console.log(JSON.stringify({consolidated:true,start:safe.start,end:safe.end,summary,meanFlowMs:safe.meanFlowMs,p95FlowMs:safe.p95FlowMs,ownReservations:integrity.ownReservations},null,2));
