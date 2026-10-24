/** Optional-lab integration through supported SIK select/release, plus native math. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep,nextFrame,awaitEventOnce} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerGateLab} from './QuantumARExplorerGateLab';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
const {applyGate,relativePhase,createGateLab}=require('./QuantumOptional/gates.js');
class HeldSIK extends DefaultLeafInteractor {
  private target:any;
  async aim(id:string):Promise<void>{this.target=findInteractablesByName('QAR '+id,undefined,true)[0];if(!this.target)throw new Error('Missing '+id);await this.enterHover(this.target);await nextFrame();}
  async down():Promise<void>{const started=awaitEventOnce(this.target.onTriggerStart);this.setTriggerType(InteractorTriggerType.Select);await started;await nextFrame();}
  async up():Promise<void>{this.setTriggerType(InteractorTriggerType.None);await nextFrame();await nextFrame();await this.exitHover();await sleep(400);}
  async cancel():Promise<void>{this.overrideInteractable=undefined;await nextFrame();await nextFrame();this.setTriggerType(InteractorTriggerType.None);await nextFrame();await sleep(400);}
}
@component
export class QuantumARExplorerGateScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);
    const budget:any={objects:0,components:0,meshVisuals:0,diagramTriangles:0,diagramVertices:0};
    const walk=(so:SceneObject)=>{budget.objects++;const cs=so.getAllComponents();budget.components+=cs.length;
      for(const c of cs)if(c.isOfType('Component.RenderMeshVisual')){budget.meshVisuals++;const v=c as RenderMeshVisual;
        if(so.name==='QAR Bloch Diagram'||so.name==='QAR State Vector'||so.name.indexOf('QAR Z ')===0||so.name==='QAR Vector Z Projection'){
          budget.diagramTriangles+=v.mesh.getIndexBuffer().length/3;budget.diagramVertices+=v.mesh.getVertexDataForAttribute('position').length/3;
        }}
      for(let i=0;i<so.getChildrenCount();i++)walk(so.getChild(i));};
    for(let i=0;i<global.scene.getRootObjectsCount();i++)walk(global.scene.getRootObject(i));
    console.log('QAR009DE BUDGET '+JSON.stringify(budget));
    await qarTap('restart');
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const lab=findSceneObjectByName('QAR Optional Gate Lab').getComponent(QuantumARExplorerGateLab.getTypeName()) as QuantumARExplorerGateLab;
    const snap=()=>main.displaySnapshot();const close=(a:number,b:number)=>expect(Math.abs(a-b)<1e-9).toBe(true);
    const stills:{texture:Texture,meta:any}[]=[];
    const capture=(label:string)=>stills.push({texture:global.scene.liveTarget.copyFrame(),meta:{label,time:getTime(),...snap()}});
    expect(findInteractablesByName('QAR enter-lab',undefined,true).length).toBe(0);
    await qarTap('next');await qarTap('prepare-plus');await qarTap('next');await qarTap('measure');
    await qarTap('next');await qarTap('answer-half-each');await qarTap('next');
    const beginner=snap().beginner;expect(JSON.parse(beginner).stage).toBe('complete');
    expect(JSON.parse(beginner).experiment.trials).toBe(1);
    // Hold a beginner action over mode entry. SIK release must not fan out.
    const held=new HeldSIK('QAR DE boundary hand');await held.aim('restart');await held.down();
    await qarTap('enter-lab');const epoch=snap().displayEpoch;await held.up();
    expect(snap().mode).toBe('lab');expect(snap().lab.revision).toBe(0);expect(snap().beginner).toBe(beginner);
    expect(snap().displayEpoch>=epoch).toBe(true);expect(snap().sample.active).toBe(false);close(snap().point.z,1);
    capture('default');
    const feedback=new HeldSIK('QAR DE feedback hand');await feedback.aim('lab-H');await sleep(220);capture('hover');
    await feedback.down();await sleep(220);capture('press');
    const release=feedback.up();await sleep(60);capture('gate-early');await sleep(140);capture('gate-later');await release;
    close(snap().lab.probabilities.zero,0.5);close(snap().lab.state.alpha.re,Math.SQRT1_2);close(snap().lab.state.beta.re,Math.SQRT1_2);
    await qarTap('lab-Z');close(snap().lab.probabilities.zero,0.5);close(snap().lab.phaseRadians,Math.PI);
    expect(qarText('StateStatus').includes('β = -0.707')).toBe(true);
    await qarTap('lab-H');close(snap().lab.probabilities.one,1);close(snap().point.z,-1);expect(snap().lab.phaseRadians).toBe(null);
    await qarTap('lab-measure');expect(snap().lab.result).toBe(1);await qarTap('lab-measure');expect(snap().lab.result).toBe(1);expect(snap().lab.trials).toBe(2);
    const measured=JSON.stringify(snap().lab);await qarTap('motion');await qarTap('inspect-axis');expect(JSON.stringify(snap().lab)).toBe(measured);
    await qarTap('lab-X');expect(snap().lab.result).toBe(null);close(snap().lab.probabilities.zero,1);expect(snap().sample.active).toBe(false);
    await qarTap('motion');await qarTap('inspect-axis');await qarTap('lab-reset');expect(snap().lab.trials).toBe(0);
    await qarTap('lab-H');await qarTap('lab-H');close(snap().lab.probabilities.zero,1);
    await qarTap('lab-reset');await qarTap('lab-H');await qarTap('lab-measure');const randomResult=snap().lab.result;
    expect(randomResult===0||randomResult===1).toBe(true);await qarTap('lab-measure');expect(snap().lab.result).toBe(randomResult);
    // Cancellation at the SIK provider leaves the lab unchanged.
    const beforeCancel=JSON.stringify(snap().lab);const canceled=new HeldSIK('QAR DE cancel hand');await canceled.aim('lab-X');await canceled.down();await canceled.cancel();
    expect(JSON.stringify(snap().lab)).toBe(beforeCancel);
    const backHold=new HeldSIK('QAR DE return hand');await backHold.aim('lab-X');await backHold.down();
    await qarTap('return-lesson');const returnedEpoch=snap().displayEpoch;await backHold.up();
    expect(snap().mode).toBe('lesson');expect(snap().beginner).toBe(beginner);expect(snap().sample.active).toBe(false);expect(snap().displayEpoch>=returnedEpoch).toBe(true);
    expect(qarText('Heading')).toBe('Lesson Complete');expect(qarText('ExperimentCounts').includes('Measurements: 1')).toBe(true);
    // Disable the optional authored feature and complete the entire original path.
    lab.featureEnabled=false;await qarTap('restart');await qarTap('toggle-bit');await qarTap('next');await qarTap('prepare-one');await qarTap('next');await qarTap('measure');await qarTap('next');await qarTap('answer-half-each');await qarTap('next');
    expect(qarText('Heading')).toBe('Lesson Complete');expect(findInteractablesByName('QAR enter-lab',undefined,true).length).toBe(0);
    lab.featureEnabled=true;await qarTap('restart');
    // Independent native complex-state check; no application input claims.
    const complex={alpha:{re:Math.SQRT1_2,im:0},beta:{re:0,im:Math.SQRT1_2}};
    const h=applyGate(complex,'H');close(h.alpha.re,0.5);close(h.alpha.im,0.5);close(h.beta.re,0.5);close(h.beta.im,-0.5);close(relativePhase(h),-Math.PI/2);
    const isolated=createGateLab();expect(isolated.dispatch('H',0).ok).toBe(true);expect(isolated.dispatch('Z',0).code).toBe('STALE_CONTROL');
    const tiny={alpha:{re:Math.sqrt(1-1e-16),im:0},beta:{re:0,im:1e-8}};close(relativePhase(tiny),Math.PI/2);
    await sleep(800);expect(snap().updateActive).toBe(false);
    for(const still of stills){console.log('QAR009DE STILL_META '+JSON.stringify(still.meta));await new Promise<void>((resolve,reject)=>Base64.encodeTextureAsync(still.texture,data=>{
      for(let i=0;i<data.length;i+=2000)console.log('QAR009DE STILL_DATA '+still.meta.label+' '+(i/2000)+' '+data.slice(i,i+2000));
      console.log('QAR009DE STILL_DONE '+still.meta.label+' '+data.length);resolve();},()=>reject(new Error('PNG encoding failed')),CompressionQuality.HighQuality,EncodingType.Png));}
    console.log('QAR009DE PASS '+JSON.stringify({beginnerPreserved:true,disabledPath:true,hzh:1,hh:0,complexNative:true,randomResult,staleHeldEntry:true,staleHeldReturn:true,canceled:true,stills:stills.map(s=>s.meta)}));
  }
}
