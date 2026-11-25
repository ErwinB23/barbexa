# Configuración de Yape en Web

El editor administrativo muestra titular, celular y una vista previa local del QR.
El guardado utiliza la configuración existente por barbería. Los dos campos
se guardan como líneas legibles al inicio de las instrucciones, seguidos de las
indicaciones anteriores. El editor reconoce el formato que genera y vuelve a
separar los campos al abrirlo. El texto anterior sin ese formato se mantiene
disponible en «Instrucciones de pago». El QR se mantiene en memoria durante la
edición y se descarta al salir.

## Propuesta para almacenamiento estructurado

Agregar titular, celular y una referencia opcional al objeto del QR a la
configuración de cada barbería. Exponerlos en una versión compatible del
contrato de lectura y guardado. Mantener las instrucciones existentes como
texto de ayuda y conservar el comportamiento de las barberías sin datos nuevos.
Validar el celular en el servidor y conservar la activación explícita y la
confirmación manual del pago.

Usar un bucket privado con rutas asignadas por el servidor bajo el identificador
de la barbería. Autorizar escrituras mediante la misma facultad que permite
configurar pagos. Verificar tamaño, formato real y decodificación de la imagen
en el servidor. Generar nombres de objeto y confirmar el cambio de referencia
solo tras validar la nueva carga. Retirar el objeto anterior después de
confirmar el cambio y limpiar cargas abandonadas. Limitar la lectura a los
administradores autorizados y, cuando se implemente la pantalla de cliente, a
las reservas autorizadas con pago por Yape mediante acceso temporal. Definir la
retención antes de eliminar imágenes que otras reservas aún puedan necesitar.

Validar aislamiento por barbería, permisos, reintentos, reemplazo, retirada y
compatibilidad con las instrucciones anteriores antes de aplicar una migración.
