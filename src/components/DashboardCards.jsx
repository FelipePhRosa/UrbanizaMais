import { ChevronRight } from 'lucide-react';

export function MetricCard({ icon: Icon, label, value, description, tone, onClick }) {
  const content = <><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-soft)]" style={{ color: tone }}><Icon size={19} /></span><strong className="mt-4 block truncate text-2xl font-extrabold text-[var(--color-ink)]">{value}</strong><span className="mt-1 block text-sm font-bold text-[var(--color-ink)]">{label}</span><span className="mt-1 block truncate text-xs text-[var(--color-muted)]">{description}</span></>;
  const className = 'min-w-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md';
  return onClick ? <button type="button" onClick={onClick} className={className}>{content}</button> : <article className={className}>{content}</article>;
}

export function ActionCard({ icon: Icon, title, description, onClick }) {
  return <button type="button" onClick={onClick} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-surface)] text-[var(--color-primary)]"><Icon size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[var(--color-ink)]">{title}</strong><small className="block truncate text-xs text-[var(--color-muted)]">{description}</small></span><ChevronRight size={17} className="shrink-0 text-[var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" /></button>;
}
