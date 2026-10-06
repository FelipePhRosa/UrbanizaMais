import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { newsImageUrl, requestNews } from './newsApi';

function Figure({ filename, caption, alt = '', className = '' }) {
  if (!filename) return null;
  return (
    <figure className={className}>
      <img
        src={newsImageUrl(filename)}
        alt={alt || caption || ''}
        loading="lazy"
        className="aspect-video w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] object-cover"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-[13px] leading-5 text-[var(--color-muted)]">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function RelatedReportCard({ reportId }) {
  const [report, setReport] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    requestNews(`/report/${reportId}`)
      .then((data) => { if (active) setReport(data?.reportInf ?? null); })
      .catch(() => { if (active) setMissing(true); });
    return () => { active = false; };
  }, [reportId]);

  // Sem a denúncia não há para onde linkar: melhor omitir o card.
  if (missing) return null;

  return (
    <aside className="my-8 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
        <TriangleAlert size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="urban-eyebrow">Denúncia relacionada #{reportId}</p>
        <p className="mt-1 truncate text-sm font-bold text-[var(--color-ink)]">
          {report?.reportTitle || 'Carregando denúncia…'}
        </p>
      </div>
      <Link
        to={`/report/${reportId}`}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3.5 text-xs font-bold text-white transition hover:brightness-95"
      >
        Ver denúncia <ArrowRight size={15} />
      </Link>
    </aside>
  );
}

function renderBlock(block, index) {
  const key = block.id || `block-${index}`;

  switch (block.type) {
    case 'paragraph':
      if (!block.text?.trim()) return null;
      return (
        <p key={key} className="my-5 whitespace-pre-line text-[17px] leading-[1.75] text-[var(--color-ink)] md:text-[18px]">
          {block.text}
        </p>
      );

    case 'heading':
      if (!block.text?.trim()) return null;
      return (
        <h2 key={key} className="mb-3 mt-10 text-2xl font-extrabold leading-snug tracking-tight text-[var(--color-ink)] md:text-[28px]">
          {block.text}
        </h2>
      );

    case 'quote':
      if (!block.text?.trim()) return null;
      return (
        <blockquote key={key} className="my-8 border-l-[3px] border-[var(--color-primary)] pl-5">
          <p className="text-[19px] italic leading-[1.6] text-[var(--color-ink)] md:text-[21px]">{block.text}</p>
          {block.attribution ? (
            <footer className="mt-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">
              {block.attribution}
            </footer>
          ) : null}
        </blockquote>
      );

    case 'image':
      if (!block.filename) return null;
      return <Figure key={key} filename={block.filename} caption={block.caption} className="my-8" />;

    case 'investment':
      if (!block.value?.trim()) return null;
      return (
        <div key={key} className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 md:p-6">
          <p className="urban-eyebrow">Investimento</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-primary)] md:text-[40px]">
            {block.value}
          </p>
          {block.label ? <p className="mt-1 text-sm font-bold text-[var(--color-ink)]">{block.label}</p> : null}
          {block.source ? <p className="mt-1 text-xs text-[var(--color-muted)]">Fonte: {block.source}</p> : null}
        </div>
      );

    case 'indicators': {
      const items = block.items || [];
      if (items.length === 0) return null;
      return (
        <div key={key} className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, itemIndex) => (
            <div key={itemIndex} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
              <p className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)] md:text-[28px]">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'timeline': {
      const steps = block.items || [];
      if (steps.length === 0) return null;
      return (
        <ol key={key} className="my-8 border-l border-[var(--color-border)] pl-6">
          {steps.map((step, stepIndex) => (
            <li key={stepIndex} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-primary)]">{step.date}</p>
              <p className="mt-0.5 text-[15px] font-bold leading-snug text-[var(--color-ink)]">{step.title}</p>
              {step.description ? (
                <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{step.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      );
    }

    case 'before_after': {
      const sides = [['Antes', block.before], ['Depois', block.after]].filter(([, side]) => side?.filename);
      if (sides.length === 0) return null;
      return (
        <div key={key} className="my-8 grid gap-4 sm:grid-cols-2">
          {sides.map(([label, side]) => (
            <div key={label}>
              <p className="urban-eyebrow mb-2">{label}</p>
              <Figure filename={side.filename} caption={side.caption} alt={label} />
            </div>
          ))}
        </div>
      );
    }

    case 'related_report':
      if (!block.report_id) return null;
      return <RelatedReportCard key={key} reportId={block.report_id} />;

    default:
      return null;
  }
}

export default function NewsBlocks({ blocks }) {
  return (blocks || []).map(renderBlock);
}
