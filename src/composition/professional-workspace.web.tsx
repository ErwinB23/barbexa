import { useContext } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import { ProfessionalDashboard } from './professional-dashboard.web';
import { SelfProfessional } from '../features/barbershop-operation/presentation/self-professional';
import { SelfSchedulePanel } from '../features/barbershop-operation/presentation/self-schedule';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { ProfessionalAgenda } from './professional-agenda.web';
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from '../shared/ui/workspace-icon.web';
import { professionalWorkspaceStyles } from '../features/barbershop-operation/presentation/professional-workspace.web.styles';

export const professionalSections = [
  { id: 'summary', label: 'Resumen profesional', icon: 'home' },
  { id: 'agenda', label: 'Mi agenda', icon: 'reservations' },
  { id: 'schedules', label: 'Mis horarios', icon: 'calendar' },
  { id: 'profile', label: 'Perfil profesional', icon: 'user' },
] as const;

export function ProfessionalWorkspace({
  application: app,
  shopId,
  shopName,
  scopeKey,
}: {
  application: OperationApplication;
  shopId: string;
  shopName: string;
  scopeKey: string;
}) {
  const booking = useContext(BookingContext);
  const { section } = useLocalSearchParams();
  const active =
    professionalSections.find((s) => s.id === section)?.id ?? 'summary';
  return (
    <div className="bx-professional-workspace">
      <style>{professionalWorkspaceStyles}</style>
      <header className="bx-professional-header">
        <div>
          <span className="bx-professional-accent" />
          <h1>Mi espacio profesional</h1>
          <p>Tu perfil, horarios y actividad en la barbería seleccionada.</p>
          <strong>
            <WorkspaceIcon name="shop" />
            {shopName}
          </strong>
        </div>
      </header>
      <nav
        className="bx-professional-tabs"
        aria-label="Secciones de Mi espacio profesional"
      >
        {professionalSections.map((s) => (
          <Link
            key={s.id}
            href={`/staff?view=professional&section=${s.id}`}
            aria-current={active === s.id ? 'page' : undefined}
          >
            <WorkspaceIcon name={s.icon as WorkspaceIconName} />
            {s.label}
          </Link>
        ))}
      </nav>
      <section
        className={`bx-professional-content bx-professional-content--${active}`}
        aria-label={professionalSections.find((s) => s.id === active)!.label}
        key={`${scopeKey}:${active}`}
      >
        {active === 'summary' &&
          (app.ownSummary ? (
            <ProfessionalDashboard
              application={app}
              booking={booking}
              shopId={shopId}
              shopName={shopName}
            />
          ) : (
            <p role="status">
              El resumen profesional no está habilitado en este entorno.
            </p>
          ))}
        {active === 'profile' &&
          (app.canEditOwnProfessional?.() ? (
            <SelfProfessional application={app} shopName={shopName} />
          ) : (
            <p role="status">
              No tienes un perfil profesional editable en esta barbería.
            </p>
          ))}
        {active === 'schedules' &&
          (app.selfSchedule ? (
            <SelfSchedulePanel application={app.selfSchedule} />
          ) : (
            <p role="status">
              Los horarios profesionales no están habilitados en este entorno.
            </p>
          ))}
        {active === 'agenda' &&
          (booking?.agenda ? (
            <ProfessionalAgenda
              application={app}
              booking={booking}
              shopId={shopId}
            />
          ) : (
            <p role="status">La agenda profesional no está disponible.</p>
          ))}
      </section>
    </div>
  );
}
