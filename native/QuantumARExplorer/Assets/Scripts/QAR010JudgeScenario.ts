/** Technical learner-flow checks through supported LEAF SIK input; no human-study claim. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep,nextFrame,awaitEventOnce} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
class QuickJudgeSelect extends DefaultLeafInteractor {
  async tap(id:string):Promise<void>{
    const target=findInteractablesByName('QAR '+id,undefined,true)[0];if(!target)throw new Error('Missing '+id);
    await this.enterHover(target);const started=awaitEventOnce(target.onTriggerStart);
    this.setTriggerType(InteractorTriggerType.Select);await started;await nextFrame();
    this.setTriggerType(InteractorTriggerType.None);await nextFrame();await this.exitHover();
  }
}
@component
export class QAR010JudgeScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await qarTap('restart');
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const snap=()=>main.displaySnapshot();
    const says=(text:string)=>expect(qarText('Explanation').replace(/\s+/g,' ').includes(text)).toBe(true);
    says('Learn by experimenting.');says('Change 0 / 1, then choose Next.');
    expect(qarText('StateStatus').replace(/\s+/g,' ')).toBe('A classical bit has one definite value: 0 or 1.');
    const bit=Number(qarText('BitValue'));await qarTap('toggle-bit');expect(Number(qarText('BitValue'))).toBe(1-bit);
    await qarTap('next');await qarTap('prepare-plus');await qarTap('next');
    says('Measure selects one outcome.');says('Repeat keeps it.');
    const quick=new QuickJudgeSelect('QAR010 interruption hand');await quick.tap('prepare-one');
    expect(snap().sample.active).toBe(true);
    await quick.tap('measure');expect(qarText('StateStatus').includes('Measurement result: 1.')).toBe(true);
    await sleep(450);expect(snap().point.z).toBe(-1);expect(snap().sample.active).toBe(false);
    await qarTap('next');await qarTap('answer-always-zero');
    expect(qarText('StateStatus').includes('Try again.')).toBe(true);
    await qarTap('answer-half-each');await qarTap('next');
    says('Optional Gate Lab');says('Return keeps lesson progress.');
    const beginner=snap().beginner;await qarTap('enter-lab');
    says('Start at 0. X swaps 0 / 1.');await qarTap('lab-X');says('X changed 0 to 1.');
    await qarTap('lab-measure');expect(snap().lab.result).toBe(1);says('Measure again keeps this result.');
    await qarTap('lab-reset');await qarTap('lab-H');says('H made equal superposition.');
    expect(Math.abs(snap().lab.probabilities.zero-0.5)<1e-9).toBe(true);
    await qarTap('lab-Z');says('Phase changed; odds did not.');
    expect(Math.abs(Math.abs(snap().lab.phaseRadians)-Math.PI)<1e-9).toBe(true);
    expect(Math.abs(snap().lab.probabilities.zero-0.5)<1e-9).toBe(true);
    await qarTap('lab-H');says('H, Z, H from 0 predicts 1.');await qarTap('lab-measure');
    expect(snap().lab.result).toBe(1);says('Result 1, as predicted.');
    await qarTap('lab-reset');await qarTap('lab-H');await qarTap('lab-H');says('H, H from 0 predicts 0.');
    await qarTap('lab-measure');expect(snap().lab.result).toBe(0);says('H, H gave 0; H, Z, H gives 1.');
    const labBefore=JSON.stringify(snap().lab);await qarTap('motion');await qarTap('inspect-axis');
    expect(JSON.stringify(snap().lab)).toBe(labBefore);expect(snap().motion).toBe(false);
    await qarTap('lab-X');expect(snap().sample.active).toBe(false);expect(snap().point.z<-0.999999).toBe(true);
    await qarTap('return-lesson');expect(snap().beginner).toBe(beginner);expect(snap().mode).toBe('lesson');
    expect(snap().sample.active).toBe(false);await qarTap('motion');await qarTap('inspect-axis');await qarTap('restart');
    expect(qarText('Heading')).toBe('1 / 3  Meet the Bit');expect(Number(qarText('BitValue'))).toBe(0);
    await sleep(800);expect(snap().updateActive).toBe(false);
    console.log('QAR010 JUDGE PASS '+JSON.stringify({adaptiveGuidance:true,x:1,hzh:1,hh:0,exactReturn:true,reducedMotion:true,errorRecovery:true,idleUpdate:false}));
  }
}
