import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EDGES } from "../../game/content";
import { connected, count, currentEvent } from "../../game/engine";
import type { GameState } from "../../game/types";

export type SceneController = {
  update: (state: GameState, selected: number, paused: boolean, evolving: boolean) => void;
  reset: () => void;
  dispose: () => void;
};
type SceneOptions = {
  host: HTMLElement; labels: (HTMLButtonElement | null)[];
  state: GameState; selected: number; paused: boolean; evolving: boolean;
  onSelect: (region: number) => void; onFailure: () => void;
};

const CENTERS = [[-6.8,-3.1],[0,-3.5],[6.8,-3],[-6.7,3.4],[.2,3.5],[7.0,3.7]];
const SURFACES = ["#647b3c","#a39e59","#778580","#b39b61","#3f7953","#55594c"];
const FOLIAGE = ["#385a2d","#6b7a35","#3c5b4b","#587d45","#276149","#596337"];
const TAU = Math.PI * 2;
function noise(x: number, z: number, seed: number) {
  const value = Math.sin(x * 127.1 + z * 311.7 + seed * 17.4) * 43758.5453;
  return value - Math.floor(value);
}
function radiusAt(angle: number, island: number) {
  return 2.45 + .25 * Math.sin(angle * 3 + island) + .17 * Math.cos(angle * 5 - island * 2);
}
function heightAt(x: number, z: number, island: number) {
  const r = Math.hypot(x,z), normalized = r / radiusAt(Math.atan2(z,x),island);
  if (normalized > 1.001) return -.25;
  const center = Math.max(0,1 - normalized);
  let height = .14 + Math.pow(center,.7) * .7;
  height += (Math.sin(x * 2.4 + island) * Math.cos(z * 2.1) + Math.sin(z * 3.5 + x)) * .085 * Math.min(1,center*4);
  if (island === 2) height += Math.max(0,1 - Math.hypot(x+.2,z+.25)/1.65) * 2.65 + Math.max(0,1-Math.hypot(x-.9,z-.4)) * .8;
  if (island === 5) {
    const cone = Math.max(0,1-Math.hypot(x-.25,z+.3)/1.65);
    height += cone * 2.7;
    if (cone > .8) height -= (cone-.8)*4;
  }
  if (island === 0) height += Math.max(0,1-Math.hypot(x+.5,z+.5)/1.5)*.4;
  return height;
}

function terrain(island: number) {
  const positions: number[] = [], colors: number[] = [];
  const rings = 20, sectors = 70, baseColor = new THREE.Color(SURFACES[island]);
  const sand = new THREE.Color(island === 5 ? "#797665" : "#c1b280");
  const stone = new THREE.Color("#7a8279"), snow = new THREE.Color("#d1ddd4");
  function point(ring: number, sector: number) {
    const angle = sector / sectors * TAU, fraction = ring / rings;
    const r = radiusAt(angle,island) * fraction, x = Math.cos(angle)*r, z = Math.sin(angle)*r;
    return [x, heightAt(x,z,island), z, fraction];
  }
  function vertex(p: number[]) {
    positions.push(p[0],p[1],p[2]);
    const c = baseColor.clone();
    if(p[3] > .92) c.lerp(sand,Math.min(1,(p[3]-.92)*13));
    if(island === 2 && p[1] > 1.2) c.lerp(stone,Math.min(1,(p[1]-1.2)*2));
    if(island === 2 && p[1] > 2.1) c.lerp(snow,Math.min(1,(p[1]-2.1)*2.2));
    if(island === 5 && p[1] > 1) c.lerp(new THREE.Color("#45483f"),.7);
    c.multiplyScalar(.90 + noise(p[0],p[2],island)*.18);
    colors.push(c.r,c.g,c.b);
  }
  for(let ring=0;ring<rings;ring++) for(let sector=0;sector<sectors;sector++) {
    const a=point(ring,sector), b=point(ring+1,sector), c=point(ring+1,sector+1), d=point(ring,sector+1);
    [a,c,b,a,d,c].forEach(vertex);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  return geo;
}

export function createArchipelago(options: SceneOptions): SceneController {
  const { host, labels } = options;
  let state=options.state, selected=options.selected, paused=options.paused, evolving=options.evolving;
  let disposed=false, elapsed=0, lastTime=0, frame=0, dirty=true, labelTick=0;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = media.matches;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#112929");
  scene.fog = new THREE.FogExp2("#112929",.017);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:"low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-label","Трёхмерный архипелаг. Поворот перетаскиванием, масштаб колесом или двумя пальцами.");
  renderer.domElement.setAttribute("role","img");
  host.prepend(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(38,1,.1,120);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true; controls.dampingFactor=.075;
  controls.enablePan=false; controls.minPolarAngle=.25; controls.maxPolarAngle=1.15;
  controls.minDistance=12; controls.maxDistance=65;
  controls.rotateSpeed=.45; controls.zoomSpeed=.6;
  controls.addEventListener("change",()=> { dirty=true; });
  function reset() {
    const ratio = host.clientWidth/Math.max(1,host.clientHeight);
    const distance = Math.max(17,36/ratio);
    camera.position.set(0,distance*.62,distance*.78);
    controls.target.set(0,0,0);
    controls.update(); dirty=true;
  }
  reset();
  const sky = new THREE.HemisphereLight("#d3e6d2","#193431",2.1); scene.add(sky);
  const sunlight = new THREE.DirectionalLight("#ffdb95",2.8);
  sunlight.position.set(-9,16,6); sunlight.castShadow=true;
  sunlight.shadow.mapSize.set(1024,1024);
  Object.assign(sunlight.shadow.camera,{left:-16,right:16,top:13,bottom:-13,near:1,far:45});
  sunlight.shadow.normalBias=.06; sunlight.shadow.bias=-.0003;
  scene.add(sunlight);
  const rim = new THREE.DirectionalLight("#85bdc0",1.8); rim.position.set(7,8,-10); scene.add(rim);

  const waterMaterial = new THREE.ShaderMaterial({
    uniforms:{ uTime:{value:0}, uCold:{value:0} },
    vertexShader:"varying vec3 vWorld; void main(){ vec4 world=modelMatrix*vec4(position,1.0); vWorld=world.xyz; gl_Position=projectionMatrix*viewMatrix*world; }",
    fragmentShader:"varying vec3 vWorld; uniform float uTime; uniform float uCold; void main(){ vec2 p=vWorld.xz; float wave=sin(p.x*2.6+uTime*.7+sin(p.y*1.8))*sin(p.y*3.2-uTime*.5); float glint=pow(max(0.0,wave),14.0); float broad=sin(p.x*.27+p.y*.31+uTime*.05)*.5+.5; vec3 color=mix(vec3(.038,.105,.111),vec3(.075,.205,.203),broad); color+=vec3(.10,.16,.115)*glint*.6; color=mix(color,vec3(.16,.25,.26),uCold*.32); float distanceFade=smoothstep(13.0,37.0,length(p)); color=mix(color,vec3(.067,.161,.161),distanceFade); gl_FragColor=vec4(color,1.0); }",
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(160,160),waterMaterial);
  water.rotation.x=-Math.PI/2; water.position.y=-.065; scene.add(water);
  const groundMaterial = new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});
  const shoreMaterial = new THREE.MeshBasicMaterial({color:"#5eaba0",transparent:true,opacity:.12,depthWrite:false});
  const islands: THREE.Group[] = [], hits: THREE.Mesh[] = [], halos: THREE.Mesh[] = [];
  const trunks = new THREE.CylinderGeometry(.06,.1,1,5);
  const crown = new THREE.IcosahedronGeometry(.4,2);
  const conifer = new THREE.ConeGeometry(.56,1.65,7);
  const rock = new THREE.DodecahedronGeometry(.4,0);
  const trunkMaterial = new THREE.MeshStandardMaterial({color:"#534b2c",roughness:1});
  const rockMaterial = new THREE.MeshStandardMaterial({color:"#8e9583",roughness:1,flatShading:true});
  const bodyGeometry = new THREE.SphereGeometry(1,8,6);
  const bodyMaterial = new THREE.MeshStandardMaterial({color:"#cbbb75",roughness:.85});
  const headsMaterial = new THREE.MeshStandardMaterial({color:"#e6d49e",roughness:.8});
  const dummy = new THREE.Object3D();
  const animalGroups: { bodies:THREE.InstancedMesh; heads:THREE.InstancedMesh; eyes:THREE.InstancedMesh; seeds:number[] }[] = [];
  const vegetation: { mesh: THREE.InstancedMesh; matrices: THREE.Matrix4[] }[] = [];
  const decorativeResources: {dispose:()=>void}[] = [trunks,crown,conifer,rock,trunkMaterial,rockMaterial,bodyGeometry,bodyMaterial,headsMaterial,groundMaterial,shoreMaterial];
  const eyeMaterial = new THREE.MeshBasicMaterial({color:"#222a18"}); decorativeResources.push(eyeMaterial);

  for(let island=0;island<6;island++) {
    const group = new THREE.Group(); group.position.set(CENTERS[island][0],0,CENTERS[island][1]); islands.push(group); scene.add(group);
    const land = new THREE.Mesh(terrain(island),groundMaterial);
    land.receiveShadow=true; land.castShadow=true; land.userData.island=island; group.add(land); hits.push(land);
    const sides=new THREE.Mesh(new THREE.CylinderGeometry(2.3,1.9,.7,28),new THREE.MeshStandardMaterial({color:island===5?"#454d47":"#777858",roughness:1,flatShading:true}));
    sides.position.y=-.35; group.add(sides);
    const coast = new THREE.Mesh(new THREE.CircleGeometry(2.85,60),shoreMaterial);
    coast.rotation.x=-Math.PI/2; coast.scale.set(1,.94,1); coast.position.y=-.04; group.add(coast);
    const halo = new THREE.Mesh(new THREE.RingGeometry(2.87,2.91,80),new THREE.MeshBasicMaterial({color:"#d8c985",transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));
    halo.rotation.x=-Math.PI/2; halo.position.y=.02; halo.visible=island===selected; group.add(halo); halos.push(halo);
    const treesCount=[45,10,10,14,48,7][island];
    const leafMaterial = new THREE.MeshStandardMaterial({color:"#ffffff",roughness:1,flatShading:false});
    const leaves=new THREE.InstancedMesh(island===2?conifer:crown,leafMaterial,treesCount*3);
    const stems=new THREE.InstancedMesh(trunks,trunkMaterial,treesCount);
    leaves.castShadow=true; leaves.receiveShadow=true; stems.castShadow=true;
    const baseMatrices:THREE.Matrix4[]=[];
    for(let n=0;n<treesCount;n++) {
      const angle=noise(n,1,island)*TAU, r=.6+noise(n,2,island)*1.32;
      const x=Math.cos(angle)*r,z=Math.sin(angle)*r,h=heightAt(x,z,island);
      const scale=.5+noise(n,3,island)*.7;
      dummy.position.set(x,h+scale*.45,z); dummy.rotation.set(0,angle,0); dummy.scale.setScalar(scale); dummy.updateMatrix(); stems.setMatrixAt(n,dummy.matrix);
      for(let layer=0;layer<3;layer++) {
        dummy.position.set(x+(layer-1)*.15*scale,h+scale*(.8+layer*.22),z+(layer%2)*.15*scale);
        dummy.scale.set(scale*(1.05-layer*.15),scale*(island===4?.6:.8),scale*(1.05-layer*.1));
        dummy.rotation.set(.12,angle+layer,.06); dummy.updateMatrix(); leaves.setMatrixAt(n*3+layer,dummy.matrix); baseMatrices.push(dummy.matrix.clone());
        leaves.setColorAt(n*3+layer,new THREE.Color(FOLIAGE[island]).multiplyScalar(.9+noise(n,layer,island)*.6));
      }
    }
    group.add(leaves,stems); vegetation.push({mesh:leaves,matrices:baseMatrices});
    const stones=new THREE.InstancedMesh(rock,rockMaterial,22);
    stones.castShadow=true; stones.receiveShadow=true;
    for(let n=0;n<22;n++){
      const a=noise(n,4,island)*TAU,r=1.55+noise(n,5,island)*.77,x=Math.cos(a)*r,z=Math.sin(a)*r;
      dummy.position.set(x,heightAt(x,z,island)+.06,z); dummy.rotation.set(a,a*.2,a*.5);
      dummy.scale.set(.4+noise(n,6,island),.25+noise(n,7,island)*.6,.4+noise(n,8,island));dummy.updateMatrix();stones.setMatrixAt(n,dummy.matrix);
    }
    group.add(stones);
    const bodies=new THREE.InstancedMesh(bodyGeometry,bodyMaterial,14);
    const heads=new THREE.InstancedMesh(bodyGeometry,headsMaterial,14);
    const eyes=new THREE.InstancedMesh(bodyGeometry,eyeMaterial,28);
    bodies.frustumCulled=false; heads.frustumCulled=false; eyes.frustumCulled=false;
    bodies.castShadow=true; heads.castShadow=true;
    group.add(bodies,heads,eyes);
    animalGroups.push({bodies,heads,eyes,seeds:Array.from({length:14},(_,n)=>noise(n,8,island)*TAU)});
  }

  // Fine meadow blades and reeds add scale without individual draw calls.
  const grassMaterial = new THREE.MeshStandardMaterial({color:"#9d9f54",side:THREE.DoubleSide,roughness:1});
  const bladeGeometry = new THREE.ConeGeometry(.032,.28,3);
  const grass=new THREE.InstancedMesh(bladeGeometry,grassMaterial,360);
  for(let n=0;n<360;n++) {
    const i=Math.floor(n/60), a=noise(n,10,i)*TAU, r=.8+noise(n,11,i)*1.25,x=Math.cos(a)*r,z=Math.sin(a)*r;
    dummy.position.set(CENTERS[i][0]+x,heightAt(x,z,i)+.1,CENTERS[i][1]+z);dummy.rotation.set(.2,a,.12);dummy.scale.setScalar(.5+noise(n,12,i));dummy.updateMatrix();grass.setMatrixAt(n,dummy.matrix);
  }
  scene.add(grass);decorativeResources.push(grassMaterial,bladeGeometry);
  const lavaMaterial=new THREE.MeshBasicMaterial({color:"#ef9950",transparent:true,opacity:.85});
  const lava=new THREE.Mesh(new THREE.CircleGeometry(.34,28),lavaMaterial);lava.rotation.x=-Math.PI/2;
  lava.position.set(CENTERS[5][0]+.25,heightAt(.25,-.3,5)+.015,CENTERS[5][1]-.3);scene.add(lava);
  const lavaLight=new THREE.PointLight("#fba446",3,5);lavaLight.position.copy(lava.position).add(new THREE.Vector3(0,.3,0));scene.add(lavaLight);
  const mistPixels=new Uint8Array(32*32*4);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    const offset=(y*32+x)*4,r=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5);
    mistPixels.set([255,255,255,Math.round(Math.pow(Math.max(0,1-r*r),3)*255)],offset);
  }
  const mistTexture=new THREE.DataTexture(mistPixels,32,32);mistTexture.needsUpdate=true;
  const cloudMaterial=new THREE.SpriteMaterial({color:"#b8d1c1",map:mistTexture,transparent:true,opacity:.13,depthWrite:false});
  const clouds=new THREE.Group(); const cloudParts:THREE.Sprite[]=[];
  for(let n=0;n<12;n++) {
    const cloud=new THREE.Sprite(cloudMaterial);
    cloud.position.set(-12+n*2.1,5.6+noise(n,10,2),Math.sin(n*1.7)*5);
    cloud.scale.set(4+noise(n,4,1),1.2,1);clouds.add(cloud);cloudParts.push(cloud);
  }
  scene.add(clouds);
  const smokeGeometry=new THREE.BufferGeometry();
  const smokePositions=new Float32Array(90*3);
  smokeGeometry.setAttribute("position",new THREE.BufferAttribute(smokePositions,3));
  const smokeMaterial=new THREE.PointsMaterial({color:"#b0aea0",map:mistTexture,size:.65,transparent:true,opacity:.3,depthWrite:false});
  const smoke=new THREE.Points(smokeGeometry,smokeMaterial);scene.add(smoke);
  const snowPositions=new Float32Array(230*3);
  for(let n=0;n<230;n++){snowPositions[n*3]=(noise(n,4,8)-.5)*26;snowPositions[n*3+1]=noise(n,5,8)*8;snowPositions[n*3+2]=(noise(n,6,8)-.5)*17;}
  const weatherGeometry=new THREE.BufferGeometry();weatherGeometry.setAttribute("position",new THREE.BufferAttribute(snowPositions,3));
  const weatherMaterial=new THREE.PointsMaterial({color:"#e0e6d7",map:mistTexture,size:.09,transparent:true,opacity:.65,depthWrite:false});
  const weather=new THREE.Points(weatherGeometry,weatherMaterial);weather.visible=false;scene.add(weather);
  const paths=new THREE.Group();scene.add(paths);
  const pathMaterials:THREE.Material[]=[];
  const pathLines:THREE.Line[]=[];
  const migrants:THREE.Mesh[]=[];
  EDGES.forEach(({a,b})=>{
    const from=new THREE.Vector3(CENTERS[a][0],.04,CENTERS[a][1]);
    const to=new THREE.Vector3(CENTERS[b][0],.04,CENTERS[b][1]);
    const direction=to.clone().sub(from).normalize();
    from.addScaledVector(direction,2.6);to.addScaledVector(direction,-2.6);
    const curve=new THREE.QuadraticBezierCurve3(from,from.clone().lerp(to,.5).add(new THREE.Vector3(0,.15,0)),to);
    const material=new THREE.LineDashedMaterial({color:"#bcc791",transparent:true,opacity:.45,dashSize:.12,gapSize:.14});
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)),material);line.computeLineDistances();paths.add(line);pathLines.push(line);pathMaterials.push(material);
    const bead=new THREE.Mesh(new THREE.SphereGeometry(.055,6,4),new THREE.MeshBasicMaterial({color:"#e2cf81"}));
    bead.userData.curve=curve;paths.add(bead);migrants.push(bead);
  });

  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  let startPointer={x:0,y:0};
  const down=(event:PointerEvent)=>{ startPointer={x:event.clientX,y:event.clientY}; };
  const up=(event:PointerEvent)=>{
    if(Math.hypot(event.clientX-startPointer.x,event.clientY-startPointer.y)>7) return;
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(hits)[0];
    if(hit) options.onSelect(hit.object.userData.island);
  };
  renderer.domElement.addEventListener("pointerdown",down);
  renderer.domElement.addEventListener("pointerup",up);
  const contextLost=(event:Event)=>{event.preventDefault();options.onFailure();};
  renderer.domElement.addEventListener("webglcontextlost",contextLost);
  const project=new THREE.Vector3();
  function updateLabels(){
    const width=host.clientWidth,height=host.clientHeight;
    labels.forEach((label,i)=>{
      if(!label)return;
      project.set(CENTERS[i][0],.2,CENTERS[i][1]+2.25).project(camera);
      const x=(project.x*.5+.5)*width,y=(-project.y*.5+.5)*height;
      label.style.transform="translate(-50%, -50%) translate("+x.toFixed(1)+"px, "+y.toFixed(1)+"px)";
      label.style.opacity=project.z>1||x < -20||x > width+20||y < 0||y > height ? "0":"1";
      label.style.pointerEvents=project.z>1?"none":"auto";
    });
  }
  function resize(){
    if(!host.clientWidth||!host.clientHeight)return;
    camera.aspect=host.clientWidth/host.clientHeight;
    camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight,false);dirty=true;
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const reducedChanged=()=>{ reduced=media.matches;dirty=true; };
  media.addEventListener("change",reducedChanged);
  const visibilityChanged=()=>{lastTime=0;dirty=true;};
  document.addEventListener("visibilitychange",visibilityChanged);
  function updateAnimals(time:number){
    animalGroups.forEach(({bodies,heads,eyes,seeds},i)=>{
      const n=Math.min(14,Math.ceil(count(state.regions[i])/16));
      bodies.count=n;heads.count=n;eyes.count=n*2;
      for(let j=0;j<n;j++){
        const seed=seeds[j],a=seed+Math.sin(time*.15+seed)*.22,r=1.6+(j%4)*.1;
        const x=Math.cos(a)*r,z=Math.sin(a)*r,h=heightAt(x,z,i),yaw=a+Math.PI/2;
        const bob=Math.sin(time*(evolving?6:3)+seed)*.016;
        dummy.position.set(x,h+.12+bob,z);dummy.rotation.set(0,-yaw,0);dummy.scale.set(.18,.105,.105);dummy.updateMatrix();bodies.setMatrixAt(j,dummy.matrix);
        const dx=Math.cos(yaw)*.16,dz=Math.sin(yaw)*.16;
        dummy.position.set(x+dx,h+.17+bob,z+dz);dummy.scale.set(.09,.08,.07);dummy.updateMatrix();heads.setMatrixAt(j,dummy.matrix);
        for(let k=0;k<2;k++){
          const side=k===0?1:-1;
          dummy.position.set(x+dx+Math.cos(yaw)*.035+Math.sin(yaw)*.045*side,h+.2+bob,z+dz+Math.sin(yaw)*.035-Math.cos(yaw)*.045*side);
          dummy.scale.setScalar(.016);dummy.updateMatrix();eyes.setMatrixAt(j*2+k,dummy.matrix);
        }
      }
      bodies.instanceMatrix.needsUpdate=true;heads.instanceMatrix.needsUpdate=true;eyes.instanceMatrix.needsUpdate=true;
    });
  }
  function updateWorld(){
    const event=currentEvent(state);
    const cold=event.kind==="cold"||state.effects.some(e=>e.kind==="cold"&&e.until>=state.turn);
    const eruption=event.kind==="eruption";
    waterMaterial.uniforms.uCold.value=cold?1:0;
    weather.visible=cold||event.kind==="rain";
    weatherMaterial.color.set(cold?"#e0e6d7":"#88b3b3");
    weatherMaterial.size=cold?.06:.035;
    sky.color.set(cold?"#b8d4df":"#d3e6d2");
    sunlight.color.set(cold?"#c2d9e8":eruption?"#f4ae75":"#ffdb95");
    smokeMaterial.opacity=eruption?.48:.2;
    lavaLight.intensity=eruption?8:3;
    halos.forEach((halo,i)=>{halo.visible=i===selected;});
    pathLines.forEach((line,i)=>{
      const open=connected(state,EDGES[i].a,EDGES[i].b);
      (line.material as THREE.LineDashedMaterial).color.set(open?"#c4d2a1":"#577d7b");
      (line.material as THREE.LineDashedMaterial).opacity=open?.55:.15;
      migrants[i].visible=open&&(count(state.regions[EDGES[i].a])>0||count(state.regions[EDGES[i].b])>0);
    });
  }
  updateWorld();updateAnimals(0);
  function render(time:number){
    if(disposed)return;
    frame=requestAnimationFrame(render);
    if(document.hidden)return;
    const delta=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
    const moving=!paused&&!reduced;
    if(moving)elapsed+=delta;
    controls.update();
    // Cap animation to 30 fps; paused/reduced-motion scenes render only on change.
    if(time-labelTick<32&&!dirty)return;
    if(!moving&&!dirty)return;
    labelTick=time;
    waterMaterial.uniforms.uTime.value=elapsed;
    if(moving||dirty){
      updateAnimals(elapsed);
      cloudParts.forEach((cloud,i)=>{cloud.position.x=-12+i*2.1+Math.sin(elapsed*.035+i)*.7;});
      for(let n=0;n<90;n++){
        const rise=(elapsed*.2+n/90*3.5)%3.5;
        smokePositions[n*3]=CENTERS[5][0]+.25+Math.sin(n*2.6+rise)*(.08+rise*.14)+rise*.18;
        smokePositions[n*3+1]=lava.position.y+rise;
        smokePositions[n*3+2]=CENTERS[5][1]-.3+Math.cos(n*3.1+rise)*(.1+rise*.1);
      }
      smokeGeometry.attributes.position.needsUpdate=true;
      if(weather.visible&&moving){for(let n=0;n<230;n++){snowPositions[n*3+1]-=delta*1.4;if(snowPositions[n*3+1]<0)snowPositions[n*3+1]=8;}weatherGeometry.attributes.position.needsUpdate=true;}
      migrants.forEach((bead,i)=>{if(bead.visible)bead.position.copy((bead.userData.curve as THREE.QuadraticBezierCurve3).getPoint((elapsed*.11+i*.17)%1));});
    }
    updateLabels();renderer.render(scene,camera);dirty=false;
  }
  frame=requestAnimationFrame(render);
  return {
    update(next,selection,stopped,active){state=next;selected=selection;paused=stopped;evolving=active;updateWorld();dirty=true;},
    reset,
    dispose(){
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
      media.removeEventListener("change",reducedChanged);document.removeEventListener("visibilitychange",visibilityChanged);
      renderer.domElement.removeEventListener("pointerdown",down);renderer.domElement.removeEventListener("pointerup",up);renderer.domElement.removeEventListener("webglcontextlost",contextLost);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
      scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.Points||object instanceof THREE.Line){geometries.add(object.geometry);(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>materials.add(material));}});
      geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());decorativeResources.forEach(resource=>resource.dispose());pathMaterials.forEach(material=>material.dispose());
      cloudMaterial.dispose();mistTexture.dispose();renderer.dispose();renderer.domElement.remove();scene.clear();
    },
  };
}
