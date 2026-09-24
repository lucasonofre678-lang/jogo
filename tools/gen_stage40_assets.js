// Pixel-art icons for Stage 40.
const fs=require('fs'),path=require('path');const {Img,shade}=require('./pixel');const root=path.join(__dirname,'..');
const items={blueberry:'#52658c',edible_mushroom:'#9b8b70',mint:'#6d9b72',plant_fiber:'#829361',tree_resin:'#a47d47',fertile_soil:'#62503c',clay:'#8e6955',muddy_water:'#78806a',wet_wood:'#65705b',treated_wood:'#806448',honey:'#c49b45'};
function item(id,c){const a=new Img(32,32);if(id==='blueberry'){for(const [x,y]of[[10,15],[17,12],[21,19],[14,22]])a.ellipse(x,y,5,5,c);a.line(16,10,19,5,'#668052');}
else if(id==='edible_mushroom'){a.rect(14,15,5,13,'#c1ad8a');a.ellipse(16,14,10,7,c);a.hline(9,13,15,shade(c,.18));}
else if(id==='mint'){a.line(16,27,16,6,'#526f50');for(const [x,y]of[[11,10],[20,13],[11,17],[20,21]])a.ellipse(x,y,6,3,c);}
else if(id==='honey'||id==='tree_resin'){a.rect(9,8,14,20,'#8d7858');a.rect(8,6,16,4,'#626966');a.rect(11,12,10,12,c);}
else if(id==='muddy_water'){a.rect(9,6,14,22,'#829493aa');a.rect(11,13,10,13,c);a.rect(8,5,16,4,'#5e6866');}
else if(id.includes('wood')){a.rect(5,10,23,13,c);a.ellipseOutline(6,16,4,7,shade(c,.25));a.hline(8,13,18,shade(c,.16));}
else{a.rect(6,10,20,16,c);a.hline(6,10,20,shade(c,.25));a.hline(6,25,20,shade(c,-.25));for(let i=0;i<7;i++)a.set(9+(i*5)%14,14+(i*3)%8,shade(c,.18));}a.volume(.1);a.contour([12,15,16,230]);return a;}
const builds={watermill:'#65745e',apiary:'#9b7b43',wood_dryer:'#705b43',reinforced_greenhouse:'#668378',swamp_walkway:'#786249',lookout_tower:'#6e5b45',rain_cistern:'#65787a',crop_scarecrow:'#8a744f'};
function build(id,c){const a=new Img(48,48);if(id==='watermill'){a.rect(3,17,25,28,c);a.ellipseOutline(34,27,12,12,'#96a58d');for(let i=0;i<8;i++){const q=i*Math.PI/4;a.line(34,27,34+Math.round(Math.cos(q)*11),27+Math.round(Math.sin(q)*11),'#96a58d');}}
else if(id==='reinforced_greenhouse'){a.rect(4,19,40,25,'#6f978f88');a.line(4,19,15,7,c);a.line(44,19,33,7,c);a.hline(15,7,19,c);for(let x=8;x<45;x+=9)a.vline(x,18,26,shade(c,.2));}
else if(id==='lookout_tower'||id==='crop_scarecrow'){a.rect(21,8,6,38,c);a.rect(8,9,32,6,shade(c,.2));if(id==='lookout_tower'){a.rect(10,4,28,16,c);a.line(14,20,7,46,c);a.line(34,20,41,46,c);}}
else if(id==='rain_cistern'){a.rect(8,6,32,39,c);a.ellipse(24,7,16,4,shade(c,.18));a.rect(11,28,26,14,'#4f8193');}
else if(id==='swamp_walkway'){a.rect(3,21,42,11,c);for(let x=6;x<45;x+=9)a.vline(x,22,9,shade(c,-.2));a.rect(7,32,5,13,c);a.rect(36,32,5,13,c);}
else{a.rect(5,12,38,32,c);a.hline(5,12,38,shade(c,.25));for(let y=18;y<42;y+=7)a.hline(8,y,32,shade(c,-.14));}a.volume(.09);a.contour([12,15,16,230]);return a;}
fs.mkdirSync(path.join(root,'assets/items'),{recursive:true});fs.mkdirSync(path.join(root,'assets/build'),{recursive:true});for(const[id,c]of Object.entries(items))item(id,c).save(path.join(root,'assets/items',id+'.png'),16);for(const[id,c]of Object.entries(builds))build(id,c).save(path.join(root,'assets/build',id+'.png'),16);console.log(`Stage 40 assets: ${Object.keys(items).length} items, ${Object.keys(builds).length} builds`);
