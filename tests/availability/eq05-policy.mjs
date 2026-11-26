// Pure accounting, not application code. Missing data is never counted as success.
export const protocol=Object.freeze({version:1,durationMs:3600000,intervalMs:10000,count:360,requestTimeoutMs:10000,flowTimeoutMs:30000,lateToleranceMs:1000,targetPercent:99.5,automaticRetries:0});
export function intervalAt(index){
  if(!Number.isSafeInteger(index)||index<0||index>=protocol.count)throw Error('INVALID_INTERVAL');
  return {index,startMs:index*protocol.intervalMs,endMs:(index+1)*protocol.intervalMs};
}
export function summarizeIntervals(input){
  const seen=new Map();
  for(const row of input){intervalAt(row.index);if(seen.has(row.index))throw Error('DUPLICATE_INTERVAL');if(!['available','unavailable','no-data'].includes(row.status))throw Error('INVALID_INTERVAL_STATUS');seen.set(row.index,row);}
  const rows=Array.from({length:protocol.count},(_,i)=>seen.get(i)||{index:i,status:'no-data'});
  const count=s=>rows.filter(r=>r.status===s).length;
  const available=count('available'),unavailable=count('unavailable'),noData=count('no-data'),observedMs=(available+unavailable)*protocol.intervalMs;
  const periods=status=>{
    const p=[];for(const r of rows){if(r.status!==status)continue;const last=p.at(-1);if(last&&last.endIndex===r.index-1){last.endIndex=r.index;last.estimatedMs+=protocol.intervalMs;}else p.push({startIndex:r.index,endIndex:r.index,estimatedMs:protocol.intervalMs});}return p;
  };
  const availabilityPercent=observedMs?available*protocol.intervalMs/observedMs*100:null;
  return {scheduledMs:protocol.durationMs,scheduledIntervals:protocol.count,available,unavailable,noData,observedMs,
    availabilityPercent,coveragePercent:observedMs/protocol.durationMs*100,lowerBoundScheduledPercent:available/protocol.count*100,
    objectiveMet:availabilityPercent!==null&&availabilityPercent>=protocol.targetPercent,fullCoverage:noData===0,
    interruptions:periods('unavailable'),missingPeriods:periods('no-data')};
}
