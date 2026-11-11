import type { InformacionAplicacion } from '../../../src/features/foundation/domain/app-information.js';
import type { InformacionAplicacionGateway } from '../../../src/features/foundation/application/app-information-gateway.js';

export class InformacionGatewayEnMemoria implements InformacionAplicacionGateway {
  llamadas = 0;

  constructor(
    private readonly responder: () => Promise<InformacionAplicacion>,
  ) {}

  async obtener(): Promise<InformacionAplicacion> {
    this.llamadas += 1;
    return this.responder();
  }
}
