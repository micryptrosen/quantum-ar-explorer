/** Native phase comparison and exact mode restoration using LEAF SIK selections. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
export async function enterComparison():Promise<void>{
  await qarTap('restart');await qarTap('next');await qarTap('prepare-plus');await qarTap('next');await qarTap('measure');await qarTap('next');await qarTap('answer-half-each');await qarTap('next');await qarTap('enter-lab');
}
@component
export class QAR011ComparisonScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await enterComparison();
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const comp=findSceneObjectByName('QAR Comparison Controller').getComponent(QuantumARExplorerComparison.getTypeName()) as QuantumARExplorerComparison;
    const snap=()=>main.displaySnapshot(),model=()=>comp.snapshot().model;
    const near=(a:number,b:number)=>expect(Math.abs(a-b)<1e-9).toBe(true);
    await qarTap('lab-H');await qarTap('lab-measure');await qarTap('inspect-axis');const lab=JSON.stringify(snap().lab),beginner=snap().beginner;
    await qarTap('enter-comparison');expect(snap().mode).toBe('comparison');await qarTap('compare-reset');
    const revision=model().revision;near(model().a.probabilities.zero,1);near(model().b.probabilities.zero,1);expect(model().trials).toBe(0);
    await qarTap('compare-step');near(model().a.probabilities.zero,0.5);near(model().b.probabilities.zero,0.5);near(model().a.bloch.x,1);near(model().b.bloch.x,1);
    await qarTap('compare-step');near(model().a.probabilities.zero,0.5);near(model().b.probabilities.zero,0.5);near(model().a.phaseRadians,Math.PI);near(model().b.phaseRadians,0);near(comp.snapshot().a.x,-1);near(comp.snapshot().b.x,1);
    const phase=JSON.stringify(model());await qarTap('compare-help');expect(JSON.stringify(model())).toBe(phase);await qarTap('compare-help');
    await qarTap('compare-motion');expect(comp.snapshot().motion).toBe(false);expect(JSON.stringify(model())).toBe(phase);
    await qarTap('compare-step');near(model().a.probabilities.one,1);near(model().b.probabilities.zero,1);expect(comp.snapshot().sampleA.active).toBe(false);
    near(comp.snapshot().a.z,-1);near(comp.snapshot().b.z,1);expect(model().a.result).toBe(null);expect(model().b.result).toBe(null);
    await qarTap('compare-step');expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);expect(model().trials).toBe(1);
    expect(model().a.counts[1]).toBe(1);expect(model().b.counts[0]).toBe(1);expect(qarText('aOdds').includes('Result 1')).toBe(true);expect(qarText('bOdds').includes('Result 0')).toBe(true);
    await qarTap('compare-step');expect(model().trials).toBe(2);expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);
    await qarTap('compare-reset');expect(model().revision>revision).toBe(true);expect(model().trials).toBe(0);expect(model().step).toBe(0);
    await qarTap('compare-motion');await qarTap('compare-exit');expect(snap().mode).toBe('lab');expect(JSON.stringify(snap().lab)).toBe(lab);expect(snap().beginner).toBe(beginner);expect(comp.a.getInspect()).toBe(true);await qarTap('inspect-axis');
    await qarTap('return-lesson');expect(snap().beginner).toBe(beginner);expect(snap().mode).toBe('lesson');
    await qarTap('restart');await sleep(800);expect(qarText('BitValue')).toBe('0');expect(snap().trials).toBe(0);expect(snap().updateActive).toBe(false);expect(comp.snapshot().updateActive).toBe(false);
    console.log('QAR011 COMPARISON PASS '+JSON.stringify({normalSampler:true,midphase:true,oppositeX:true,predictions:[1,0],actualResults:[1,0],repeat:true,monotonicReset:true,exactLab:true,exactBeginner:true,motionOff:true,helpPure:true}));
  }
}
