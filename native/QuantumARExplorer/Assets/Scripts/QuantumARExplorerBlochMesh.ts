/** Parametric Bloch diagram; math (x,y,z) maps to world (x,z,-y). No science decisions. */
@component
export class QuantumARExplorerBlochMesh extends BaseScriptComponent {
  @input @hint('Unlit cyan diagram material authored through MCP')
  material:Material;
  private arrow:MeshBuilder;
  private ringVisual:RenderMeshVisual;
  private arrowVisual:RenderMeshVisual;
  onAwake():void {
    if(isNull(this.material)){console.error('QAR DIAGRAM missing material');return;}
    this.ringVisual=this.sceneObject.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    const rings=new MeshBuilder([{name:'position',components:3}]);
    rings.topology=MeshTopology.Lines; rings.indexType=MeshIndexType.UInt16;
    const v:number[]=[]; const indices:number[]=[];
    for(let axis=0;axis<3;axis++)for(let i=0;i<96;i++){
      const a=i*Math.PI*2/96, b=(i+1)*Math.PI*2/96;
      const n=v.length/3;
      for(const t of [a,b]){
        const c=8*Math.cos(t),s=8*Math.sin(t);
        v.push(...(axis===0?[c,s,0]:axis===1?[c,0,s]:[0,c,s]));
      }
      indices.push(n,n+1);
    }
    rings.appendVerticesInterleaved(v);rings.appendIndices(indices);
    this.ringVisual.mesh=rings.getMesh();this.ringVisual.mainMaterial=this.material;rings.updateMesh();
    const so=global.scene.createSceneObject('QAR State Vector');so.setParent(this.sceneObject);
    this.arrowVisual=so.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    this.arrow=new MeshBuilder([{name:'position',components:3}]);
    this.arrow.topology=MeshTopology.Lines;this.arrow.indexType=MeshIndexType.UInt16;
    this.arrow.appendVerticesInterleaved([0,0,0,0,8,0,-1,6.5,0,0,8,0,1,6.5,0,0,8,0]);
    this.arrow.appendIndices([0,1,2,3,4,5]);
    this.arrowVisual.mesh=this.arrow.getMesh();
    const mat=this.material.clone();mat.mainPass.baseColor=new vec4(1,0.8,0.2,1);
    this.arrowVisual.mainMaterial=mat;this.arrow.updateMesh();
  }
  public show(visible:boolean,point:{x:number,y:number,z:number}):void {
    if(!this.arrow)return;
    this.ringVisual.enabled=visible;this.arrowVisual.enabled=visible;
    const tip=new vec3(point.x*8,point.z*8,-point.y*8);
    const side=Math.abs(tip.y)>6?new vec3(1,0,0):new vec3(0,1,0);
    const base=tip.uniformScale(0.8);
    const a=base.add(side),b=base.sub(side);
    this.arrow.setVertexInterleaved(1,[tip.x,tip.y,tip.z]);
    this.arrow.setVertexInterleaved(2,[a.x,a.y,a.z]);
    this.arrow.setVertexInterleaved(3,[tip.x,tip.y,tip.z]);
    this.arrow.setVertexInterleaved(4,[b.x,b.y,b.z]);
    this.arrow.setVertexInterleaved(5,[tip.x,tip.y,tip.z]);this.arrow.updateMesh();
  }
}
