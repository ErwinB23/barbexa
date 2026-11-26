// New dedicated synthetic fixture; no modification of previous test data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {ownedLab,root,lab} from '../../k6/lib/lab-client.mjs';
import {sqlId as q,syntheticPassword} from '../../k6/lib/fixture-values.mjs';
import {protocol} from './eq05-policy.mjs';
if(process.argv[2]!=='--execute=local-synthetic-lab')throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const env=ownedLab({recordBaseline:false}),marker=JSON.parse(fs.readFileSync(path.join(lab,'fixture-manifest.json'))).runId;
assert.equal(env.sql('select run_id from private.k6_lab_marker;'),marker);
const dir=path.join(root,'.artifacts/eq05');fs.mkdirSync(dir,{recursive:true});
const pointer=path.join(dir,'current.json');let m;
if(fs.existsSync(pointer))m=JSON.parse(fs.readFileSync(JSON.parse(fs.readFileSync(pointer)).manifest));
else{const id=randomUUID(),runDir=path.join(dir,id);fs.mkdirSync(runDir);m={id,dir:runDir,marker,accounts:[],protocol};fs.writeFileSync(pointer,JSON.stringify({manifest:path.join(runDir,'manifest.json')},null,2));}
assert.equal(m.marker,marker);assert.ok(!m.windowStartedAt,'WINDOW_ALREADY_STARTED');
const save=()=>fs.writeFileSync(path.join(m.dir,'manifest.json'),JSON.stringify(m,null,2)+'\n');save();
const tables=['public.profiles','public.barbershops','public.barbershop_memberships','public.barbershop_booking_settings','public.services','public.barber_profiles','public.barber_services','public.barbershop_hours','public.barber_schedules','public.reservations','public.reservation_items','public.reservation_events','public.staff_invitations','private.booking_care','private.care_events','private.care_settings','private.barbershop_ownership','private.admin_invitation_mail'];
if(!m.baseline){
  m.baseline=Object.fromEntries(tables.map(t=>[t,JSON.parse(env.sql(`select coalesce(json_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') from ${t} r;`))]));
  const inventory=JSON.parse(fs.readFileSync(path.join(root,'docs/evaluacion/evidencias/eq08/preservacion-sha256.json'))).sha256;
  for(const [p,h]of Object.entries(inventory))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex'),h);
  m.protectedFiles=inventory;save();
}
const check=(r,status,label)=>{assert.equal(r.status,status,label);return r.body;};
for(let i=0;i<3;i++){
  let a=m.accounts[i];if(!a){a={role:['owner','professional','client'][i],email:`eq05-${m.id}-${i}@example.invalid`,password:syntheticPassword()};m.accounts.push(a);save();}
  if(!a.id){a.id=check(await env.request('/auth/v1/admin/users',{admin:true,body:{email:a.email,password:a.password,email_confirm:true}}),200,'create-synthetic-account').id;save();}
  if(!a.session||a.session.expires_at<Date.now()/1000+600){a.session=check(await env.request('/auth/v1/token?grant_type=password',{body:{email:a.email,password:a.password}}),200,'real-auth');assert.equal(a.session.user.id,a.id);save();}
  if(!a.profile){check(await env.request('/functions/v1/ensure-profile',{token:a.session.access_token,body:{displayName:`EQ05 ${a.role}`,phone:null}}),200,'profile');a.profile=true;save();}
}
const owner=m.accounts[0],professional=m.accounts[1];
if(!m.shop){m.shop=check(await env.request('/functions/v1/create-barbershop',{token:owner.session.access_token,body:{name:'EQ05 laboratorio '+m.id.slice(0,8)}}),201,'shop').barbershop.id;save();}
const op=async body=>check(await env.request('/functions/v1/barbershop-operation',{token:owner.session.access_token,body:{barbershopId:m.shop,...body}}),200,'offering-'+body.action);
if(!m.prepared){
  await op({action:'configure-shop',publicContact:'Sintético EQ05',address:'Laboratorio EQ05',policies:{minimumNoticeMin:0,bookingHorizonDays:7,maxFuturePerClient:12,slotStepMin:15,bufferMin:0,cancellationAdvanceMin:0}});
  if(!m.service){m.service=(await op({action:'upsert-service',name:'Servicio sintético EQ05',category:'Corte de cabello',description:'Monitor local de disponibilidad',price:{amountMinor:1500,currency:'PEN'},durationMin:15,active:true})).id;save();}
  env.sql(`insert into public.barbershop_memberships(id,user_id,barbershop_id,role,status) values(${q(randomUUID())},${q(professional.id)},${q(m.shop)},'barber','active') on conflict(user_id,barbershop_id) do nothing;`);
  m.barber=(await op({action:'set-professional',userId:professional.id,professionalName:'EQ05 sintético',active:true})).id;save();
  const hours=Array.from({length:7},(_,weekday)=>({weekday,opensMin:540,closesMin:1080}));
  for(const body of [{action:'set-shop-hours',hours},{action:'set-barber-hours',barberId:m.barber,hours},{action:'set-capabilities',barberId:m.barber,serviceIds:[m.service]},{action:'set-publication',state:'published'}])await op(body);
  m.localDate=env.sql("select to_char((now() at time zone 'America/Lima')::date+3,'YYYY-MM-DD');");
  m.publicKey=env.publicKey;m.origin='http://127.0.0.1:54721';m.prepared=true;save();
}
const publicDir=path.join(root,'docs/evaluacion/evidencias/eq05');fs.mkdirSync(publicDir,{recursive:true});
fs.writeFileSync(path.join(publicDir,'protocolo-previo.json'),JSON.stringify({documentedAt:new Date().toISOString(),runId:m.id,protocol,environment:'barbexa-k6-lab/127.0.0.1:54721',measuredFlow:['real-password-auth','catalog','slots','own-reservations','confirm','read-persisted','cancel-own-reservation','read-cancelled'],cleanup:'Logical cancellation only of reservations linked to this run; preserve audit history and prior data.',target:'>=99.5% estimated observed-window availability',originalMonthlyScenarioChanged:false,academicAdaptationRequiresTeacherAcceptance:true,windowStarted:false},null,2)+'\n');
console.log(JSON.stringify({prepared:true,runId:m.id,accounts:3,priorReservations:m.baseline['public.reservations'].length,count:protocol.count,periodSeconds:10,requestLimitSeconds:10,flowLimitSeconds:30,windowStarted:false}));
