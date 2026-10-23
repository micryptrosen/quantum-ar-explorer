/** Passive UIKit lesson view. Scientific state belongs to the reused core engine. */
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {BackPlate} from 'SpectaclesUIKit.lspkg/Scripts/BackPlate';
import {Button} from 'SpectaclesUIKit.lspkg/Scripts/Components/Button/Button';
import {ElementContent} from 'SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent';
import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexDirection, FlexAlign, FlexAlignSelf, FlexJustify} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
const TYPE_SCALE={Title1:{size:105,weight:700},Body:{size:39,weight:500},Caption:{size:38,weight:500}};
function applyTextRole(t:Text,role:keyof typeof TYPE_SCALE):void{t.size=TYPE_SCALE[role].size;(t as Text & {weight?:number}).weight=TYPE_SCALE[role].weight;}
@component
export class QuantumARExplorerBitUI extends BaseScriptComponent {
  @ui.label('Quantum AR Explorer - lesson view')
  @ui.separator
  @input @hint('Panel width in centimeters') @widget(new SliderWidget(40,48,1))
  panelWidth:number=44;
  public onDiagramLayout=new Event<vec3>();
  public onPlacement=new Event<string>();
  private positioning=false;
  private controlPage=0;
  private paintedStage='';
  private viewEpoch=0;
  public onAction=new Event<{id:string,revision:number}>();
  private content:SceneObject;
  private plate:BackPlate;
  private pending:any;
  private texts:{[key:string]:Text}={};
  private slots:{so:SceneObject,ec:ElementContent,action:any,lesson:boolean}[]=[];
  private repaint:DelayedCallbackEvent;
  onAwake():void{this.sceneObject.createComponent('Component.Canvas');this.plate=this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate;this.repaint=this.createEvent('DelayedCallbackEvent');this.repaint.bind(()=>this.paint(this.pending));}
  public render(model:any):void {
    // Invalidate immediately, including the delay before the next visual paint.
    this.viewEpoch++;
    this.pending=model;this.repaint.reset(0.2);
  }
  private paint(model:any):void {
    if(!model)return;
    this.viewEpoch++;
    if(this.paintedStage!==model.stage){this.controlPage=0;this.paintedStage=model.stage;}
    if(!this.content){
      this.content=this.obj(this.sceneObject,'LessonContent',new vec3(0,0,0.6));
      const flex=this.flex(this.content,FlexDirection.Column,this.panelWidth,64,0.6);
      flex.paddingLeft=2;flex.paddingRight=2;flex.paddingTop=1;flex.paddingBottom=1;
      flex.onLayoutComplete.add(r=>{this.plate.size=new vec2(r.containerWidth,r.containerHeight);const anchor=this.texts.BitValue;if(anchor)this.onDiagramLayout.invoke(anchor.sceneObject.getTransform().getWorldPosition());});
      this.label(this.content,flex,'Heading','',2,'Body');
      this.label(this.content,flex,'Explanation','',4,'Body');
      this.label(this.content,flex,'BitValue','',18,'Title1');
      this.label(this.content,flex,'StateStatus','',5,'Body');
      this.label(this.content,flex,'ExperimentCounts','',2,'Body');
      for(let rowIndex=0;rowIndex<2;rowIndex++){
        const row=this.obj(this.content,'ControlRow');const rowItem=row.createComponent(FlexItem.getTypeName()) as FlexItem;
        rowItem.overrideHeight=8.2;rowItem.flexShrink=0;flex.addItems([rowItem]);
        const rowFlex=this.flex(row,FlexDirection.Row,this.panelWidth-4,6,2.2);
        for(let col=0;col<3;col++)this.button(row,rowFlex,'slot-'+(rowIndex*3+col),'',11.86,()=>{});
      }
      const placementRow=this.obj(this.content,'PlacementControls');
      const pi=placementRow.createComponent(FlexItem.getTypeName()) as FlexItem;pi.overrideHeight=6;pi.marginTop=0.6;pi.flexShrink=0;flex.addItems([pi]);
      const pf=this.flex(placementRow,FlexDirection.Row,this.panelWidth-4,6,2.2);
      this.button(placementRow,pf,'recenter','Recenter',18.9,()=>this.onPlacement.invoke('recenter'),false);
      this.button(placementRow,pf,'reposition','Reposition',18.9,()=>{this.positioning=!this.positioning;this.paint(this.pending);},false);
      this.label(this.content,flex,'Placement','Manual placement - table stand-in',2,'Caption');
    }
    this.texts.Heading.text=model.title;
    this.texts.Explanation.text=this.wrap(model.explanation,66);
    this.texts.BitValue.text=model.stage==='bit'?String(model.visual.bit.value):'';
    const state=model.stage==='bit'?'A classical bit is either 0 or 1.':model.stage==='challenge'?(model.challenge.feedback||'Fresh equal superposition: what are the chances?'):model.stage==='complete'?'You did it! Restart to explore again.':model.measurement.probabilityText+'\n'+model.measurement.status;
    const basis=model.measurement.collapsed?(model.measurement.result===0?'zero':'one'):model.measurement.preparation;
    const vector=basis==='zero'?'|psi> = |0>':basis==='one'?'|psi> = |1>':'|psi> = (|0> + |1>) / sqrt(2)';
    this.texts.StateStatus.text=this.wrap((model.stage==='qubit'||model.stage==='measurement'?vector+'; north=0, south=1\n':'')+state,68);
    this.texts.ExperimentCounts.text='Measurements: '+model.experiment.trials+'    0: '+model.experiment.counts[0]+'    1: '+model.experiment.counts[1];
    const enabled=model.controls.filter((c:any)=>c.enabled);
    const pageCount=enabled.length>6?Math.ceil(enabled.length/5):1;
    this.controlPage=Math.min(this.controlPage,pageCount-1);
    const lessonItems=pageCount===1?enabled:enabled.slice(this.controlPage*5,this.controlPage*5+5).concat([{id:'control-page',label:this.controlPage===pageCount-1?'First controls':'More controls'}]);
    const items=this.positioning?['left','right','up','down','farther','nearer'].map(id=>({id:'place-'+id,label:id[0].toUpperCase()+id.slice(1)+' 5 cm'})):lessonItems;
    const move=this.slots.find(slot=>slot.so.name==='QAR reposition');if(move)move.ec.text=this.positioning?'Done positioning':'Reposition';
    this.texts.Placement.text=this.positioning?'Manual placement: adjust, then Done':pageCount>1?'Controls '+(this.controlPage+1)+'/'+pageCount+' - manual placement':'Manual placement - no surface detection';
    const shortLabels:any={'prepare-plus':'Equal superposition','measure':'Measure','fresh-plus-ten':'10 fresh trials','clear-experiment':'Clear counts','answer-half-each':'50% each','answer-always-zero':'Always 0','answer-alternating':'Must alternate','restart':'Restart'};
    this.slots.filter(slot=>slot.lesson).forEach((slot,i)=>{
      const item=items[i];slot.so.enabled=!!item;
      if(item){slot.so.name='QAR '+item.id;slot.ec.text=shortLabels[item.id]||item.label;slot.action={id:item.id,revision:model.revision,pageCount};}
      else slot.action=null;
    });
  }
  private wrap(text:string,n:number):string {
    return text.split('\n').map(line=>{const words=line.split(' ');let out='',row='';for(const word of words){if((row+' '+word).length>n){out+=row+'\n';row=word;}else row+=(row?' ':'')+word;}return out+row;}).join('\n');
  }
  private flex(so:SceneObject,direction:FlexDirection,width:number,height:number,gap:number):FlexLayout{
    const f=so.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    f.autoDiscoverItemsOnStart=false;f.width=width;f.height=height;f.direction=direction;
    f.alignItems=direction===FlexDirection.Row?FlexAlign.Center:FlexAlign.Stretch;f.justifyContent=FlexJustify.Center;f.rowGap=gap;f.columnGap=gap;return f;
  }
  private button(parent:SceneObject,flex:FlexLayout,id:string,label:string,width:number,action:()=>void,lesson=true):void {
    const so=this.obj(parent,'QAR '+id);const item=so.createComponent(FlexItem.getTypeName()) as FlexItem;
    item.overrideHeight=6;item.overrideWidth=width;item.flexShrink=0;
    const btn=so.createComponent(Button.getTypeName()) as Button;btn.size=new vec3(width,6,1);
    const labelSO=this.obj(so,'ButtonLabel',new vec3(0,0,0.08));
    const ec=labelSO.createComponent(ElementContent.getTypeName()) as ElementContent;
    ec.text=label;ec.textSize=39;ec.sizeOverride=new vec2(width-0.8,5);ec.contentAlignment='center';
    const slot={so,ec,action:null as any,lesson};this.slots.push(slot);
    const actionCallback=action;
    let pressed:any=null;let down=false;let availableAt=0;
    const cancel=()=>{down=false;pressed=null;availableAt=getTime()+0.35;};
    btn.onTriggerDown.add(()=>{if(down||getTime()<availableAt)return;down=true;pressed={epoch:this.viewEpoch,action:slot.action?{...slot.action}:null};});
    btn.onTriggerUp.add(()=>{
      if(!down)return;down=false;availableAt=getTime()+0.35;
      const press=pressed;pressed=null;
      if(!press||press.epoch!==this.viewEpoch){console.log('QAR VIEW stale release ignored');return;}
      if(!lesson){this.viewEpoch++;actionCallback();return;}
      const action=press.action;if(!action)return;
      if(action.id==='control-page'){this.controlPage=(this.controlPage+1)%action.pageCount;this.paint(this.pending);}
      else if(action.id.indexOf('place-')===0){this.viewEpoch++;this.onPlacement.invoke(action.id.slice(6));}
      else this.onAction.invoke(action);
    });
    // Element.interactable is available only after UIKit initialization (installed Element.ts).
    btn.onInitialized.add(()=>{
      btn.interactable.onTriggerCanceled.add(cancel);
      btn.interactable.onTriggerEndOutside.add(cancel);
    });
    flex.addItems([item]);
  }
  private label(parent:SceneObject,flex:FlexLayout,name:string,value:string,height:number,role:keyof typeof TYPE_SCALE):Text {
    const so=this.obj(parent,name);const t=so.createComponent('Component.Text') as Text;
    t.text=value;t.depthTest=true;t.textFill.color=new vec4(1,1,1,1);applyTextRole(t,role);t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;
    t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;t.layoutRect=Rect.create(-0.5,0.5,-0.5,0.5);
    const item=so.createComponent(FlexItem.getTypeName()) as FlexItem;item.overrideHeight=height;item.flexShrink=0;item.alignSelf=FlexAlignSelf.Stretch;flex.addItems([item]);this.texts[name]=t;return t;
  }
  private obj(parent:SceneObject,name:string,position?:vec3):SceneObject{
    const so=global.scene.createSceneObject(name);so.setParent(parent);if(position)so.getTransform().setLocalPosition(position);return so;
  }
}

