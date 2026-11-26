"""Gráficas offline de la hora realmente terminada; ReportLab/PDFium preinstalados."""
import json
from pathlib import Path
from reportlab.graphics.shapes import Drawing, String, Rect, Line
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics import renderPDF, renderSVG
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import pypdfium2 as pdfium
from PIL import Image

OUT=Path(__file__).resolve().parent
R=json.loads((OUT/'resultados.json').read_text(encoding='utf-8'))
S=R['summary']
FIG=OUT/'graficas'
FIG.mkdir(exist_ok=True)
W,H=1050,670
INK,MUTED,GRID=[colors.HexColor(c) for c in ['#172b43','#4e6278','#dce4ed']]
BLUE,GREEN,RED,GRAY,GOLD=[colors.HexColor(c) for c in ['#2465ac','#087f64','#bb4149','#98a4b2','#af6517']]
def text(d,x,y,value,size=11,color=INK,bold=False,anchor='start'):
    d.add(String(x,y,str(value),fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,fillColor=color,textAnchor=anchor))
def frame(title,subtitle):
    d=Drawing(W,H);d.add(Rect(0,0,W,H,fillColor=colors.white,strokeColor=None))
    d.add(Rect(34,H-64,6,27,fillColor=GREEN,strokeColor=None))
    text(d,52,H-58,title,23,bold=True);text(d,36,H-85,subtitle,12,MUTED)
    d.add(Line(36,49,W-36,49,strokeColor=GRID))
    text(d,36,29,'BARBEXA | EQ-05 | Observación local de una hora, 26 nov. 2026',10,MUTED)
    text(d,W-36,29,'No acredita disponibilidad mensual o servicio publicado',10,MUTED,anchor='end')
    return d
def plot(d,x,y,w,h,series,ylabel,ymax=None):
    series=[(label,col,[(a,b) for a,b in points if a is not None and b is not None]) for label,col,points in series]
    series=[s for s in series if s[2]]
    if not series:
        text(d,x+w/2,y+h/2,'Sin observaciones disponibles',anchor='middle');return
    p=LinePlot();p.x=x;p.y=y;p.width=w;p.height=h;p.data=[s[2] for s in series];p.joinedLines=1
    for ax in [p.xValueAxis,p.yValueAxis]:
        ax.strokeColor=GRID;ax.labels.fontName='Helvetica';ax.labels.fontSize=10;ax.labels.fillColor=MUTED
    p.xValueAxis.valueMin=0;p.xValueAxis.valueMax=60;p.xValueAxis.valueSteps=[0,10,20,30,40,50,60]
    p.yValueAxis.valueMin=0;p.yValueAxis.visibleGrid=True;p.yValueAxis.gridStrokeColor=GRID
    if ymax is not None:p.yValueAxis.valueMax=ymax
    for i,(_,col,_) in enumerate(series):p.lines[i].strokeColor=col;p.lines[i].strokeWidth=1.8
    d.add(p);text(d,x,y+h+15,ylabel,11,MUTED,bold=True);text(d,x+w/2,y-32,'Minutos desde el inicio programado',11,MUTED,anchor='middle')
def legend(d,entries,x=80,y=530,step=260):
    for i,(label,col) in enumerate(entries):
        d.add(Rect(x+i*step,y,16,10,fillColor=col,strokeColor=None));text(d,x+i*step+23,y,label,11,MUTED)

figures=[]
d=frame('Disponibilidad y cobertura del periodo','360 intervalos previstos de 10 segundos; ningún intervalo sin datos se trata como éxito')
legend(d,[('Disponible',GREEN),('No disponible',RED),('Sin datos',GRAY)],80,521)
for r in R['records']:
    col={'available':GREEN,'unavailable':RED,'no-data':GRAY}[r['status']]
    d.add(Rect(80+r['index']*2.47,390,2.47,65,fillColor=col,strokeColor=None))
for minute in range(0,61,10):
    x=80+minute/60*889.2;d.add(Line(x,382,x,389,strokeColor=MUTED));text(d,x,360,str(minute),11,MUTED,anchor='middle')
text(d,525,329,'Minutos programados',11,MUTED,anchor='middle')
for i,(label,value) in enumerate([('Disponibilidad observada',S['availabilityPercent']),('Cobertura',S['coveragePercent']),('Límite inferior programado',S['lowerBoundScheduledPercent'])]):
    xx=80+i*310;text(d,xx,253,label,13,bold=True);text(d,xx,203,'No disponible' if value is None else f'{value:.4f} %',27,GREEN,bold=True)
text(d,80,143,f"Resultados: {S['available']} disponibles / {S['unavailable']} no disponibles / {S['noData']} sin datos.",13,MUTED)
text(d,80,113,'Meta adaptada: >=99,5 % en la ventana observada. Exige informar cobertura por separado.',12,MUTED)
text(d,80,82,'La adaptación a una hora requiere aceptación docente; el escenario original es mensual.',12,GOLD,bold=True)
figures.append(('01-estado',d))

d=frame('Tiempo del flujo supervisado','Autenticación, consultas, reserva, persistencia, cancelación y verificación; sin reintentos')
points=[(r['index']/6,r.get('durationMs')) for r in R['records']]
maximum=max([y for _,y in points if y is not None],default=0)
plot(d,80,190,890,300,[('Flujo',BLUE,points)],'Flujo completo (ms)',max(1000,maximum*1.15))
text(d,80,126,f"p50 = {R['p50FlowMs']:.2f} ms | p95 = {R['p95FlowMs']:.2f} ms | p99 = {R['p99FlowMs']:.2f} ms",13,BLUE,bold=True)
text(d,80,98,'Límites previos: 10.000 ms por petición y 30.000 ms por flujo; el eje muestra tiempos reales.',11,MUTED)
text(d,80,76,'Sin datos: sin latencia asignada. Puntos ausentes nunca se sustituyen por cero.',11,MUTED)
figures.append(('02-latencias',d))

from datetime import datetime
epoch=datetime.fromisoformat(R['start'].replace('Z','+00:00')).timestamp()
samples=R['resources']
def values(k):return [((datetime.fromisoformat(x['at'].replace('Z','+00:00')).timestamp()-epoch)/60,x.get(k)) for x in samples]
d=frame('Recursos observados durante la hora','Lecturas del host y sesiones PostgreSQL; no son métricas de disponibilidad por sí solas')
legend(d,[('RAM host %',GOLD),('CPU host %',BLUE)],80,530,250)
plot(d,80,355,890,135,[('RAM',GOLD,values('ramPercent')),('CPU',BLUE,values('cpuObservedPercent'))],'Uso del host (%)',100)
legend(d,[('Sesiones PG',GREEN)],80,287)
pg=[((datetime.fromisoformat(x['at'].replace('Z','+00:00')).timestamp()-epoch)/60,x['connections']['sessions']) for x in samples]
plot(d,80,120,890,130,[('Sesiones',GREEN,pg)],'Sesiones PostgreSQL muestreadas',max(30,max([v for _,v in pg],default=0)*1.2))
text(d,80,72,f"RAM libre mínima: {min(x['freeMiB'] for x in samples)/1024:.2f} GiB | Límite PG: {max(x['connections']['max'] for x in samples)} sesiones",11,MUTED)
figures.append(('03-recursos',d))

c=canvas.Canvas(str(FIG/'eq05-disponibilidad.pdf'),pagesize=(W,H));c.setTitle('BARBEXA EQ-05 - hora local observada')
for name,d in figures:renderSVG.drawToFile(d,str(FIG/(name+'.svg')));renderPDF.draw(d,c,0,0);c.showPage()
c.save();pdf=pdfium.PdfDocument(str(FIG/'eq05-disponibilidad.pdf'));assert len(pdf)==3
thumbs=[]
for i,(name,_) in enumerate(figures):
    im=pdf[i].render(scale=1.6).to_pil();im.save(FIG/(name+'.png'));im.thumbnail((840,536));thumbs.append(im.copy())
sheet=Image.new('RGB',(840,1608),'#dce4ed')
for i,im in enumerate(thumbs):sheet.paste(im,(0,i*536))
sheet.save(FIG/'vista-conjunta.png')
print('Tres gráficas PNG/SVG y PDF de tres páginas, generados únicamente con la observación terminada.')

# Academic report, separate from the figures-only PDF.
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as PdfImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from xml.sax.saxutils import escape
styles=getSampleStyleSheet()
styles.add(ParagraphStyle('BodyEQ',fontName='Helvetica',fontSize=9.5,leading=14,spaceAfter=9,textColor=INK))
styles.add(ParagraphStyle('TitleEQ',fontName='Helvetica-Bold',fontSize=24,leading=29,spaceAfter=16,textColor=INK))
styles.add(ParagraphStyle('HeadingEQ',fontName='Helvetica-Bold',fontSize=14,leading=19,spaceAfter=11,textColor=INK))
story=[]
def para(value,style='BodyEQ'):story.append(Paragraph(escape(str(value)),styles[style]))
def report_table(rows,widths):
    formatted=[[Paragraph(escape(str(value)),styles['BodyEQ']) for value in row] for row in rows]
    t=Table(formatted,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf3f8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),0.4,GRID),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
    story.append(t);story.append(Spacer(1,13))
para('BARBEXA | EQ-05','TitleEQ')
para('Informe académico de disponibilidad local','HeadingEQ')
para('26 de noviembre de 2026 | Una hora completa | Cuenta y datos sintéticos')
para('Resultado: adaptación local alcanzada. El requisito original mensual del servicio publicado NO queda acreditado. La adaptación requiere aceptación docente.')
report_table([['Medida','Resultado'],['Ventana Lima','15:27:14 a 16:27:14'],['Duración monotónica',f"{R['actualElapsedMs']/1000:.3f} segundos"],['Frecuencia','Un sondeo cada 10 segundos; 360 programados'],['Disponibles / fallidos / sin datos',f"{S['available']} / {S['unavailable']} / {S['noData']}"],['Disponibilidad / cobertura','100 % / 100 %'],['Peticiones HTTP medidas',R['httpRequests']],['Reservas propias / activas','361 / 0']],[225,298])
para('Metodología y fórmulas','HeadingEQ')
para('Flujo: Auth real, catálogo, horarios, reservas propias, confirmación, lectura persistida, cancelación y comprobación. Límites previos: 10 s por petición y 30 s por flujo. Sin reintentos ni respuestas simuladas. Destino exclusivo: laboratorio 127.0.0.1:54721.')
para('Disponibilidad = disponibles / (disponibles + no disponibles) x 100. Cobertura = intervalos clasificados / 360 x 100. Límite inferior del periodo = disponibles / 360 x 100. Sin datos nunca cuenta como éxito. Es estimación por muestreo, no observación continua.')
story.append(PageBreak())
para('Tiempos de respuesta y recursos','HeadingEQ')
para(f"Flujo completo: media {R['meanFlowMs']:.2f} ms; p50 {R['p50FlowMs']:.2f} ms; p95 {R['p95FlowMs']:.2f} ms; p99 {R['p99FlowMs']:.2f} ms; máximo {R['maxFlowMs']:.2f} ms.")
report_table([['Paso (360 muestras por paso)','p50 ms','p95 ms','p99 ms']]+[[o['operation'],f"{o['p50Ms']:.2f}",f"{o['p95Ms']:.2f}",f"{o['p99Ms']:.2f}"] for o in R['operations']],[259,88,88,88])
para('Percentiles offline: valor ordenado de índice floor((N-1)*p). Los intervalos sin datos no tienen latencia cero. No se mezclan resultados de k6 con esta evaluación.')
rs=R['resourceStats']
para(f"CPU del host media/máxima: {rs['cpu']['mean']:.2f}/{rs['cpu']['max']:.2f} %. RAM máxima: {rs['ramPercent']['max']:.2f} %; libre mínima: {rs['freeMiB']['min']/1024:.3f} GiB. PostgreSQL: {rs['pgSessions']['min']}-{rs['pgSessions']['max']} sesiones sobre límite {rs['pgSessions']['limit']}.")
para('Se conservó la primera CPU cruda como línea base; se excluyó del análisis temporal. Recursos del host compartido, no CPU/RAM exclusivos por servicio. Las protecciones críticas y sostenidas permanecieron activas.')
para('No se detectaron interrupciones, intervalos sin datos ni recuperaciones tras fallo. No hubo mantenimiento declarado; no se deduce de ello ausencia absoluta de eventos no observados.')
story.append(PageBreak())
para('Integridad, conservación y alcance','HeadingEQ')
para('La auditoría SQL guardada concilia 360 reservas medidas y una de preflight: todas canceladas lógicamente, ninguna activa. Cada una conserva un item, un evento de confirmación, otro de cancelación y su fila care. No se borraron historiales.')
para(f"Total auditado: {R['integrity']['integrity']['reservations']:,} reservas. Se preservaron {R['integrity']['priorReservations']:,} previas, filas de 18 tablas y hashes de 814 archivos protegidos y 763 evidencias históricas. Cero solapamientos, tenants incongruentes, requests/recibos duplicados y reservas parciales.")
para('Intento parcial anterior: 128 éxitos, cero fallos y 232 sin datos; cobertura 35,56 %, cierre por solicitud del responsable. Se conserva por separado y no se suma a la hora aprobada.')
para('Justificación académica','HeadingEQ')
para('El plazo del Sprint 2 permite una hora reproducible para validar los contratos implementados, registro de eventos e integridad. El escenario original exige un mes en servicio publicado. La adaptación requiere aceptación docente y no permite extrapolar 100 % a ese mes, a Internet, DNS/CDN o al producto publicado.')
para('Se usó un monitor Node.js local, no Grafana Synthetic Monitoring propuesto originalmente. No se contrató Grafana Cloud ni se presenta esta adaptación como observación externa.')
para('Estado: EQ-05 parcial integral; objetivo de la adaptación local acreditado. No es un ensayo de carga, de renderizado Web, Android o recuperación ante una caída deliberada. Las caídas de duración inferior al muestreo pueden no observarse.')
para('Entregables y siguientes pasos mínimos','HeadingEQ')
para('Código organizado, primera versión Web, OpenAPI/Swagger y pruebas/cobertura están disponibles. El paquete de atributos está documentado: seis cumplidos en su alcance definido y cuatro parciales (02, 05, 08, 09). Presentar las limitaciones y solicitar aceptación académica; no declarar diez cierres integrales.')
para('No repetir k6 ni esta hora. Los 2.000 VU siguen como meta adicional pospuesta; Android, mapas, imágenes y reseñas conservan sus pendientes. Los cambios recientes siguen locales, sin commits ni push autorizados.')
para('Trazabilidad: INFORME.md, resultados.json, resumen.json, CSV, integridad.json, auditoria-offline.json y preservacion-sha256.json en la misma carpeta. El manifiesto privado y las sesiones no forman parte del informe público.')
for name,_ in figures:
    story.append(PageBreak());para(name.replace('-',' ').title(),'HeadingEQ')
    story.append(PdfImage(str(FIG/(name+'.png')),width=523,height=334))
def footer(c,doc):
    c.setFont('Helvetica',8);c.setFillColor(MUTED)
    c.drawString(36,23,'BARBEXA - EQ-05 local | No acredita disponibilidad mensual')
    c.drawRightString(A4[0]-36,23,str(doc.page))
SimpleDocTemplate(str(OUT/'INFORME.pdf'),pagesize=A4,rightMargin=36,leftMargin=36,topMargin=36,bottomMargin=42,title='BARBEXA EQ-05 - Informe académico local').build(story,onFirstPage=footer,onLaterPages=footer)

# Separate simulated terminal preview. Never included as a measured availability graph.
demo=OUT/'terminal-demo.txt'
if demo.exists():
    lines=demo.read_text(encoding='utf-8-sig').splitlines()
    assert any('SIMULADOS' in line for line in lines)
    preview=Drawing(1000,46+len(lines)*23)
    preview.add(Rect(0,0,preview.width,preview.height,fillColor=colors.HexColor('#102134'),strokeColor=None))
    for i,line in enumerate(lines):
        col=colors.HexColor('#f5c56b' if 'SIMULADOS' in line else '#8de4c1' if '+' in line else '#e7edf5')
        preview.add(String(24,preview.height-34-i*23,line,fontName='Courier',fontSize=13,fillColor=col))
    renderSVG.drawToFile(preview,str(OUT/'terminal-demo.svg'))
    renderPDF.drawToFile(preview,str(FIG/'terminal-demo-simulado.pdf'))
    rendered=pdfium.PdfDocument(str(FIG/'terminal-demo-simulado.pdf'))
    rendered[0].render(scale=1.2).to_pil().save(OUT/'terminal-demo.png')
