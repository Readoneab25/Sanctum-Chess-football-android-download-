import assert from 'node:assert/strict';import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const release=JSON.parse(fs.readFileSync('public/release.json','utf8'));const app=fs.readFileSync('src/App.jsx','utf8');const scene=fs.readFileSync('src/Scene3D.jsx','utf8');const css=fs.readFileSync('src/style.css','utf8');
assert.ok(pkg.dependencies.three&&pkg.dependencies.gsap&&pkg.dependencies.react);
assert.equal(release.apkUrl,'/base.apk');assert.match(release.sha256,/^[0-9a-f]{64}$/);
assert.ok(!app.includes('https://sanctum-chess-football.pages.dev/'));assert.ok(!app.includes('PLAY NOW'));assert.ok(app.includes('/assets/game-logo.svg'));assert.ok(app.includes('mobile data or Wi-Fi'));assert.ok(app.includes('App size: 195 KB'));assert.ok(app.includes('https://wa.me/2349138907913'));assert.ok(app.includes('prefers-reduced-motion'));assert.ok(app.includes('ScrollTrigger'));
assert.ok(scene.includes('WebGLRenderer'));assert.ok(scene.includes('PerspectiveCamera'));assert.ok(scene.includes('InstancedMesh'));assert.ok(css.includes('@media'));assert.ok(css.includes(':focus-visible'));
console.log('PASS: framework, conversion links, accessibility, WebGL scene, and APK metadata');
