import { useContext, useEffect, useState } from 'react';
import { BookingContext } from './booking-context';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
export function PaymentChoice({
  barbershopId,
  selected,
  disabled,
  onSelect,
}: {
  barbershopId: string;
  selected?: 'cash' | 'yape';
  disabled: boolean;
  onSelect: (method: 'cash' | 'yape') => void;
}) {
  const app = useContext(BookingContext),
    [options, setOptions] = useState<{ cash: true; yape: boolean } | null>(
      null,
    ),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    if (!app?.care) return;
    void app
      .care({ command: 'payment-options', barbershopId })
      .then((raw) => {
        const v = raw as { cash: true; yape: boolean };
        if (v?.cash !== true || typeof v.yape !== 'boolean') throw Error();
        if (current) setOptions(v);
      })
      .catch(() => {
        if (current) setError(true);
      });
    return () => {
      current = false;
    };
  }, [app, barbershopId, attempt]);
  return (
    <>
      <AppText>
        Medio de pago (recepción manual; no se cobra desde la app)
      </AppText>
      {!options && !error && <AppText>Consultando medios disponibles…</AppText>}
      {error && (
        <>
          <AppText>
            No se pudieron consultar los medios. No confirmes hasta verificar la
            disponibilidad.
          </AppText>
          <AppButton
            label="Reintentar medios de pago"
            disabled={disabled}
            onPress={() => {
              setError(false);
              setOptions(null);
              setAttempt((n) => n + 1);
            }}
          />
        </>
      )}
      {options && (
        <>
          <AppButton
            label="Efectivo"
            selected={selected === 'cash'}
            disabled={disabled}
            onPress={() => onSelect('cash')}
          />
          {options.yape && (
            <AppButton
              label="Yape"
              selected={selected === 'yape'}
              disabled={disabled}
              onPress={() => onSelect('yape')}
            />
          )}
        </>
      )}
      {!selected && (
        <AppText>Selecciona un medio de pago antes de confirmar.</AppText>
      )}
    </>
  );
}
