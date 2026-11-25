# Decisiones — 006

- **Decisión**: completar RF05 con el puerto002 existente. **Razón**: `profiles.ts`,
  composición tenant y adaptador HTTP ya implementan edición; falta conectar la interfaz.
  **Alternativa descartada**: nueva tabla/RPC/Edge o duplicar un servicio.
- **Decisión**: distinguir perfil personal de profesional. **Razón**: RF21 exige edición
  profesional conforme a pertenencia; el upsert004 es administrativo y no debe abrirse
  a un barbero. Campos ampliados y comando propio requieren contrato y permiso de migración;
  esta entrega no cubre el editor profesional completo.
- **Decisión**: generación de sesión y respuesta propia para descartar respuestas tras
  logout/cambio de cuenta; una edición no debe alterar el rol por barbería.
- **Fuente**: copia local limpia de la propuesta, remote exacto
  `ErwinB23/barberia_app-arquitSoft-02-Erwin`, HEAD
  `1eb8852388480388f39035641eb87d299def9258`, requisitos e historias; solo lectura.
