import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { filterBlockDefinitions } from './blockTypes';

export default function SlashMenu({ query, anchorRect, isMobile, onPick, onClose }) {
  const options = useMemo(() => filterBlockDefinitions(query), [query]);
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  useEffect(() => {
    const move = (step) => setActive((current) => {
      if (options.length === 0) return 0;
      return (current + step + options.length) % options.length;
    });

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const option = options[active];
        if (option) onPick(option.type);
      }
    };

    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [options, active, onPick, onClose]);

  const items = options.map((definition, index) => {
    const Icon = definition.icon;
    return (
      <li key={definition.type}>
        <button
          type="button"
          data-active={index === active}
          onMouseEnter={() => setActive(index)}
          onClick={() => onPick(definition.type)}
          className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
            index === active
              ? 'bg-[var(--color-primary-tint)] text-[var(--color-primary)]'
              : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]'
          }`}
        >
          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
            index === active
              ? 'border-transparent bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
          }`}
          >
            <Icon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm font-bold">{definition.label}</strong>
            <small className="mt-0.5 block truncate text-xs text-[var(--color-muted)]">{definition.description}</small>
          </span>
          {index === active && !isMobile && <CornerDownLeft size={14} className="mt-2 shrink-0 opacity-60" />}
        </button>
      </li>
    );
  });

  const body = (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] px-3 py-2.5 text-[var(--color-muted)]">
        <Search size={14} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-xs font-bold">/{query || 'Digite para filtrar blocos'}</span>
        <button type="button" onClick={onClose} aria-label="Fechar menu de blocos" className="grid h-6 w-6 shrink-0 place-items-center rounded-md transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]">
          <X size={14} />
        </button>
      </div>

      {options.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-[var(--color-muted)]">Nenhum bloco corresponde a “/{query}”.</p>
      ) : (
        <ul ref={listRef} className="max-h-[min(320px,55vh)] space-y-0.5 overflow-y-auto p-1.5">{items}</ul>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[1300] md:hidden">
        <button type="button" aria-label="Fechar menu de blocos" onClick={onClose} className="absolute inset-0 cursor-default bg-[var(--color-ink)]/45 backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[max(8px,env(safe-area-inset-bottom))] shadow-2xl">
          <span className="mx-auto mt-2 block h-1 w-10 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
          {body}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-[1300] w-[320px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-md:hidden"
      style={{
        left: Math.max(12, Math.min(anchorRect?.left ?? 12, window.innerWidth - 332)),
        top: Math.max(12, Math.min((anchorRect?.bottom ?? 12) + 6, window.innerHeight - 380)),
      }}
    >
      {body}
    </div>
  );
}
