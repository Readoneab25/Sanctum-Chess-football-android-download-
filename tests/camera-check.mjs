import assert from 'node:assert/strict';
import {sampleCamera,shotProgress,shotImpact,reveal,portraitCameras,landscapeCameras} from '../src/sceneTimeline.js';
for (const mobile of [true,false]) {
 for (let n=0;n<=60;n++) {
  const p=n/10, a=sampleCamera(p,mobile), b=sampleCamera(p,mobile);
  assert.deepEqual(a,b,'camera is a pure function of scroll position');
  assert.equal(a.pos.length,3);
  assert.ok(a.pos.every(Number.isFinite));
  assert.ok(a.at.every(Number.isFinite));
  if(n>0&&n<60) {
   const earlier=sampleCamera(p-.001,mobile);
   assert.ok(Math.hypot(...a.pos.map((v,i)=>v-earlier.pos[i]))<.09,'camera movement continuous');
  }
 }
}
assert.ok(portraitCameras.every(v=>Math.abs(v.pos[0])<=2.1),'portrait camera never flies horizontally across pitch');
assert.ok(landscapeCameras.some(v=>v.pos[0]>10),'desktop can make wider cinematic orbits');
assert.ok(shotProgress(2.8)<shotProgress(3.3),'shot advances forward');
assert.equal(shotProgress(2.8),shotProgress(2.8),'shot rewinds deterministically');
assert.equal(shotImpact(0),0);
assert.equal(shotImpact(6),0);
assert.ok(shotImpact(3.55)>.6,'goal hit creates an impact highlight');
assert.equal(reveal(.2,.3,.9),0);
console.log('PASS deterministic reversible camera, portrait framing and shot timeline');
