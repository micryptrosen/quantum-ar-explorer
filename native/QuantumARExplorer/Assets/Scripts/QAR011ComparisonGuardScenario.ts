/** Additive SIK cancellation/stale lifetime, native model rollback and idle-cost checks. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep,nextFrame,awaitEventOnce} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerBitUI} from './QuantumARExplorerBitUI';
import {enterComparison} from './QAR011ComparisonScenario';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
const {createComparison}=require('./QuantumOptional/comparison.js');
class ComparisonHand extends DefaultLeafInteractor {
  async down(id:string):Promise<void>{const t=findInteractablesByName('QAR '+id,undefined,true)[0];if(!t)throw new Error('Missing '+id);await this.enterHover(t);const start=awaitEventOnce(t.onTriggerStart);this.setTriggerType(InteractorTriggerType.Select);await start;await nextFrame();}
  async up():Promise<void>{this.setTriggerType(InteractorTriggerType.None);await nextFrame();this.overrideInteractable=undefined;await nextFrame();await sleep(450);}
  async quick(id:string):Promise<void>{await this.down(id);this.setTriggerType(InteractorTriggerType.None);await nextFrame();await this.exitHover();}
  async cancel():Promise<void>{this.sikInteractor.enabled=false;await sleep(150);this.setTriggerType(InteractorTriggerType.None);this.overrideInteractable=undefined;this.sikInteractor.enabled=true;await sleep(500);}
  async outside():Promise<void>{Object.defineProperty(this.sikInteractor,'isHoveringCurrentInteractable',{get:()=>false,configurable:true});this.setTriggerType(InteractorTriggerType.None);await sleep(150);Reflect.deleteProperty(this.sikInteractor,'isHoveringCurrentInteractable');await this.exitHover();await sleep(500);}
}
@component
export class QAR011ComparisonGuardScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);
    // Exercise the visible display-row Next without qarTap's pagination fallback.
    await qarTap('restart');await qarTap('next');await qarTap('prepare-one');await qarTap('next');
    const lesson=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const heading=()=>qarText('Heading');
    const visibleNext=()=>findInteractablesByName('QAR next',undefined,true);
    expect(visibleNext().length).toBe(1);expect(visibleNext()[0].sceneObject.getParent().name).toBe('DisplayInstruments');
    expect(qarText('Explanation').includes('Predict: 0 0% / 1 100%')).toBe(true);
    const currentView=JSON.parse(lesson.displaySnapshot().beginner);
    expect(currentView.controls.find((c:any)=>c.id==='next').enabled).toBe(true);
    const view=findSceneObjectByName('QAR Bit View').getComponent(QuantumARExplorerBitUI.getTypeName()) as QuantumARExplorerBitUI;
    // TEST-ONLY view fixture proves a false core enabled condition cannot dispatch.
    view.render({...currentView,controls:currentView.controls.map((c:any)=>c.id==='next'?{...c,enabled:false}:c)});
    const disabledScience=lesson.displaySnapshot().science;
    await new DefaultLeafInteractor().trigger(visibleNext()[0]);await sleep(500);
    expect(heading()).toBe('3 / 3  Make a Measurement');expect(lesson.displaySnapshot().science).toBe(disabledScience);
    view.render(currentView);
    await qarTap('measure');
    expect(qarText('Explanation').includes('Repeat odds: 0 0% / 1 100%')).toBe(true);
    expect(qarText('Explanation').includes('10 fresh equal-superposition\ntrials: 50% each')).toBe(true);
    const navigationHand=new ComparisonHand('QAR011 visible Next lifetime');
    const measuredScience=lesson.displaySnapshot().science;
    await navigationHand.down('next');await navigationHand.cancel();expect(lesson.displaySnapshot().science).toBe(measuredScience);expect(heading()).toBe('3 / 3  Make a Measurement');
    await navigationHand.down('next');await navigationHand.outside();expect(heading()).toBe('3 / 3  Make a Measurement');
    await navigationHand.down('next');await qarTap('prepare-zero');const preparedScience=lesson.displaySnapshot().science;await navigationHand.up();expect(lesson.displaySnapshot().science).toBe(preparedScience);expect(heading()).toBe('3 / 3  Make a Measurement');
    await qarTap('measure');expect(visibleNext().length).toBe(1);
    await new DefaultLeafInteractor().trigger(visibleNext()[0]);await sleep(700);expect(heading()).toBe('Try the Probability Challenge');
    console.log('QAR011 VISIBLE NEXT PASS '+JSON.stringify({displayRow:true,singleVisible:true,coreAllowsNextBeforeMeasurement:true,disabledViewFixture:true,cancel:true,outside:true,stalePreparation:true,currentAndFreshCopy:true,authoritativeNext:true}));
    await enterComparison();
    const comp=findSceneObjectByName('QAR Comparison Controller').getComponent(QuantumARExplorerComparison.getTypeName()) as QuantumARExplorerComparison;
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const snap=()=>comp.snapshot(),model=()=>snap().model;
    await qarTap('enter-comparison');await qarTap('compare-reset');
    const hand=new ComparisonHand('QAR011 held lifetime');
    let before=JSON.stringify(model());await hand.down('compare-step');await hand.cancel();expect(JSON.stringify(model())).toBe(before);
    await hand.down('compare-step');await hand.outside();expect(JSON.stringify(model())).toBe(before);
    await hand.down('compare-step');await qarTap('compare-reset');before=JSON.stringify(model());await hand.up();expect(JSON.stringify(model())).toBe(before);
    const old=snap();await hand.down('compare-step');await qarTap('compare-exit');await hand.up();expect(snap().active).toBe(false);expect(main.displaySnapshot().mode).toBe('lab');expect(model().step).toBe(0);
    expect(comp.act('compare-step',old.model.revision,old.context).code).toBe('STALE_CONTEXT');
    await qarTap('enter-comparison');expect(comp.act('compare-step',model().revision,old.context).code).toBe('STALE_CONTEXT');
    await qarTap('compare-reset');const r=model().revision;await qarTap('compare-step');expect(comp.act('compare-step',r,snap().context).code).toBe('STALE_CONTEXT');
    await qarTap('compare-reset');const quick=new ComparisonHand('QAR011 interruption');await quick.quick('compare-step');expect(snap().sampleA.active).toBe(true);
    // Interrupt a render-only transition with a committed reset through a different SIK hand.
    const other=new ComparisonHand('QAR011 reset interruption');await other.quick('compare-reset');expect(model().step).toBe(0);expect(snap().sampleA.active).toBe(false);expect(snap().a.z).toBe(1);
    await sleep(500);await qarTap('compare-step');await qarTap('compare-step');await quick.quick('compare-step');expect(snap().sampleA.active).toBe(true);await other.quick('compare-step');expect(model().step).toBe(3);expect(model().a.result).toBe(null);await sleep(500);await qarTap('compare-step');expect(model().a.result).toBe(1);expect(model().b.result).toBe(0);
    await sleep(800);expect(snap().updateActive).toBe(false);expect(Math.abs(snap().a.z+1)<1e-9).toBe(true);expect(Math.abs(snap().b.z-1)<1e-9).toBe(true);
    const budget={objects:0,meshVisuals:0,diagramTriangles:0,diagramVertices:0};
    const walk=(so:SceneObject)=>{budget.objects++;for(const c of so.getAllComponents())if(c.isOfType('Component.RenderMeshVisual')){budget.meshVisuals++;if(so===comp.a.sceneObject||so===comp.b.sceneObject||so.getParent()===comp.a.sceneObject||so.getParent()===comp.b.sceneObject){const v=c as RenderMeshVisual;budget.diagramTriangles+=v.mesh.getIndexBuffer().length/3;budget.diagramVertices+=v.mesh.getVertexDataForAttribute('position').length/3;}}for(let i=0;i<so.getChildrenCount();i++)walk(so.getChild(i));};for(let i=0;i<global.scene.getRootObjectsCount();i++)walk(global.scene.getRootObject(i));console.log('QAR011 OPTIONAL_ON_BUDGET '+JSON.stringify(budget));
    await qarTap('compare-exit');comp.featureEnabled=false;await qarTap('lab-H');expect(findInteractablesByName('QAR enter-comparison',undefined,true).length).toBe(0);await qarTap('return-lesson');await qarTap('restart');expect(qarText('BitValue')).toBe('0');comp.featureEnabled=true;
    // Explicit TEST-ONLY sampler injection: invalid second draw atomically rolls back both.
    let calls=0;const pure=createComparison({random:()=>++calls===2?NaN:0.2});for(let i=0;i<3;i++)pure.dispatch('next',pure.snapshot().revision);const p=pure.snapshot();expect(pure.dispatch('measure',p.revision).code).toBe('INVALID_SAMPLE');const after=pure.snapshot();expect(JSON.stringify(after.a)).toBe(JSON.stringify(p.a));expect(JSON.stringify(after.b)).toBe(JSON.stringify(p.b));expect(after.revision).toBe(p.revision+1);expect(after.trials).toBe(0);
    await sleep(800);console.log('QAR011 GUARDS PASS '+JSON.stringify({cancel:true,outside:true,resetHeld:true,exitHeld:true,oldContext:true,oldRevision:true,activeReset:true,rapidSameButtonRejected:true,settledMeasure:true,disabledFallback:true,testOnlyRollback:true,budget}));
  }
}
