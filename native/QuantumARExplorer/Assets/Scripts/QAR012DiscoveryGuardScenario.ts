/** Additive input lifetime, fallback and IK tests; fixtures are explicitly test-only. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep,nextFrame,awaitEventOnce} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {createIKInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
class DiscoveryHand extends DefaultLeafInteractor {
 async down(id:string):Promise<void>{const t=findInteractablesByName('QAR '+id,undefined,true)[0];if(!t)throw new Error('Missing '+id);await this.enterHover(t);const start=awaitEventOnce(t.onTriggerStart);this.setTriggerType(InteractorTriggerType.Select);await start;await nextFrame();}
 async up():Promise<void>{this.setTriggerType(InteractorTriggerType.None);await nextFrame();this.overrideInteractable=undefined;await nextFrame();await sleep(450);}
 async quick(id:string):Promise<void>{await this.down(id);this.setTriggerType(InteractorTriggerType.None);await nextFrame();await this.exitHover();}
 async cancel():Promise<void>{this.sikInteractor.enabled=false;await sleep(150);this.setTriggerType(InteractorTriggerType.None);this.overrideInteractable=undefined;this.sikInteractor.enabled=true;await sleep(500);}
 async outside():Promise<void>{Object.defineProperty(this.sikInteractor,'isHoveringCurrentInteractable',{get:()=>false,configurable:true});this.setTriggerType(InteractorTriggerType.None);await sleep(150);Reflect.deleteProperty(this.sikInteractor,'isHoveringCurrentInteractable');await this.exitHover();await sleep(500);}
}
@component
export class QAR012DiscoveryGuardScenario extends Scenario {
 async run():Promise<void>{
  await sleep(1500);await qarTap('restart');
  const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
  const comp=findSceneObjectByName('QAR Comparison Controller').getComponent(QuantumARExplorerComparison.getTypeName()) as QuantumARExplorerComparison;
  const model=()=>comp.snapshot().model,hand=new DiscoveryHand('QAR012 lifetime');
  let origin=main.displaySnapshot().beginner;
  await hand.down('enter-discovery');await hand.cancel();expect(main.displaySnapshot().mode).toBe('lesson');expect(main.displaySnapshot().beginner).toBe(origin);
  await hand.down('enter-discovery');await hand.outside();expect(main.displaySnapshot().mode).toBe('lesson');
  await hand.down('enter-discovery');await qarTap('toggle-bit');const changed=main.displaySnapshot().beginner;await hand.up();expect(main.displaySnapshot().mode).toBe('lesson');expect(main.displaySnapshot().beginner).toBe(changed);
  await qarTap('restart');origin=main.displaySnapshot().beginner;await hand.quick('enter-discovery');
  const boundary=model();expect(comp.act('compare-step',boundary.revision,comp.snapshot().context).code).toBe('MODE_SETTLING');expect(JSON.stringify(model())).toBe(JSON.stringify(boundary));await sleep(800);
  let before=JSON.stringify(model());await hand.down('compare-help');await hand.cancel();expect(JSON.stringify(model())).toBe(before);expect(qarText('aOdds').includes('α=')).toBe(false);
  await hand.down('compare-help');await hand.outside();expect(qarText('aOdds').includes('α=')).toBe(false);
  await hand.down('compare-step');await qarTap('compare-help');await hand.up();expect(JSON.stringify(model())).toBe(before);expect(qarText('aOdds').includes('α=')).toBe(true);await qarTap('compare-help');
  await hand.down('compare-help');await qarTap('compare-reset');before=JSON.stringify(model());await hand.up();expect(JSON.stringify(model())).toBe(before);expect(qarText('aOdds').includes('α=')).toBe(false);
  const old=comp.snapshot();await hand.down('compare-step');await qarTap('compare-exit');await hand.up();expect(main.displaySnapshot().mode).toBe('lesson');expect(main.displaySnapshot().beginner).toBe(origin);expect(comp.act('compare-step',old.model.revision,old.context).code).toBe('STALE_CONTEXT');
  // Runtime feature/reference fixtures. Ordinary lesson remains usable, with no B display.
  comp.featureEnabled=false;await qarTap('toggle-bit');expect(findInteractablesByName('QAR enter-discovery',undefined,true).length).toBe(0);await qarTap('next');await qarTap('prepare-plus');await qarTap('next');await qarTap('measure');await qarTap('next');await qarTap('answer-half-each');await qarTap('next');expect(qarText('Heading')).toBe('Lesson Complete');await qarTap('restart');comp.featureEnabled=true;
  const reference=main.optionalComparison;main.optionalComparison=null;await qarTap('toggle-bit');expect(findInteractablesByName('QAR enter-discovery',undefined,true).length).toBe(0);await qarTap('next');await qarTap('back');main.optionalComparison=reference;await qarTap('restart');
  const ik=createIKInteractor();await qarTap('enter-discovery',ik);expect(model().step).toBe(2);await qarTap('compare-help',ik);await qarTap('compare-help',ik);await qarTap('compare-step',ik);await qarTap('compare-step',ik);expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);await qarTap('compare-exit',ik);expect(main.displaySnapshot().mode).toBe('lesson');await qarTap('restart');
  console.log('QAR012 DISCOVERY GUARDS PASS '+JSON.stringify({entryCancel:true,entryOutside:true,entryStale:true,modeBoundary:true,detailsCancel:true,detailsOutside:true,detailsResetStale:true,stepDetailsEpoch:true,exitHeld:true,oldContext:true,disabledCompleteLesson:true,missingReferenceFallback:true,ikDirectReach:true}));
 }
}
