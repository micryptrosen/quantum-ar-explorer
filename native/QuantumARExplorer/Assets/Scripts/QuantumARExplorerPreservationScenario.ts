/** Native regression: visible pagination, preserved controls, and SIK press lifetime. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep,awaitEventOnce,findSceneObjectByName} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';

// Extend installed LEAF protected interaction hooks; do not invoke application handlers.
class HeldPressInteractor extends DefaultLeafInteractor {
  async begin(target:Interactable):Promise<void>{
    await this.enterHover(target);
    const started=awaitEventOnce(target.onTriggerStart);
    this.setTriggerType(InteractorTriggerType.Select);await started;await sleep(100);
  }
  async release(settleMs=700):Promise<void>{
    this.setTriggerType(InteractorTriggerType.None);await sleep(150);
    await this.exitHover();if(settleMs>0)await sleep(settleMs);
  }
  async cancel():Promise<void>{
    this.sikInteractor.enabled=false;await sleep(150);
    this.setTriggerType(InteractorTriggerType.None);this.overrideInteractable=undefined;
    this.sikInteractor.enabled=true;await sleep(700);
  }
  async releaseOutside():Promise<void>{
    // Installed SIK selects TriggerEndOutside from this public interactor getter.
    Object.defineProperty(this.sikInteractor,'isHoveringCurrentInteractable',{get:()=>false,configurable:true});
    this.setTriggerType(InteractorTriggerType.None);await sleep(150);
    Reflect.deleteProperty(this.sikInteractor,'isHoveringCurrentInteractable');
    await this.exitHover();await sleep(700);
  }
}
function target(id:string):Interactable{
  const t=findInteractablesByName('QAR '+id,undefined,true)[0];
  if(!t)throw new Error('Missing visible QAR '+id);return t;
}
function trials():number{return Number(qarText('ExperimentCounts').match(/Measurements: (\d+)/)[1]);}
@component
export class QuantumARExplorerPreservationScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await qarTap('restart');await qarTap('toggle-bit');
    const bit=qarText('BitValue');await qarTap('next');await qarTap('prepare-one');
    const prepared=qarText('StateStatus');await qarTap('back');expect(qarText('BitValue')).toBe(bit);
    await qarTap('next');expect(qarText('StateStatus')).toBe(prepared);
    await qarTap('next');await qarTap('measure');
    const measured=qarText('StateStatus');const count=qarText('ExperimentCounts');
    await qarTap('back');await qarTap('next');
    expect(qarText('StateStatus')).toBe(measured);expect(qarText('ExperimentCounts')).toBe(count);
    const beforeTen=trials();await qarTap('fresh-plus-ten');expect(trials()).toBe(beforeTen+10);
    await qarTap('clear-experiment');expect(trials()).toBe(0);
    expect(qarText('Heading')).toBe('3 / 3  Make a Measurement');
    expect(qarText('ExperimentCounts').includes('0: 0    1: 0')).toBe(true);
    await qarTap('control-page'); // first controls
    const held=new HeldPressInteractor('QAR held-press regression');
    const other=new DefaultLeafInteractor('QAR other-hand regression');
    // Scientific revision changes while a measurement is held.
    await held.begin(target('measure'));await qarTap('prepare-one',other);await held.release();
    expect(trials()).toBe(0);
    // Same scientific revision, different page and newly mapped slot.
    await held.begin(target('measure'));await qarTap('control-page',other);await held.release();
    expect(trials()).toBe(0);expect(qarText('Heading')).toBe('3 / 3  Make a Measurement');
    await qarTap('control-page');
    // SIK cancel really fires; it must not count as a measurement.
    let canceled=0;const measure=target('measure');const offCancel=measure.onTriggerCanceled.add(()=>canceled++);
    await held.begin(measure);await held.cancel();offCancel();
    expect(canceled>0).toBe(true);expect(trials()).toBe(0);
    let outside=0;const offOutside=measure.onTriggerEndOutside.add(()=>outside++);
    await held.begin(measure);await held.releaseOutside();offOutside();
    expect(outside>0).toBe(true);expect(trials()).toBe(0);
    // A placement press from an old view must not move the station on release.
    const station=findSceneObjectByName('QAR Bit View').getTransform();
    const p=station.getWorldPosition();
    await held.begin(target('recenter'));await qarTap('reposition',other);await held.release();
    expect(station.getWorldPosition().distance(p)<0.01).toBe(true);
    await held.begin(target('place-right'));await qarTap('reposition',other);await held.release();
    expect(station.getWorldPosition().distance(p)<0.01).toBe(true);expect(trials()).toBe(0);
    // Real installed SIK start/end events across moving targets, never app callbacks.
    const preservedState=qarText('StateStatus'),preservedCounts=qarText('ExperimentCounts');
    await qarTap('reposition',other);
    await held.begin(target('place-right'));await held.release(0);
    const moved=station.getWorldPosition();expect(Math.abs(moved.x-p.x-5)<0.01).toBe(true);
    let crossStarts=0,crossEnds=0;
    const left=target('place-left');
    const offStart=left.onTriggerStart.add(()=>crossStarts++),offEnd=left.onTriggerEnd.add(()=>crossEnds++);
    await held.begin(left);await held.release(0);offStart();offEnd();
    expect(crossStarts>0&&crossEnds>0).toBe(true);
    expect(station.getWorldPosition().distance(moved)<0.01).toBe(true);
    await sleep(600);await qarTap('place-left',other);
    expect(station.getWorldPosition().distance(p)<0.01).toBe(true);
    expect(qarText('StateStatus')).toBe(preservedState);expect(qarText('ExperimentCounts')).toBe(preservedCounts);
    await qarTap('place-right');await qarTap('recenter');
    expect(station.getWorldPosition().distance(p)<0.01).toBe(true);
    await qarTap('reposition');
    await qarTap('measure');expect(trials()).toBe(1);
    await qarTap('restart');expect(qarText('Heading')).toBe('1 / 3  Meet the Bit');expect(trials()).toBe(0);
    console.log('QAR PRESERVATION: navigation, fresh-ten, clear, stale science/page/placement, cancel, end-outside, rapid cross-target move/release, settled left, recenter and input recovery verified');
  }
}
