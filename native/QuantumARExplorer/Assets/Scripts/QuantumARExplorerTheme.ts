/** Project-owned UIKit theme; vendor dictionaries remain read-only. */
import {ThemeService} from 'SpectaclesUIKit.lspkg/Scripts/Themes/ThemeService';
import {Theme} from 'SpectaclesUIKit.lspkg/Scripts/Themes/Theme';
import {Style} from 'SpectaclesUIKit.lspkg/Scripts/Themes/Style';
import {SnapOS3} from 'SpectaclesUIKit.lspkg/Scripts/Themes/SnapOS-3.0/SnapOS3';
export function installQARTheme():void {
  const state=(base:vec4,border:vec4)=>({baseType:'Color' as const,baseColor:base,
    hasBorder:true,borderType:'Color' as const,borderColor:border,borderSize:0.12,borderSoftness:0.04,
    shouldScale:false,shouldPosition:false});
  const idle=()=>state(new vec4(0.025,0.045,0.055,1),new vec4(0.18,0.72,0.78,1));
  const hover=()=>state(new vec4(0.04,0.18,0.22,1),new vec4(0.3,0.94,1,1));
  const press=()=>state(new vec4(0.22,0.16,0.04,1),new vec4(1,0.8,0.2,1));
  const style:Style={default:idle(),hovered:hover(),triggered:press(),toggledDefault:idle(),
    toggledHovered:hover(),toggledTriggered:press(),inactive:idle()};
  const content:any={};
  for(const name of ['default','hovered','triggered','toggledDefault','toggledHovered','toggledTriggered','inactive']){
    const c=name==='triggered'||name==='toggledTriggered'?new vec4(1,0.9,0.5,1):new vec4(1,1,1,name==='inactive'?0.4:1);
    content[name]={textColor:c,iconTint:c};
  }
  const theme:Theme={name:'QARCharcoal',defaultStyleName:'QAR',defaultShapeName:'Rectangle',
    styles:{...SnapOS3.styles,Button:{QAR:style},RectangleButton:{QAR:style}},
    componentData:{...SnapOS3.componentData,ContentColors:{Button:{QAR:content},RectangleButton:{QAR:content}}}};
  const service=ThemeService.getInstance();service.registerTheme(theme);service.setTheme(theme);
}
