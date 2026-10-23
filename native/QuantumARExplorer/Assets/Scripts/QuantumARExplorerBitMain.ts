/** Minimal milestone controller: owns the classical bit; view reports supported input. */
import {QuantumARExplorerBitUI} from './QuantumARExplorerBitUI';
import {QuantumARExplorerBlochMesh} from './QuantumARExplorerBlochMesh';
const {createLessonControls}=require('./QuantumCore/controls.js');
@component
export class QuantumARExplorerBitMain extends BaseScriptComponent {
  @input @hint('Authored UIKit bit view, wired in scene Phase B')
  bitView:QuantumARExplorerBitUI;
  @input @hint('Authored parametric Bloch visualization')
  blochView:QuantumARExplorerBlochMesh;
  @input @hint('World tracked viewing camera for explicit manual recenter only')
  camera:SceneObject;
  private controls:any;
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
    this.createEvent('OnStartEvent').bind(()=>{
      if(isNull(this.bitView)){console.error('QAR BIT: missing view');return;}
      this.bitView.onDiagramLayout.add(p=>{if(!isNull(this.blochView))this.blochView.sceneObject.getTransform().setWorldPosition(p.add(this.bitView.sceneObject.getTransform().getWorldRotation().multiplyVec3(new vec3(0,0,9))))});
      this.controls=createLessonControls({render:(model:any)=>{
        this.bitView.render(model);
        if(!isNull(this.blochView))this.blochView.show(model.stage!=='bit',model.visual.sphere.arrow.to);
        console.log('QAR LESSON '+JSON.stringify({stage:model.stage,bit:model.visual.bit.value,result:model.measurement.result,counts:model.experiment.counts,challenge:model.challenge.status}));
      }});
      this.bitView.onAction.add(({id,revision})=>{
        const result=this.controls.activate(id,revision);
        if(!result.ok)console.warn('QAR INPUT '+JSON.stringify(result.error));
      });
      this.bitView.onPlacement.add(id=>this.place(id));
      this.controls.refresh();
    });
  }
}
