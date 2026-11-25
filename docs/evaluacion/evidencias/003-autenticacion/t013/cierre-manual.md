# Cierre de T011 y T013 — evidencia manual del usuario

Fecha de registro: 14/11/2026, America/Lima. **T011 [x], T013 [x]; 13/36.**
Origen: confirmación expresa del usuario en esta conversación. Los recorridos fueron
ejecutados por el usuario, **no por Codex**. Entorno: exclusivamente Supabase local y
Mailpit; Web y APK Android Development existente en teléfono real. No prueba Cloud.

## Resultado esperado y observado

| Plataforma | Esperado | Confirmación del usuario |
| --- | --- | --- |
| Web | Registro ficticio local, correo en Mailpit, confirmación válida y perfil propio. | Registro correcto; correo recibido; enlace abierto; «Confirmación de cuenta» con «Perfil confirmado» y nombre correcto. |
| Android | Otra cuenta ficticia local desde el APK, correo y retorno al APK con perfil propio. | Registro correcto; correo recibido; enlace abierto desde el teléfono y retorno correcto; «Perfil confirmado» y nombre correcto. |

Ambos recorridos fueron declarados satisfactorios, sin observaciones funcionales.
El usuario informa cuatro capturas visuales. No proporcionó rutas y no se localizaron
imágenes en las evidencias 003 del repositorio: no se inventan nombres/enlaces ni se
atribuye a Codex una inspección visual de esas capturas. La declaración manual es la
evidencia de ejecución; no depende de una ruta de captura inexistente.

## Cotejo de criterios literales

| Tarea | Criterios acreditados y evidencia |
| --- | --- |
| T011 | Acciones/coordinador/adaptador y parsers implementados, validación del destino y PKCE único, conservación del verifier, limpieza Web y fallo seguro sin implicit. Pruebas previas de T010/T011 y composición documentadas en [resultado T011](../t011/resultado.md) y [verificaciones T013](verification.json). Perfil propio mediante getOwnProfile/ensureOwnProfile de002; ausente exige datos, existente no se sobrescribe, metadata no autoriza roles. El pendiente adicional de registro→correo→confirmación→perfil real queda ahora acreditado en ambas plataformas por el usuario. |
| T013 | Pantallas y rutas del grupo auth, callback y provider raíz integrados; carga/error/éxito, perfil pendiente y reintento sin nueva alta cubiertos por las pruebas de presentación/coordinador previas. T011 y T012 satisfechas; rutas públicas001 conservadas con regresiones previas. Presentación conectada comprobada por el usuario en Web y Android. |

Se reutilizan **108/108 unitarias, 65/65 integración/presentación**, tipos, lint, formato
y arquitectura con salida0, ya registrados; no se ejecutaron otra vez. La cobertura
previa100% líneas/funciones y97,23% ramas corresponde al núcleo, no a las pantallas.
Las17 pruebas originales RED→GREEN están conservadas. Este cierre solo modifica documentos.

No se atribuye al usuario una ejecución manual de los casos negativos por el hecho de
haber confirmado el recorrido satisfactorio. Enlaces inválidos/consumidos, cierre de
vista, fallo/reintento de perfil y tres recorridos consecutivos por plataforma siguen en
la validación real ampliada **T014**, además de su cobertura automática ya existente.
Cerrar las tareas de implementación no equivale a cerrar T014 ni SC-001/SC-006 completos.

## Observaciones visuales para una mejora posterior

Declaradas por el usuario: tipografía de aspecto manuscrito visible en Android y
espaciado irregular en algunos textos. Registradas como mejora futura de UI, sin
diagnosticar una causa, rediseñar pantallas ni atribuirlas a una revisión visual de Codex.
No se reportaron fallos funcionales asociados.

## Datos conservados y siguiente bloque propuesto

No se consultó ni alteró la base: las cuentas y perfiles ficticios locales usados por
el usuario quedan conservados. No se eliminaron mensajes de Mailpit ni sesiones/datos.
Antes de una limpieza, identificar selectivamente esos datos y comprobar su utilidad
para perfil existente, enlaces consumidos y demás verificaciones pendientes.

Siguiente bloque recomendado: **T014, validación US1**, ahora habilitada por T011–T013.
Preparar cuentas/límites y limpieza selectiva; completar tres recorridos consecutivos
primero Web e inmediatamente Android, incluidos cierre de vista, enlace inválido/consumido,
perfil reintentado y comprobación de duplicados; registrar us1-web.md/us1-android.md.
Reutilizar controles válidos y ejecutar solo calidad afectada cuando proceda. No se da por
hecha esa batería a partir de estos dos recorridos ni se ejecuta aquí.
Después: **T015 → T016 → T017** (RED, login/logout compartido, pantallas/guardas), con Web
ligeramente prioritaria y validación Android seguida en cada flujo. T018/T019 vendrán después.

Riesgos npm moderados y XSS residual Web permanecen documentados. No nuevas operaciones
Auth/Cloud, correos, usuarios, builds, dependencias, contenedores, commits ni push.
Comprobaciones documentales/Git de este cierre: [revisión](cierre-revision.json).
