import type { Professional } from '../domain/types';
import { ShopSettingsIcon } from './shop-settings-web';
export function AvailabilityScopeWeb(p: {
  barber: string | null;
  professionals: readonly Professional[];
  disabled: boolean;
  onScope: (id: string | null) => void;
}) {
  const person = p.professionals.find((v) => v.id === p.barber);
  return (
    <div className="bx-availability-scope">
      <label htmlFor="exception-target">
        ¿A quién afectará?
        <select
          id="exception-target"
          value={p.barber ?? ''}
          disabled={p.disabled}
          onChange={(e) => p.onScope(e.target.value || null)}
        >
          <option value="">Toda la barbería</option>
          {p.professionals.map((v) => (
            <option key={v.id} value={v.id}>
              {v.professionalName}
            </option>
          ))}
        </select>
      </label>
      <div className="bx-availability-impact" role="status">
        <ShopSettingsIcon name={p.barber ? 'team' : 'shop'} />
        <div>
          <strong>
            {p.barber
              ? `Solo ${person?.professionalName ?? 'el profesional seleccionado'}`
              : 'Toda la barbería'}
          </strong>
          <p>
            {p.barber
              ? 'Bloquea nuevas reservas solo para este profesional. Los demás profesionales mantienen su disponibilidad.'
              : 'Bloquea nuevas reservas para todos los profesionales de esta barbería durante el periodo indicado.'}
          </p>
        </div>
      </div>
      <p className="bx-availability-help">
        Este selector está sincronizado con el horario elegido arriba. Usa una
        excepción para una fecha concreta; el horario semanal se edita en el
        calendario superior.
      </p>
    </div>
  );
}
