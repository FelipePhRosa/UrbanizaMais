import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2, Plus, Save, Send, ShieldAlert, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AdminBackLink from '../components/AdminBackLink';
import AutoTextarea from '../components/news/AutoTextarea';
import BlockRow from '../components/news/BlockRow';
import ImagePicker from '../components/news/ImagePicker';
import SlashMenu from '../components/news/SlashMenu';
import { AuthContext } from '../context/AuthContext';
import useIsMobile from '../hooks/useIsMobile';
import {
  createBlock,
  emptyParagraph,
  findBlockProblem,
  firstFieldOf,
  isBlockEmpty,
  prepareBlocksForSave,
} from '../components/news/blockTypes';
import { requestNews } from '../components/news/newsApi';

const EDITOR_ROLES = ['1', '2', '7'];

const bareInput = 'w-full bg-transparent text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/70 focus:outline-none';

export default function NewsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { token, user } = useContext(AuthContext);
  const canEdit = EDITOR_ROLES.includes(String(user?.role));

  const [loading, setLoading] = useState(Boolean(id));
  const [loadFailed, setLoadFailed] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [cover, setCover] = useState({ filename: '', caption: '' });
  const [blocks, setBlocks] = useState([emptyParagraph()]);
  const [status, setStatus] = useState('rascunho');
  const [saving, setSaving] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [slash, setSlash] = useState(null);
  const [pendingFocus, setPendingFocus] = useState(null);
  const focusSequence = useRef(0);

  useEffect(() => {
    if (!id || !token) return undefined;
    let active = true;

    (async () => {
      try {
        const data = await requestNews(`/news/${id}`, { token });
        if (!active) return;
        const news = data.newsInf;
        setTitle(news.title ?? '');
        setSubtitle(news.subtitle ?? '');
        setCover({ filename: news.cover_image ?? '', caption: news.cover_caption ?? '' });
        setBlocks(news.content?.length ? news.content : [emptyParagraph()]);
        setStatus(news.status);
      } catch (error) {
        if (!active) return;
        setLoadFailed(true);
        toast.error(error.message);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id, token]);

  const focusOn = (blockId, field) => {
    focusSequence.current += 1;
    setPendingFocus({ id: blockId, field, seq: focusSequence.current });
  };

  const touch = () => setDirty(true);

  const patchBlock = (blockId, patch) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, ...patch } : block)));
    touch();
  };

  const insertBlock = (index, block) => {
    setBlocks((current) => {
      const next = [...current];
      next.splice(index, 0, block);
      return next;
    });
    focusOn(block.id, firstFieldOf(block.type));
    touch();
  };

  const removeBlock = (blockId) => {
    const index = blocks.findIndex((block) => block.id === blockId);
    const previous = blocks[index - 1];
    setBlocks((current) => {
      const next = current.filter((block) => block.id !== blockId);
      return next.length ? next : [emptyParagraph()];
    });
    if (previous) focusOn(previous.id, firstFieldOf(previous.type));
    touch();
  };

  const moveBlock = (blockId, direction) => {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === blockId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    touch();
  };

  const handleOpenMenu = (blockId, query, rect, mode) => {
    if (query === null) {
      setSlash(null);
      return;
    }
    setSlash({ blockId, query, rect, mode: mode ?? 'replace' });
  };

  const pickBlockType = (type) => {
    if (!slash) return;
    const index = blocks.findIndex((block) => block.id === slash.blockId);
    const block = createBlock(type);
    setSlash(null);
    if (!block || index < 0) return;

    if (slash.mode === 'replace') {
      setBlocks((current) => current.map((item, position) => (position === index ? block : item)));
      focusOn(block.id, firstFieldOf(type));
      touch();
      return;
    }
    insertBlock(index + 1, block);
  };

  const save = async (nextStatus) => {
    if (!title.trim()) {
      toast.error('Dê um título para a notícia.');
      return;
    }

    const incomplete = blocks.find((block) => !isBlockEmpty(block) && findBlockProblem(block));
    if (incomplete) {
      toast.error(findBlockProblem(incomplete));
      return;
    }

    const content = prepareBlocksForSave(blocks);
    if (nextStatus === 'publicado' && content.length === 0) {
      toast.error('Adicione ao menos um bloco antes de publicar.');
      return;
    }

    setSaving(nextStatus);
    try {
      const data = await requestNews(id ? `/news/${id}` : '/news', {
        token,
        method: id ? 'PUT' : 'POST',
        body: {
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          cover_image: cover.filename || null,
          cover_caption: cover.caption.trim() || null,
          content,
          status: nextStatus,
        },
      });

      setStatus(nextStatus);
      setDirty(false);
      toast.success(nextStatus === 'publicado' ? 'Notícia publicada na comunidade.' : 'Rascunho salvo.');

      const newsId = data?.newsInf?.id ?? id;
      if (!id && newsId) navigate(`/Comunidade/${newsId}/editar`, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(null);
    }
  };

  if (!canEdit) {
    return (
      <Layout>
        <main className="mx-auto max-w-[720px] px-4 py-10 md:px-8">
          <div className="urban-surface grid place-items-center px-6 py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-warning-tint)] text-[var(--color-warning)]">
              <ShieldAlert size={22} />
            </span>
            <h1 className="mt-4 text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Só a prefeitura publica aqui</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              A criação de notícias é reservada para prefeito, administradores e o dono da plataforma.
            </p>
            <Link to="/Comunidade" className="urban-button-accent mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold">
              <ArrowLeft size={16} /> Voltar para Comunidade
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout hideMobileNavigation>
        <main className="mx-auto max-w-[760px] px-4 py-8 md:px-8">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[var(--color-border)]" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--color-border)]" />
            <div className="h-5 w-2/3 animate-pulse rounded-lg bg-[var(--color-border)]" />
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-[var(--color-border)]" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-[var(--color-border)]" />
          </div>
        </main>
      </Layout>
    );
  }

  if (loadFailed) {
    return (
      <Layout>
        <main className="mx-auto max-w-[720px] px-4 py-10 md:px-8">
          <div className="urban-surface grid place-items-center px-6 py-14 text-center">
            <h1 className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Não foi possível abrir esta notícia</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
              Ela pode ter sido removida por outro administrador.
            </p>
            <Link to="/Comunidade" className="urban-button-accent mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold">
              <ArrowLeft size={16} /> Voltar para Comunidade
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout hideMobileNavigation>
      <main className="mx-auto max-w-[760px] px-4 pb-28 pt-5 md:px-8 md:pb-16">
        <AdminBackLink />

        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
          <div className="min-w-0">
            <Link to="/Comunidade" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] transition hover:underline">
              <ArrowLeft size={14} /> Comunidade
            </Link>
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-extrabold tracking-tight text-[var(--color-ink)]">
                {id ? 'Editar notícia' : 'Nova notícia'}
              </h1>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
                status === 'publicado'
                  ? 'bg-[var(--color-success-tint)] text-[var(--color-success)]'
                  : 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]'
              }`}
              >
                {status === 'publicado' ? 'Publicada' : 'Rascunho'}
              </span>
              {dirty && <span className="text-[11px] font-semibold text-[var(--color-muted)]">alterações não salvas</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 max-md:hidden">
            {status === 'publicado' && id && (
              <Link to={`/noticia/${id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)]">
                <Eye size={15} /> Ver matéria
              </Link>
            )}
            <button type="button" onClick={() => save('rascunho')} disabled={Boolean(saving)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
              {saving === 'rascunho' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Salvar
            </button>
            {status === 'publicado' ? (
              <button type="button" onClick={() => save('rascunho')} disabled={Boolean(saving)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
                <Undo2 size={15} /> Despublicar
              </button>
            ) : (
              <button type="button" onClick={() => save('publicado')} disabled={Boolean(saving)} className="urban-button-accent inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold">
                {saving === 'publicado' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Publicar
              </button>
            )}
          </div>
        </header>

        <section className="space-y-2">
          <AutoTextarea
            value={title}
            onChange={(event) => { setTitle(event.target.value); touch(); }}
            placeholder="Título da notícia..."
            className="text-3xl font-extrabold leading-[1.2] tracking-tight md:text-[40px]"
          />
          <AutoTextarea
            value={subtitle}
            onChange={(event) => { setSubtitle(event.target.value); touch(); }}
            placeholder="Escreva um subtítulo..."
            className="text-lg font-medium leading-snug text-[var(--color-muted)] md:text-xl"
          />
        </section>

        <section className="mt-6">
          <p className="urban-eyebrow mb-2">Capa</p>
          <ImagePicker
            filename={cover.filename}
            onPick={(filename) => { setCover((current) => ({ ...current, filename })); touch(); }}
            token={token}
            label="Enviar imagem de capa"
          />
          <input
            value={cover.caption}
            onChange={(event) => { setCover((current) => ({ ...current, caption: event.target.value })); touch(); }}
            placeholder="Legenda da capa (opcional)"
            className={`${bareInput} mt-2 text-xs text-[var(--color-muted)]`}
          />
        </section>

        <section className="mt-8">
          <p className="urban-eyebrow mb-3">Conteúdo</p>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <BlockRow
                key={block.id}
                block={block}
                token={token}
                isMobile={isMobile}
                canRemove={blocks.length > 1}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
                slashOpen={slash?.blockId === block.id}
                pendingFocus={pendingFocus}
                onPatch={(patch) => patchBlock(block.id, patch)}
                onRemove={() => removeBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, -1)}
                onMoveDown={() => moveBlock(block.id, 1)}
                onOpenMenu={(query, rect, mode) => handleOpenMenu(block.id, query, rect, mode)}
                onAddBelow={() => insertBlock(index + 1, emptyParagraph())}
                onBackspaceEmpty={() => removeBlock(block.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => insertBlock(blocks.length, emptyParagraph())}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]"
          >
            <Plus size={14} /> Novo bloco
          </button>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Dica: digite <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-1 font-sans font-bold">/</kbd> dentro de um bloco de texto para escolher um bloco estruturado.
          </p>
        </section>
      </main>

      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-[1250] flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
          <button type="button" onClick={() => handleOpenMenu(blocks[blocks.length - 1]?.id, '', null, 'insert')} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)]">
            <Plus size={15} /> Bloco
          </button>
          <button type="button" onClick={() => save('rascunho')} disabled={Boolean(saving)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] disabled:opacity-50">
            {saving === 'rascunho' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
          </button>
          <button type="button" onClick={() => save(status === 'publicado' ? 'rascunho' : 'publicado')} disabled={Boolean(saving)} className="urban-button-accent inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : status === 'publicado' ? <Undo2 size={15} /> : <Send size={15} />}
            {status === 'publicado' ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      )}

      {slash && (
        <SlashMenu
          query={slash.query}
          anchorRect={slash.rect}
          isMobile={isMobile}
          onPick={pickBlockType}
          onClose={() => setSlash(null)}
        />
      )}
    </Layout>
  );
}
