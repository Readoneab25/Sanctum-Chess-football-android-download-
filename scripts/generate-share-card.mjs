import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const base=process.cwd();
const logo=fs.readFileSync(path.join(base,'public/assets/game-logo.svg'),'utf8')
  .replace(/<svg\b[^>]*>/, '<svg x="79" y="94" width="440" height="440" viewBox="0 0 512 512">');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="b" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#0f2c22"/><stop offset=".58" stop-color="#071811"/><stop offset="1" stop-color="#030d09"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop stop-color="#2b7650" stop-opacity=".35"/><stop offset="1" stop-color="#17402b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#b)"/>
  <circle cx="370" cy="315" r="440" fill="url(#glow)"/>
  <g fill="none" stroke="#72a889" opacity=".17">
    <rect x="25" y="25" width="1150" height="580" rx="21"/>
    <path d="M53 572H1147 M53 58H1147"/>
    <circle cx="1060" cy="96" r="110"/>
  </g>
  ${logo}
  <path d="M587 151h54" stroke="#a0d3ad" stroke-width="5"/>
  <text x="586" y="206" fill="#9ed1ad" font-size="24" font-weight="700" font-family="Arial,sans-serif" letter-spacing="4">THE ANDROID EDITION</text>
  <text x="582" y="304" fill="#f6f9ed" font-size="76" font-weight="900" font-family="Arial,sans-serif">SANCTUM</text>
  <text x="582" y="380" fill="#f6f9ed" font-size="66" font-weight="900" font-family="Arial,sans-serif">CHESS</text>
  <text x="582" y="456" fill="#f6f9ed" font-size="66" font-weight="900" font-family="Arial,sans-serif">FOOTBALL</text>
  <path d="M590 490h480" stroke="#8aab92" stroke-opacity=".5"/>
  <text x="589" y="535" fill="#d8b773" font-size="25" font-weight="700" font-family="Arial,sans-serif" letter-spacing="3">FOOTBALL. THINKING. GLORY.</text>
</svg>`;
const png=new Resvg(svg,{fitTo:{mode:'width',value:1200}}).render().asPng();
const out=path.join(base,'public/assets/share-card.png');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,png);
if(png.readUInt32BE(16)!==1200||png.readUInt32BE(20)!==630)throw new Error('Incorrect social preview dimensions');
console.log('Generated official-logo social image: '+out+' ('+png.length+' bytes)');
