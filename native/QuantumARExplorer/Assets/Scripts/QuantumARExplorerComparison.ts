/** Isolated optional comparison controller; no beginner or Gate Lab model access. */
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {QuantumARExplorerComparisonUI} from './QuantumARExplorerComparisonUI';
import {QuantumARExplorerBlochMesh} from './QuantumARExplorerBlochMesh';
const {createComparison}=require('./QuantumOptional/comparison.js');
const {createVisualTransition}=require('./QuantumVisual/transition.js');
@component
export class QuantumARExplorerComparison extends BaseScriptComponent {
  @input @hint('Optional comparison feature flag') featureEnabled:boolean=true;
  @input @allowUndefined @hint('Passive comparison UIKit view') view:QuantumARExplorerComparisonUI;
  @input @allowUndefined @hint('Reused primary Bloch instrument') a:QuantumARExplorerBlochMesh;
  @input @allowUndefined @hint('Second Bloch instrument') b:QuantumARExplorerBlochMesh;
  public onExit=new Event<number>();
  public onMotion=new Event<boolean>();
  private model:any=createComparison();
  private active=false;
  private context=0;
  private frame=0;
  private motion=true;
  private ta:any=createVisualTransition();
  private tb:any=createVisualTransition();
  private update:SceneEvent;
  private originalPosition:vec3;
  private originalInspect=false;
  private availableAt=0;
  public available():boolean{return this.featureEnabled&&this.enabled&&!isNull(this.view)&&!isNull(this.a)&&!isNull(this.b);}
  public snapshot():any{return {active:this.active,context:this.context,model:this.model.snapshot(),updateActive:this.update?.enabled,a:this.a?.getDisplayPoint(),b:this.b?.getDisplayPoint(),sampleA:this.ta.sample(getTime()),sampleB:this.tb.sample(getTime()),motion:this.motion};}
  onAwake():void {
    this.update=this.createEvent('UpdateEvent');this.update.bind(()=>this.draw());this.update.enabled=false;
    this.createEvent('OnStartEvent').bind(()=>{
      if(!this.available())return;
      this.b.show(false,{x:0,y:0,z:1});
      this.view.onLayout.add(p=>{if(!this.active)return;const offset=this.view.sceneObject.getTransform().getWorldRotation().multiplyVec3(new vec3(0,0,9));this.a.sceneObject.getTransform().setWorldPosition(p.a.add(offset));this.b.sceneObject.getTransform().setWorldPosition(p.b.add(offset));});
      this.view.onAction.add(e=>this.act(e.id,e.revision,e.context));
    });
  }
  public enter(motion:boolean):boolean {
    if(!this.available()||this.active)return false;
    this.active=true;this.context++;this.availableAt=getTime()+0.5;this.motion=motion;this.originalPosition=this.a.sceneObject.getTransform().getWorldPosition();this.originalInspect=this.a.getInspect();
    this.a.sceneObject.getTransform().setLocalScale(new vec3(15/18,15/18,15/18));this.b.sceneObject.getTransform().setLocalScale(new vec3(15/18,15/18,15/18));
    this.a.setInspect(false);this.b.setInspect(false);this.publish(true);return true;
  }
  public act(id:string,revision:number,context:number):any {
    if(!this.active||context!==this.context||revision!==this.model.snapshot().revision)return {ok:false,code:'STALE_CONTEXT'};
    if(getTime()<this.availableAt)return {ok:false,code:'MODE_SETTLING'};
    if(id==='compare-exit'){
      const exited=this.context;this.active=false;this.context++;this.frame++;this.update.enabled=false;this.view.hide();this.b.show(false,this.model.snapshot().b.bloch);this.a.sceneObject.getTransform().setLocalScale(vec3.one());this.a.sceneObject.getTransform().setWorldPosition(this.originalPosition);this.a.setInspect(this.originalInspect);this.onExit.invoke(exited);return {ok:true};
    }
    if(id==='compare-motion'){this.motion=!this.motion;this.onMotion.invoke(this.motion);this.publish(true);return {ok:true};}
    const action=id==='compare-reset'?'reset':id==='compare-step'?(this.model.snapshot().step>=3?'measure':'next'):null;
    if(!action)return {ok:false,code:'INVALID_ACTION'};
    const result=this.model.dispatch(action,revision);if(result.ok||result.revision!==revision)this.publish(action==='reset'||!result.ok);return result;
  }
  private publish(instant=false):void {
    const s=this.model.snapshot();const frame=++this.frame;
    this.a.setAuthority(s.a.bloch);this.b.setAuthority(s.b.bloch);
    const options={instant:instant||!this.motion,shown:true,event:'prepare'};
    this.ta.set(s.a.bloch,frame,getTime(),options);this.tb.set(s.b.bloch,frame,getTime(),options);
    this.view.render(s,this.context,this.motion);this.draw();
  }
  private draw():void {
    if(!this.active){this.update.enabled=false;return;}
    const a=this.ta.sample(getTime()),b=this.tb.sample(getTime());this.a.show(true,a.point);this.b.show(true,b.point);this.update.enabled=a.active||b.active;
  }
}
