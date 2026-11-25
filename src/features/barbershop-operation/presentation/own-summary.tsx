import { useRef, useState } from 'react';
import { Section } from '../../../shared/ui/page-header';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { BusinessError } from '../domain/values';
import type { OwnProfessionalSummary } from '../domain/own-summary';
import type { OwnSummaryApplication } from '../application/own-summary';
export function OwnSummaryContent(p: {
  date: string;
  view: OwnProfessionalSummary | null;
  busy: boolean;
  error: string | null;
  onDate: (v: string) => void;
  onRead: () => void;
}) {
  return (
    <Section title="Mi resumen profesional">
      <AppText>
        Solo tu actividad en la barbería seleccionada, por fecha de Lima.
      </AppText>
      <AppTextField
        id="own-summary-date"
        label="Fecha del resumen (AAAA-MM-DD)"
        value={p.date}
        onChangeText={p.onDate}
        disabled={p.busy}
      />
      <AppButton
        label={p.busy ? 'Consultando resumen…' : 'Consultar mi resumen'}
        onPress={p.onRead}
        disabled={p.busy}
      />
      {p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {p.error}
        </AppText>
      )}
      {p.view ? (
        <>
          <AppText variant="action">
            {p.view.professional.professionalName} · {p.view.localDate}
          </AppText>
          {p.view.total === 0 ? (
            <AppText>Sin actividad en esta fecha.</AppText>
          ) : (
            <>
              <AppText>Total de citas: {p.view.total}</AppText>
              <AppText>Programadas: {p.view.scheduled}</AppText>
              <AppText>En atención: {p.view.inService}</AppText>
              <AppText>Completadas: {p.view.completed}</AppText>
              <AppText>Canceladas: {p.view.cancelled}</AppText>
              <AppText>Inasistencias: {p.view.noShow}</AppText>
              <AppText>
                Sin estado de atención registrado: {p.view.unrecorded}
              </AppText>
              <AppText>Próximas del día: {p.view.upcoming}</AppText>
              {p.view.nextStartsAt && (
                <AppText>
                  Siguiente:{' '}
                  {new Date(p.view.nextStartsAt).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                  })}
                </AppText>
              )}
            </>
          )}
          {p.error && (
            <AppText>
              Se conserva el último resultado verificado para la fecha indicada.
            </AppText>
          )}
        </>
      ) : (
        <AppText>Consulta una fecha para ver tu actividad.</AppText>
      )}
    </Section>
  );
}
export function OwnSummaryPanel({
  application: app,
}: {
  application: OwnSummaryApplication;
}) {
  const [date, setDate] = useState(() =>
      new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10),
    ),
    [view, setView] = useState<OwnProfessionalSummary | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const running = useRef(false),
    stamp = app.scopeKey();
  async function read() {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await app.read(date);
      if (app.scopeKey() === stamp) setView(result);
    } catch (e) {
      if (app.scopeKey() !== stamp) return;
      const code =
        e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE';
      setError(
        code === 'NOT_AVAILABLE'
          ? 'No tienes un perfil profesional activo en esta barbería.'
          : code === 'INVALID_INPUT'
            ? 'Indica una fecha válida.'
            : code === 'FORBIDDEN' || code === 'UNAUTHENTICATED'
              ? 'Tu sesión no permite consultar este resumen.'
              : 'No pudimos consultar el resumen. Puedes reintentar.',
      );
      if (['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code))
        setView(null);
    } finally {
      running.current = false;
      if (app.scopeKey() === stamp) setBusy(false);
    }
  }
  return (
    <OwnSummaryContent
      date={date}
      view={view}
      busy={busy}
      error={error}
      onDate={setDate}
      onRead={() => void read()}
    />
  );
}
