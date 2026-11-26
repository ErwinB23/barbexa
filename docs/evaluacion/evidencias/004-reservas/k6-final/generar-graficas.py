"""Gráficas offline con ReportLab: métricas existentes, sin llamadas de red."""
import json
import math
from pathlib import Path
from reportlab.graphics.shapes import Drawing, String, Rect, Line
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.legends import Legend
from reportlab.graphics import renderPDF, renderSVG
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import pypdfium2 as pdfium

OUT = Path(__file__).resolve().parent
DATA = json.loads((OUT / 'auditoria.json').read_text(encoding='utf-8'))
FIG = OUT / 'graficas'
FIG.mkdir(exist_ok=True)
W, H = 960, 620
INK = colors.HexColor('#162638')
MUTED = colors.HexColor('#526579')
GRID = colors.HexColor('#dce4ec')
BLUE = colors.HexColor('#2364aa')
TEAL = colors.HexColor('#087f8c')
AMBER = colors.HexColor('#b66b14')
RED = colors.HexColor('#b13f45')
PURPLE = colors.HexColor('#7450a8')

def text(d, x, y, value, size=12, color=INK, bold=False, anchor='start'):
    d.add(String(x, y, value, fontName='Helvetica-Bold' if bold else 'Helvetica', fontSize=size, fillColor=color, textAnchor=anchor))

def frame(title, subtitle):
    d = Drawing(W, H)
    d.add(Rect(0, 0, W, H, fillColor=colors.white, strokeColor=None))
    d.add(Rect(34, 572, 6, 22, fillColor=TEAL, strokeColor=None))
    text(d, 52, 577, title, 23, bold=True)
    text(d, 36, 550, subtitle, 12, MUTED)
    d.add(Line(36, 48, W-36, 48, strokeColor=GRID))
    text(d, 36, 29, 'BARBEXA | Campaña af768017 | Evidencias locales, 25–26 nov. 2026', 10, MUTED)
    text(d, W-36, 29, 'Lectura de API; no concurrencia de reservas', 10, MUTED, anchor='end')
    return d

def legend(d, items, x=72, y=511, dx=240):
    for i,(name,color) in enumerate(items):
        xx = x + i * dx
        d.add(Line(xx, y+4, xx+25, y+4, strokeColor=color, strokeWidth=2.5))
        text(d, xx+32, y, name, 11, MUTED)

def plot(d, x, y, w, h, series, x_label, y_label, ymax=None, xmin=None, xmax=None, xticks=None, yticks=None):
    clean = [(name, color, [(a,b) for a,b in points if a is not None and b is not None and math.isfinite(a) and math.isfinite(b)]) for name,color,points in series]
    clean = [s for s in clean if s[2]]
    if not clean:
        text(d, x+w/2, y+h/2, 'Sin datos disponibles', anchor='middle')
        return
    p = LinePlot()
    p.x, p.y, p.width, p.height = x,y,w,h
    p.data = [s[2] for s in clean]
    p.joinedLines = 1
    p.lineLabelFormat = None
    for axis in [p.xValueAxis,p.yValueAxis]:
        axis.strokeColor = GRID
        axis.labels.fontName = 'Helvetica'
        axis.labels.fontSize = 10
        axis.labels.fillColor = MUTED
    p.yValueAxis.visibleGrid = True
    p.yValueAxis.gridStrokeColor = GRID
    p.yValueAxis.gridStrokeWidth = 0.5
    p.yValueAxis.valueMin = 0
    if ymax is not None: p.yValueAxis.valueMax = ymax
    if xmin is not None: p.xValueAxis.valueMin = xmin
    if xmax is not None: p.xValueAxis.valueMax = xmax
    if xticks: p.xValueAxis.valueSteps = xticks
    if yticks: p.yValueAxis.valueSteps = yticks
    for i,(_,color,_) in enumerate(clean):
        p.lines[i].strokeColor = color
        p.lines[i].strokeWidth = 2.0
    d.add(p)
    text(d, x+w/2, y-35, x_label, 11, MUTED, anchor='middle')
    text(d, x, y+h+14, y_label, 11, MUTED, bold=True)

def bars(d,x,y,w,h, labels, values, palette, y_label, ymax=None, units=''):
    p = VerticalBarChart()
    p.x,p.y,p.width,p.height = x,y,w,h
    p.data = [values]
    p.categoryAxis.categoryNames = labels
    p.categoryAxis.labels.fontName = 'Helvetica'
    p.categoryAxis.labels.fontSize = 11
    p.categoryAxis.labels.fillColor = MUTED
    p.valueAxis.valueMin = 0
    p.valueAxis.visibleGrid = True
    p.valueAxis.gridStrokeColor = GRID
    p.valueAxis.labels.fontSize = 10
    p.valueAxis.labels.fillColor = MUTED
    if ymax: p.valueAxis.valueMax = ymax
    for i,color in enumerate(palette): p.bars[(0,i)].fillColor = color
    p.bars.strokeColor = None
    p.barLabelFormat = '%d' + units
    p.barLabels.fontSize = 12
    p.barLabels.fontName = 'Helvetica-Bold'
    d.add(p)
    text(d, x, y+h+17, y_label, 12, bold=True)

def selected(type):
    return next(a for a in DATA['attempts'] if a['id']==DATA['selected'][type])

stress = selected('stress')
spike = selected('spike')
old = next(a for a in DATA['attempts'] if a['id'].startswith('28edec30'))
S = stress['segments']
drawings=[]

d = frame('Latencia por nivel de concurrencia', 'Stress aprobado | 60 s por tramo | 100 a 1.000 VU | HTTP en milisegundos')
legend(d,[('p95 HTTP',BLUE),('p99 HTTP',TEAL)],dx=220)
plot(d,78,125,815,330,[('p95',BLUE,[(s['level'],s['p95Ms']) for s in S]),('p99',TEAL,[(s['level'],s['p99Ms']) for s in S])],'Usuarios virtuales del tramo','Latencia HTTP (ms)',ymax=1000,xmin=100,xmax=1000,xticks=list(range(100,1001,100)))
text(d,78,78,'A 1.000 VU: p95 789,45 ms; p99 903,27 ms. p95 completo catálogo/slots: 786 / 793 ms.',11,MUTED)
drawings.append(('01-latencias',d))

d=frame('Rendimiento por nivel de concurrencia','Solicitudes observadas / duración del tramo completo; no se usa el RPS global del escenario')
legend(d,[('Antes: límite 512',AMBER),('Después: límite 4096',BLUE)],dx=260)
plot(d,78,125,815,330,[('Antes',AMBER,[(s['level'],s['rps']) for s in old['segments'] if s['passed']]),('Después',BLUE,[(s['level'],s['rps']) for s in S])],'Usuarios virtuales del tramo','Solicitudes por segundo',ymax=800,xmin=100,xmax=1000,xticks=list(range(100,1001,100)))
text(d,78,78,'Máximo observado: 757,28 RPS a 800 VU; 643,57 RPS a 1.000 VU. No implica capacidad ilimitada.',11,MUTED)
drawings.append(('02-rps',d))

d=frame('Errores por nivel: Stress optimizado','Las tasas cero son mediciones reales. El segundo intento previo carece de denominador verificable.')
for x,key,label,color in [(78,'technicalErrorRate','Errores técnicos (%)',RED),(535,'unexpectedRate','Resultados funcionales inesperados (%)',PURPLE)]:
    plot(d,x,160,350,290,[(label,color,[(s['level'],100*s[key]) for s in S])],'Usuarios virtuales',label,ymax=1.05,xmin=100,xmax=1000,xticks=[100,400,700,1000],yticks=[0,0.25,0.5,0.75,1])
    text(d,x,485,'0 / 338.131 solicitudes en la corrida aprobada',11,color,bold=True)
text(d,78,101,'Umbrales conservados: técnicos <1%; resultados inesperados =0; checks funcionales =100%.',11,MUTED)
text(d,78,78,'Antes: 1 EOF en 28edec30 y 16 eventos EOF en a8d488dd; no se mezclan con esta corrida.',11,MUTED)
drawings.append(('03-errores',d))

d=frame('CPU y memoria durante Stress','Máximos muestreados por tramo; host compartido de 24 CPU lógicas y 15,43 GiB RAM')
plot(d,76,325,355,150,[('CPU',BLUE,[(s['level'],s['resources']['cpuHostPeakPercent']) for s in S])],'VU','CPU host (%)',ymax=100,xmin=100,xmax=1000,xticks=[100,400,700,1000])
plot(d,550,325,330,150,[('RAM',PURPLE,[(s['level'],s['resources']['ramHostPeakPercent']) for s in S])],'VU','RAM host ocupada (%)',ymax=100,xmin=100,xmax=1000,xticks=[100,400,700,1000])
plot(d,76,110,355,130,[('Generador',TEAL,[(s['level'],s['resources']['generatorPeakMiB']) for s in S]),('Backend',AMBER,[(s['level'],s['resources']['backendMemoryPeakMiB']) for s in S])],'VU','Memoria observada (MiB)',ymax=1000,xmin=100,xmax=1000,xticks=[100,400,700,1000])
legend(d,[('k6: máximo acumulado',TEAL),('Backend: suma simultánea',AMBER)],x=80,y=272,dx=235)
plot(d,550,110,330,130,[('Rest',BLUE,[(s['level'],s['resources']['backend']['rest']['cpuPeakOneCorePercent']) for s in S])],'VU','CPU PostgREST (% de un núcleo)',ymax=1400,xmin=100,xmax=1000,xticks=[100,400,700,1000])
text(d,550,275,'PostgreSQL: máximo 21 / 100 sesiones; locks =0.',10,MUTED)
drawings.append(('04-recursos',d))

d=frame('Antes y después de optimizar Kong','Cambio: 512 → 4096 worker_connections; un worker, mismos contratos y umbrales')
legend(d,[('Antes: 28edec30',AMBER),('Después: e5e44a3e',BLUE)],dx=270)
bars(d,78,165,320,275,['Antes','Después'],[400,1000],[AMBER,BLUE],'Máximo acreditado (VU / 60 s)',ymax=1100)
plot(d,535,165,350,275,[('Antes',AMBER,[(s['level'],s['p95Ms']) for s in old['segments'] if s['passed']]),('Después',BLUE,[(s['level'],s['p95Ms']) for s in S if s['level']<=400])],'VU en tramos equivalentes','p95 HTTP comparable (ms)',ymax=16,xmin=100,xmax=400,xticks=[100,200,300,400])
text(d,78,103,'El límite eliminó el corte alrededor de 500 VU; no demuestra una reducción general de latencia.',11,MUTED)
text(d,78,80,'Los 500–1.000 VU previos no tienen tramos completos comparables. EOF posteriores: 0.',11,MUTED)
drawings.append(('05-optimizacion',d))

d=frame('Spike: pico y recuperación','Pico de 1.000 VU durante 30 s; rampas de 5 s; recuperación de 10 VU durante 60 s')
for s in spike['segments']:
    color=BLUE if 'peak' not in s['name'] else RED
    label={'spike-baseline':'Base: 10 VU','spike-peak':'Pico: 1.000 VU','spike-recovery':'Recuperación: 10 VU'}[s['name']]
    x=78+s['start']/130*815; width=(s['end']-s['start'])/130*815
    d.add(Rect(x,494,width,22,fillColor=colors.HexColor('#edf2f7'),strokeColor=None))
    text(d,x+width/2,501,label,10,color,bold=True,anchor='middle')
plot(d,78,325,815,135,[(s['name'],TEAL if i!=1 else RED,[(s['start'],s['p99Ms']),(s['end'],s['p99Ms'])]) for i,s in enumerate(spike['segments'])],'Segundos del escenario','p99 HTTP por fase (ms)',ymax=1200,xmin=0,xmax=130,xticks=[0,30,35,65,70,100,130])
plot(d,78,125,815,110,[('CPU',BLUE,[(s['elapsedSeconds'],s['cpuHostPercent']) for s in spike['samples']]),('RAM',PURPLE,[(s['elapsedSeconds'],s['ramHostPercent']) for s in spike['samples']])],'Segundos del escenario','CPU host (azul) y RAM ocupada (violeta), %',ymax=100,xmin=0,xmax=130,xticks=[0,30,35,65,70,100,130])
text(d,78,270,'p99: base 13,57 ms; pico 1.015,98 ms; recuperación 9,77 ms. Cero errores en las tres fases.',11,MUTED)
text(d,78,68,'Percentiles agregados por fase, no instantáneos. Los huecos corresponden a rampas sin agregado propio.',10,MUTED)
drawings.append(('06-spike',d))

pdf_path=FIG/'graficas-k6.pdf'
c=canvas.Canvas(str(pdf_path),pagesize=(W,H))
c.setTitle('BARBEXA — Resultados k6 de la campaña af768017')
for name,drawing in drawings:
    renderSVG.drawToFile(drawing,str(FIG/(name+'.svg')))
    renderPDF.draw(drawing,c,0,0)
    c.showPage()
c.save()
pdf=pdfium.PdfDocument(str(pdf_path))
for i,(name,_) in enumerate(drawings):
    page=pdf[i]
    image=page.render(scale=1.8).to_pil()
    image.save(FIG/(name+'.png'))
    page.close()
pdf.close()
print(json.dumps({'figures':len(drawings),'formats':['SVG','PNG','PDF'],'directory':str(FIG.relative_to(OUT))}))
