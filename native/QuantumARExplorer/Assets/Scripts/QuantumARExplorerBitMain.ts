/** Minimal milestone controller: owns the classical bit; view reports supported input. */
import {QuantumARExplorerBitUI} from './QuantumARExplorerBitUI';
import {QuantumARExplorerBlochMesh} from './QuantumARExplorerBlochMesh';
import {QuantumARExplorerGateLab} from './QuantumARExplorerGateLab';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
const {createVisualTransition}=require('./QuantumVisual/transition.js');
const {createLessonControls}=require('./QuantumCore/controls.js');
@component
export class QuantumARExplorerBitMain extends BaseScriptComponent {
  @input @hint('Authored UIKit bit view, wired in scene Phase B')
  bitView:QuantumARExplorerBitUI;
  @input @hint('Authored parametric Bloch visualization')
  blochView:QuantumARExplorerBlochMesh;
  @input @hint('World tracked viewing camera for explicit manual recenter only')
  camera:SceneObject;
  @input @allowUndefined @hint('Optional removable Gate Lab controller; omission preserves the complete beginner path')
  optionalLab:QuantumARExplorerGateLab;
  @input @allowUndefined @hint('Optional isolated phase comparison; disabled or absent preserves Gate Lab')
  optionalComparison:QuantumARExplorerComparison;
  private inComparison=false;
  private modeAvailableAt=0;
  private inLab=false;
  private beginner:any;
  private displayEpoch=0;
  private controls:any;
  private transition:any=createVisualTransition();
  private latest:any;
  private intent='navigation';
  private motion=true;
  private update:SceneEvent;
  private feedbackUntil=0;
  private feedback='';
  private lastTrials=0;
  public displaySnapshot():any {return {sample:this.transition.sample(getTime()),point:this.blochView.getDisplayPoint(),motion:this.motion,revision:this.latest?.revision,trials:this.latest?.experiment.trials,mode:this.inComparison?'comparison':this.inLab?'lab':'lesson',comparison:isNull(this.optionalComparison)?null:this.optionalComparison.snapshot(),displayEpoch:this.displayEpoch,updateActive:this.update.enabled,lab:this.inLab?this.optionalLab.snapshot():null,beginner:JSON.stringify(this.beginner),science:JSON.stringify({measurement:this.latest?.measurement,experiment:this.latest?.experiment,challenge:this.latest?.challenge,point:this.latest?.visual.sphere.arrow.to})};}
  private publish(model:any,instant=false):void {
    this.latest=model;this.blochView.setAuthority(model.visual.sphere.arrow.to);
    // Display epochs are monotonic across both independent model revision spaces.
    this.transition.set(model.visual.sphere.arrow.to,++this.displayEpoch,getTime(),{instant:instant||!this.motion||this.intent==='navigation'||this.intent==='reset',shown:model.stage!=='bit',event:this.intent});
    if(model.stage==='lab')model={...model,offerComparison:!isNull(this.optionalComparison)&&this.optionalComparison.available()};
    this.bitView.render(model);this.draw();
  }
  private draw():void {
    if(this.inComparison){this.update.enabled=false;return;}
    const sample=this.transition.sample(getTime());
    this.blochView.show(sample.visible,sample.point);
    const feedback=getTime()<this.feedbackUntil?this.feedback:'';
    this.bitView.displayFeedback(sample.active?'Illustrative display transition; probabilities are current.': '',feedback);
    this.update.enabled=sample.active||!!feedback;
  }
  private place(id:string):void {
    const station=this.bitView.sceneObject.getTransform();
    if(id==='recenter'){
      if(isNull(this.camera)){console.warn('QAR PLACEMENT missing camera');return;}
      const c=this.camera.getTransform();const r=c.getWorldRotation();
      station.setWorldPosition(c.getWorldPosition().add(r.multiplyVec3(new vec3(0,0,-110))));
      station.setWorldRotation(r);
    }else{
      const offsets:any={left:[-5,0,0],right:[5,0,0],up:[0,5,0],down:[0,-5,0],farther:[0,0,-5],nearer:[0,0,5]};
      const v=offsets[id];if(!v)return;
      station.setWorldPosition(station.getWorldPosition().add(station.getWorldRotation().multiplyVec3(new vec3(v[0],v[1],v[2]))));
    }
    console.log('QAR PLACEMENT '+id+' '+station.getWorldPosition());
  }
  onAwake():void {
    this.update=this.createEvent('UpdateEvent');this.update.bind(()=>this.draw());this.update.enabled=false;
    this.createEvent('OnStartEvent').bind(()=>{
      if(isNull(this.bitView)){console.error('QAR BIT: missing view');return;}
      if(!isNull(this.optionalComparison)){
        this.optionalComparison.onExit.add(context=>{
          if(!this.inComparison||this.optionalComparison.snapshot().context!==context+1)return;
          this.inComparison=false;this.modeAvailableAt=getTime()+0.5;this.bitView.setVisible(true);this.intent='navigation';this.feedback='';this.feedbackUntil=0;
          this.publish(this.optionalLab.view(this.beginner),true);
        });
        this.optionalComparison.onMotion.add(motion=>{this.motion=motion;this.transition=createVisualTransition({reducedMotion:!motion});this.bitView.setMotionPreference(motion);});
      }
      this.bitView.onDiagramLayout.add(p=>{if(!isNull(this.blochView))this.blochView.sceneObject.getTransform().setWorldPosition(p.add(this.bitView.sceneObject.getTransform().getWorldRotation().multiplyVec3(new vec3(0,0,9))))});
      this.controls=createLessonControls({render:(model:any)=>{
        this.beginner=model;this.inLab=false;
        const fresh=model.experiment.trials-this.lastTrials;this.lastTrials=model.experiment.trials;
        this.feedback=fresh>0?(fresh===10?'10 fresh preparations measured.':'Measurement accepted. Repeat keeps this result.'):'';
        this.feedbackUntil=getTime()+0.65;
        const offered=model.stage==='complete'&&!isNull(this.optionalLab)&&this.optionalLab.available();
        this.publish(offered?{...model,controls:[...model.controls,{id:'enter-lab',label:'Optional Gate Lab',enabled:true}]}:model);
        console.log('QAR LESSON '+JSON.stringify({stage:model.stage,bit:model.visual.bit.value,result:model.measurement.result,counts:model.experiment.counts,challenge:model.challenge.status}));
      }});
      this.bitView.onAction.add(({id,revision})=>{
        if(this.inComparison||getTime()<this.modeAvailableAt)return;
        if(id==='enter-comparison'){
          if(!this.inLab||revision!==this.optionalLab.snapshot().revision||isNull(this.optionalComparison)||!this.optionalComparison.available())return;
          this.bitView.setVisible(false);this.update.enabled=false;
          this.inComparison=this.optionalComparison.enter(this.motion);
          if(!this.inComparison)this.bitView.setVisible(true);
          return;
        }
        if(id==='enter-lab'){
          if(this.inLab||this.beginner?.stage!=='complete'||revision!==this.beginner.revision||isNull(this.optionalLab)||!this.optionalLab.available())return;
          this.inLab=true;this.feedback='';this.feedbackUntil=0;this.intent='navigation';
          this.publish(this.optionalLab.view(this.beginner),true);return;
        }
        if(id==='return-lesson'){
          if(!this.inLab||revision!==this.optionalLab.snapshot().revision)return;
          this.inLab=false;this.intent='navigation';this.feedback='';this.feedbackUntil=0;
          const model=this.beginner;
          const offered=!isNull(this.optionalLab)&&this.optionalLab.available();
          this.publish(offered?{...model,controls:[...model.controls,{id:'enter-lab',label:'Optional Gate Lab',enabled:true}]}:model,true);return;
        }
        if(this.inLab){
          if(id.indexOf('lab-')!==0)return;
          const result=this.optionalLab.act(id.slice(4),revision);
          if(!result.ok){console.warn('QAR LAB INPUT '+result.code);return;}
          this.intent=id==='lab-reset'?'reset':id==='lab-measure'?'measurement':'prepare';
          this.feedback=id==='lab-measure'?'Lab measurement accepted.':'';this.feedbackUntil=getTime()+0.65;
          this.publish(this.optionalLab.view(this.beginner));console.log('QAR LAB '+JSON.stringify(result));return;
        }
        if(id.indexOf('lab-')===0)return;
        this.intent=id==='restart'?'reset':id.indexOf('prepare-')===0?'prepare':id==='measure'?'measurement':id==='fresh-plus-ten'?'trials':'navigation';
        const result=this.controls.activate(id,revision);
        if(!result.ok)console.warn('QAR INPUT '+JSON.stringify(result.error));
      });
      this.bitView.onDisplay.add(({motion,inspect})=>{
        this.motion=motion;this.blochView.setInspect(inspect);
        // A display preference never dispatches a scientific action or consumes a revision.
        this.transition=createVisualTransition({reducedMotion:!motion});
        if(this.latest)this.transition.set(this.latest.visual.sphere.arrow.to,++this.displayEpoch,getTime(),{instant:true,shown:this.latest.stage!=='bit',event:'navigation'});
        this.draw();
      });
      this.bitView.onPlacement.add(id=>this.place(id));
      this.controls.refresh();
    });
  }
}
