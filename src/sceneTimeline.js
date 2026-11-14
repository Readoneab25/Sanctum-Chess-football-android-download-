// All major motion is a deterministic function of scroll progress.
// This is deliberately reversible: the camera never advances independently of scrolling.
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
export const reveal=(p,a,b)=>ease((p-a)/(b-a));
export const pulse=(p,a,b,c,d)=>reveal(p,a,b)*(1-reveal(p,c,d));
export const heroFocus=p=>1-reveal(p,.43,.96);
export const shotProgress=p=>reveal(p,2.68,3.42);
export const shotImpact=p=>pulse(p,3.28,3.48,3.68,3.98);

// A dedicated portrait camera language: limited horizontal drift, coherent pushes,
// and focus changes matching each text reveal. Desktop can take wider hero angles.
export const portraitCameras=[
 {pos:[1.3,4.2,13.3],at:[0,2.65,8]}, // hero: football holds frame
 {pos:[2.1,19.5,25.7],at:[0,.15,0]}, // concept: reveal full pitch
 {pos:[-1.6,5.9,9.7],at:[-4,1,2]}, // player: reveal space
 {pos:[.9,6.1,7.6],at:[0,1,-5]}, // pass and shot: follow ball
 {pos:[-1.1,4.5,6.7],at:[-4.5,1.1,2]}, // kit: close focus
 {pos:[1.9,21,22],at:[0,.1,0]}, // formation: overhead reveal
 {pos:[.4,17.6,26],at:[0,1,-4]} // finale: trophy and field
];
export const landscapeCameras=[
 {pos:[5.8,5.7,16],at:[0,2.15,8]},
 {pos:[17,19,23],at:[0,.15,0]},
 {pos:[7,7.7,13.5],at:[-4,1,2]},
 {pos:[7.7,9.5,15],at:[0,1,-5]},
 {pos:[4.9,5.6,9],at:[-4.5,1,2]},
 {pos:[16,19,17],at:[0,.1,0]},
 {pos:[3.8,18,23],at:[0,1,-4]}
];
export function sampleCamera(progress,mobile=false){
 const table=mobile?portraitCameras:landscapeCameras;
 const p=clamp(progress,0,6),i=Math.min(5,Math.floor(p)),t=ease(p-i);
 const a=table[i],b=table[i+1];
 return {pos:a.pos.map((v,j)=>mix(v,b.pos[j],t)),at:a.at.map((v,j)=>mix(v,b.at[j],t))};
}
