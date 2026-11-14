import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {sampleCamera,clamp as progressClamp,mix as progressMix,reveal,shotProgress,shotImpact,pulse} from './sceneTimeline.js';
const C={grass:0x0b3b2a,white:0xc6f6dc,teal:0x37e5c2,gold:0xe4b75b,dark:0x06120e};
const L=(a,b,t)=>a+(b-a)*t;const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=x=>{let t=clamp(x);return t*t*(3-2*t)};
const range=(v,a,b)=>ease((v-a)/(b-a));
const material=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.58,metalness:.17,...opts});
function mesh(parent,geo,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);return o}
function line(parent,arr,color=0xc3ffe2,opacity=.72,width=1){
 const pts=arr.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
 const g=new THREE.BufferGeometry().setFromPoints(pts);
 const m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
 const o=new THREE.Line(g,m);parent.add(o);return o;
}
function rect(parent,x1,z1,x2,z2,y=.06,col=C.white,alpha=.7){
 return line(parent,[[x1,y,z1],[x2,y,z1],[x2,y,z2],[x1,y,z2],[x1,y,z1]],col,alpha);
}
function ring(parent,x,z,rx,rz,y=.07,color=C.white,opacity=.55){
 const arr=[];for(let i=0;i<=80;i++){let a=i/80*Math.PI*2;arr.push([x+Math.cos(a)*rx,y,z+Math.sin(a)*rz])}
 return line(parent,arr,color,opacity);
}
function stadium(scene,isMobile){
 const pitch=new THREE.Group();scene.add(pitch);
 const grass=mesh(pitch,new THREE.BoxGeometry(19,.22,27),material(C.grass,{roughness:1}),0,-.17,0);
 for(let i=0;i<12;i++){
  const z=-13.5+(i+.5)*27/12;
  const stripe=mesh(pitch,new THREE.BoxGeometry(19,.009,27/12),new THREE.MeshBasicMaterial({color:i%2?0x124e35:0x15593d,transparent:true,opacity:.34}),0,-.045,z);
 }
 rect(pitch,-9.5,-13.5,9.5,13.5);
 line(pitch,[[-9.5,.07,0],[9.5,.07,0]]);
 ring(pitch,0,0,2.15,2.15);
 rect(pitch,-5.35,-13.5,5.35,-8.1);rect(pitch,-2.8,-13.5,2.8,-11.25);
 rect(pitch,-5.35,13.5,5.35,8.1);rect(pitch,-2.8,13.5,2.8,11.25);
 for(const z of [-9.35,9.35])mesh(pitch,new THREE.SphereGeometry(.12,10,8),new THREE.MeshBasicMaterial({color:0xe4ffff}),0,.08,z);
 const goalMat=new THREE.MeshStandardMaterial({color:0xeaffec,metalness:.8,roughness:.2,emissive:0x6effac,emissiveIntensity:.23});
 for(const sign of [-1,1]){
  const gz=sign*13.56;
  for(const x of [-3.1,3.1])mesh(pitch,new THREE.CylinderGeometry(.095,.095,2.1,10),goalMat,x,1.07,gz);
  const bar=mesh(pitch,new THREE.CylinderGeometry(.09,.09,6.4,10),goalMat,0,2.12,gz);bar.rotation.z=Math.PI/2;
  const back=sign*(13.56+1.1);
  for(const x of [-3.1,3.1])line(pitch,[[x,2.12,gz],[x,1.7,back],[x,.14,back]],0xa3ffdc,.45);
  for(let x=-3.1;x<=3.1;x+=.55)line(pitch,[[x,2.1,gz],[x,1.7,back]],0xa6e6d5,.16);
  for(let y=.25;y<=1.9;y+=.28)line(pitch,[[-3.1,y,back],[3.1,y,back]],0xa6e6d5,.13);
 }
 const trim=material(0x09271f,{metalness:.27,roughness:.8});
 // The layered edges and rows create architectural scale without large models.
 for(let i=0;i<5;i++){
   let x=10.6+i*1.04;
   for(const sign of [-1,1]){
    mesh(scene,new THREE.BoxGeometry(.95,.35+i*.26,37+i*1.9),trim,sign*x,-.26+i*.08,0);
   }
 }
 for(let i=0;i<3;i++){
   let z=15.25+i*1.4;
   for(const sign of [-1,1])mesh(scene,new THREE.BoxGeometry(25+i*3,.45+i*.19,.85),material(i%2?0x0c382a:0x103e30),0,-.13+i*.05,sign*z);
 }
 const borderMat=new THREE.MeshBasicMaterial({color:0xc1e875});
 for(let sign of [-1,1])for(let z=-12;z<=12;z+=3.3){
  const board=mesh(scene,new THREE.BoxGeometry(.12,.55,2.7),new THREE.MeshBasicMaterial({color:z%2?0x70a57a:0xc3bf70}),sign*10,.35,z);
 }
 // A small instanced crowd adds a distant stadium glow; it is reduced on phones.
 const num=isMobile?65:320,geom=new THREE.SphereGeometry(.035,5,4);
 const crowd=new THREE.InstancedMesh(geom,new THREE.MeshBasicMaterial({color:0xc2efc6}),num);
 const dummy=new THREE.Object3D(),color=new THREE.Color();
 for(let i=0;i<num;i++){
  const side=i%4,along=((i*47)%101)/101;
  let xx=side<2?(side===0?-12.5:12.5)+(i%5-2)*.18:(along-.5)*24;
  let zz=side<2?along*35-17.5:(side===2?-17.4:17.4)+(i%5-2)*.18;
  dummy.position.set(xx,.2+(i%4)*.16,zz);dummy.scale.setScalar(.6+(i%7)*.11);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);
  color.set(i%4===0?0xb1eeae:i%4===1?0x91c6a9:i%4===2?0xebc77b:0x4d987d);crowd.setColorAt(i,color);
 }
 crowd.instanceMatrix.needsUpdate=true;scene.add(crowd);
 return {pitch,goalMat};
}
function makePlayer(scene,{team,number,x,z,isKeeper=false}){
 const p=new THREE.Group();scene.add(p);
 const main=material(team==='teal'?0x9bd2bc:0xcbb88b,{roughness:.49});
 const skin=material(team==='teal'?0x94634e:0xb67c58);
 const short=material(0x152b23);
 const sock=material(team==='teal'?0x9bd2bc:0xcbb88b);
 const dark=new THREE.MeshBasicMaterial({color:0x05120c});
 const torso=mesh(p,new THREE.CylinderGeometry(.39,.29,.82,9),main,0,1.1,0);
 mesh(p,new THREE.SphereGeometry(.295,12,9),skin,0,1.81,0);
 mesh(p,new THREE.SphereGeometry(.308,12,7,0,Math.PI*2,0,Math.PI*.55),dark,0,1.88,0);
 for(const sign of [-1,1]){
  const arm=mesh(p,new THREE.CylinderGeometry(.12,.11,.67,7),skin,sign*.50,1.11,0);arm.rotation.z=sign*.34;
  const leg=mesh(p,new THREE.CylinderGeometry(.135,.11,.55,8),short,sign*.2,.5,0);
  mesh(p,new THREE.CylinderGeometry(.10,.11,.30,8),sock,sign*.2,.16,.04);
  mesh(p,new THREE.BoxGeometry(.21,.15,.37),dark,sign*.2,.075,.17);
 }
 const shadow=mesh(p,new THREE.CircleGeometry(.62,20),new THREE.MeshBasicMaterial({color:0x030c09,transparent:true,opacity:.45,depthWrite:false}),0,.017,0);
 shadow.rotation.x=-Math.PI/2;
 const select=mesh(p,new THREE.RingGeometry(.7,.81,48),new THREE.MeshBasicMaterial({color:0xdfffa2,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,.028,0);select.rotation.x=-Math.PI/2;
 const pin=mesh(p,new THREE.ConeGeometry(.24,.55,6),new THREE.MeshBasicMaterial({color:0xe5ff87,transparent:true,opacity:0}),0,2.82,0);pin.rotation.z=Math.PI;
 p.position.set(x,0,z);
 p.userData={main,select,pin,team,number,baseX:x,baseZ:z,torso};return p;
}
function makeBall(scene){
 const b=new THREE.Group();scene.add(b);
 const mat=new THREE.MeshStandardMaterial({color:0xf7faed,roughness:.32,metalness:.08});
 mesh(b,new THREE.SphereGeometry(.43,24,18),mat);
 const patches=new THREE.MeshBasicMaterial({color:0x12352b});
 const axes=[[0,1,0],[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[.66,.5,.6],[-.66,.5,-.6]];
 for(const a of axes){
  const dir=new THREE.Vector3(...a).normalize();
  const disk=mesh(b,new THREE.CircleGeometry(.195,5),patches,...dir.clone().multiplyScalar(.426).toArray());
  disk.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);
 }
 return b;
}
function makePawn(scene){
 const profile=[[0,0],[.55,0],[.61,.08],[.42,.16],[.38,.26],[.24,.4],[.22,.55],[.13,.86],[.29,1.03],[.31,1.15],[.22,1.29],[0,1.29]];
 const points=profile.map(([r,y])=>new THREE.Vector2(r,y));
 const m=new THREE.Mesh(new THREE.LatheGeometry(points,24),material(0xdfe8ca,{metalness:.52,roughness:.2,transparent:true,opacity:1}));
 const group=new THREE.Group();group.add(m);scene.add(group);return {group,mat:m.material};
}
function makeEffects(scene){
 const node=new THREE.Group();scene.add(node);
 const route=mesh(node,new THREE.TorusGeometry(1,.037,7,85),new THREE.MeshBasicMaterial({color:0xbfff88,transparent:true,opacity:0,depthWrite:false}),0,.16,0);
 route.rotation.x=-Math.PI/2;
 const target=mesh(node,new THREE.RingGeometry(.85,1.1,48),new THREE.MeshBasicMaterial({color:0xeecb78,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,.1,0);target.rotation.x=-Math.PI/2;
 const trajectory=line(node,[[-3,.55,3],[-1,1.4,0],[1,1.75,-4],[0,1.05,-10]],0xe8ff8a,0);
 const goalFlash=new THREE.PointLight(0xc8ff95,0,16);scene.add(goalFlash);goalFlash.position.set(0,2.2,-13.4);
 const glow=mesh(node,new THREE.PlaneGeometry(7,4),new THREE.MeshBasicMaterial({color:0xc9ff75,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,2,-13.35);
 return {node,route,target,trajectory,goalFlash,glow};
}
function atmosphere(scene,mobile){
 const count=mobile?36:110;const positions=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  positions[i*3]=(Math.sin(i*26.64)*.5+.5)*32-16;
  positions[i*3+1]=2+(Math.sin(i*45.19)*.5+.5)*19;
  positions[i*3+2]=(Math.sin(i*13.71)*.5+.5)*39-19.5;
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.PointsMaterial({color:0xece3b9,size:mobile?.05:.095,transparent:true,opacity:.34,depthWrite:false,blending:THREE.AdditiveBlending});
 const particles=new THREE.Points(geometry,material);scene.add(particles);
 return particles;
}
function trophy(scene){
 const group=new THREE.Group();scene.add(group);
 const gold=new THREE.MeshStandardMaterial({color:0xc8a96e,metalness:.75,roughness:.2,transparent:true,opacity:0});
 const pedestal=new THREE.MeshStandardMaterial({color:0x122d22,roughness:.32,metalness:.45,transparent:true,opacity:0});
 mesh(group,new THREE.CylinderGeometry(.62,.77,.25,24),pedestal,0,.15,0);
 mesh(group,new THREE.CylinderGeometry(.4,.5,.7,24),pedestal,0,.59,0);
 mesh(group,new THREE.CylinderGeometry(.6,.35,.2,24),gold,0,1.02,0);
 const bowl=mesh(group,new THREE.SphereGeometry(.91,22,16,0,Math.PI*2,0,Math.PI*.60),gold,0,2.05,0);
 mesh(group,new THREE.CylinderGeometry(.15,.31,.8,20),gold,0,1.4,0);
 for(const sign of [-1,1]){
  const handle=mesh(group,new THREE.TorusGeometry(.57,.085,10,32,Math.PI*1.24),gold,sign*.79,2.05,0);
  handle.rotation.z=sign*Math.PI*.58;
 }
 group.position.set(0,0,-.6);
 return {group,gold,pedestal};
}
function tacticalArcs(scene){
 const group=new THREE.Group();scene.add(group);
 const ribbons=[];
 for(let i=0;i<3;i++){
  const x=i===0?-5:i===1?0:5;
  const curve=new THREE.QuadraticBezierCurve3(
   new THREE.Vector3(x,.18,8),
   new THREE.Vector3(x*.5,2.8-i*.4,-.5),
   new THREE.Vector3(x*.7,.18,-8)
  );
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)),new THREE.LineBasicMaterial({color:i===1?0xc1ddb7:0xe2d3a4,transparent:true,opacity:0,depthWrite:false}));
  group.add(line);ribbons.push(line);
 }
 return {group,ribbons};
}
const initial=[
 [-4,7],[-1,6],[3,6],[-5,2],[-1,1.4],[3,1.5],[-3,10],[4,10], // gold
 [-5,-7],[-1,-7],[4,-6],[-5,-2],[0,-2],[4,-2],[-3,-10],[4,-10] // teal
];
function animateWorld(p,time,items,mobile,reduced){
 const {players,ball,pawn,effects,cam,renderer,particles,award,arcs,pitch}=items;
 const k=sampleCamera(p,mobile);
 // Interpolate the camera only (never the underlying play timeline).
 const t=reduced?1:mobile?.17:.12;
 cam.position.lerp(items.cameraPosition.set(...k.pos),t);
 items.look.lerp(items.cameraTarget.set(...k.at),t);
 if(!reduced){
   const breathing=.022*Math.sin(time*.00062);
   cam.position.y+=breathing;
 }
 cam.lookAt(items.look);
 // Hero: the isolated football enters view while the chess-inspired pawn recedes.
 const hero=1-reveal(p,.23,.96);
 pawn.group.visible=hero>.004;
 pawn.group.position.set(mobile?-1.15:0,2.1,8);
 pawn.group.rotation.y=reduced?p*.32:time*.00012;
 pawn.group.scale.setScalar(.75*hero);
 pawn.mat.opacity=hero*.84;
 // Pitch is unveiled in unison with the first camera pullback.
 const pitchIn=reveal(p,.26,.95);
 for(const pl of players){
   pl.visible=p>.28;
   const opacity=pl.userData.select.material;
   opacity.opacity=0;
 }
 // Real ball positions map directly to scroll so reversing works.
 if(p<1.95){
  const t=reveal(p,.05,.65);
  ball.position.set(L(0,-4,t),L(mobile?2.65:3.2,.56,t),L(8,5,t));
 }else if(p<2.7){
  const t=reveal(p,1.96,2.55);
  ball.position.set(L(-4,-1,t),.54+Math.sin(t*Math.PI)*1.2,L(5,-3,t));
 }else if(p<3.75){
  const q=shotProgress(p);
  ball.position.set(L(-1,.5,q),.53+Math.sin(q*Math.PI)*2.05,L(-3,-13.4,q));
 }else{
  ball.position.set(0,.52,L(-13.4,-10,reveal(p,3.8,4.8)));
 }
 const size=reveal(p,.15,.85);
 ball.scale.setScalar(L(mobile?1.82:2.25,.83,size));
 const ballRotation=p*2.4;
 ball.rotation.set(ballRotation*.55,ballRotation*.35,ballRotation);
 for(let i=0;i<players.length;i++){
  const pl=players[i],u=pl.userData;
  const formation=reveal(p,4.53,5.45);
  const targetX=u.baseX+(i%4-1.5)*formation*.72;
  const targetZ=u.baseZ+(i%3-1)*formation*1.25;
  pl.position.x=targetX;pl.position.z=targetZ;
  const selected=pulse(p,1.15,1.57,1.99,2.42)*(i===3?1:0);
  u.select.material.opacity=selected*.82;
  u.pin.material.opacity=selected;
  u.pin.position.y=2.78+(reduced?0:Math.sin(time*.0025)*.055);
  const kit=reveal(p,3.63,4.43);
  if(u.team==='gold')u.main.color.setRGB(L(.80,.17,kit),L(.71,.46,kit),L(.55,.36,kit));
  pl.rotation.y=(i%3-.7)*reveal(p,3.6,4.42);
  const kitZoom=(i===3?pulse(p,3.72,4.07,4.50,4.86):0);
  pl.scale.setScalar(1+kitZoom*.38);
 }
 const route=pulse(p,1.54,1.94,2.38,2.72);
 effects.route.material.opacity=route*.8;
 effects.route.position.set(-5,.11,2);
 effects.route.scale.setScalar(1+(reduced?0:Math.sin(time*.002)*.09));
 effects.target.material.opacity=pulse(p,2.67,3.04,3.37,3.76)*.9;
 effects.target.position.set(0,.12,-11);
 effects.trajectory.material.opacity=pulse(p,2.67,3.1,3.35,3.79)*.8;
 const impact=shotImpact(p);
 effects.goalFlash.intensity=impact*(mobile?13:20);
 effects.glow.material.opacity=impact*.28;
 // Reacting goal net + gold particles at the scoring moment.
 effects.glow.scale.z=1+impact*.8;
 particles.material.opacity=mobile?.14:.26;
 arcs.ribbons.forEach((r,i)=>{r.material.opacity=pulse(p,4.75,5.12,5.6,5.92)*(.30+i*.11)});
 const prize=reveal(p,5.47,5.98);
 award.group.visible=prize>.006;
 award.group.position.y=prize*.55;
 award.group.rotation.y=p*.17+(reduced?0:time*.00013);
 award.group.scale.setScalar(prize*(mobile?.89:1.14));
 award.gold.opacity=prize;
 award.pedestal.opacity=prize;
 renderer.toneMappingExposure=mobile?1.23:1.35;
}
export default function Scene3D({progressRef,reducedMotion,onUnavailable}){
 const container=useRef(null);
 const values=useRef({reducedMotion,onUnavailable});
 values.current={reducedMotion,onUnavailable};
 useEffect(()=>{
  const host=container.current;if(!host)return;
  const mobile=window.innerWidth<760||navigator.hardwareConcurrency<=4;
  const veryLowEnd=window.innerWidth<400&&(navigator.deviceMemory||4)<=2;
  let renderer,scene,cam,raf=0,observer,resizeObserver,disposed=false,active=true;
  try{renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:'default',stencil:false});}
  catch(err){values.current.onUnavailable?.();return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,veryLowEnd?1:mobile?1.35:1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
  renderer.setClearColor(0x071611,1);host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  scene=new THREE.Scene();scene.background=new THREE.Color(0x071611);scene.fog=new THREE.FogExp2(0x071611,.020);
  cam=new THREE.PerspectiveCamera(mobile?57:47,1,.1,120);
  const hemisphere=new THREE.HemisphereLight(0xcfffe6,0x032118,2.3);scene.add(hemisphere);
  const directional=new THREE.DirectionalLight(0xffe0a2,3.15);directional.position.set(-9,19,12);scene.add(directional);
  const fill=new THREE.PointLight(0x4fdbc0,35,37);fill.position.set(9,11,-9);scene.add(fill);
  const glow=new THREE.PointLight(0xeacb83,20,26);glow.position.set(-9,7,12);scene.add(glow);
  stadium(scene,mobile);
  const players=initial.map(([x,z],i)=>makePlayer(scene,{team:i<8?'gold':'teal',number:i%8+1,x,z,isKeeper:i===7||i===15}));
  const ball=makeBall(scene),pawn=makePawn(scene),effects=makeEffects(scene);
  const particles=atmosphere(scene,mobile),award=trophy(scene),arcs=tacticalArcs(scene);
  const state={players,ball,pawn,effects,cam,renderer,particles,award,arcs,look:new THREE.Vector3(0,2,8),cameraPosition:new THREE.Vector3(),cameraTarget:new THREE.Vector3()};
  function resize(){
   if(disposed)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
   renderer.setSize(w,h,false);
   cam.aspect=w/h;cam.fov=w<650?47:44;cam.updateProjectionMatrix();
  }
  resize();resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  observer=new IntersectionObserver(([e])=>{active=e.isIntersecting},{rootMargin:'100px'});observer.observe(host);
  let previous=0;let rafBudget=mobile&&veryLowEnd?40:mobile?17:15;
  function animate(now){
   if(disposed)return;
   raf=requestAnimationFrame(animate);
   if(!active||document.hidden)return;
   if(now-previous<rafBudget)return;previous=now;
   const p=clamp(progressRef.current,0,6);
   animateWorld(p,now,state,mobile,values.current.reducedMotion);
   renderer.render(scene,cam);
  }
  raf=requestAnimationFrame(animate);
  return ()=>{
   disposed=true;cancelAnimationFrame(raf);observer?.disconnect();resizeObserver?.disconnect();
   scene.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});
   renderer.dispose();renderer.domElement.remove();
  };
 },[progressRef]);
 return <div ref={container} className="three-host" aria-hidden="true"/>;
}
