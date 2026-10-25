/** Passive optional comparison view. Layout and gestures never change scientific state. */
import Event from 'SpectaclesInteractionKit.lspkg/Utils/Event';
import {Button} from 'SpectaclesUIKit.lspkg/Scripts/Components/Button/Button';
import {ElementContent} from 'SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent';
import {FlexLayout} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout';
import {FlexItem} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem';
import {FlexDirection,FlexAlign,FlexAlignSelf,FlexJustify} from 'SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes';
const {describeDiscovery}=require('./QuantumOptional/discovery.js');
const TYPE_SCALE={Heading:93,Body:64,Caption:54};
@component
export class QuantumARExplorerComparisonUI extends BaseScriptComponent {
  public onAction=new Event<{id:string,revision:number,context:number}>();
  public onLayout=new Event<{a:vec3,b:vec3}>();
  private content:SceneObject;
  private texts:{[key:string]:Text}={};
  private buttons:{[key:string]:ElementContent}={};
  private pending:any;
  private context=0;
  private epoch=0;
  private visible=false;
  private help=false;
  private motion=true;
  private directDiscovery=false;
  private intermediate:any=null;
  private modeAvailableAt=0;
  private layoutReady:DelayedCallbackEvent;
  private layoutSettle:SceneEvent;
  private layoutUntil=0;
  onAwake():void{this.sceneObject.createComponent('Component.Canvas');
    // UIKit nested layouts settle after their own initialization. Follow their final
    // world anchors for a bounded window; never move the station or scientific state.
    this.layoutSettle=this.createEvent('LateUpdateEvent');this.layoutSettle.enabled=false;
    this.layoutSettle.bind(()=>{if(!this.visible||getTime()>this.layoutUntil){this.layoutSettle.enabled=false;return;}this.onLayout.invoke({a:this.texts.aDiagram.sceneObject.getTransform().getWorldPosition(),b:this.texts.bDiagram.sceneObject.getTransform().getWorldPosition()});});this.layoutReady=this.createEvent('DelayedCallbackEvent');this.layoutReady.bind(()=>{if(this.visible)this.onLayout.invoke({a:this.texts.aDiagram.sceneObject.getTransform().getWorldPosition(),b:this.texts.bDiagram.sceneObject.getTransform().getWorldPosition()});});}
  public hide():void{this.visible=false;this.epoch++;if(this.content)this.content.enabled=false;}
  public render(model:any,context:number,motion:boolean,directDiscovery=this.directDiscovery,intermediate=this.intermediate):void {
    if(!this.visible){this.help=false;this.modeAvailableAt=getTime()+0.5;}
    this.intermediate=intermediate;
    this.directDiscovery=directDiscovery;this.pending=model;this.context=context;this.motion=motion;this.visible=true;this.epoch++;
    if(!this.content)this.build();
    this.content.enabled=true;
    const d=describeDiscovery(model,{technical:this.help});
    this.texts.CompareHeading.text=d.title;
    for(const key of ['a','b']){
      const state=model[key],p=state.probabilities;
      this.texts[key+'Title'].text=d[key].title;
      this.texts[key+'Odds'].size=this.help?TYPE_SCALE.Caption:TYPE_SCALE.Body;
      this.texts[key+'Odds'].text=d[key].odds+'\n'+(state.result===null?'Predicted, not measured':'Result '+state.result+' · measured')+(this.help?'\n'+d[key].technical.replace('  β=','\nβ=').replace(/Path: [^\n]*/,this.history(state.history)):'');
    }
    this.texts.CompareGuide.size=this.help?TYPE_SCALE.Caption:TYPE_SCALE.Body;
    let detail=d.explanation.replace('Two independent qubits; this is not entanglement.','Independent qubits, not entanglement. MZ = Z measurement.');
    if(this.intermediate){const complex=(z:any)=>z.re.toFixed(3)+(z.im<0?'':' +')+z.im.toFixed(3)+'i';for(const key of ['a','b']){const s=this.intermediate[key].state;detail+='\nIntermediate '+key.toUpperCase()+': α='+complex(s.alpha)+'  β='+complex(s.beta);}}
    this.texts.CompareGuide.text=this.help?detail:d.guide;
    this.texts.CompareCounts.text='';
    this.texts.CompareCounts.text=(this.directDiscovery&&model.step===2?'Prepared deliberately · no measurement yet.  ':'')+'Observed pairs: '+model.trials+'   A 0:'+model.a.counts[0]+' 1:'+model.a.counts[1]+'   B 0:'+model.b.counts[0]+' 1:'+model.b.counts[1];
    this.buttons['compare-step'].text=model.step===2?'Try same\noperation':model.step===0?'Prepare equal\nodds':d.nextLabel;
    this.buttons['compare-exit'].text=this.directDiscovery?'Return lesson':'Return Lab';
    this.buttons['compare-motion'].text=motion?'Motion: on':'Motion: off';
    this.buttons['compare-help'].text=this.help?'Close Details':'Details';
    this.layoutUntil=getTime()+0.8;this.layoutSettle.enabled=true;this.layoutReady.reset(0.2);
  }
  private history(history:string[]):string {
    // Lossless run-length display of the bounded authoritative history.
    const groups:{value:string,count:number}[]=[];
    for(const value of history){const last=groups[groups.length-1];if(last&&last.value===value)last.count++;else groups.push({value,count:1});}
    return 'Path: '+(groups.length?groups.map(g=>g.value.replace('Z measurement: ','MZ')+(g.count>1?'×'+g.count:'')).join('→'):'0');
  }
  private build():void {
    this.content=this.obj(this.sceneObject,'ComparisonContent',new vec3(0,0,0.6));
    const root=this.flex(this.content,FlexDirection.Column,52,68,2.2);
    this.label(this.content,root,'CompareHeading',52,3,'Heading');
    const pair=this.cell(this.content,root,'ComparePair',52,36);
    const row=this.flex(pair,FlexDirection.Row,52,36,2.2);
    for(const key of ['a','b']){
      const cell=this.cell(pair,row,'Compare'+key.toUpperCase(),24.9,36);
      const col=this.flex(cell,FlexDirection.Column,24.9,36,0.4);
      this.label(cell,col,key+'Title',24.9,3,'Body').text=key==='a'?'A · H-Z-H':'B · H-H';
      this.label(cell,col,key+'North',24.9,2,'Caption').text='0 · NORTH';
      this.label(cell,col,key+'Diagram',24.9,18,'Body');
      this.label(cell,col,key+'South',24.9,2,'Caption').text='1 · SOUTH';
      this.label(cell,col,key+'Odds',24.9,10,'Body');
      col.onLayoutComplete.add(()=>{if(this.texts.aDiagram&&this.texts.bDiagram)this.onLayout.invoke({a:this.texts.aDiagram.sceneObject.getTransform().getWorldPosition(),b:this.texts.bDiagram.sceneObject.getTransform().getWorldPosition()});});
    }
    this.label(this.content,root,'CompareGuide',52,5,'Body');
    this.label(this.content,root,'CompareCounts',52,2,'Caption');
    const actions=this.cell(this.content,root,'CompareActions',52,6);
    const af=this.flex(actions,FlexDirection.Row,52,6,2.2);
    for(const [id,label] of [['compare-step','Apply H to both'],['compare-reset','Reset'],['compare-exit','Return Lab']])this.button(actions,af,id,label,15.866);
    const prefs=this.cell(this.content,root,'ComparePreferences',52,6);
    const pf=this.flex(prefs,FlexDirection.Row,52,6,2.2);
    this.button(prefs,pf,'compare-motion','Motion: on',24.9);this.button(prefs,pf,'compare-help','Help',24.9);
  }
  private button(parent:SceneObject,flex:FlexLayout,id:string,label:string,width:number):void {
    const so=this.cell(parent,flex,'QAR '+id,width,6);
    const b=so.createComponent(Button.getTypeName()) as Button;b.size=new vec3(width,6,1);b.setVariant({theme:'Inherited'});
    const ec=so.createComponent(ElementContent.getTypeName()) as ElementContent;ec.text=label;ec.textSize=68;ec.sizeOverride=new vec2(width-0.8,5);ec.contentAlignment='center';this.buttons[id]=ec;
    let down=false,press:any=null,availableAt=0;
    const cancel=()=>{down=false;press=null;availableAt=getTime()+0.35;};
    b.onTriggerDown.add(()=>{if(down||!this.visible||getTime()<availableAt||getTime()<this.modeAvailableAt)return;down=true;press={epoch:this.epoch,context:this.context,revision:this.pending.revision};});
    b.onTriggerUp.add(()=>{
      if(!down)return;down=false;availableAt=getTime()+0.35;const p=press;press=null;
      if(!p||!this.visible||p.epoch!==this.epoch||p.context!==this.context||p.revision!==this.pending.revision)return;
      if(id==='compare-help'){this.help=!this.help;this.render(this.pending,this.context,this.motion,this.directDiscovery,this.intermediate);return;}
      this.onAction.invoke({id,revision:p.revision,context:p.context});
    });
    b.onInitialized.add(()=>{b.interactable.onTriggerCanceled.add(cancel);b.interactable.onTriggerEndOutside.add(cancel);});
  }
  private label(parent:SceneObject,flex:FlexLayout,name:string,width:number,height:number,role:keyof typeof TYPE_SCALE):Text {
    const so=this.cell(parent,flex,name,width,height);const t=so.createComponent('Component.Text') as Text;
    t.text='';t.size=TYPE_SCALE[role];(t as Text & {weight?:number}).weight=role==='Heading'?700:500;t.depthTest=true;t.textFill.color=role==='Heading'?new vec4(0.3,0.94,0.88,1):new vec4(1,1,1,1);
    t.horizontalAlignment=HorizontalAlignment.Center;t.verticalAlignment=VerticalAlignment.Center;t.horizontalOverflow=HorizontalOverflow.Overflow;t.verticalOverflow=VerticalOverflow.Overflow;t.layoutRect=Rect.create(-0.5,0.5,-0.5,0.5);this.texts[name]=t;return t;
  }
  private cell(parent:SceneObject,flex:FlexLayout,name:string,width:number,height:number):SceneObject {const so=this.obj(parent,name);const i=so.createComponent(FlexItem.getTypeName()) as FlexItem;i.overrideWidth=width;i.overrideHeight=height;i.flexShrink=0;i.alignSelf=FlexAlignSelf.Stretch;flex.addItems([i]);return so;}
  private flex(so:SceneObject,direction:FlexDirection,width:number,height:number,gap:number):FlexLayout {const f=so.createComponent(FlexLayout.getTypeName()) as FlexLayout;f.autoDiscoverItemsOnStart=false;f.width=width;f.height=height;f.direction=direction;f.alignItems=FlexAlign.Stretch;f.justifyContent=FlexJustify.Center;f.rowGap=gap;f.columnGap=gap;return f;}
  private obj(parent:SceneObject,name:string,position?:vec3):SceneObject {const so=global.scene.createSceneObject(name);so.setParent(parent);if(position)so.getTransform().setLocalPosition(position);return so;}
}
