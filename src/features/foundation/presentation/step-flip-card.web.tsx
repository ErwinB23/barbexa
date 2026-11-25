import { useId, useRef, useState, type ComponentProps } from 'react';
import { SiteIcon } from '@/shared/ui/site-icon.web';

interface StepFlipCardProps {
  step?: number;
  title: string;
  description: string;
  icon: ComponentProps<typeof SiteIcon>['name'];
  backTitle: string;
  details: string;
  points: readonly string[];
}

export function StepFlipCard({
  step,
  title,
  description,
  icon,
  backTitle,
  details,
  points,
}: StepFlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const pointer = useRef('');
  const mode = useRef<'hover' | 'manual'>('manual');
  const id = useId();
  const supportsHover = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return (
    <article
      className="bx-flip"
      data-flipped={flipped}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && supportsHover()) {
          mode.current = 'hover';
          setFlipped(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse' && mode.current === 'hover')
          setFlipped(false);
      }}
    >
      <div className="bx-flip-inner">
        <div
          className="bx-flip-face bx-flip-front"
          aria-hidden={flipped}
          inert={flipped}
        >
          <div className="bx-flip-top">
            <SiteIcon name={icon} />
            {step !== undefined && (
              <span className="bx-flip-number" aria-label={`Paso ${step}`}>
                {String(step).padStart(2, '0')}
              </span>
            )}
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <div
          id={id}
          className="bx-flip-face bx-flip-back"
          aria-hidden={!flipped}
          inert={!flipped}
        >
          <p className="bx-flip-back-step">
            {step === undefined ? 'Beneficio de Barbexa' : `Paso ${step}`}
          </p>
          <h3>{backTitle}</h3>
          <p>{details}</p>
          <ul>
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        className="bx-flip-control"
        aria-expanded={flipped}
        aria-controls={id}
        aria-label={
          step === undefined
            ? `${flipped ? 'Volver' : 'Descubrir más'}: ${title}`
            : `${flipped ? 'Volver al paso' : 'Descubrir más sobre el paso'} ${step}: ${title}`
        }
        onPointerDown={(event) => {
          pointer.current = event.pointerType;
        }}
        onClick={(event) => {
          // A real mouse hover already opens the card. Keyboard and touch toggle it.
          if (
            event.detail !== 0 &&
            pointer.current === 'mouse' &&
            supportsHover()
          )
            return;
          mode.current = 'manual';
          setFlipped((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            mode.current = 'manual';
            setFlipped(false);
          }
        }}
        onBlur={() => {
          mode.current = 'manual';
          setFlipped(false);
        }}
      >
        <span>
          {flipped ? 'Volver' : 'Descubre más'}{' '}
          <span aria-hidden="true">{flipped ? '↶' : '↗'}</span>
        </span>
      </button>
    </article>
  );
}
