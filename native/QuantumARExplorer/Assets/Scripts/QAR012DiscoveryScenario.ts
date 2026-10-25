/** Additive discovery integration proof. No replacement of the original nine scenarios. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
@component
export class QAR012DiscoveryScenario extends Scenario {
 async run():Promise<void>{
  await sleep(1500);await qarTap('restart');
  const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
  const comp=findSceneObjectByName('QAR Comparison Controller').getComponent(QuantumARExplorerComparison.getTypeName()) as QuantumARExplorerComparison;
  const model=()=>comp.snapshot().model,near=(a:number,b:number)=>expect(Math.abs(a-b)<1e-9).toBe(true);
  expect(qarText('BitValue')).toBe('0');expect(findInteractablesByName('QAR next',undefined,true).length).toBe(1);
  const origin=main.displaySnapshot().beginner;const science=main.displaySnapshot().science;const start=getTime();
  await qarTap('enter-discovery');const prepared=model();
  expect(main.displaySnapshot().mode).toBe('comparison');expect(comp.snapshot().directDiscovery).toBe(true);
  expect(prepared.step).toBe(2);expect(prepared.trials).toBe(0);expect(prepared.a.result).toBe(null);expect(prepared.b.result).toBe(null);
  expect(JSON.stringify(prepared.a.history)).toBe(JSON.stringify(['H','Z']));expect(JSON.stringify(prepared.b.history)).toBe(JSON.stringify(['H','Wait']));
  near(prepared.a.probabilities.zero,0.5);near(prepared.b.probabilities.zero,0.5);near(prepared.a.phaseRadians,Math.PI);near(prepared.b.phaseRadians,0);
  near(comp.snapshot().a.x,-1);near(comp.snapshot().b.x,1);
  expect(qarText('aTitle')).toBe('Experiment A');expect(qarText('bTitle')).toBe('Experiment B');expect(qarText('CompareGuide').includes('Will the same operation')).toBe(true);
  expect(qarText('aOdds').includes('not measured')).toBe(true);expect(qarText('CompareCounts').includes('Prepared deliberately')).toBe(true);
  await qarTap('compare-step');expect(model().step).toBe(3);near(model().a.probabilities.one,1);near(model().b.probabilities.zero,1);
  expect(model().trials).toBe(0);expect(model().a.result).toBe(null);expect(qarText('CompareGuide').includes('predicts')).toBe(true);
  await qarTap('compare-step');expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);expect(model().trials).toBe(1);
  const elapsed=getTime()-start;expect(qarText('CompareGuide').includes('Measured A: 1; B: 0.')).toBe(true);
  const measured=JSON.stringify(model());await qarTap('compare-help');expect(JSON.stringify(model())).toBe(measured);
  expect(qarText('aOdds').includes('α=')).toBe(true);expect(qarText('aOdds').includes('Phase:')).toBe(true);expect(qarText('aOdds').includes('Path:')).toBe(true);
  expect(qarText('CompareGuide').includes('not entanglement')).toBe(true);expect(qarText('CompareGuide').includes('Intermediate A')).toBe(true);
  await qarTap('compare-help');expect(JSON.stringify(model())).toBe(measured);
  await qarTap('compare-step');expect(model().trials).toBe(2);await qarTap('compare-help');expect(qarText('aOdds').includes('MZ1×2')).toBe(true);expect(qarText('bOdds').includes('MZ0×2')).toBe(true);await qarTap('compare-help');
  await qarTap('compare-exit');expect(main.displaySnapshot().mode).toBe('lesson');expect(main.displaySnapshot().beginner).toBe(origin);expect(main.displaySnapshot().science).toBe(science);expect(qarText('BitValue')).toBe('0');
  // Nontrivial origin: retain prior observed counts and bit choice through discovery.
  await qarTap('toggle-bit');await qarTap('next');await qarTap('prepare-one');await qarTap('next');await qarTap('measure');await qarTap('back');await qarTap('back');
  expect(qarText('BitValue')).toBe('1');const nontrivial=main.displaySnapshot().beginner;expect(JSON.parse(nontrivial).experiment.trials).toBe(1);
  await qarTap('motion');await qarTap('enter-discovery');expect(comp.snapshot().motion).toBe(false);expect(comp.snapshot().sampleA.active).toBe(false);
  await qarTap('compare-reset');expect(model().step).toBe(0);expect(model().trials).toBe(0);
  for(let i=0;i<3;i++)await qarTap('compare-step');expect(model().a.result).toBe(null);await qarTap('compare-step');expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);
  await qarTap('compare-exit');expect(main.displaySnapshot().beginner).toBe(nontrivial);expect(qarText('BitValue')).toBe('1');await qarTap('motion');await qarTap('restart');
  console.log('QAR012 DISCOVERY PASS '+JSON.stringify({prepared,measured:JSON.parse(measured),elapsedSyntheticLeafSeconds:elapsed,exactColdOrigin:true,exactNontrivialOrigin:true,detailsDisplayOnly:true,resetFullRoute:true,motionOff:true}));
 }
}
