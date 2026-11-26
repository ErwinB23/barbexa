"""Gráficas offline: ReportLab + PDFium del runtime de herramientas, sin instalar paquetes."""
import json
import csv
import math
from pathlib import Path
from reportlab.graphics.shapes import Drawing, String, Rect, Line
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics import renderPDF, renderSVG
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import pypdfium2 as pdfium
from PIL import Image

OUT = Path(__file__).resolve().parent
DATA = json.loads((OUT / 'auditoria.json').read_text(encoding='utf-8'))
RUNS = [x for x in DATA['attempts'] if x['approved']]
FIG = OUT / 'graficas'
FIG.mkdir(exist_ok=True)
W, H = 1050, 670
INK, MUTED, GRID = [colors.HexColor(x) for x in ['#172b43','#4e6278','#dce4ed']]
BLUE, TEAL, GOLD, PURPLE = [colors.HexColor(x) for x in ['#2465ac','#087f82','#af6517','#7550a1']]

def text(d, x, y, s, size=11, color=INK, bold=False, anchor='start'):
    d.add(String(x,y,str(s),fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,fillColor=color,textAnchor=anchor))

def frame(title, subtitle):
    d=Drawing(W,H)
    d.add(Rect(0,0,W,H,fillColor=colors.white,strokeColor=None))
    d.add(Rect(34,H-64,6,27,fillColor=TEAL,strokeColor=None))
    text(d,52,H-58,title,23,bold=True)
    text(d,36,H-85,subtitle,12,MUTED)
    d.add(Line(36,49,W-36,49,strokeColor=GRID))
    text(d,36,29,'BARBEXA | Serie mixta 71e00e3c | Evidencia del 26 nov. 2026',10,MUTED)
    text(d,W-36,29,'API local; datos sintéticos; sin nuevas ejecuciones',10,MUTED,anchor='end')
    return d

def legend(d, entries, x, y, step=185):
    for i,(label,color) in enumerate(entries):
        xx=x+i*step
        d.add(Line(xx,y+4,xx+19,y+4,strokeColor=color,strokeWidth=2.5))
        text(d,xx+26,y,label,10,MUTED)

def plot(d,x,y,w,h,series,xlabel,ylabel,ymax=None,xmax=None,xticks=None):
    clean=[(name,col,[(a,b) for a,b in pts if a is not None and b is not None and math.isfinite(a) and math.isfinite(b)]) for name,col,pts in series]
    clean=[x for x in clean if x[2]]
    p=LinePlot();p.x=x;p.y=y;p.width=w;p.height=h
    p.data=[v[2] for v in clean];p.joinedLines=1
    for ax in [p.xValueAxis,p.yValueAxis]:
        ax.strokeColor=GRID;ax.labels.fontName='Helvetica';ax.labels.fontSize=10;ax.labels.fillColor=MUTED
    p.yValueAxis.visibleGrid=True;p.yValueAxis.gridStrokeColor=GRID;p.yValueAxis.valueMin=0
    if ymax is not None:p.yValueAxis.valueMax=ymax
    if xmax is not None:p.xValueAxis.valueMax=xmax
    if xticks is not None:p.xValueAxis.valueSteps=xticks
    for i,(_,col,_) in enumerate(clean):p.lines[i].strokeColor=col;p.lines[i].strokeWidth=2.1
    d.add(p)
    text(d,x+w/2,y-34,xlabel,11,MUTED,anchor='middle')
    text(d,x,y+h+16,ylabel,11,MUTED,bold=True)

figures=[]
vu=[a['level'] for a in RUNS]
d=frame('Latencias: consultas y mezcla global','Tres niveles aprobados | 600 s estables por nivel | Escalas separadas para evitar ocultar las consultas')
legend(d,[('Catálogo',BLUE),('Disponibilidad',TEAL),('Mis reservas',GOLD)],55,533,145)
plot(d,75,200,405,280,[(name,col,[(a['level'],a['operations'][op]['wallMs']['p(95)']) for a in RUNS]) for op,name,col in [('catalog','Catálogo',BLUE),('slots','Disponibilidad',TEAL),('reservations','Mis reservas',GOLD)]],'Usuarios virtuales','p95 completo de consulta (ms)',16,100,vu)
legend(d,[('HTTP p95',PURPLE),('HTTP p99',GOLD)],575,533,185)
plot(d,590,200,405,280,[(name,col,[(a['level'],a['httpMs'][k]) for a in RUNS]) for k,name,col in [('p(95)','p95',PURPLE),('p(99)','p99',GOLD)]],'Usuarios virtuales','HTTP global, todas las fases (ms)',4200,100,vu)
text(d,75,128,'100 VU: p95 de consultas = 4 / 8 / 7 ms; criterio original: <= 3.000 ms.',12,TEAL,bold=True)
text(d,75,103,'p95 HTTP global a 100 VU = 3.660,71 ms. No es un percentil exclusivo de confirmaciones.',11,MUTED)
text(d,75,79,'Los percentiles de confirmación no quedaron exportados: se documentan como no disponibles.',11,MUTED)
figures.append(('01-latencias',d))

d=frame('Carga sostenida y reservas persistidas','Las cifras HTTP incluyen todas las fases; las tasas estables usan exclusivamente sus 600 segundos')
legend(d,[('HTTP total / s',BLUE),('HTTP estable / s',TEAL),('Confirmaciones estables / s',GOLD)],70,531,295)
plot(d,80,205,425,280,[(name,col,[(a['level'],a[k]) for a in RUNS]) for k,name,col in [('rps','HTTP total',BLUE),('steadyRps','HTTP estable',TEAL)]] + [('Confirmaciones',GOLD,[(a['level'],a['operations']['confirm']['steadyRps']) for a in RUNS])],'Usuarios virtuales','Solicitudes o confirmaciones por segundo',65,100,vu)
text(d,580,497,'Aceptadas = persistidas (cada nivel)',14,bold=True)
for j,a in enumerate(RUNS):
    yy=422-j*76;ww=a['persistedReservations']/8000*310
    text(d,580,yy+8,f"{a['level']} VU",12,bold=True)
    d.add(Rect(648,yy,ww,27,fillColor=TEAL,strokeColor=None))
    text(d,655+ww,yy+8,f"{a['persistedReservations']:,}".replace(',','.'),12,TEAL,bold=True)
text(d,580,184,'17.630 aceptadas y 17.630 persistidas',15,TEAL,bold=True)
text(d,80,127,'50 -> 100 VU: throughput estable 48,86 -> 58,03 RPS (+18,78 %); escalado no lineal.',12,MUTED)
text(d,80,100,'Cero errores técnicos, cero resultados inesperados y cero conflictos en los niveles aprobados.',11,MUTED)
text(d,80,77,'Los intentos no aprobados y sus 1.245 reservas persistidas se mantienen separados.',11,MUTED)
figures.append(('02-throughput-integridad',d))

d=frame('Recursos observados en la serie aprobada','Picos muestreados; CPU de contenedores y generador expresada como porcentaje de un núcleo')
legend(d,[('Backend agregado',TEAL),('Generador (pico histórico)',BLUE)],70,531,230)
plot(d,80,215,410,270,[(name,col,[(a['level'],a['resources'][key]) for a in RUNS]) for key,name,col in [('backendMemoryPeakMiB','Backend',TEAL),('generatorPeakMiB','Generador',BLUE)]],'Usuarios virtuales','Memoria (MiB)',950,100,vu)
legend(d,[('CPU host',BLUE),('RAM host',PURPLE),('CPU Edge',GOLD)],570,531,145)
plot(d,590,215,405,270,[('CPU host',BLUE,[(a['level'],a['resources']['cpuHostPeakPercent']) for a in RUNS]),('RAM host',PURPLE,[(a['level'],a['resources']['ramHostPeakPercent']) for a in RUNS]),('CPU Edge',GOLD,[(a['level'],a['resources']['backend']['edge_runtime']['cpuPeakOneCorePercent']) for a in RUNS])],'Usuarios virtuales','Porcentaje (denominadores distintos)',100,100,vu)
text(d,80,133,'PostgreSQL: máximo 21 / 22 / 22 sesiones de 100; cero esperas de locks muestreadas.',12,MUTED)
text(d,80,107,'A 100 VU: backend 857,88 MiB; generador 196,84 MiB; mínimo host libre 2,17 GiB.',12,MUTED)
text(d,80,80,'Son muestras cada ~2 s: no descartan picos breves ni prueban por sí solas la causa de latencia.',11,MUTED)
figures.append(('03-recursos',d))

rows=list(csv.DictReader((OUT/'recursos-serie.csv').open(encoding='utf-8',newline='')))
rows=[r for r in rows if r['attempt']==RUNS[-1]['id']]
def points(key):return [(float(r['elapsedSeconds']),float(r[key])) for r in rows if r[key]!='']
d=frame('Recursos durante la ejecución de 100 VU','Eje temporal aproximado desde el inicio del generador; no representa tiempos individuales de confirmación')
legend(d,[('Backend MiB',TEAL),('Generador MiB',BLUE)],75,531,220)
plot(d,80,335,900,155,[('Backend',TEAL,points('backendMemoryMiB')),('Generador',BLUE,points('generatorWorkingMiB'))],'','Memoria residente (MiB)',950,785,[0,60,120,300,480,600,720,780])
legend(d,[('CPU host %',BLUE),('RAM host %',PURPLE)],75,288,220)
plot(d,80,112,900,140,[('CPU',BLUE,points('cpuHostPercent')),('RAM',PURPLE,points('ramHostPercent'))],'Segundos desde el inicio aproximado del generador','Uso del host (%)',100,785,[0,60,120,300,480,600,720,780])
text(d,80,66,'Plan: calentamiento 0-60 s | rampa 60-120 s | estable 120-720 s | descenso 720-780 s.',11,MUTED)
figures.append(('04-evolucion-100vu',d))

pdf=FIG/'graficas-mixtas.pdf'
c=canvas.Canvas(str(pdf),pagesize=(W,H))
c.setTitle('BARBEXA - Serie mixta k6: resultados auditados')
for name,d in figures:
    renderSVG.drawToFile(d,str(FIG/(name+'.svg')))
    renderPDF.draw(d,c,0,0);c.showPage()
c.save()
document=pdfium.PdfDocument(str(pdf))
thumbs=[]
for i,(name,_) in enumerate(figures):
    im=document[i].render(scale=1.6).to_pil()
    im.save(FIG/(name+'.png'))
    im.thumbnail((840,536));thumbs.append(im.copy())
sheet=Image.new('RGB',(1680,1072),'#dce4ed')
for i,im in enumerate(thumbs):sheet.paste(im,((i%2)*840,(i//2)*536))
sheet.save(FIG/'vista-conjunta.png')
assert len(document)==4
print('4 páginas PDF y 4 gráficas PNG/SVG generadas; cifras tomadas de auditoria.json y CSV.')
