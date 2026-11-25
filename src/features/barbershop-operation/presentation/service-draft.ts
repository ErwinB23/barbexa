import { moneyPEN } from '../domain/values';

export class ServiceDraftError extends Error {
  constructor(
    readonly field: 'name' | 'price' | 'duration',
    message: string,
  ) {
    super(message);
    this.name = 'ServiceDraftError';
  }
}
export function parseServiceDraft(input: {
  name: string;
  price: string;
  duration: string;
}) {
  const name = input.name.trim();
  if (!name)
    throw new ServiceDraftError('name', 'Escribe el nombre del servicio.');
  const price = input.price.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(price))
    throw new ServiceDraftError(
      'price',
      'Ingresa un precio válido, por ejemplo 15 o 15,50.',
    );
  const [whole, fraction = ''] = price.split('.');
  const amountMinor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(amountMinor) || amountMinor > 999999999999)
    throw new ServiceDraftError(
      'price',
      'El precio supera el importe permitido.',
    );
  const duration = input.duration.trim();
  const durationMin = Number(duration);
  if (
    !/^\d+$/.test(duration) ||
    !Number.isInteger(durationMin) ||
    durationMin < 1 ||
    durationMin > 2147483647
  )
    throw new ServiceDraftError(
      'duration',
      'Ingresa una duración válida en minutos enteros, por ejemplo 30.',
    );
  return { name, price: moneyPEN(amountMinor), durationMin };
}
