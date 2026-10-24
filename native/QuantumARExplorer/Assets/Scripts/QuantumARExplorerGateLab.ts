/** Removable optional controller. No dependency on the beginner session. */
const {createGateLab,describeGateLab}=require('./QuantumOptional/gates.js');
@component
export class QuantumARExplorerGateLab extends BaseScriptComponent {
  @input @hint('Offer the optional one-qubit lab only after beginner completion')
  featureEnabled:boolean=true;
  private lab:any=createGateLab();
  public available():boolean{return this.enabled&&this.featureEnabled&&this.sceneObject.enabled;}
  public snapshot():any{return this.lab.snapshot();}
  public act(id:string,revision:number):any{return this.lab.dispatch(id,revision);}
  public view(beginner:any):any {
    const lab=this.snapshot();
    return {...beginner,stage:'lab',title:'Optional Gate Lab',revision:lab.revision,lab,labGuidance:describeGateLab(lab),
      visual:{...beginner.visual,sphere:{...beginner.visual.sphere,arrow:{to:lab.bloch}}},
      experiment:{trials:lab.trials,counts:lab.counts},
      controls:[['lab-X','X'],['lab-H','H'],['lab-Z','Z'],['lab-measure','Measure'],['lab-reset','Reset Lab'],['return-lesson','Return lesson']].map(([id,label])=>({id,label,enabled:true}))};
  }
}
