import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import AutoTextarea from './AutoTextarea';
import ImagePicker from './ImagePicker';
import { BLOCK_MAP } from './blockTypes';

const bareInput = 'w-full bg-transparent text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 focus:outline-none';
const boxedInput = 'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15';

const SLASHABLE = ['paragraph', 'heading', 'quote'];

function ToolButton({ label, onClick, children, tone = 'default', disabled }) {
  const tones = {
    default: 'text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]',
    danger: 'text-[var(--color-muted)] hover:bg-[var(--color-danger-tint)] hover:text-[var(--color-danger)]',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function BlockShell({ block, children }) {
  const definition = BLOCK_MAP[block.type];
  const Icon = definition.icon;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--color-muted)]">
        <Icon size={13} className="text-[var(--color-primary)]" aria-hidden="true" />
        {definition.label}
      </p>
      {children}
    </div>
  );
}

export default function BlockRow({
  block,
  token,
  isMobile,
  canRemove,
  isFirst,
  isLast,
  slashOpen,
  pendingFocus,
  onPatch,
  onRemove,
  onMoveUp,
  onMoveDown,
  onOpenMenu,
  onAddBelow,
  onBackspaceEmpty,
}) {
  const rootRef = useRef(null);
  const fieldRefs = useRef({});
  const [toolsOpen, setToolsOpen] = useState(false);

  const registerRef = (name, element) => {
    if (name) fieldRefs.current[name] = element;
  };

  useEffect(() => {
    if (!pendingFocus || pendingFocus.id !== block.id) return;
    const element = fieldRefs.current[pendingFocus.field ?? 'text'];
    if (!element) return;
    element.focus();
    const end = element.value?.length ?? 0;
    element.setSelectionRange?.(end, end);
  }, [pendingFocus, block.id]);

  useEffect(() => {
    if (!toolsOpen) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [toolsOpen]);

  const handleTextChange = (field) => (event) => {
    const { value } = event.target;
    onPatch({ [field]: value });
    if (field === 'text' && SLASHABLE.includes(block.type)) {
      if (value.startsWith('/')) onOpenMenu(value.slice(1), rootRef.current?.getBoundingClientRect(), 'replace');
      else if (slashOpen) onOpenMenu(null);
    }
  };

  const handleTextKeyDown = (event) => {
    if (slashOpen) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onAddBelow();
      return;
    }
    const element = event.currentTarget;
    if (event.key === 'Backspace' && !element.value && !isFirst) {
      event.preventDefault();
      onBackspaceEmpty();
    }
  };

  const updateItems = (items) => onPatch({ items });
  const patchItem = (index, patch) => updateItems(block.items.map((item, position) => (position === index ? { ...item, ...patch } : item)));
  const removeItem = (index) => updateItems(block.items.filter((_, position) => position !== index));

  const fields = () => {
    switch (block.type) {
      case 'paragraph':
        return (
          <AutoTextarea
            name="text"
            registerRef={registerRef}
            value={block.text}
            onChange={handleTextChange('text')}
            onKeyDown={handleTextKeyDown}
            placeholder="Escreva o texto, ou digite / para escolher um bloco..."
            className="text-[17px] leading-[1.7]"
          />
        );

      case 'heading':
        return (
          <AutoTextarea
            name="text"
            registerRef={registerRef}
            value={block.text}
            onChange={handleTextChange('text')}
            onKeyDown={handleTextKeyDown}
            placeholder="Subtítulo da seção"
            className="text-xl font-extrabold leading-snug tracking-tight"
          />
        );

      case 'quote':
        return (
          <div className="border-l-[3px] border-[var(--color-primary)] pl-4">
            <AutoTextarea
              name="text"
              registerRef={registerRef}
              value={block.text}
              onChange={handleTextChange('text')}
              onKeyDown={handleTextKeyDown}
              placeholder="Escreva a citação..."
              className="text-lg italic leading-[1.7]"
            />
            <input
              ref={(element) => registerRef('attribution', element)}
              value={block.attribution}
              onChange={(event) => onPatch({ attribution: event.target.value })}
              placeholder="Quem disse (opcional)"
              className={`${bareInput} mt-1.5 text-xs font-semibold text-[var(--color-muted)]`}
            />
          </div>
        );

      case 'image':
        return (
          <BlockShell block={block}>
            <ImagePicker filename={block.filename} onPick={(filename) => onPatch({ filename })} token={token} label="Enviar imagem da matéria" />
            <input
              ref={(element) => registerRef('caption', element)}
              value={block.caption}
              onChange={(event) => onPatch({ caption: event.target.value })}
              placeholder="Legenda da imagem (opcional)"
              className={`${bareInput} mt-2 text-xs text-[var(--color-muted)]`}
            />
          </BlockShell>
        );

      case 'investment':
        return (
          <BlockShell block={block}>
            <input
              ref={(element) => registerRef('value', element)}
              value={block.value}
              onChange={(event) => onPatch({ value: event.target.value })}
              placeholder="R$ 1,2 milhão"
              className={`${bareInput} text-2xl font-extrabold tracking-tight text-[var(--color-primary)]`}
            />
            <input
              ref={(element) => registerRef('label', element)}
              value={block.label}
              onChange={(event) => onPatch({ label: event.target.value })}
              placeholder="Rótulo (ex.: repasse para drenagem)"
              className={`${bareInput} mt-1 text-sm font-semibold text-[var(--color-ink)]`}
            />
            <input
              ref={(element) => registerRef('source', element)}
              value={block.source}
              onChange={(event) => onPatch({ source: event.target.value })}
              placeholder="Fonte do dado (opcional)"
              className={`${bareInput} mt-1 text-xs text-[var(--color-muted)]`}
            />
          </BlockShell>
        );

      case 'indicators':
        return (
          <BlockShell block={block}>
            <div className="space-y-2">
              {block.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                    <input
                      ref={(element) => registerRef(`${index}.value`, element)}
                      value={item.value}
                      onChange={(event) => patchItem(index, { value: event.target.value })}
                      placeholder="1.240"
                      className={`${bareInput} text-base font-extrabold text-[var(--color-primary)]`}
                    />
                    <input
                      ref={(element) => registerRef(`${index}.label`, element)}
                      value={item.label}
                      onChange={(event) => patchItem(index, { label: event.target.value })}
                      placeholder="Legenda do número"
                      className={`${bareInput} mt-0.5 text-xs text-[var(--color-muted)]`}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remover indicador ${index + 1}`}
                    onClick={() => removeItem(index)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-danger-tint)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => updateItems([...block.items, { value: '', label: '' }])}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-tint)]"
            >
              <Plus size={14} /> Adicionar indicador
            </button>
          </BlockShell>
        );

      case 'timeline':
        return (
          <BlockShell block={block}>
            <div className="space-y-2">
              {block.items.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                    <input
                      ref={(element) => registerRef(`${index}.date`, element)}
                      value={item.date}
                      onChange={(event) => patchItem(index, { date: event.target.value })}
                      placeholder="Março de 2026"
                      className={`${bareInput} text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--color-primary)]`}
                    />
                    <input
                      ref={(element) => registerRef(`${index}.title`, element)}
                      value={item.title}
                      onChange={(event) => patchItem(index, { title: event.target.value })}
                      placeholder="Título da etapa"
                      className={`${bareInput} mt-0.5 text-sm font-bold text-[var(--color-ink)]`}
                    />
                    <input
                      ref={(element) => registerRef(`${index}.description`, element)}
                      value={item.description}
                      onChange={(event) => patchItem(index, { description: event.target.value })}
                      placeholder="Detalhe da etapa (opcional)"
                      className={`${bareInput} mt-0.5 text-xs text-[var(--color-muted)]`}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remover etapa ${index + 1}`}
                    onClick={() => removeItem(index)}
                    className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-danger-tint)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => updateItems([...block.items, { date: '', title: '', description: '' }])}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-tint)]"
            >
              <Plus size={14} /> Adicionar etapa
            </button>
          </BlockShell>
        );

      case 'before_after':
        return (
          <BlockShell block={block}>
            <div className="grid gap-3 sm:grid-cols-2">
              {['before', 'after'].map((side) => (
                <div key={side}>
                  <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {side === 'before' ? 'Antes' : 'Depois'}
                  </p>
                  <ImagePicker
                    filename={block[side]?.filename}
                    onPick={(filename) => onPatch({ [side]: { ...block[side], filename } })}
                    token={token}
                    label={side === 'before' ? 'Foto do antes' : 'Foto do depois'}
                  />
                  <input
                    ref={(element) => registerRef(`${side}.caption`, element)}
                    value={block[side]?.caption}
                    onChange={(event) => onPatch({ [side]: { ...block[side], caption: event.target.value } })}
                    placeholder="Legenda (opcional)"
                    className={`${bareInput} mt-1.5 text-xs text-[var(--color-muted)]`}
                  />
                </div>
              ))}
            </div>
          </BlockShell>
        );

      case 'related_report':
        return (
          <BlockShell block={block}>
            <input
              ref={(element) => registerRef('report_id', element)}
              type="number"
              min="1"
              value={block.report_id}
              onChange={(event) => onPatch({ report_id: event.target.value })}
              placeholder="Número da denúncia"
              className={boxedInput}
            />
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              É o id que aparece no endereço da denúncia (/report/id).
            </p>
          </BlockShell>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={rootRef} className="group relative">
      {!isMobile && (
        <div className="absolute -left-14 top-0 hidden w-12 items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
          <ToolButton label="Inserir bloco abaixo" onClick={() => onOpenMenu('', rootRef.current?.getBoundingClientRect(), 'insert')}>
            <Plus size={14} />
          </ToolButton>
          <div className="relative">
            <ToolButton label="Mover ou remover bloco" onClick={() => setToolsOpen((open) => !open)}>
              <GripVertical size={14} />
            </ToolButton>
            {toolsOpen && (
              <div className="absolute left-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-xl">
                <button type="button" onClick={() => { onMoveUp(); setToolsOpen(false); }} disabled={isFirst} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40">
                  <ArrowUp size={14} /> Mover para cima
                </button>
                <button type="button" onClick={() => { onMoveDown(); setToolsOpen(false); }} disabled={isLast} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40">
                  <ArrowDown size={14} /> Mover para baixo
                </button>
                <button type="button" onClick={() => { onRemove(); setToolsOpen(false); }} disabled={!canRemove} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold text-[var(--color-danger)] transition hover:bg-[var(--color-danger-tint)] disabled:opacity-40">
                  <Trash2 size={14} /> Remover bloco
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isMobile && (
        <div className="mb-1 flex items-center justify-end gap-1">
          <ToolButton label="Mover para cima" onClick={onMoveUp} disabled={isFirst}><ArrowUp size={13} /></ToolButton>
          <ToolButton label="Mover para baixo" onClick={onMoveDown} disabled={isLast}><ArrowDown size={13} /></ToolButton>
          <ToolButton label="Remover bloco" tone="danger" onClick={onRemove} disabled={!canRemove}><Trash2 size={13} /></ToolButton>
        </div>
      )}

      {fields()}
    </div>
  );
}
