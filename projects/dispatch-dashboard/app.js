'use strict';
const form=document.getElementById('dispatch-form'),reviewed=new Set();let assessed=[];
const time=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.ceil(n%60)).padStart(2,'0')}`;
function render(){try{
const f=new FormData(form),parts=f.get('now').split(':').map(Number),now=parts[0]*60+parts[1],grace=Number(f.get('grace'));
assessed=DispatchModel.routes.map(r=>DispatchModel.assess(r,now,grace)).sort((a,b)=>['Critical','Review','Clear'].indexOf(a.severity)-['Critical','Review','Clear'].indexOf(b.severity));
document.getElementById('error').textContent='';
document.getElementById('metrics').innerHTML=`<div><span>Routes needing intervention</span><strong>${assessed.filter(r=>r.flags.length).length} / ${assessed.length}</strong></div><div><span>Total scan gaps</span><strong>${assessed.reduce((s,r)=>s+r.missing,0)}</strong></div><div><span>Estimated service risks</span><strong>${assessed.filter(r=>r.flags.some(f=>f.kind==='Service risk')).length}</strong></div>`;
const filter=document.getElementById('filter').value,rows=assessed.filter(r=>filter==='All'||(filter==='Open'?!reviewed.has(r.id):r.severity===filter));
document.getElementById('summary').textContent=`${rows.length} routes shown · ${reviewed.size} reviewed this session · Rules applied at ${time(now)}`;
document.getElementById('routes').innerHTML=rows.length?rows.map(r=>`<article class="route"><h3>${r.id} · ${r.area}<span class="flag ${r.severity}">${r.severity}</span></h3><p>Estimated finish ${time(r.finish)} · Deadline ${time(r.deadline)} · ${r.scanned}/${r.expected} scanned</p>${r.flags.length?`<ul>${r.flags.map(f=>`<li><strong>${f.kind}</strong> — ${f.reason}<br><span class="muted">${f.action}</span></li>`).join('')}</ul>`:'<p>No exceptions under the current rules.</p>'}<button type="button" class="action" data-review="${r.id}" aria-pressed="${reviewed.has(r.id)}">${reviewed.has(r.id)?'Reviewed · undo':'Mark reviewed'}</button></article>`).join(''):'<div class="panel">No routes match this filter.</div>';
}catch(e){document.getElementById('error').textContent=e.message;document.getElementById('routes').innerHTML='';}}
form.addEventListener('submit',e=>{e.preventDefault();render();});document.getElementById('filter').addEventListener('change',render);
document.getElementById('routes').addEventListener('click',e=>{const b=e.target.closest('[data-review]');if(!b)return;const id=b.dataset.review;reviewed.has(id)?reviewed.delete(id):reviewed.add(id);render();});
document.getElementById('input-data').innerHTML=DispatchModel.routes.map(r=>`<tr><th>${r.id}</th><td>${time(r.plannedArrival)} / ${r.actualArrival===null?'Not recorded':time(r.actualArrival)}</td><td>${time(r.departure)}</td><td>${r.scanned}/${r.expected}</td><td>${r.remainingStops}</td><td>${r.minutesPerStop} + ${r.travelMinutes}</td><td>${time(r.deadline)}</td></tr>`).join('');render();
