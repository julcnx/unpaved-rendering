# Colour-blindness check (Machado et al. 2009, severity 1.0, linear RGB): simulated images and the contrast of the tint steps.
# Usage: python3 mockups/check-colour-blindness.py steps
#        python3 mockups/check-colour-blindness.py images <out dir> <png ...>
#        python3 mockups/check-colour-blindness.py sheet   (writes mockups/options-comparison-colour-blind.png: normal and the three simulations)
import sys, numpy as np
from PIL import Image
M = {
 'protanopia':   [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
 'deuteranopia': [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
 'tritanopia':   [[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]],
}
lin = lambda c: np.where(c <= 0.04045, c/12.92, ((c+0.055)/1.055)**2.4)
srgb = lambda c: np.where(c <= 0.0031308, c*12.92, 1.055*np.power(np.clip(c,0,1),1/2.4)-0.055)
def sim(rgb, m): return srgb(np.clip(lin(rgb) @ np.array(m).T, 0, 1))
def lum(rgb): l = lin(rgb); return 0.2126*l[...,0]+0.7152*l[...,1]+0.0722*l[...,2]
def cr(a,b): la,lb=sorted([lum(a),lum(b)]); return (lb+0.05)/(la+0.05)
h = lambda x: np.array([int(x[i:i+2],16)/255 for i in (1,3,5)])
if sys.argv[1] == 'images':
    for path in sys.argv[3:]:
        im = np.asarray(Image.open(path).convert('RGB'))/255
        for name, m in M.items():
            Image.fromarray((sim(im, m)*255).round().astype('uint8')).save(f"{sys.argv[2]}/{path.split('/')[-1][:-4]}-{name}.png")
elif sys.argv[1] == 'sheet':
    from PIL import ImageDraw, ImageFont
    here = __file__.rsplit('/', 1)[0]
    src = Image.open(f'{here}/options-comparison.png').convert('RGB')
    src = src.resize((1480, round(src.height * 1480 / src.width)), Image.LANCZOS)
    im = np.asarray(src)/255
    sheet = Image.new('RGB', (2960, 2 * (src.height + 30)), 'white')
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 26)
    for i, (name, m) in enumerate([('normal', np.eye(3)), ('deuteranopia', M['deuteranopia']), ('protanopia', M['protanopia']), ('tritanopia', M['tritanopia'])]):
        x, y = (i % 2) * 1480, (i // 2) * (src.height + 30)
        sheet.paste(Image.fromarray((sim(im, m)*255).round().astype('uint8')), (x, y + 30))
        ImageDraw.Draw(sheet).text((x + 740, y + 15), name, fill='black', font=font, anchor='mm')
    sheet.save(f'{here}/options-comparison-colour-blind.png')
else:
    LAND='#f2efe9'
    C={'Red':('#f9b29c','#ed9d84','#e98667'),'Orange':('#fcd6a4','#eec28b','#e8ac61'),'Yellow':('#f7fabf','#e4e194','#d0cb44'),'White':('#ffffff','#e2cfb8','#cca979')}
    print(f"{'class':7} {'vision':13} fill>Unpaved  Unpaved>Off-road  Off-road vs land  | hue-only? (fill vs other class fills)")
    for k,(f,lo,of) in C.items():
        for name,m in [('normal',np.eye(3))]+list(M.items()):
            F,L,O,LD=[sim(h(x),m) for x in (f,lo,of,LAND)]
            print(f"{k:7} {name:13} {cr(F,L):6.2f}        {cr(L,O):6.2f}            {cr(O,LD):6.2f}")
    print("\nclass fills under each vision (are classes still told apart?):")
    for name,m in [('normal',np.eye(3))]+list(M.items()):
        fills=[sim(h(C[k][0]),m) for k in C]
        print(f"  {name:13}", '  '.join(f"{k}={'#%02x%02x%02x'%tuple((v*255).round().astype(int))}" for k,v in zip(C,fills)))
