from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "HOLOS88-social-visuals-final.pdf"
TMP = ROOT / "tmp" / "pdfs"
TMP.mkdir(parents=True, exist_ok=True)
OUT.parent.mkdir(parents=True, exist_ok=True)
MOON = ROOT / "dist" / "assets" / "moon.jpg"

try:
    pdfmetrics.registerFont(TTFont("DidotHOLOS", "/System/Library/Fonts/Supplemental/Didot.ttc", subfontIndex=0))
    DISPLAY = "DidotHOLOS"
except Exception:
    DISPLAY = "Times-Roman"

moon = Image.open(MOON).convert("L")
moon = ImageEnhance.Contrast(moon).enhance(1.12)
moon = ImageOps.colorize(moon, black="#101817", white="#d8d6cf")
moon_path = TMP / "moon-print.png"
moon.save(moon_path, quality=100)
moon_reader = ImageReader(str(moon_path))

def hexrgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i+2], 16) / 255 for i in (0, 2, 4))

def text(c, x, y, value, font, size, color, leading=None):
    c.setFillColorRGB(*hexrgb(color))
    c.setFont(font, size)
    t = c.beginText(x, y)
    t.setLeading(leading or size * .92)
    for line in value.split("\n"):
        t.textLine(line)
    c.drawText(t)

def orbit(c, w, h, vertical=False):
    if vertical:
        specs = [(-.14,.035,.48,.46,-12,.88),(.01,.07,.48,.46,-4,.68),(.19,.11,.48,.46,2,.46),(.38,.15,.48,.46,8,.26),(.58,.19,.48,.46,14,.11)]
    else:
        specs = [(0,.02,.12,.96,-12,.88),(.10,.08,.12,.96,-4,.70),(.27,.14,.12,.96,2,.48),(.45,.20,.12,.96,8,.27),(.63,.26,.12,.96,14,.12)]
    for lx, by, ww, hh, angle, alpha in specs:
        c.saveState(); c.setFillAlpha(alpha); c.translate(lx*w, by*h); c.rotate(angle)
        c.drawImage(moon_reader, 0, 0, width=ww*w, height=hh*h, preserveAspectRatio=False, mask='auto')
        c.restoreState()
    c.setFillAlpha(1)

def common(c, w, h, bg, headline, accent, horizontal=True, number=""):
    c.setFillColorRGB(*hexrgb(bg)); c.rect(0,0,w,h,fill=1,stroke=0)
    orbit(c,w,h,not horizontal)
    c.saveState(); c.translate(28, h-32); c.rotate(-90)
    text(c,0,0,"OBSERVE / RECORD / CONNECT","Courier",10,"#ffffff",12); c.restoreState()
    if horizontal:
        left=w*.29; top=h-54
        text(c,left,top,"A NATURAL HISTORY OF NOW","Courier",11,"#ffffff",13)
        lines=headline.count("\n")+1; fs=58 if lines==2 else 51
        text(c,left,top-40,headline,"Times-Bold",fs,accent,fs*.86)
        rule_y=top-48-lines*fs*.86
        c.setStrokeColorRGB(*hexrgb(accent)); c.setLineWidth(.7); c.line(left,rule_y,w-48,rule_y)
        text(c,left,rule_y-24,"HOLOS88 / ONE WINDOW, A CLOSER LOOK","Courier",11,accent,13)
        text(c,w-192,h-34,"HOLOS 88",DISPLAY,32,"#ffffff",34)
        text(c,w-150,22,"HOLOS88.COM","Courier",9,"#ffffff",11)
    else:
        left=w*.27; top=h-82
        text(c,left,top,"A NATURAL HISTORY OF NOW","Courier",18,"#f4ecdf",20)
        fs=82 if w < h else 62
        text(c,left,top-76,headline,"Times-Bold",fs,accent,fs*.92)
        lines=headline.count("\n")+1; rule_y=top-90-lines*fs*.92
        c.setStrokeColorRGB(*hexrgb(accent)); c.setLineWidth(1); c.line(left,rule_y,w-68,rule_y)
        text(c,left,rule_y-35,"WATCH THE NOW / HOLOS88","Courier",16,"#f4ecdf",19)
        text(c,w-225,72,"HOLOS 88",DISPLAY,39,"#ffffff",42)
        text(c,w-176,42,"HOLOS88.COM","Courier",13,"#ffffff",15)
    c.showPage()

c = canvas.Canvas(str(OUT), pageCompression=1)
horizontal = [
    ("#d7d2c6","The world\nis too interesting\nto rush through.","#171717"),
    ("#1c2930","To think\nis to find\nthe right distance.","#e6c65b"),
    ("#b2c6c0","You make\nyour life.\nYour life makes you.","#7d4353"),
    ("#8b493f","Sharp with power.\nKind to people.","#f4ecdf"),
]
for i,(bg,msg,accent) in enumerate(horizontal,1):
    c.setPageSize((1500,500)); common(c,1500,500,bg,msg,accent,True,str(i))
vertical = [
    (1080,1920,"#d7d2c6","The world\nis too interesting\nto rush through.","#171717"),
    (1080,1920,"#1c2930","To think\nis to find\nthe right distance.","#e6c65b"),
    (1080,1080,"#8b493f","Sharp with power.\nKind to people.","#e8c86a"),
]
for w,h,bg,msg,accent in vertical:
    c.setPageSize((w,h)); common(c,w,h,bg,msg,accent,False)
c.save()
print(OUT)
