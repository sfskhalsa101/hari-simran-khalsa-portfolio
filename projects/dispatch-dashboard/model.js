(function(root){'use strict';
const routes=[{id:'R-201',area:'North',plannedArrival:420,actualArrival:446,departure:480,expected:240,scanned:210,remainingStops:48,minutesPerStop:5,travelMinutes:30,deadline:780},{id:'R-202',area:'West',plannedArrival:430,actualArrival:432,departure:495,expected:180,scanned:180,remainingStops:30,minutesPerStop:5,travelMinutes:20,deadline:780},{id:'R-203',area:'East',plannedArrival:450,actualArrival:null,departure:510,expected:320,scanned:140,remainingStops:65,minutesPerStop:5,travelMinutes:40,deadline:780},{id:'R-204',area:'South',plannedArrival:435,actualArrival:437,departure:470,expected:200,scanned:196,remainingStops:46,minutesPerStop:6,travelMinutes:30,deadline:750},{id:'R-205',area:'Central',plannedArrival:460,actualArrival:458,departure:520,expected:150,scanned:150,remainingStops:22,minutesPerStop:4,travelMinutes:15,deadline:780}];
function assess(r,now=480,grace=15){
if(!Number.isFinite(now)||now<0||now>1439||!Number.isFinite(grace)||grace<0||grace>120)throw Error('Invalid review time or late tolerance.');
for(const k of ['plannedArrival','departure','expected','scanned','remainingStops','minutesPerStop','travelMinutes','deadline'])if(!Number.isFinite(r[k])||r[k]<0)throw Error('Route values must be nonnegative numbers.');
if(r.scanned>r.expected)throw Error('Scanned packages cannot exceed expected packages.');
if(r.actualArrival!==null&&(!Number.isFinite(r.actualArrival)||r.actualArrival<0))throw Error('Actual arrival is invalid.');
const actual=r.actualArrival!==null&&r.actualArrival<=now?r.actualArrival:null;
const late=Math.max(0,(actual??now)-r.plannedArrival),missing=r.expected-r.scanned;
const finish=Math.max(now,r.departure,actual??now)+r.remainingStops*r.minutesPerStop+r.travelMinutes;
const flags=[];
if(late>grace)flags.push({kind:'Late arrival',severity:actual===null?'Critical':'Review',reason:`${Math.round(late)} min ${actual===null?'overdue; arrival not recorded':'late'}`,action:'Confirm inbound ETA and revise the loading plan.'});
if(missing>0&&now>=r.departure-15)flags.push({kind:'Missing scans',severity:now>=r.departure?'Critical':'Review',reason:`${missing} expected packages lack scans`,action:'Reconcile the manifest and scan gaps before releasing the route.'});
if(finish>r.deadline)flags.push({kind:'Service risk',severity:'Critical',reason:`Estimated finish ${Math.ceil(finish-r.deadline)} min beyond deadline`,action:'Review remaining stops, transfer options, and service commitments.'});
return {...r,late,missing,finish,flags,severity:flags.some(f=>f.severity==='Critical')?'Critical':flags.length?'Review':'Clear'};
}
const api={routes,assess};if(typeof module!=='undefined')module.exports=api;else root.DispatchModel=api;
})(globalThis);
