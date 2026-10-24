/** Native display contracts observed through actual SIK releases; no app handler calls. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep,nextFrame,awaitEventOnce} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {InteractorTriggerType} from 'SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {QuantumARExplorerBitUI} from './QuantumARExplorerBitUI';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
const {createVisualTransition}=require('./QuantumVisual/transition.js');
class QuickSIK extends DefaultLeafInteractor {
  private prepared:any;
  async aim(id:string):Promise<void>{this.prepared=findInteractablesByName('QAR '+id,undefined,true)[0];await this.enterHover(this.prepared);}
  async press():Promise<void>{const started=awaitEventOnce(this.prepared.onTriggerStart);this.setTriggerType(InteractorTriggerType.Select);await started;await nextFrame();this.setTriggerType(InteractorTriggerType.None);await nextFrame();await this.exitHover();}
  async tap(id:string):Promise<void>{
    const target=findInteractablesByName('QAR '+id,undefined,true)[0];
    if(!target)throw new Error('Missing QAR '+id);
    await this.enterHover(target);const started=awaitEventOnce(target.onTriggerStart);
    this.setTriggerType(InteractorTriggerType.Select);await started;await nextFrame();
    this.setTriggerType(InteractorTriggerType.None);await nextFrame();await this.exitHover();
  }
}
@component
export class QuantumARExplorerVisualScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await qarTap('restart');await qarTap('next');
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const ui=findSceneObjectByName('QAR Bit View').getComponent(QuantumARExplorerBitUI.getTypeName()) as QuantumARExplorerBitUI;
    const other=new QuickSIK('QAR009 second SIK');await other.aim('prepare-plus');
    let interrupt:Promise<void>;
    const stills:{texture:Texture,meta:any}[]=[];
    const capture=(label:string)=>{const meta={label,time:getTime(),...main.displaySnapshot()};stills.push({texture:global.scene.liveTarget.copyFrame(),meta});};
    const frames:any[]=[];const off=ui.onAction.add(action=>{
      if(action.id.indexOf('prepare-')===0)frames.push({time:getTime(),action:action.id,...main.displaySnapshot()});
      if(action.id==='prepare-one'){sleep(50).then(()=>capture('early'));sleep(170).then(()=>capture('later'));interrupt=other.press();}
    });
    const quick=new QuickSIK('QAR009 quick SIK');
    await quick.tap('prepare-one');await sleep(20);
    const middle=main.displaySnapshot();
    expect(middle.sample.active).toBe(true);expect(middle.sample.point.z>-1&&middle.sample.point.z<1).toBe(true);
    console.log('QAR009 ANIMATION TIMESTAMP '+JSON.stringify({time:getTime(),...middle}));
    await interrupt;
    const interrupted=main.displaySnapshot();expect(interrupted.sample.kind).toBe('prepare');
    await sleep(450);const end=main.displaySnapshot();
    expect(end.sample.active).toBe(false);expect(JSON.stringify(end.point)).toBe(JSON.stringify(JSON.parse(end.science).point));
    expect(frames.length).toBe(2);expect(frames[0].sample.active).toBe(true);expect(frames[1].sample.active).toBe(true);
    expect(frames[1].sample.point.z>-1&&frames[1].sample.point.z<1).toBe(true);
    console.log('QAR009 ANIMATION TIMESTAMP '+JSON.stringify({time:getTime(),...end,releaseFrames:frames}));off();
    const science=end.science,revision=end.revision;
    await qarTap('inspect-axis');expect(main.displaySnapshot().science).toBe(science);expect(main.displaySnapshot().revision).toBe(revision);
    expect((findSceneObjectByName('QAR Z Measurement Axis').getComponent('Component.RenderMeshVisual') as RenderMeshVisual).enabled).toBe(true);
    expect(Math.abs(findSceneObjectByName('QAR Z Probability Height').getTransform().getLocalPosition().y)<1e-6).toBe(true);
    await qarTap('motion');expect(main.displaySnapshot().science).toBe(science);expect(main.displaySnapshot().revision).toBe(revision);
    await qarTap('prepare-one');const reduced=main.displaySnapshot();expect(reduced.sample.active).toBe(false);expect(reduced.point.z).toBe(-1);
    await qarTap('motion');await qarTap('inspect-axis');
    await qarTap('restart');expect(main.displaySnapshot().sample.visible).toBe(false);expect(qarText('ExperimentCounts').includes('Measurements: 0')).toBe(true);
    // Native execution of helper stale/duplicate/same-target contracts, independent of core.
    const t=createVisualTransition();t.set({x:0,y:0,z:1},1,0);t.set({x:1,y:0,z:0},2,0);
    expect(t.set({x:0,y:0,z:-1},1,0.1).accepted).toBe(false);
    expect(t.set({x:0,y:0,z:-1},2,0.1).accepted).toBe(false);
    t.set({x:1,y:0,z:0},3,0.15);expect(t.sample(0.35).point.x).toBe(1);expect(t.sample(0.35).active).toBe(false);
    expect(stills.length).toBe(2);
    for(const still of stills){
      console.log('QAR009 STILL_META '+JSON.stringify(still.meta));
      await new Promise<void>((resolve,reject)=>Base64.encodeTextureAsync(still.texture,data=>{
        for(let i=0;i<data.length;i+=2000)console.log('QAR009 STILL_DATA '+still.meta.label+' '+(i/2000)+' '+data.slice(i,i+2000));
        console.log('QAR009 STILL_DONE '+still.meta.label+' '+data.length);resolve();
      },()=>reject(new Error('Native PNG encoding failed')),CompressionQuality.HighQuality,EncodingType.Png));
    }
    console.log('QAR009 VISUAL PASS: actual SIK synchronization, antipodal midpoint, interrupted current pose, exact endpoint, reduced motion, inspect nonmutation, reset/hide, stale/duplicate and same-target refresh');
  }
}
