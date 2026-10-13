import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {slides} from './deck-content.mjs';
const ROOT='/Users/Sotnikov/code/evolution-atlas';
const BUILD=path.join(ROOT,'.codex-build/evolution-talk');
const IMG=path.join(ROOT,'public/assets/images');
const C={bg:'#0C1718',paper:'#F4EAD8',gold:'#E2BB70',muted:'#B7C8C3',light:'#F2ECDD',ink:'#17342D'};
const A={
 river:'timeline-river-evolution-21-9.png',cells:'source-backed/generated-atlas/cell-lines.png',sapiens:'source-backed/generated-homo-sapiens.jpg',
 body:'traits/body-plan.png',movement:'traits/movement.png',social:'traits/brain-social.png',jaws:'source-backed/generated-atlas/jawed-fish.jpg',tiktaalik:'source-backed/generated-atlas/tiktaalik.jpg',
 cover:'game/cards/cover-v4.jpg',refuge:'game/cards/refuge-v4.jpg',mosaic:'game/cards/mosaic-v4.jpg',variation:'game/discoveries/variation-v5.jpg',bottleneck:'game/discoveries/bottleneck-v5.jpg',
 feathers:'dinosaurs/generated-branch/feathered-dinosaurs.jpg',archaeopteryx:'dinosaurs/generated-branch/archaeopteryx.jpg',birds:'dinosaurs/generated-branch/modern-birds.jpg',
 extinction:'extinctions/cretaceous-paleogene.jpg',theropod:'dinosaurs/generated-branch/theropods.jpg',shoebill:'dinosaurs/modern-birds.jpg',chimp:'source-backed/chimpanzees-branch.jpg',
 dna:'education/genetics-dna-generated.jpg',fossil:'source-backed/placentals.jpg',beagle:'game/darwin-beagle-v4.jpg',islands:'game/archipelago.jpg',
 tree:path.join(ROOT,'output/playwright/evolution-tree.png')
};
const p=Presentation.create({slideSize:{width:1280,height:720}});
const trace=[];
function text(s,str,x,y,w,h,size=56,color=C.paper,bold=true,align='left'){
 const o=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 o.text=str;o.text.style={typeface:'Trebuchet MS',fontSize:size,bold,color,insets:0,wrap:'none',autoFit:'none',alignment:align,verticalAlignment:'top'};return o;
}
async function img(s,key,x,y,w,h,fit='cover'){
 let f=A[key];if(!f)throw Error('asset '+key);if(!path.isAbsolute(f))f=path.join(IMG,f);
 const b=await fs.readFile(f);const e=path.extname(f).toLowerCase();
 s.images.add({blob:b,contentType:e==='.png'?'image/png':'image/jpeg',alt:key,fit,position:{left:x,top:y,width:w,height:h}});
 trace.at(-1).images.push({key,path:f});
}
function link(s,label,url,x=48,y=652,w=730,color=C.gold){
 const l=text(s,label+' ↗',x,y,w,34,23,color,false);l.text.get(label+' ↗').link={uri:'https://atlas.aidms.ru'+url,isExternal:true};
}
function footer(s,d,light=false){
 link(s,d.label,d.url,48,652,820,light?C.ink:C.gold);
 if(d.disclosure)text(s,d.disclosure,940,654,290,26,18,light?'#49655B':C.muted,false,'right');
}
function rect(s,x,y,w,h,fill){s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});}
for(let i=0;i<slides.length;i++){
 const d=slides[i],s=p.slides.add();s.background.fill=C.bg;
 trace.push({slide:i+1,id:d.id,title:d.title,time:d.time,images:[]});
 if(d.layout==='cover'){
  await img(s,d.asset,0,0,1280,720);text(s,d.title,62,68,890,230,84);text(s,d.subtitle,66,278,970,65,32,C.gold,false);footer(s,d);
 } else if(d.layout==='choices'){
  text(s,d.title,48,32,1184,88,60);text(s,d.subtitle,50,117,1150,48,30,C.gold,false);
  const choices=[['theropod','1. Теропод'],['shoebill','2. Птица'],['chimp','3. Шимпанзе'],['sapiens','4. Человек']];
  for(let j=0;j<4;j++){const x=48+j*303;await img(s,choices[j][0],x,193,278,369);text(s,choices[j][1],x,580,288,42,30);}
  footer(s,d);
 } else if(d.layout==='number'){
  text(s,d.title,48,38,1190,94,57);text(s,d.number,48,138,470,210,166,C.gold);text(s,d.unit,522,176,706,190,47);
  await img(s,d.asset,0,365,1280,268);footer(s,d);
 } else if(d.layout==='wide'){
  text(s,d.title,48,34,1184,93,56);await img(s,d.asset,0,147,1280,482);footer(s,d);
 } else if(d.layout==='anatomy'){
  await img(s,d.asset,650,0,590,637,'contain');text(s,d.title,48,136,640,340,59);footer(s,d);
 } else if(d.layout==='experiment'||d.layout==='experimentLight'){
  const light=d.layout==='experimentLight';if(light)s.background.fill=C.light;
  await img(s,d.asset,855,0,425,631);
  text(s,d.title,48,52,805,225,61,light?C.ink:C.paper);
  text(s,d.large,48,315,805,130,d.id==='generation2'?87:108,light?C.ink:C.gold);
  text(s,d.small,50,465,760,110,34,light?C.ink:C.paper,false);
  footer(s,d,light);
 } else if(d.layout==='quiz'){
  await img(s,d.asset,670,0,610,720);rect(s,0,0,670,720,C.bg);
  text(s,'Верно или нет?',48,59,594,70,34,C.gold,false);
  text(s,d.title,48,193,600,400,56);footer(s,d);
 } else if(d.layout==='tree'){
  text(s,d.title,48,62,700,220,58);await img(s,d.asset,48,302,1184,322,'contain');footer(s,d);
 } else if(d.layout==='evidence'){
  text(s,d.title,48,37,1184,88,53);
  await img(s,'fossil',48,158,568,390,'contain');await img(s,'dna',648,158,584,390,'cover');
  text(s,'Ископаемые',48,573,560,50,34);text(s,'ДНК',650,573,560,50,34);footer(s,d);
 } else if(d.layout==='finish'){
  await img(s,d.asset,570,0,710,720);text(s,d.title,48,92,555,260,64);text(s,d.subtitle,50,387,530,70,33,C.gold,false);
  link(s,'Динозавры',d.url,48,560,490);link(s,'Карта тела','/body-map',48,604,490);link(s,'Игра','/game',48,648,490);
 } else {
  await img(s,d.asset,607,0,673,631,d.asset==='social'?'contain':'cover');
  text(s,d.title,48,104,560,405,61);footer(s,d);
 }
 const sources=trace.at(-1).images.map(a=>a.path.startsWith(IMG)?'https://atlas.aidms.ru/assets/images/'+path.relative(IMG,a.path):'https://atlas.aidms.ru/cladogram');
 s.speakerNotes.text=`СЛАЙД ${i+1}. ${d.time}\n${d.title.replaceAll('\n',' ')}\n\n${d.notes}\n\nПЕРЕХОД НА ПОРТАЛ: https://atlas.aidms.ru${d.url}\nИЗОБРАЖЕНИЯ С ПОРТАЛА:\n${sources.join('\n')}\nОснова: сценарий «Динозавр во дворе и древняя история внутри тебя».`;
 if(d.layout==='choices')s.speakerNotes.append('\nФото птицы и шимпанзе взяты из локальной библиотеки портала; древний теропод и ранний человек — художественные реконструкции. Фото шимпанзе: David Bruyere, CC BY-SA 2.0; https://commons.wikimedia.org/wiki/File:2006-12-09_Chipanzees_D_Bruyere.JPG');
 console.log('authored',i+1,d.id);
}
const draft=path.join(BUILD,'candidate.pptx');await(await PresentationFile.exportPptx(p)).save(draft);
await fs.writeFile(path.join(BUILD,'trace.json'),JSON.stringify(trace,null,2));
for(let i=0;i<p.slides.items.length;i++){
 const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(path.join(BUILD,'render',`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await b.arrayBuffer()));
 console.log('rendered',i+1);
}
console.log('COMPLETE',draft);
