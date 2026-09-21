from PIL import Image, ImageDraw
from pathlib import Path
import random, math

ROOT=Path(__file__).resolve().parents[1]/'assets'
random.seed(17)

def save(im,p):
    p.parent.mkdir(parents=True,exist_ok=True)
    im.save(p)

def ore_tile(name, base_path, flecks, seed):
    base=Image.open(base_path).convert('RGBA')
    for v in range(3):
        im=base.copy(); d=ImageDraw.Draw(im); rng=random.Random(seed+v)
        for i in range(16):
            x=rng.randint(3,28); y=rng.randint(3,28); c=flecks[i%len(flecks)]
            w=rng.choice([2,2,3,4]); h=rng.choice([1,2,2,3])
            d.rectangle((x,y,min(31,x+w),min(31,y+h)),fill=c)
            if rng.random()>.45: d.point((min(31,x+1),max(0,y-1)),fill=(min(255,c[0]+35),min(255,c[1]+35),min(255,c[2]+35),255))
        save(im,ROOT/'tiles'/f'{name}_{v}.png')

stone=[ROOT/'tiles'/f'stone_{v}.png' for v in range(3)]
dark=[ROOT/'tiles'/f'dark_stone_{v}.png' for v in range(3)]
ore_tile('coal_ore',stone[0],[(38,40,42,255),(25,26,28,255),(74,77,78,255)],101)
ore_tile('iron_ore',stone[1],[(122,88,70,255),(92,72,63,255),(155,112,79,255)],201)
ore_tile('copper_ore',stone[2],[(145,91,60,255),(97,114,82,255),(184,118,72,255)],301)
ore_tile('quartz_ore',dark[0],[(174,165,190,255),(208,201,218,255),(126,117,145,255)],401)
ore_tile('mossy_stone',stone[1],[(63,92,63,255),(78,108,71,255),(45,70,49,255)],501)
ore_tile('slate',dark[2],[(66,74,84,255),(47,53,61,255),(94,101,111,255)],601)

# generic item icon helpers
def item_icon(kind, palette):
    im=Image.new('RGBA',(32,32),(0,0,0,0)); d=ImageDraw.Draw(im)
    outline=(28,30,31,255); light=palette[0]; mid=palette[1]; darkc=palette[2]
    if kind=='ore':
        pts=[(5,20),(9,10),(18,6),(27,13),(24,24),(14,28),(6,25)]
        d.polygon(pts,fill=darkc,outline=outline); d.polygon([(9,18),(12,11),(18,9),(16,18)],fill=light); d.polygon([(17,20),(23,14),(24,21),(20,25)],fill=mid)
    elif kind=='ingot':
        d.polygon([(6,13),(11,8),(25,8),(28,13),(24,23),(9,23),(4,18)],fill=darkc,outline=outline)
        d.polygon([(8,13),(12,10),(24,10),(25,13),(10,15)],fill=light); d.rectangle((9,16,24,21),fill=mid)
    elif kind=='plate':
        d.rectangle((5,6,27,26),fill=darkc,outline=outline); d.rectangle((8,9,24,22),fill=mid); d.line((8,9,24,9),fill=light,width=2)
        for x,y in [(8,8),(24,8),(8,23),(24,23)]: d.rectangle((x-1,y-1,x+1,y+1),fill=light)
    elif kind=='circuit':
        d.rectangle((5,6,27,26),fill=darkc,outline=outline); d.rectangle((8,9,24,23),fill=mid)
        for x in [10,16,22]: d.line((x,10,x,22),fill=light,width=1)
        for y in [12,18]: d.line((8,y,24,y),fill=light,width=1)
        d.rectangle((13,14,18,19),fill=(36,40,41,255))
    elif kind=='key':
        d.ellipse((4,6,15,17),outline=light,width=3); d.rectangle((13,10,27,13),fill=mid); d.rectangle((23,13,26,19),fill=mid)
    elif kind=='pickaxe':
        d.line((8,28,18,12),fill=(116,78,47,255),width=4); d.line((11,9,27,7),fill=mid,width=5); d.line((11,9,5,14),fill=mid,width=4); d.point((26,6),fill=light)
    elif kind=='clothing':
        d.polygon([(9,6),(14,4),(18,4),(23,6),(28,11),(24,16),(23,27),(9,27),(8,16),(4,11)],fill=mid,outline=outline)
        d.line((16,7,16,26),fill=darkc,width=2); d.line((10,8,6,13),fill=light,width=1); d.line((22,8,26,13),fill=darkc,width=1)
    elif kind=='helmet':
        d.pieslice((5,6,27,27),180,360,fill=mid,outline=outline); d.rectangle((5,16,27,21),fill=darkc,outline=outline); d.rectangle((14,8,20,14),fill=light); d.rectangle((16,9,22,12),fill=(220,204,126,255))
    elif kind=='boots':
        d.rectangle((5,9,13,22),fill=mid,outline=outline); d.rectangle((3,20,15,26),fill=darkc,outline=outline); d.rectangle((18,11,26,22),fill=mid,outline=outline); d.rectangle((16,20,29,26),fill=darkc,outline=outline)
    return im

items={
 'coal':('ore',[(90,92,94,255),(55,57,59,255),(31,32,34,255)]),
 'iron_ore':('ore',[(174,124,91,255),(126,91,73,255),(80,68,63,255)]),
 'copper_ore':('ore',[(191,125,76,255),(139,89,59,255),(73,90,69,255)]),
 'quartz':('ore',[(231,222,239,255),(176,165,194,255),(103,96,119,255)]),
 'iron_ingot':('ingot',[(204,209,211,255),(139,146,149,255),(75,81,84,255)]),
 'copper_ingot':('ingot',[(222,150,104,255),(166,102,72,255),(92,63,52,255)]),
 'steel_plate':('plate',[(171,179,183,255),(103,113,117,255),(55,61,64,255)]),
 'circuit_parts':('circuit',[(134,194,159,255),(72,120,94,255),(35,65,51,255)]),
 'maintenance_key':('key',[(218,192,108,255),(157,129,74,255),(88,73,48,255)]),
 'steel_pickaxe':('pickaxe',[(205,212,215,255),(128,139,145,255),(67,76,80,255)]),
 'denim_jacket':('clothing',[(105,133,158,255),(72,94,115,255),(42,57,72,255)]),
 'utility_vest':('clothing',[(129,136,101,255),(91,100,75,255),(53,61,46,255)]),
 'miner_helmet':('helmet',[(223,203,111,255),(151,129,70,255),(74,67,46,255)]),
 'hiking_boots':('boots',[(126,94,61,255),(88,65,46,255),(47,38,31,255)]),
 'rubber_boots':('boots',[(90,107,102,255),(58,70,67,255),(30,38,37,255)]),
}
for name,(kind,pal) in items.items(): save(item_icon(kind,pal),ROOT/'items'/f'{name}.png')

# recolor clothing sprite overlays from nearest existing silhouette

def recolor(src,dst,target):
    im=Image.open(src).convert('RGBA'); pix=im.load(); out=Image.new('RGBA',im.size,(0,0,0,0)); op=out.load()
    tr,tg,tb=target
    for y in range(im.height):
      for x in range(im.width):
        r,g,b,a=pix[x,y]
        if a<10: continue
        lum=(r+g+b)/765
        factor=.42+.75*lum
        op[x,y]=(min(255,int(tr*factor)),min(255,int(tg*factor)),min(255,int(tb*factor)),a)
    save(out,dst)

spr=ROOT/'sprites'
recolor(spr/'player_rain_jacket.png',spr/'player_denim_jacket.png',(72,96,122))
recolor(spr/'player_rain_jacket.png',spr/'player_utility_vest.png',(93,102,74))
recolor(spr/'player_wool_hat.png',spr/'player_miner_helmet.png',(154,132,70))
recolor(spr/'player_work_boots.png',spr/'player_hiking_boots.png',(92,69,49))
recolor(spr/'player_work_boots.png',spr/'player_rubber_boots.png',(57,70,67))

# build icons
def build_icon(name,kind):
    im=Image.new('RGBA',(48,48),(0,0,0,0)); d=ImageDraw.Draw(im); o=(28,30,31,255)
    if kind=='furnace':
        d.rectangle((7,12,40,42),fill=(95,83,76,255),outline=o,width=2); d.rectangle((14,23,33,38),fill=(35,38,40,255),outline=o); d.rectangle((18,27,30,35),fill=(191,104,54,255)); d.rectangle((31,4,37,14),fill=(55,59,61,255),outline=o)
    elif kind=='wall':
        d.rectangle((8,5,39,43),fill=(89,99,102,255),outline=o,width=2)
        for y in [15,27,39]: d.line((8,y,39,y),fill=(50,56,59,255),width=2)
    elif kind=='floor':
        d.polygon([(6,29),(18,16),(42,16),(31,31)],fill=(94,104,108,255),outline=o); d.line((10,27,35,27),fill=(145,153,156,255),width=2)
    elif kind=='locker':
        d.rectangle((12,5,35,43),fill=(91,104,106,255),outline=o,width=2); d.line((12,24,35,24),fill=(45,50,52,255),width=2); d.rectangle((29,14,31,18),fill=(185,179,145,255)); d.rectangle((29,31,31,35),fill=(185,179,145,255))
    else:
        d.line((12,42,12,8),fill=(126,99,66,255),width=4); d.line((12,10,36,10),fill=(105,115,118,255),width=4); d.line((17,35,17,13),fill=(151,119,75,255),width=3); d.line((10,25,30,25),fill=(104,113,116,255),width=3)
    save(im,ROOT/'build'/f'{name}.png')
for name,kind in [('furnace','furnace'),('reinforced_wall','wall'),('metal_floor','floor'),('storage_locker','locker'),('scaffold_tower','tower')]: build_icon(name,kind)

# decor assets -- small original pixel art

def canvas(w,h): return Image.new('RGBA',(w,h),(0,0,0,0))

def decor_subway_sign():
    im=canvas(64,34);d=ImageDraw.Draw(im); d.rectangle((4,6,59,28),fill=(52,66,70,255),outline=(22,26,28,255),width=2); d.rectangle((8,10,55,24),fill=(177,164,117,255)); d.rectangle((11,13,20,21),fill=(55,68,72,255)); d.line((24,14,49,14),fill=(73,78,78,255),width=2); d.line((24,19,44,19),fill=(73,78,78,255),width=2); return im

def decor_turnstile():
    im=canvas(40,36);d=ImageDraw.Draw(im); d.rectangle((15,9,24,33),fill=(74,82,85,255),outline=(27,30,32,255)); d.ellipse((14,5,25,15),fill=(118,126,128,255),outline=(27,30,32,255)); d.line((20,12,34,18),fill=(145,151,152,255),width=3); d.line((20,12,6,18),fill=(145,151,152,255),width=3); return im

def decor_light():
    im=canvas(44,20);d=ImageDraw.Draw(im); d.rectangle((4,5,39,15),fill=(71,78,80,255),outline=(23,26,28,255)); d.rectangle((9,8,34,12),fill=(220,205,139,255)); return im

def decor_support():
    im=canvas(54,64);d=ImageDraw.Draw(im); c=(102,77,53,255); o=(38,31,26,255); d.rectangle((5,5,12,61),fill=c,outline=o); d.rectangle((42,5,49,61),fill=c,outline=o); d.rectangle((4,4,50,12),fill=(116,86,58,255),outline=o); d.line((12,15,41,42),fill=(79,60,44,255),width=4); return im

def decor_orecart():
    im=canvas(50,34);d=ImageDraw.Draw(im); d.polygon([(5,7),(44,7),(38,23),(11,23)],fill=(83,89,91,255),outline=(27,30,31,255)); d.ellipse((10,22,20,32),fill=(28,30,31,255)); d.ellipse((32,22,42,32),fill=(28,30,31,255)); d.rectangle((12,4,18,9),fill=(127,83,59,255)); d.rectangle((20,3,27,8),fill=(91,93,90,255)); return im

def decor_subwaycar():
    im=canvas(112,50);d=ImageDraw.Draw(im); o=(27,30,31,255); d.rectangle((4,7,107,43),fill=(91,102,105,255),outline=o,width=2); d.rectangle((8,12,103,18),fill=(117,126,127,255));
    for x in [12,31,50,69,88]: d.rectangle((x,20,x+13,34),fill=(57,73,78,255),outline=o)
    d.rectangle((47,20,55,40),fill=(69,77,79,255),outline=o); d.rectangle((84,20,92,40),fill=(69,77,79,255),outline=o); d.ellipse((18,38,32,49),fill=o); d.ellipse((79,38,93,49),fill=o); d.line((5,37,106,37),fill=(139,104,66,255),width=2); return im

decors={'subway_sign':decor_subway_sign(),'turnstile':decor_turnstile(),'tunnel_light':decor_light(),'mine_support':decor_support(),'ore_cart':decor_orecart(),'subway_car':decor_subwaycar()}
for n,im in decors.items(): save(im,ROOT/'decor'/f'{n}.png')

print('stage17 assets generated')
