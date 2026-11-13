// Browser-only renderer, dynamically loaded when the 3D figure enters view.
// Both imports resolve to the SAME pinned Three.js version via the shortcode import map.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {makeGraph,voidCenter,centerCoordinate,PITCH,NODE_RADIUS,LINK_RADIUS,VOID_RADIUS} from './model.js';

// Muted material tints preserve Frameworked's navy/blue/red/green identity
// without using the intense interface colors as brightly lit plastic meshes.
const MODEL_NODE=0xCFA6A0, MODEL_LINK=0x678DB5, MODEL_PORE=0x83B99A;
const UP=new THREE.Vector3(0,1,0);
const VEC=new THREE.Vector3();
const viewDir=new THREE.Vector3(1.16,.88,1.42).normalize();

export function createMofScene(mount) {
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,1,.08,100);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setClearColor(0xffffff,0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='fw-mof-3d__canvas';
  renderer.domElement.tabIndex=0;
  renderer.domElement.setAttribute('role','img');
  renderer.domElement.setAttribute('aria-label','Rotatable conceptual three-dimensional framework. Drag to rotate, choose a building stage below, or use the turn buttons.');
  renderer.domElement.style.touchAction='none';
  mount.append(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff,0xc1cfdd,1.15));
  const key=new THREE.DirectionalLight(0xffffff,1.25);
  key.position.set(5,8,7);
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xc8d8eb,.35);
  fill.position.set(-6,-2,-4);
  scene.add(fill);

  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enablePan=false;
  controls.enableDamping=false; // no continuous animation loop
  controls.enableZoom=true;
  controls.enableRotate=true;
  controls.minDistance=1.45;
  controls.maxDistance=22;
  controls.maxPolarAngle=Math.PI-.12;
  controls.minPolarAngle=.12;
  controls.mouseButtons.LEFT=THREE.MOUSE.ROTATE;
  controls.touches.ONE=THREE.TOUCH.ROTATE;
  controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;

  // Reuse one unit geometry and material per visual role; InstancedMesh prevents
  // 208 separate draw calls for 3x3x3. No textures or postprocessing.
  const sphereGeometry=new THREE.SphereGeometry(1,24,18);
  const strutGeometry=new THREE.CylinderGeometry(1,1,1,14);
  const nodeMat=new THREE.MeshStandardMaterial({color:MODEL_NODE,roughness:1,metalness:0});
  const linkMat=new THREE.MeshStandardMaterial({color:MODEL_LINK,roughness:1,metalness:0});
  // Opaque and matte: depth comes from the actual 3D mesh, not a glow,
  // highlight wireframe, or translucent overlay.
  const poreMat=new THREE.MeshStandardMaterial({
    color:MODEL_PORE,roughness:1,metalness:0,
    transparent:false,opacity:1,depthWrite:true
  });
  const group=new THREE.Group();
  scene.add(group);
  const poreGroup=new THREE.Group();
  const poreBall=new THREE.Mesh(new THREE.SphereGeometry(VOID_RADIUS,32,24),poreMat);
  poreGroup.add(poreBall);
  group.add(poreGroup);
  poreGroup.visible=false;

  let n=0,disposed=false;
  let nodesMesh=null,edgesMesh=null;
  let shown=true;
  const temporary=new THREE.Object3D();
  const world=p=>new THREE.Vector3((p.x-n/2)*PITCH,(p.y-n/2)*PITCH,(p.z-n/2)*PITCH);
  const draw=()=>{
    if(disposed || !shown || !mount.isConnected) return;
    renderer.render(scene,camera);
  };
  const requestDraw=()=>{
    if(disposed)return;
    requestAnimationFrame(draw);
  };
  controls.addEventListener('change',requestDraw);

  const resize=()=>{
    if(disposed)return;
    const width=Math.max(1,Math.round(mount.clientWidth));
    const height=Math.max(1,Math.round(mount.clientHeight));
    if(width===renderer.domElement.width/renderer.getPixelRatio() &&
      height===renderer.domElement.height/renderer.getPixelRatio())return;
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    requestDraw();
  };
  const observer=typeof ResizeObserver==='function' ? new ResizeObserver(resize) : null;
  observer?.observe(mount);
  window.addEventListener('resize',resize);

  const removeMeshes=()=>{
    if(nodesMesh){group.remove(nodesMesh);nodesMesh.dispose();nodesMesh=null;}
    if(edgesMesh){group.remove(edgesMesh);edgesMesh.dispose();edgesMesh=null;}
  };
  function rebuild(next) {
    if(disposed)return;
    if(!Number.isInteger(next)||next<0||next>3)throw new RangeError('Invalid scale.');
    n=next;removeMeshes();
    if(n===0) {
      nodesMesh=new THREE.InstancedMesh(sphereGeometry,nodeMat,1);
      temporary.position.set(-.48,0,0);
      temporary.rotation.set(0,0,0);
      temporary.scale.setScalar(.24);
      temporary.updateMatrix();
      nodesMesh.setMatrixAt(0,temporary.matrix);
      nodesMesh.instanceMatrix.needsUpdate=true;
      edgesMesh=new THREE.InstancedMesh(strutGeometry,linkMat,1);
      temporary.position.set(.58,0,0);
      temporary.rotation.set(0,0,-Math.PI/2);
      temporary.scale.set(.12,.84,.12);
      temporary.updateMatrix();
      edgesMesh.setMatrixAt(0,temporary.matrix);
      edgesMesh.instanceMatrix.needsUpdate=true;
    } else {
      const graph=makeGraph(n);
      nodesMesh=new THREE.InstancedMesh(sphereGeometry,nodeMat,graph.nodes.length);
      for(let i=0;i<graph.nodes.length;i++){
        const node=graph.nodes[i];
        temporary.position.copy(world(node));
        temporary.quaternion.identity();
        temporary.scale.setScalar(NODE_RADIUS);
        temporary.updateMatrix();
        nodesMesh.setMatrixAt(i,temporary.matrix);
      }
      nodesMesh.instanceMatrix.needsUpdate=true;
      edgesMesh=new THREE.InstancedMesh(strutGeometry,linkMat,graph.edges.length);
      for(let i=0;i<graph.edges.length;i++){
        const edge=graph.edges[i];
        const a=world(edge.a), b=world(edge.b);
        VEC.subVectors(b,a);
        temporary.position.copy(a).add(b).multiplyScalar(.5);
        temporary.quaternion.setFromUnitVectors(UP,VEC.clone().normalize());
        temporary.scale.set(LINK_RADIUS,VEC.length(),LINK_RADIUS);
        temporary.updateMatrix();
        edgesMesh.setMatrixAt(i,temporary.matrix);
      }
      edgesMesh.instanceMatrix.needsUpdate=true;
    }
    group.add(nodesMesh,edgesMesh);
    if(n>0){
      const c=centerCoordinate(voidCenter(n),n);
      poreGroup.position.set(c.x,c.y,c.z);
    }
    poreGroup.visible=false;
    frame(false);
  }

  function frame(resetOrientation=false){
    const dir=resetOrientation || camera.position.length()<.1
      ? viewDir.clone()
      : camera.position.clone().sub(controls.target).normalize();
    const dist=n===0?4.2:Math.min(15,n*2.7+2.2);
    controls.target.set(0,0,0);
    camera.position.copy(dir.multiplyScalar(dist));
    controls.update();
    requestDraw();
  }

  function setPore(visible){
    poreGroup.visible=Boolean(visible)&&n>0;
    requestDraw();
  }
  function focusPore(){
    if(n===0)return;
    const center=poreGroup.position.clone();
    const dir=camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(dir,2.45);
    controls.update();
    requestDraw();
  }
  function rotate(delta){
    const d=camera.position.clone().sub(controls.target);
    d.applyAxisAngle(UP,delta);
    camera.position.copy(controls.target).add(d);
    controls.update();
    requestDraw();
  }
  function setVisible(visible){ shown=Boolean(visible);if(shown){resize();requestDraw();} }
  function dispose(){
    if(disposed)return;
    disposed=true;
    observer?.disconnect();
    window.removeEventListener('resize',resize);
    controls.dispose();
    removeMeshes();
    sphereGeometry.dispose();strutGeometry.dispose();
    poreBall.geometry.dispose();
    nodeMat.dispose();linkMat.dispose();poreMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  resize();
  frame(true);
  rebuild(0);
  return {rebuild,setPore,focusPore,rotate,frame,setVisible,dispose,get canvas(){return renderer.domElement;}};
}
