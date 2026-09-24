// Generates the Stage 39 pixel-art inventory and construction icons.
const fs=require('fs'),path=require('path');
const {Img,shade,hash}=require('./pixel');
const root=path.join(__dirname,'..');
const items={
 seed_carrot:'#b97b45',seed_pumpkin:'#b78245',seed_cabbage:'#728b56',seed_onion:'#9d8760',seed_strawberry:'#a45156',
 carrot:'#bd7440',pumpkin:'#ad7136',cabbage:'#758f57',onion:'#a38b64',strawberry:'#ad4b50',vegetable_preserve:'#8b8552',expedition_meal:'#7f7653',herbal_tea:'#7b8f62',
 glass_jar:'#9aaca8',pipe:'#6d7878',valve:'#7b7160',water_filter:'#748985',sprinkler_head:'#6d8588',fuse:'#ad9b67',solar_cell:'#506c78',motion_sensor:'#688083',power_timer:'#7c806c',power_controller:'#49666d',pump_parts:'#617579',grow_lamp:'#8a7192'
};
const seeds=new Set(Object.keys(items).filter(x=>x.startsWith('seed_'))),produce=new Set(['carrot','pumpkin','cabbage','onion','strawberry']);
function itemIcon(id,color){const img=new Img(32,32);
 if(seeds.has(id)){img.rect(7,8,18,18,'#8b7655');img.hline(7,8,18,'#b49b70');img.rect(10,12,12,8,shade(color,.05));for(let i=0;i<7;i++)img.ellipse(10+Math.floor(hash(i,4,1)*12),14+Math.floor(hash(i,8,2)*7),1.3,1,color);}
 else if(produce.has(id)){if(id==='carrot'){img.rect(14,9,6,18,color);img.rect(12,10,10,6,shade(color,.2));img.line(16,9,11,3,'#638054');img.line(18,9,22,3,'#638054');}else{img.ellipse(16,18,id==='pumpkin'?11:9,id==='pumpkin'?9:8,color);img.rect(14,6,4,6,'#5d744b');if(id==='pumpkin')for(let x=9;x<25;x+=5)img.vline(x,12,13,shade(color,-.18));if(id==='strawberry'){for(let i=0;i<8;i++)img.set(10+(i*7)%13,14+(i*5)%10,'#e3bd75');}}}
 else if(id==='solar_cell'){img.rect(4,7,24,18,color);for(let x=5;x<28;x+=6)img.vline(x,8,16,'#8dafb5');for(let y=8;y<25;y+=5)img.hline(5,y,22,'#8dafb5');}
 else if(id==='pipe'){img.rect(5,13,22,7,color);img.rect(4,11,6,11,shade(color,.18));img.rect(23,11,5,11,shade(color,-.18));}
 else if(id==='valve'){img.rect(14,8,4,20,color);img.ellipseOutline(16,10,9,6,shade(color,.25));img.hline(7,9,18,shade(color,.15));}
 else if(id==='glass_jar'||id==='vegetable_preserve'){img.rect(9,8,14,20,id==='glass_jar'?'#9aaca880':'#82905e');img.rect(8,6,16,4,'#717775');img.hline(11,11,10,shade(color,.25));}
 else if(id==='herbal_tea'){img.rect(8,8,14,20,'#91aaa488');img.rect(10,14,10,12,color);img.rect(22,12,5,11,'#778985');}
 else if(id==='expedition_meal'){img.rect(5,10,22,16,color);img.hline(5,10,22,shade(color,.25));img.rect(10,14,12,7,'#b3a774');}
 else{img.rect(6,8,20,18,color);img.hline(6,8,20,shade(color,.3));img.hline(6,25,20,shade(color,-.3));img.rect(10,12,12,8,shade(color,-.15));img.set(14,15,'#d5c87c');img.set(18,15,'#d5c87c');}
 img.volume(.12);img.contour([12,15,16,230]);return img;}
const builds={distribution_box:'#667274',battery_bank:'#59686b',solar_array:'#4b6874',motion_floodlight:'#c0a567',grow_light_station:'#8a7192',water_reservoir:'#55717a',electric_pump:'#5c7174',sprinkler:'#668284',compost_bin:'#665a3f',pantry:'#765f45',cold_room:'#63777a',seed_storage:'#6f6048',porch_floor:'#806043',support_pillar:'#73543b',roof_gutter:'#677072'};
function buildIcon(id,color){const img=new Img(48,48);
 if(id==='solar_array'){img.rect(3,12,42,25,color);for(let x=4;x<45;x+=10)img.vline(x,13,23,'#80a1a8');for(let y=13;y<37;y+=8)img.hline(4,y,40,'#80a1a8');img.rect(21,37,6,9,'#545e5f');}
 else if(id==='water_reservoir'){img.rect(8,5,32,38,color);img.rect(11,8,26,32,'#6f8990');img.rect(12,24,24,15,'#4d8297');}
 else if(id==='sprinkler'||id==='motion_floodlight'||id==='support_pillar'){img.rect(21,9,6,35,color);img.rect(10,8,28,6,shade(color,.2));if(id==='sprinkler'){img.line(13,8,4,3,'#81a8ac');img.line(35,8,44,3,'#81a8ac');}}
 else if(id==='roof_gutter'||id==='porch_floor'){img.rect(3,20,42,9,color);img.hline(3,20,42,shade(color,.25));for(let x=7;x<45;x+=9)img.vline(x,21,7,shade(color,-.18));}
 else{img.rect(5,10,38,32,color);img.hline(5,10,38,shade(color,.28));img.hline(5,41,38,shade(color,-.3));img.rect(10,15,28,20,shade(color,-.12));if(['battery_bank','distribution_box','electric_pump','grow_light_station','cold_room'].includes(id)){img.rect(12,17,5,5,'#83a274');img.rect(21,17,5,5,'#b1965c');}}
 img.volume(.1);img.contour([12,15,16,230]);return img;}
fs.mkdirSync(path.join(root,'assets/items'),{recursive:true});fs.mkdirSync(path.join(root,'assets/build'),{recursive:true});
for(const [id,c] of Object.entries(items))itemIcon(id,c).save(path.join(root,'assets/items',`${id}.png`),16);
for(const [id,c] of Object.entries(builds))buildIcon(id,c).save(path.join(root,'assets/build',`${id}.png`),16);
console.log(`Stage 39 assets: ${Object.keys(items).length} items, ${Object.keys(builds).length} builds`);
