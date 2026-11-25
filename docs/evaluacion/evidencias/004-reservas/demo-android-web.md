# T023 — demostración de agenda acreditada

**Confirmación manual vigente del usuario, 14/11/2026:** T023 validada satisfactoriamente.
Web administradorA: agenda correcta, apareció la reserva existente. Android administradorA:
agenda y filtro por profesional correctos. Sin observaciones ni nuevas reservas.
Se registra como confirmación del recorrido entregado (Android→agenda Web y dirección
inversa); no se inventan capturas, tiempos ni identificadores que el usuario no transcribió.
Las reservas reales previas y la matriz SQL/HTTP de asignación, tenant y revocación
permanecen acreditadas en [agenda.md](agenda.md). Son fuentes distintas: uso físico por el
usuario y pruebas automatizadas con JWT reales por Codex. No se declara nuevo TalkBack
ni una medición instrumental. T023[x].

## Antecedente antes de la confirmación manual

El usuario ya confirmó creación de reservas Web y Android en T019; no se repetirán.
Falta acreditar la misma cita Android en la agenda admin Web y la cita Web en Android,
con ID/hora/profesional/total, agenda profesional, accesibilidad y contexto. Ningún resultado
físico de agenda se atribuye aún al usuario ni a Codex. [Único recorrido](t020-t023/recorrido-manual.md).
La matriz de permisos/revocación sí se ejecutó con JWT reales y restauración exacta:
[roles](t020-t023/roles.json), [alcance](agenda.md). No sustituye la demo de interfaces.
