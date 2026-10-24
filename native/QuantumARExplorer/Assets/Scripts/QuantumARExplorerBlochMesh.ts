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
      const point=(t:number)=>{const c=8.91*Math.cos(t),s=8.91*Math.sin(t);return axis===0?new vec3(c,s,0):axis===1?new vec3(c,0,s):new vec3(0,c,s);};
      this.stroke(v,indices,point(a),point(b),0.09);
    }
    rings.appendVerticesInterleaved(v);rings.appendIndices(indices);
    this.ringVisual.mesh=rings.getMesh();this.ringVisual.mainMaterial=this.material;rings.updateMesh();
    const so=global.scene.createSceneObject('QAR State Vector');so.setParent(this.sceneObject);
    this.arrowVisual=so.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    this.arrow=new MeshBuilder([{name:'position',components:3}]);
    this.arrow.topology=MeshTopology.Triangles;this.arrow.indexType=MeshIndexType.UInt16;
    const av:number[]=[],ai:number[]=[];
    this.stroke(av,ai,new vec3(0,0,0),new vec3(0,9,0),0.135);
    this.stroke(av,ai,new vec3(-1,7.2,0),new vec3(0,9,0),0.135);
    this.stroke(av,ai,new vec3(1,7.2,0),new vec3(0,9,0),0.135);
    this.arrow.appendVerticesInterleaved(av);this.arrow.appendIndices(ai);
    this.arrowVisual.mesh=this.arrow.getMesh();
    const mat=this.material.clone();mat.mainPass.baseColor=new vec4(1,0.8,0.2,1);
    this.arrowVisual.mainMaterial=mat;this.arrow.updateMesh();
  }
  private axis:RenderMeshVisual;
  private projection:RenderMeshVisual;
  private authority={x:0,y:0,z:1};
  public setAuthority(point:{x:number,y:number,z:number}):void {this.authority={...point};}
  private tick:RenderMeshVisual;
  private inspected=false;
  private shown=false;
  private current={x:0,y:0,z:1};
  public setInspect(on:boolean):void {this.inspected=on;this.show(this.shown,this.current);}
  public getDisplayPoint():{x:number,y:number,z:number}{return {...this.current};}
  public show(visible:boolean,point:{x:number,y:number,z:number}):void {
    if(!this.arrow)return;
    this.current={...point};this.shown=visible;
    this.ringVisual.enabled=visible;this.arrowVisual.enabled=visible;
    // Geometry is built once. Animation changes transforms, never mesh buffers.
    const tip=new vec3(point.x*9,point.z*9,-point.y*9);
    this.arrowVisual.sceneObject.getTransform().setLocalRotation(quat.rotationFromTo(new vec3(0,1,0),tip.normalize()));
    if(!this.axis){
      this.axis=this.instrument('QAR Z Measurement Axis',new vec4(0.3,0.7,1,1));
      this.axis.sceneObject.getTransform().setLocalPosition(new vec3(0,-9,0));
      this.axis.sceneObject.getTransform().setLocalScale(new vec3(1,18,1));
      this.projection=this.instrument('QAR Vector Z Projection',new vec4(0.3,0.94,0.88,1));
      this.tick=this.instrument('QAR Z Probability Height',new vec4(0.3,0.94,0.88,1));
      this.tick.sceneObject.getTransform().setLocalRotation(quat.rotationFromTo(new vec3(0,1,0),new vec3(1,0,0)));
      this.tick.sceneObject.getTransform().setLocalScale(new vec3(1,3,1));
    }
    this.axis.enabled=visible&&this.inspected;
    this.tick.enabled=visible&&this.inspected;
    this.tick.sceneObject.getTransform().setLocalPosition(new vec3(-1.5,this.authority.z*9,0.3));
    const actual=new vec3(this.authority.x*9,this.authority.z*9,-this.authority.y*9);
    const endpoint=new vec3(0,actual.y,0),delta=endpoint.sub(actual),length=delta.length;
    this.projection.enabled=visible&&this.inspected&&length>0.001;
    if(length>0.001){const t=this.projection.sceneObject.getTransform();t.setLocalPosition(actual);t.setLocalRotation(quat.rotationFromTo(new vec3(0,1,0),delta.normalize()));t.setLocalScale(new vec3(1,length,1));}
  }
  private instrument(name:string,color:vec4):RenderMeshVisual {
    const so=global.scene.createSceneObject(name);so.setParent(this.sceneObject);
    const visual=so.createComponent('Component.RenderMeshVisual') as RenderMeshVisual;
    const builder=new MeshBuilder([{name:'position',components:3}]);builder.topology=MeshTopology.Triangles;builder.indexType=MeshIndexType.UInt16;
    const vertices:number[]=[],indices:number[]=[];this.stroke(vertices,indices,new vec3(0,0,0),new vec3(0,1,0),0.055);
    builder.appendVerticesInterleaved(vertices);builder.appendIndices(indices);visual.mesh=builder.getMesh();
    const material=this.material.clone();material.mainPass.baseColor=color;visual.mainMaterial=material;builder.updateMesh();return visual;
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
