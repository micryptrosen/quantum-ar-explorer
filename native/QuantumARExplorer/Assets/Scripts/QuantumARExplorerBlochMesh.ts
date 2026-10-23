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
    rings.topology=MeshTopology.Triangles; rings.indexType=MeshIndexType.UInt16;
    const v:number[]=[]; const indices:number[]=[];
    for(let axis=0;axis<3;axis++)for(let i=0;i<96;i++){
      const a=i*Math.PI*2/96, b=(i+1)*Math.PI*2/96;
      const point=(t:number)=>{const c=7.96*Math.cos(t),s=7.96*Math.sin(t);return axis===0?new vec3(c,s,0):axis===1?new vec3(c,0,s):new vec3(0,c,s);};
      this.stroke(v,indices,point(a),point(b),0.04);
    }
    rings.appendVerticesInterleaved(v);rings.appendIndices(indices);
    this.ringVisual.mesh=rings.getMesh();this.ringVisual.mainMaterial=this.material;rings.updateMesh();
    const so=global.scene.createSceneObject('QAR State Vector');so.setParent(this.sceneObject);
    this.arrowVisual=so.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    this.arrow=new MeshBuilder([{name:'position',components:3}]);
    this.arrow.topology=MeshTopology.Triangles;this.arrow.indexType=MeshIndexType.UInt16;
    const av:number[]=[],ai:number[]=[];
    this.stroke(av,ai,new vec3(0,0,0),new vec3(0,8,0),0.09);
    this.stroke(av,ai,new vec3(-1,6.4,0),new vec3(0,8,0),0.09);
    this.stroke(av,ai,new vec3(1,6.4,0),new vec3(0,8,0),0.09);
    this.arrow.appendVerticesInterleaved(av);this.arrow.appendIndices(ai);
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
    const vertices:number[]=[],indices:number[]=[];
    this.stroke(vertices,indices,new vec3(0,0,0),tip,0.09);
    this.stroke(vertices,indices,a,tip,0.09);this.stroke(vertices,indices,b,tip,0.09);
    for(let i=0;i<vertices.length/3;i++)this.arrow.setVertexInterleaved(i,vertices.slice(i*3,i*3+3));
    this.arrow.updateMesh();
  }
  /** Six-sided tubes keep diagram strokes readable without adding ornament. */
  private stroke(vertices:number[],indices:number[],a:vec3,b:vec3,radius:number):void {
    const direction=b.sub(a).normalize();
    const seed=Math.abs(direction.y)>0.9?new vec3(1,0,0):new vec3(0,1,0);
    const u=direction.cross(seed).normalize().uniformScale(radius),v=direction.cross(u).normalize().uniformScale(radius);
    const start=vertices.length/3;
    for(const p of [a,b])for(let j=0;j<6;j++){
      const t=j*Math.PI/3,q=p.add(u.uniformScale(Math.cos(t))).add(v.uniformScale(Math.sin(t)));
      vertices.push(q.x,q.y,q.z);
    }
    for(let j=0;j<6;j++){const k=(j+1)%6;indices.push(start+j,start+k,start+6+j,start+k,start+6+k,start+6+j);}
  }
}
