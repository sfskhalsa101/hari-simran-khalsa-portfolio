(function(root){
'use strict';
const trailers=[{id:'T-101',arrival:0,volume:3600},{id:'T-102',arrival:0,volume:1800},{id:'T-103',arrival:30,volume:5400},{id:'T-104',arrival:60,volume:2400},{id:'T-105',arrival:90,volume:4200},{id:'T-106',arrival:120,volume:3000}];
function validate(p,ts){
for(const [k,min,max] of [['crew',0,18],['support',0,6],['rate',50,1000],['belt',0,20000],['target',30,480]]) if(!Number.isFinite(p[k])||p[k]<min||p[k]>max||!Number.isInteger(p[k]))throw Error(`${k} must be a whole number from ${min} to ${max}.`);
if(p.support>p.crew)throw Error('Support positions cannot exceed the available crew.');
if(!Array.isArray(ts)||ts.length>30)throw Error('Use at most 30 trailers.');
if(new Set(ts.map(t=>t.id)).size!==ts.length)throw Error('Trailer IDs must be unique.');
for(const t of ts)if(!t.id||!Number.isInteger(t.arrival)||t.arrival<0||t.arrival>480||!Number.isInteger(t.volume)||t.volume<1||t.volume>50000)throw Error('Each trailer needs a unique ID, arrival of 0–480 minutes, and volume of 1–50,000.');
}
function simulate(p,ts,crew,policy){
const jobs=ts.map((t,i)=>({...t,left:t.volume,door:null,start:null,end:null,queue:i%3}));
const doors=[null,null,null];let atTarget=0,finish=null;
const total=ts.reduce((s,t)=>s+t.volume,0);
if(!total)return {completed:0,total:0,finish:0,labor:0,jobs,crew};
for(let m=0;m<1440;m++){
for(let d=0;d<3;d++)if(doors[d]===null&&crew[d]>0){
let ready=jobs.filter(j=>j.start===null&&j.arrival<=m&&(policy==='balanced'?j.queue===d:true));
ready.sort(policy==='balanced'?(a,b)=>a.arrival-b.arrival:(a,b)=>b.left-a.left||a.arrival-b.arrival);
if(ready.length){let j=ready[0];j.start=m;j.door=d;doors[d]=j;}}
const rates=doors.map((j,d)=>j?crew[d]*p.rate/60:0),sum=rates.reduce((a,b)=>a+b,0),factor=sum?Math.min(1,p.belt/60/sum):0;
let lastEnd=m;
for(let d=0;d<3;d++){let j=doors[d],r=rates[d]*factor;if(!j||!r)continue;let processed=Math.min(j.left,r);j.left-=processed;if(m<p.target)atTarget+=processed;if(j.left<1e-8){j.left=0;j.end=m+processed/r;lastEnd=Math.max(lastEnd,j.end);doors[d]=null;}}
if(jobs.every(j=>j.left===0)){finish=lastEnd;break;}
}
const active=crew.reduce((a,b)=>a+b,0)+p.support;
return {completed:atTarget,total,finish,labor:finish===null?null:active*finish/60,jobs,crew};
}
function plan(p,ts=trailers){validate(p,ts);const productive=p.crew-p.support;
const equal=[0,0,0];for(let i=0;i<Math.min(productive,18);i++)equal[i%3]++;
let baseline=simulate(p,ts,equal,'balanced'),best=baseline;
for(let a=0;a<=6;a++)for(let b=0;b<=6;b++)for(let c=0;c<=6;c++){
if(a+b+c>productive||a+b+c===0)continue;
const r=simulate(p,ts,[a,b,c],'largest');
if(r.completed>best.completed+1e-7||(Math.abs(r.completed-best.completed)<1e-7&&((r.labor??Infinity)<(best.labor??Infinity)-1e-7)))best=r;
}
return {baseline,best,policy:best===baseline?'Balanced queues retained':'Largest available trailer first'};
}
const api={trailers,plan,simulate,validate};if(typeof module!=='undefined')module.exports=api;else root.SortPlanner=api;
})(globalThis);
