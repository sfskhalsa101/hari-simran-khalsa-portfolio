(function (root) {
  'use strict';
  const bounds = {
    volume: [0, 1000000, true], window: [0.25, 24, false], crew: [0, 200, true],
    support: [0, 100, true], doors: [0, 50, true], perDoor: [1, 10, true],
    rate: [1, 2000, false], belt: [0, 100000, false], heavy: [0, 100, false],
    multiplier: [1, 5, false], downtime: [0, 1439, false], reserve: [0, 80, false], cost: [0, 200, false]
  };
  const names = { volume: 'Remaining packages', window: 'Target finish', crew: 'Available crew', support: 'Support crew', doors: 'Available doors', perDoor: 'People per door', rate: 'Normal rate', belt: 'Belt capacity', heavy: 'Heavy package share', multiplier: 'Handling multiplier', downtime: 'Lost minutes', reserve: 'Capacity reserve', cost: 'Hourly labor cost' };
  const baseline = { volume:40000, window:4, crew:50, support:8, doors:18, perDoor:3, rate:350, belt:17000, heavy:20, multiplier:1.5, downtime:15, reserve:10, cost:30 };
  const scenarios = { balanced: baseline, late: {...baseline, doors:8, downtime:60}, belt: {...baseline,belt:6000}, crew: {...baseline,crew:32} };
  function calculate(values) {
    const v = {};
    for (const [key, range] of Object.entries(bounds)) {
      const n = values[key];
      if (typeof n !== 'number' || !Number.isFinite(n) || n < range[0] || n > range[1] || (range[2] && !Number.isInteger(n))) {
        throw new Error(`${names[key]} must be ${range[2] ? 'a whole number' : 'a number'} between ${range[0]} and ${range[1]}.`);
      }
      v[key] = n;
    }
    const productiveHours = v.window - v.downtime / 60;
    if (productiveHours <= 0) throw new Error('Lost minutes must leave some productive time before the target finish.');
    const plannedRate = v.rate / (1 + (v.heavy / 100) * (v.multiplier - 1)) * (1 - v.reserve / 100);
    const laborCapacity = Math.max(0,v.crew-v.support) * plannedRate;
    const doorCapacity = v.doors * v.perDoor * plannedRate;
    const runningCapacity = v.crew < v.support ? 0 : Math.min(laborCapacity,doorCapacity,v.belt);
    const requiredRate = v.volume/productiveHours;
    const requiredUnloaders = Math.ceil(Math.max(0,requiredRate/plannedRate - 1e-10));
    const requiredCrew = v.volume === 0 ? 0 : requiredUnloaders+v.support;
    const structurallyFeasible = requiredRate <= Math.min(doorCapacity,v.belt)+1e-7;
    const finishHours = v.volume===0 ? 0 : runningCapacity>0 ? v.volume/runningCapacity+v.downtime/60 : null;
    const laborCost = finishHours===null ? null : v.crew*v.cost*finishHours;
    const meetsTarget = finishHours!==null && finishHours<=v.window+1e-7;
    const activeConstraints=[];
    if (v.crew<v.support) activeConstraints.push('Support coverage');
    else {
      if (Math.abs(laborCapacity-runningCapacity)<1e-7) activeConstraints.push('Labor');
      if (Math.abs(doorCapacity-runningCapacity)<1e-7) activeConstraints.push('Doors');
      if (Math.abs(v.belt-runningCapacity)<1e-7) activeConstraints.push('Belt');
    }
    let decision;
    if(v.volume===0) decision='No packages remain. Modeled remaining time and labor cost are zero.';
    else if(v.crew<v.support) decision=`Cover the ${v.support} dedicated support positions first. The current crew cannot support modeled unloading.`;
    else if(!structurallyFeasible) {
      const limits=[];
      if(doorCapacity+1e-7<requiredRate) limits.push('door capacity');
      if(v.belt+1e-7<requiredRate) limits.push('belt capacity');
      decision=`The target exceeds ${limits.join(' and ')}. Extra people alone cannot achieve it; increase available capacity, reduce lost time, or extend the finish window.`;
    } else if(!meetsTarget) decision=`This model needs ${Math.max(0,requiredCrew-v.crew)} more people, including full support coverage, to meet the target under these assumptions.`;
    else decision=`The current crew meets the target. The modeled minimum is ${requiredCrew} people including support; validate real coverage and sustained rates before changing staffing.`;
    return {plannedRate,productiveHours,laborCapacity,doorCapacity,beltCapacity:v.belt,runningCapacity,requiredRate,requiredCrew,additionalCrew:structurallyFeasible?Math.max(0,requiredCrew-v.crew):null,structurallyFeasible,finishHours,laborCost,meetsTarget,activeConstraints:v.volume===0?['No remaining work']:activeConstraints,decision,volume:v.volume,targetHours:v.window};
  }
  const api={calculate,baseline,scenarios,bounds};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.StaffingModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
