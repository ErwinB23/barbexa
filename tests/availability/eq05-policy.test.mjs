import {test} from 'node:test';
import assert from 'node:assert/strict';
import {protocol,summarizeIntervals,intervalAt} from './eq05-policy.mjs';
test('hour and ten-second schedule are immutable and contain exactly 360 non-overlapping intervals',()=>{
  assert.equal(protocol.durationMs,3600000);assert.equal(protocol.intervalMs,10000);assert.equal(protocol.count,360);
  assert.equal(intervalAt(359).endMs,3600000);assert.throws(()=>intervalAt(360));
});
test('unknown intervals never count as available; observed availability and full-window coverage are separate',()=>{
  const rows=Array.from({length:360},(_,index)=>({index,status:index===1?'unavailable':index===2?'no-data':'available'}));
  const r=summarizeIntervals(rows);assert.equal(r.available,358);assert.equal(r.unavailable,1);assert.equal(r.noData,1);
  assert.equal(r.observedMs,3590000);assert.equal(r.coveragePercent,359/360*100);
  assert.equal(r.availabilityPercent,358/359*100);assert.equal(r.lowerBoundScheduledPercent,358/360*100);
});
test('no samples means no measured availability, never 100%; omissions are expanded as no-data',()=>{
  const r=summarizeIntervals([]);assert.equal(r.availabilityPercent,null);assert.equal(r.coveragePercent,0);assert.equal(r.noData,360);assert.equal(r.objectiveMet,false);
});
test('99.5% and interruptions are evaluated without reducing thresholds or merging missing data into downtime',()=>{
  const all=Array.from({length:360},(_,index)=>({index,status:'available'}));
  all[10].status='unavailable';assert.equal(summarizeIntervals(all).objectiveMet,true);
  all[11].status='unavailable';all[12].status='no-data';const r=summarizeIntervals(all);
  assert.equal(r.objectiveMet,false);assert.deepEqual(r.interruptions,[{startIndex:10,endIndex:11,estimatedMs:20000}]);
  assert.deepEqual(r.missingPeriods,[{startIndex:12,endIndex:12,estimatedMs:10000}]);
  assert.throws(()=>summarizeIntervals([...all,all[0]]));
});
