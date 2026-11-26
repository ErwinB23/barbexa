// Post-window reconciliation and safe logical cleanup of this run only.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ownedLab,root} from '../../k6/lib/lab-client.mjs';
import {sqlId as q} from '../../k6/lib/fixture-values.mjs';
import {protocol,summarizeIntervals} from './eq05-policy.mjs';
if(process.argv[2]!=='--execute=local-synthetic-lab')throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const m=JSON.parse(fs.readFileSync(JSON.parse(fs.readFileSync(path.join(root,'.artifacts/eq05/current.json'))).manifest));
assert.ok(m.windowFinishedAt,'WINDOW_NOT_FINISHED_DO_NOT_AUDIT_DURING_MEASUREMENT');
assert.ok(!fs.existsSync(path.join(m.dir,'monitor.lock')),'MONITOR_STILL_RUNNING');
const env=ownedLab({recordBaseline:false});assert.equal(env.sql('select run_id from private.k6_lab_marker;'),m.marker);
const readLines=name=>fs.existsSync(path.join(m.dir,name))?fs.readFileSync(path.join(m.dir,name),'utf8').trim().split('\n').filter(Boolean).map(JSON.parse):[];
const rows=readLines('intervals.jsonl'),ledger=readLines('write-ledger.jsonl');
const ids=new Set();for(const entry of ledger){q(entry.requestId);q(entry.cancelRequestId);assert.ok(!ids.has(entry.requestId));ids.add(entry.requestId);}
const beforeCleanup=JSON.parse(env.sql(`select coalesce(json_agg(json_build_object('id',r.id,'requestId',r.request_id,'client',r.client_user_id,'shop',r.barbershop_id,'startsAt',to_char(r.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'state',r.state) order by r.created_at),'[]') from public.reservations r where r.barbershop_id=${q(m.shop)};`));
for(const r of beforeCleanup){const plan=ledger.find(l=>l.requestId===r.requestId);assert.ok(plan,'Unknown reservation, refuse cleanup');assert.equal(r.client,m.accounts[2].id);assert.equal(r.shop,m.shop);assert.equal(r.startsAt,plan.startsAt);}
const cleanupLog=[];
if(beforeCleanup.some(r=>r.state==='confirmed')){
  const account=m.accounts[2];
  const auth=await env.request('/auth/v1/token?grant_type=password',{body:{email:account.email,password:account.password}});
  assert.equal(auth.status,200,'CLEANUP_AUTH_FAILED');assert.equal(auth.body.user.id,account.id);
  for(const r of beforeCleanup.filter(r=>r.state==='confirmed')){
    const entry=ledger.find(l=>l.requestId===r.requestId);
    const result=await env.request('/functions/v1/reservation-command',{token:auth.body.access_token,body:{action:'cancel',requestId:entry.cancelRequestId,reservationId:r.id,reason:'EQ05 reconciliación y limpieza exclusiva fuera de medición'}});
    cleanupLog.push({requestId:r.requestId,status:result.status,at:new Date().toISOString(),outsideMeasurement:true});
    assert.equal(result.status,200,'CLEANUP_FAILED_KEEP_LEDGER');assert.equal(result.body.state,'cancelled');
  }
}
const reservations=JSON.parse(env.sql(`select coalesce(json_agg(json_build_object('id',r.id,'requestId',r.request_id,'state',r.state,'itemCount',(select count(*) from public.reservation_items i where i.reservation_id=r.id),'confirmEvents',(select count(*) from public.reservation_events e where e.reservation_id=r.id and e.kind='confirmed'),'cancelEvents',(select count(*) from public.reservation_events e where e.reservation_id=r.id and e.kind='cancelled'),'careCount',(select count(*) from private.booking_care c where c.reservation_id=r.id)) order by r.created_at),'[]') from public.reservations r where r.barbershop_id=${q(m.shop)};`));
for(const r of reservations){assert.equal(r.state,'cancelled');assert.equal(r.itemCount,1);assert.equal(r.confirmEvents,1);assert.equal(r.cancelEvents,1);assert.equal(r.careCount,1);}
for(const row of rows.filter(r=>r.status==='available')){const bookings=reservations.filter(b=>b.requestId===row.requestId);assert.equal(bookings.length,1,'Available probe missing persisted booking');assert.ok(row.cleanupConfirmed);}
const tables=[];
for(const [table,before]of Object.entries(m.baseline)){
  const after=JSON.parse(env.sql(`select coalesce(json_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') from ${table} r;`));
  const counts=new Map();for(const hash of after)counts.set(hash,(counts.get(hash)||0)+1);
  for(const hash of before){assert.ok(counts.get(hash)>0,'Prior row modified/removed: '+table);counts.set(hash,counts.get(hash)-1);}
  tables.push({table,priorRows:before.length,priorRowsPreserved:true,newRows:after.length-before.length});
}
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const [p,h]of Object.entries(m.protectedFiles))assert.equal(hash(path.join(root,p)),h,p);
const earlier=JSON.parse(fs.readFileSync(path.join(root,'docs/evaluacion/evidencias/004-reservas/k6-mixta-final/preservacion-sha256.json')));
for(const [p,h]of Object.entries(earlier))assert.equal(hash(path.join(root,p)),h,p);
const integrity=JSON.parse(env.sql(fs.readFileSync(path.join(root,'k6/integrity.sql'),'utf8')));
for(const key of ['overlaps','tenantMismatch','duplicateRequests','partialReservations','duplicateReceipts'])assert.equal(integrity[key],0,key);
assert.equal(integrity.reservations,m.baseline['public.reservations'].length+reservations.length);
const summary=summarizeIntervals(rows);const privateReport={at:new Date().toISOString(),summary,cleanupLog,reservations,tables,integrity};
fs.writeFileSync(path.join(m.dir,'post-window-audit.json'),JSON.stringify(privateReport,null,2)+'\n');
const out=path.join(root,'docs/evaluacion/evidencias/eq05');
fs.writeFileSync(path.join(out,'integridad.json'),JSON.stringify({at:privateReport.at,priorReservations:m.baseline['public.reservations'].length,
  ownReservations:reservations.length,preflightReservations:ledger.filter(x=>x.index===-1).length,
  measuredRequestsPlanned:ledger.filter(x=>x.index>=0).length,measuredPersisted:reservations.filter(r=>ledger.find(x=>x.requestId===r.requestId)?.index>=0).length,
  activeOwnReservations:0,allOwnReservationsCancelled:true,oneItemConfirmationCancellationAndCareEach:true,
  cleanupMode:'Logical cancellation; preserve auditable synthetic histories, no physical deletion.',lateCleanupOperations:cleanupLog,
  priorTables:tables,protectedFiles:Object.keys(m.protectedFiles).length,historicalEvidenceFiles:Object.keys(earlier).length,
  hashesUnchanged:true,integrity,k6Executed:false,cloudModified:false,migrationsModified:false},null,2)+'\n');
console.log(JSON.stringify({auditPassed:true,summary,ownReservations:reservations.length,activeOwnReservations:0,priorDataPreserved:true,integrity},null,2));
