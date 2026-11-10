# Modelo técnico local — 001

Diseño previsto, sin persistencia ni entidades de negocio. Véase [contrato](contracts/foundation.md).

| Tipo propio | Campos / reglas | Responsabilidad |
| --- | --- | --- |
| SolicitudInformacion | `idioma`: cadena; solo `es-PE` aceptado | Entrada que el caso de uso valida en runtime |
| InformacionAplicacion | `nombre`, `version`, `descripcion`: cadenas no vacías | Información pública, inmutable, sin usuario ni tenant |
| ResultadoInformacion | Unión discriminada: `ok` con información, `entrada-invalida`, `no-disponible` | Resultado propio; no filtra excepciones del proveedor |

El adaptador de configuración local recibe datos públicos al construirse. El punto de composición
entrega nombre, versión y descripción, sin importar `app.json` desde el núcleo. El adaptador valida
sus datos antes de devolver el tipo propio; configuración malformada se convierte en no disponible.

Estado de presentación separado del resultado de aplicación:

- `cargando` → `exito` o `error`; `error` → reintento → `cargando`.
- `vacio` pertenece a la galería visual estática de componentes; no significa que exista un negocio vacío.
- La galería incluye ejemplos etiquetados de carga, vacío, error y éxito. No fuerza errores artificiales
  en el caso de uso ni agrega parámetros de negocio para producir capturas.
- La información técnica real carga al entrar a la pantalla. Se ignoran respuestas tras desmontar;
  durante una solicitud se deshabilita el reintento para evitar duplicados.

No hay sesiones, roles, barberías, tablas ni migraciones en esta feature. Un texto sobre preparación
multitenant nunca se presentará como evidencia de aislamiento implementado.
