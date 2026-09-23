(function () {
  'use strict';
  const form=document.getElementById('staffing-form');
  const model=window.StaffingModel;
  if(!form || !model) return;
  const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  const count=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
  const set=(id,value)=>{document.getElementById(id).textContent=value;};
  let currentResult=null;
  function readValues(){
    const values={};
    for(const key of Object.keys(model.bounds)){
      const input=document.getElementById(key);
      values[key]=input.value.trim()===''?NaN:Number(input.value);
    }
    return values;
  }
  function formatHours(hours){
    if(hours===null) return 'Cannot finish';
    const total=Math.ceil(hours*60-1e-8);
    return `${Math.floor(total/60)}h ${String(total%60).padStart(2,'0')}m`;
  }
  function render(){
    const error=document.getElementById('result-error');
    const content=document.getElementById('result-content');
    let r;
    try {r=model.calculate(readValues());}
    catch(e){error.hidden=false;error.textContent=e.message;content.hidden=true;currentResult=null;return null;}
    error.hidden=true;content.hidden=false;currentResult=r;
    const status=document.getElementById('result-status');
    status.classList.toggle('late',!r.meetsTarget);
    status.textContent=r.volume===0?'No work remaining':r.finishHours===null?'No productive capacity':r.meetsTarget?'Within target window':'Target at risk';
    set('finish-time',formatHours(r.finishHours));
    set('finish-message',r.finishHours===null?'The current inputs do not allow unloading.':r.volume===0?'There are no remaining packages to process.':r.meetsTarget?`${Math.floor((r.targetHours-r.finishHours)*60+1e-7)} minutes inside the target window.`:`${Math.ceil((r.finishHours-r.targetHours)*60-1e-7)} minutes beyond the target window.`);
    set('throughput',count.format(r.runningCapacity)+'/hr');
    set('required-crew',r.structurallyFeasible?count.format(r.requiredCrew):'Not feasible');
    set('labor-cost',r.laborCost===null?'—':money.format(r.laborCost));
    set('additional-crew',r.additionalCrew===null?'Capacity first':count.format(r.additionalCrew));
    set('constraint',r.activeConstraints.join(' + '));
    set('decision',r.decision);
    const max=Math.max(r.laborCapacity,r.doorCapacity,r.beltCapacity,1);
    for(const [key,value] of [['labor',r.laborCapacity],['door',r.doorCapacity],['belt',r.beltCapacity]]){
      const meter=document.getElementById(key+'-meter');meter.max=max;meter.value=value;
      meter.setAttribute('aria-label',`${key==='door'?'Door':key} capacity ${Math.round(value)} packages per hour`);
      set(key+'-value',count.format(value));
    }
    set('capacity-context',`Capacity in packages per running hour. Required to meet target: ${count.format(r.requiredRate)}/hr. Time is rounded up to the next minute; cost uses unrounded time.`);
    return r;
  }
  function clearPreset(){for(const b of document.querySelectorAll('[data-scenario]')) b.setAttribute('aria-pressed','false');}
  function applyValues(values,preset){
    model.calculate(values);
    for(const [key,value] of Object.entries(values)) document.getElementById(key).value=String(value);
    clearPreset();
    if(preset) document.querySelector(`[data-scenario="${preset}"]`)?.setAttribute('aria-pressed','true');
    return render();
  }
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input',()=>{clearPreset();render();});
  document.getElementById('reset-demo').addEventListener('click',()=>applyValues({...model.baseline},'balanced'));
  for(const b of document.querySelectorAll('[data-scenario]')) b.addEventListener('click',()=>applyValues({...model.scenarios[b.dataset.scenario]},b.dataset.scenario));
  render();
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const properties={};
    for(const [key,[min,max,integer]] of Object.entries(model.bounds)) properties[key]={type:integer?'integer':'number',minimum:min,maximum:max};
    const tool={name:'configure_staffing_scenario',title:'Configure staffing scenario',description:'Update the visible illustrative staffing model and return projected throughput, finish time, crew demand, and modeled labor cost. This changes only the demo inputs.',inputSchema:{type:'object',properties,additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
      if(!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Provide an object of scenario inputs.');
      if(Object.keys(input).some(k=>!Object.hasOwn(model.bounds,k))) throw new Error('Unknown staffing input.');
      const next={...readValues(),...input};
      model.calculate(next);
      return applyValues(next);
    }};
    try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch(e){}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
