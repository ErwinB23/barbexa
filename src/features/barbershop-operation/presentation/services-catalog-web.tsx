import { useState, type ReactNode } from 'react';
import type { ManagementData } from '../application/operation-application';
import type { Service, ServiceCategory } from '../domain/types';
import { AppButton } from '../../../shared/ui/app-button';
import { ShopSettingsIcon } from './shop-settings-web';
import { servicesCatalogStyles } from './services-catalog-web.styles';

export const serviceCategories = [
  'Todos los servicios',
  'Corte de cabello',
  'Barba',
  'Tratamientos',
  'Otros',
] as const;
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
// Presentation grouping only: no categories are written or claimed as catalog data.
export function serviceVisualCategory(name: string) {
  const text = normalize(name);
  if (/corte|cabello|fade|peinado/.test(text)) return 'Corte de cabello';
  if (/barba|bigote|afeitado/.test(text)) return 'Barba';
  if (/tratamiento|capilar|hidrat|masaje|lavado/.test(text))
    return 'Tratamientos';
  return 'Otros';
}
export function filterCatalog(
  services: readonly Service[],
  query: string,
  category: string,
  status: string,
) {
  return services.filter(
    (service) =>
      (!query.trim() ||
        normalize(service.name).includes(normalize(query.trim()))) &&
      (category === 'Todos los servicios' ||
        (service.category ?? serviceVisualCategory(service.name)) ===
          category) &&
      (status === 'all' || service.active === (status === 'active')),
  );
}
export interface ServicesCatalogWebProps {
  title: string;
  data: ManagementData | null;
  loading: boolean;
  disabled: boolean;
  navigation: ReactNode;
  feedback: ReactNode;
  onContext?: () => void;
  category?: ServiceCategory;
  onCategory?: (value: ServiceCategory) => void;
  onDelete?: (service: Service) => void;
  serviceId?: string;
  serviceName: string;
  description: string;
  price: string;
  duration: string;
  active: boolean;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onPrice: (value: string) => void;
  onDuration: (value: string) => void;
  onActive: () => void;
  onSave: () => void;
  onNew: () => void;
  onEdit: (service: Service) => void;
}
export function ServicesCatalogWeb(p: ServicesCatalogWebProps) {
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState<string>('Todos los servicios'),
    [status, setStatus] = useState('all'),
    [page, setPage] = useState(1),
    [previewId, setPreview] = useState<string | null>(null),
    [editing, setEditing] = useState(false);
  const services = p.data?.services ?? [],
    known = !!p.data && !p.loading;
  const filtered = filterCatalog(services, query, category, status),
    pages = Math.max(1, Math.ceil(filtered.length / 5)),
    currentPage = Math.min(page, pages),
    shown = filtered.slice((currentPage - 1) * 5, currentPage * 5);
  const preview =
    services.find((service) => service.id === previewId) ??
    filtered[0] ??
    services[0];
  const money = (service: Service) =>
    `S/ ${(service.price.amountMinor / 100).toFixed(2)}`;
  function startNew() {
    p.onNew();
    setEditing(true);
  }
  function edit(service: Service) {
    p.onEdit(service);
    setPreview(service.id);
    setEditing(true);
  }
  return (
    <div className="bx-services-page">
      <style>{servicesCatalogStyles}</style>
      <header className="bx-services-heading">
        <h1>{p.title}</h1>
        <p>Configura tu negocio y prepara su oferta para recibir reservas.</p>
        {p.onContext && (
          <button type="button" onClick={p.onContext}>
            Seleccionar o actualizar mis barberías
          </button>
        )}
      </header>
      <nav
        className="bx-services-tabs"
        aria-label="Administración de la barbería"
      >
        {p.navigation}
      </nav>
      <div className="bx-services-feedback">{p.feedback}</div>
      <div className="bx-services-layout">
        <aside
          className="bx-services-panel bx-services-categories"
          aria-label="Categorías de servicios"
        >
          <div className="bx-services-title">
            <span>
              <ShopSettingsIcon name="layers" />
            </span>
            <div>
              <h2>Categorías de servicios</h2>
              <p>Organiza tus servicios por tipo.</p>
            </div>
          </div>
          <div className="bx-services-category-list">
            {serviceCategories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => {
                  setCategory(item);
                  setPage(1);
                }}
              >
                <ShopSettingsIcon
                  name={
                    item === 'Todos los servicios'
                      ? 'scissors'
                      : item === 'Tratamientos'
                        ? 'layers'
                        : item === 'Otros'
                          ? 'shop'
                          : 'scissors'
                  }
                />
                <span>{item}</span>
                <b>
                  {known
                    ? item === 'Todos los servicios'
                      ? services.length
                      : services.filter(
                          (s) =>
                            (s.category ?? serviceVisualCategory(s.name)) ===
                            item,
                        ).length
                    : '—'}
                </b>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled
            className="bx-services-new-category"
            aria-describedby="services-category-note"
          >
            ＋ Nueva categoría
          </button>
          <p id="services-category-note" className="bx-services-category-note">
            Selecciona la categoría al crear o editar un servicio.
          </p>
          <div className="bx-services-watermark" aria-hidden="true" />
        </aside>
        <section
          className="bx-services-panel bx-services-catalog"
          aria-labelledby="services-catalog-title"
        >
          <div className="bx-services-catalog-heading">
            <div className="bx-services-title">
              <span>
                <ShopSettingsIcon name="scissors" />
              </span>
              <div>
                <h2 id="services-catalog-title">Catálogo de servicios</h2>
                <p>
                  Administra los servicios que ofreces, sus precios, duración y
                  disponibilidad.
                </p>
              </div>
            </div>
            <AppButton
              label="Añadir servicio"
              disabled={p.disabled}
              onPress={startNew}
            />
          </div>
          <div className="bx-services-filters">
            <label>
              <span className="bx-services-sr-only">Buscar servicio</span>
              <input
                type="search"
                placeholder="Buscar servicio…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              <span className="bx-services-sr-only">Categoría</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {serviceCategories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'Todos los servicios'
                      ? 'Todas las categorías'
                      : item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="bx-services-sr-only">Estado</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Visible</option>
                <option value="inactive">Oculto</option>
              </select>
            </label>
          </div>
          {!known ? (
            <p className="bx-services-empty" role="status">
              {p.loading
                ? 'Consultando servicios…'
                : 'No se pudo cargar el catálogo. Utiliza Reintentar.'}
            </p>
          ) : !services.length ? (
            <div className="bx-services-empty">
              <ShopSettingsIcon name="scissors" />
              <h3>Todavía no hay servicios.</h3>
              <p>Añade el primero para preparar la oferta de tu barbería.</p>
            </div>
          ) : !shown.length ? (
            <p className="bx-services-empty">
              No hay servicios que coincidan con los filtros.
            </p>
          ) : (
            <div className="bx-services-list">
              {shown.map((service) => {
                const assigned =
                  p.data?.professionals.filter(
                    (profile) =>
                      profile.active &&
                      p.data?.capabilities.some(
                        (c) =>
                          c.barberId === profile.id &&
                          c.serviceId === service.id,
                      ),
                  ).length ?? 0;
                return (
                  <article
                    className={`bx-services-row${preview?.id === service.id ? ' is-selected' : ''}`}
                    key={service.id}
                  >
                    <button
                      type="button"
                      className="bx-services-row-main"
                      aria-label={`Vista previa de ${service.name}`}
                      aria-pressed={preview?.id === service.id}
                      onClick={() => setPreview(service.id)}
                    >
                      <span className="bx-services-row-icon">
                        <ShopSettingsIcon name="scissors" />
                      </span>
                      <span>
                        <strong>{service.name}</strong>
                        <span className="bx-services-price-duration">
                          <span>
                            <ShopSettingsIcon name="clock" />
                            {service.durationMin} min
                          </span>
                          <span>{money(service)}</span>
                        </span>
                      </span>
                    </button>
                    <div className="bx-services-row-info">
                      <span className="bx-services-category-chip">
                        <ShopSettingsIcon name="layers" />
                        {service.category ??
                          serviceVisualCategory(service.name)}
                      </span>
                      <small>
                        <ShopSettingsIcon name="team" />
                        {assigned}{' '}
                        {assigned === 1
                          ? 'profesional activo asignado'
                          : 'profesionales activos asignados'}
                      </small>
                    </div>
                    <span
                      className={`bx-services-state${service.active ? ' is-visible' : ''}`}
                    >
                      {service.active ? 'Visible' : 'Oculto'}
                    </span>
                    <details className="bx-services-menu">
                      <summary aria-label={`Acciones de ${service.name}`}>
                        •••
                      </summary>
                      <div>
                        <button
                          type="button"
                          disabled={p.disabled}
                          aria-label={`Editar ${service.name}`}
                          title="Editar servicio"
                          onClick={(event) => {
                            event.currentTarget
                              .closest('details')
                              ?.removeAttribute('open');
                            edit(service);
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="m15 4 5 5-11 11-6 1 1-6ZM13 6l5 5" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label={`Eliminar ${service.name}`}
                          title="Eliminar del catálogo"
                          disabled={p.disabled || !p.onDelete}
                          onClick={(event) => {
                            event.currentTarget
                              .closest('details')
                              ?.removeAttribute('open');
                            setDeleting(service);
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
                          </svg>
                        </button>
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
          {known && (
            <footer className="bx-services-pagination">
              <p>
                Mostrando{' '}
                {shown.length
                  ? `${(currentPage - 1) * 5 + 1}–${Math.min(currentPage * 5, filtered.length)}`
                  : '0'}{' '}
                de {filtered.length} servicios
              </p>
              {pages > 1 && (
                <div>
                  <button
                    type="button"
                    aria-label="Página anterior"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    ‹
                  </button>
                  <span aria-live="polite">
                    {currentPage} / {pages}
                  </span>
                  <button
                    type="button"
                    aria-label="Página siguiente"
                    disabled={currentPage === pages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </footer>
          )}
          {deleting && (
            <section
              className="bx-services-delete-confirm"
              role="alertdialog"
              aria-label="Eliminar servicio"
            >
              <h3>¿Eliminar «{deleting.name}» del catálogo?</h3>
              <p>
                Dejará de ofrecerse. Las reservas y su historial se conservarán.
              </p>
              <button
                type="button"
                disabled={p.disabled}
                onClick={() => setDeleting(null)}
              >
                Conservar
              </button>
              <button
                type="button"
                disabled={p.disabled}
                onClick={() => {
                  p.onDelete?.(deleting);
                  setDeleting(null);
                }}
              >
                Eliminar del catálogo
              </button>
            </section>
          )}
          {editing && (
            <section
              className="bx-services-editor"
              aria-label={p.serviceId ? 'Editar servicio' : 'Nuevo servicio'}
            >
              <div className="bx-services-editor-title">
                <h3>{p.serviceId ? 'Editar servicio' : 'Nuevo servicio'}</h3>
                <button
                  type="button"
                  disabled={p.disabled}
                  onClick={() => setEditing(false)}
                >
                  Cerrar formulario
                </button>
              </div>
              <div className="bx-services-editor-grid">
                <label className="bx-service-name">
                  Nombre del servicio
                  <input
                    id="service-name"
                    value={p.serviceName}
                    onChange={(e) => p.onName(e.target.value)}
                    disabled={p.disabled}
                    placeholder="Ej. Corte clásico"
                    maxLength={120}
                  />
                </label>
                <label>
                  Categoría
                  <select
                    value={p.category ?? 'Otros'}
                    onChange={(e) =>
                      p.onCategory?.(e.target.value as ServiceCategory)
                    }
                    disabled={p.disabled || !p.onCategory}
                  >
                    {serviceCategories.slice(1).map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="bx-service-description">
                  Descripción
                  <textarea
                    id="description"
                    value={p.description}
                    onChange={(e) => p.onDescription(e.target.value)}
                    disabled={p.disabled}
                    rows={2}
                    placeholder="Describe brevemente qué incluye el servicio."
                  />
                </label>
                <label>
                  Precio (S/)
                  <input
                    id="price"
                    inputMode="decimal"
                    value={p.price}
                    onChange={(e) => p.onPrice(e.target.value)}
                    disabled={p.disabled}
                    placeholder="25.50"
                  />
                </label>
                <label>
                  Duración (min)
                  <input
                    id="duration"
                    inputMode="numeric"
                    value={p.duration}
                    onChange={(e) => p.onDuration(e.target.value)}
                    disabled={p.disabled}
                    placeholder="30"
                  />
                </label>
              </div>
              <footer className="bx-services-editor-footer">
                <label className="bx-service-active">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={p.onActive}
                    disabled={p.disabled}
                  />
                  Visible para clientes
                </label>
                <AppButton
                  label={p.serviceId ? 'Guardar servicio' : 'Crear servicio'}
                  disabled={p.disabled}
                  onPress={p.onSave}
                />
              </footer>
              <small>
                Asigna profesionales desde Gestión de equipo y personal.
              </small>
            </section>
          )}
        </section>
        <aside
          className="bx-services-preview-column"
          aria-label="Vista previa del cliente"
        >
          <section className="bx-services-panel bx-services-preview">
            <div className="bx-services-title">
              <span>
                <ShopSettingsIcon name="calendar" />
              </span>
              <div>
                <h2>Vista previa del cliente</h2>
                <p>Así verá el servicio al momento de reservar.</p>
              </div>
            </div>
            {known && preview ? (
              <div className="bx-services-preview-card">
                <div className="bx-services-title">
                  <span>
                    <ShopSettingsIcon name="scissors" />
                  </span>
                  <div>
                    <h3>{preview.name}</h3>
                    <span className="bx-services-category-chip">
                      {preview.category ?? serviceVisualCategory(preview.name)}
                    </span>
                  </div>
                </div>
                <div className="bx-services-preview-meta">
                  <span>
                    <ShopSettingsIcon name="clock" />
                    {preview.durationMin} minutos
                  </span>
                  <strong>{money(preview)}</strong>
                </div>
                <p>{preview.description || 'Sin descripción registrada.'}</p>
                {!preview.active && (
                  <p className="bx-services-hidden-note">
                    Este servicio está oculto para los clientes.
                  </p>
                )}
                <AppButton
                  label="Reservar este servicio"
                  disabled
                  onPress={() => {}}
                />
                <small>Vista previa: este botón no crea una reserva.</small>
              </div>
            ) : (
              <p className="bx-services-empty">
                {p.loading
                  ? 'Consultando vista previa…'
                  : 'Selecciona un servicio del catálogo para ver sus detalles.'}
              </p>
            )}
          </section>
          <section className="bx-services-panel bx-services-information">
            <h2>ⓘ Información</h2>
            <ul>
              <li>Nombre, duración y precio reflejan los datos guardados.</li>
              <li>Cada servicio pertenece a una categoría del catálogo.</li>
              <li>
                Visible indica un servicio activo. Reservar también requiere
                publicación y disponibilidad.
              </li>
              <li>La descripción ayuda al cliente a elegir mejor.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
