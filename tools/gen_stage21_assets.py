from PIL import Image, ImageDraw
from pathlib import Path
import colorsys

ROOT = Path(__file__).resolve().parents[1]
ITEMS = ROOT / 'assets' / 'items'
SPRITES = ROOT / 'assets' / 'sprites'


def recolor(im, target, saturation=0.68, brightness=1.0):
    im = im.convert('RGBA')
    tr,tg,tb = target
    th,ts,tv = colorsys.rgb_to_hsv(tr/255,tg/255,tb/255)
    out = Image.new('RGBA', im.size)
    src = im.load(); dst = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a = src[x,y]
            if a == 0:
                continue
            lum = (0.2126*r + 0.7152*g + 0.0722*b)/255
            # keep pixel-art outlines dark and highlights readable
            v = max(0.06, min(1.0, (0.20 + lum*0.86)*brightness))
            sat = min(1, saturation * (0.65 + lum*0.35))
            rr,gg,bb = colorsys.hsv_to_rgb(th, sat, v)
            dst[x,y] = (int(rr*255), int(gg*255), int(bb*255), a)
    return out


def base_item(name): return Image.open(ITEMS/f'{name}.png').convert('RGBA')
def base_sprite(name): return Image.open(SPRITES/f'player_{name}.png').convert('RGBA')

def save_item(name, im):
    im.save(ITEMS/f'{name}.png')

def save_sprite(name, im):
    im.save(SPRITES/f'player_{name}.png')

# ---- melee icons -------------------------------------------------------
# Baton: shorter, darker metal pipe with grip.
im = recolor(base_item('metal_pipe'), (50,58,64), .30)
d = ImageDraw.Draw(im)
d.rectangle((5,24,11,27), fill=(34,39,43,255))
d.rectangle((7,22,13,24), fill=(74,82,86,255))
save_item('police_baton', im)

# Fire axe: high-visibility rescue head + dark handle.
im = recolor(base_item('stone_axe'), (212,70,43), .82)
d = ImageDraw.Draw(im)
d.line((11,26,20,8), fill=(76,58,44,255), width=3)
d.rectangle((18,6,26,13), fill=(190,55,37,255))
d.rectangle((24,8,29,11), fill=(113,36,31,255))
save_item('fire_axe', im)

# Sledgehammer: large industrial head.
im = recolor(base_item('repair_hammer'), (104,111,112), .18)
d = ImageDraw.Draw(im)
d.rectangle((7,5,26,11), fill=(86,91,92,255))
d.rectangle((5,7,28,10), fill=(117,122,121,255))
save_item('sledgehammer', im)

# Steel spear: cool steel point and reinforced shaft.
im = recolor(base_item('spear'), (139,151,154), .25)
d = ImageDraw.Draw(im)
d.polygon([(25,4),(30,2),(28,8)], fill=(199,207,205,255))
d.line((10,23,25,8), fill=(88,75,58,255), width=2)
save_item('steel_spear', im)

# ---- firearm icons (abstract game sprites, not realistic schematics) ---
# Compact SMG: pistol silhouette extended with a compact stock/body.
im = recolor(base_item('pistol'), (61,70,75), .28)
d = ImageDraw.Draw(im)
d.rectangle((7,11,24,16), fill=(65,74,79,255))
d.rectangle((5,13,10,17), fill=(45,52,56,255))
d.rectangle((15,16,19,25), fill=(48,55,59,255))
d.rectangle((23,12,28,14), fill=(99,105,106,255))
save_item('smg_compact', im)

# Police carbine: blue-black variant with compact optic marker.
im = recolor(base_item('rifle'), (58,72,82), .38)
d = ImageDraw.Draw(im)
d.rectangle((14,10,19,12), fill=(105,127,137,255))
d.rectangle((16,8,18,10), fill=(38,46,51,255))
save_item('police_carbine', im)

# Blackridge carbine: dark technical variant with cyan status stripe.
im = recolor(base_item('rifle'), (43,55,58), .34)
d = ImageDraw.Draw(im)
d.rectangle((13,10,21,12), fill=(58,82,84,255))
d.rectangle((18,12,24,13), fill=(91,147,145,255))
d.rectangle((7,16,11,18), fill=(74,109,108,255))
save_item('blackridge_carbine', im)

# ---- clothing item icons ----------------------------------------------
def clothing_icon(new, base, target, sat=.65):
    save_item(new, recolor(base_item(base), target, sat))

clothing_icon('police_jacket', 'denim_jacket', (38,61,77), .58)
clothing_icon('police_helmet', 'hard_hat', (39,53,62), .48)
clothing_icon('firefighter_helmet', 'hard_hat', (224,153,39), .78)
clothing_icon('firefighter_boots', 'work_boots', (50,43,35), .32)
clothing_icon('paramedic_jacket', 'rain_jacket', (38,92,89), .62)
clothing_icon('ranger_jacket', 'denim_jacket', (74,83,51), .52)
clothing_icon('blackridge_vest', 'police_vest', (44,61,62), .42)
clothing_icon('blackridge_helmet', 'miner_helmet', (49,66,67), .40)

# Add small visual identifiers while staying readable at 32px.
for name, mark in [
    ('police_jacket',(185,201,204,255)), ('paramedic_jacket',(210,226,216,255)),
    ('ranger_jacket',(171,159,92,255)), ('blackridge_vest',(88,161,154,255))]:
    p=ITEMS/f'{name}.png'; im=Image.open(p).convert('RGBA'); d=ImageDraw.Draw(im)
    d.rectangle((14,13,17,15), fill=mark); im.save(p)

# ---- player overlay sheets --------------------------------------------
def sprite(new, base, target, sat=.65):
    save_sprite(new, recolor(base_sprite(base), target, sat))

sprite('police_jacket', 'denim_jacket', (35,59,76), .58)
sprite('police_helmet', 'hard_hat', (39,52,61), .46)
sprite('firefighter_helmet', 'hard_hat', (225,154,40), .80)
sprite('firefighter_boots', 'work_boots', (47,40,33), .32)
sprite('paramedic_jacket', 'rain_jacket', (37,91,87), .62)
sprite('ranger_jacket', 'denim_jacket', (72,82,49), .50)
sprite('blackridge_vest', 'police_vest', (42,59,60), .42)
sprite('blackridge_helmet', 'miner_helmet', (47,64,65), .40)

print('Stage 21 assets generated: 15 item icons + 8 clothing overlays')
