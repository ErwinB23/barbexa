export type SolicitudInformacion = Readonly<{
  // La validación runtime admite únicamente es-PE.
  idioma: string;
}>;

export type InformacionAplicacion = Readonly<{
  // El adaptador validará que estos datos públicos sean cadenas no vacías.
  nombre: string;
  version: string;
  descripcion: string;
}>;

export type ResultadoInformacion =
  | Readonly<{ estado: 'ok'; informacion: InformacionAplicacion }>
  | Readonly<{ estado: 'entrada-invalida' }>
  | Readonly<{ estado: 'no-disponible' }>;
