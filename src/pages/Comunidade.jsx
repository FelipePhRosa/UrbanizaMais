import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, FilePlus2, Loader2, Newspaper, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminBackLink from '../components/AdminBackLink';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { newsImageUrl, requestNews } from '../components/news/newsApi';

const EDITOR_ROLES = ['1', '2', '7'];
const PAGE_SIZE = 12;
const TABS = [
  { id: 'feed', label: 'Publicadas' },
  { id: 'mine', label: 'Minhas notícias' },
];

function relativeDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

function NewsThumb({ filename, className = '', iconSize = 20 }) {
  if (!filename) {
    return (
      <span className={`grid place-items-center bg-[var(--color-primary-tint)] text-[var(--color-primary)] ${className}`}>
        <Newspaper size={iconSize} />
      </span>
    );
  }
  return <img src={newsImageUrl(filename)} alt="" loading="lazy" className={`object-cover ${className}`} />;
}

function NewsCard({ news }) {
  return (
    <Link
      to={`/noticia/${news.id}`}
      className="urban-surface group flex flex-col overflow-hidden transition hover:border-[var(--color-primary)]"
    >
      <div className="aspect-video w-full overflow-hidden">
        <NewsThumb
          filename={news.cover_image}
          iconSize={26}
          className="h-full w-full transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {news.cityName ? <p className="urban-eyebrow">{news.cityName}</p> : null}
        <h2 className="mt-1.5 line-clamp-3 text-base font-extrabold leading-snug tracking-tight text-[var(--color-ink)]">
          {news.title}
        </h2>
        {news.subtitle ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">{news.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-4">
          <img
            src={newsImageUrl(news.authorAvatar) || '/cityIcon.png'}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full border border-[var(--color-border)] object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[var(--color-muted)]">
            {news.authorName || 'Urbaniza+'}
          </span>
          <span className="shrink-0 text-[11px] text-[var(--color-muted)]">
            {relativeDate(news.published_at || news.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MyNewsRow({ news, busy, onDelete }) {
  const published = news.status === 'publicado';
  return (
    <article className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border-subtle)] p-3 last:border-0 sm:flex-nowrap sm:px-4">
      <NewsThumb filename={news.cover_image} className="h-14 w-24 shrink-0 rounded-xl border border-[var(--color-border)]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              published
                ? 'bg-[var(--color-success-tint)] text-[var(--color-success)]'
                : 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]'
            }`}
          >
            {published ? 'Publicada' : 'Rascunho'}
          </span>
          <span className="text-[11px] text-[var(--color-muted)]">{relativeDate(news.updated_at)}</span>
        </div>
        <h3 className="mt-1 truncate text-sm font-bold text-[var(--color-ink)]">{news.title}</h3>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {published ? (
          <Link
            to={`/noticia/${news.id}`}
            aria-label="Ver matéria"
            title="Ver matéria"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <Eye size={15} />
          </Link>
        ) : null}
        <Link
          to={`/Comunidade/${news.id}/editar`}
          aria-label="Editar notícia"
          title="Editar"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <Pencil size={15} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(news)}
          disabled={busy}
          aria-label="Excluir notícia"
          title="Excluir"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] transition hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-tint)] hover:text-[var(--color-danger)] disabled:opacity-50"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
        </button>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="urban-surface animate-pulse overflow-hidden">
      <div className="aspect-video w-full bg-[var(--color-border)]" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-20 rounded bg-[var(--color-border)]" />
        <div className="h-4 w-full rounded bg-[var(--color-border)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--color-border)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-border)]" />
      </div>
    </div>
  );
}

function EmptyState({ title, text, children }) {
  return (
    <section className="urban-surface grid min-h-64 place-items-center px-6 py-12 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
          <Newspaper size={22} />
        </span>
        <h2 className="mt-4 text-base font-bold text-[var(--color-ink)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{text}</p>
        {children}
      </div>
    </section>
  );
}

export default function Comunidade() {
  const { token, user } = useContext(AuthContext);
  const canEdit = EDITOR_ROLES.includes(String(user?.role));
  const [tab, setTab] = useState('feed');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadFeed = useCallback(async (nextPage) => {
    const data = await requestNews(`/news?page=${nextPage}&limit=${PAGE_SIZE}`);
    const rows = data?.data ?? [];
    setItems((previous) => (nextPage === 1 ? rows : [...previous, ...rows]));
    setPage(nextPage);
    setPages(data?.pages ?? 1);
    setTotal(data?.total ?? 0);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadFeed(1)
      .catch((error) => { if (active) toast.error(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadFeed]);

  useEffect(() => {
    if (tab !== 'mine') return;
    let active = true;
    setLoading(true);
    requestNews('/mynews', { token })
      .then((data) => { if (active) setMine(data?.data ?? []); })
      .catch((error) => { if (active) toast.error(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, token]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadFeed(page + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (news) => {
    if (!window.confirm(`Excluir “${news.title}”? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(news.id);
    try {
      await requestNews(`/news/${news.id}`, { token, method: 'DELETE' });
      setMine((previous) => previous.filter((item) => item.id !== news.id));
      toast.success('Notícia excluída.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <main className="mx-auto max-w-[1200px] px-4 py-5 md:px-8">
        <AdminBackLink />

        <header className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="urban-eyebrow">Comunidade</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Notícias da cidade</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
              Obras, investimentos e respostas da prefeitura publicadas a partir das demandas da população.
            </p>
          </div>
          {canEdit ? (
            <Link
              to="/Comunidade/nova"
              className="urban-button-accent inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"
            >
              <FilePlus2 size={18} /> Nova notícia
            </Link>
          ) : null}
        </header>

        {canEdit ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {TABS.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                  tab === item.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {tab === 'feed' ? (
          loading ? (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}
            </section>
          ) : items.length === 0 ? (
            <EmptyState
              title="Ainda não há notícias publicadas"
              text="Quando a prefeitura publicar uma matéria, ela aparece aqui e na página pública, acessível por link."
            >
              {canEdit ? (
                <Link
                  to="/Comunidade/nova"
                  className="urban-button-accent mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold"
                >
                  <FilePlus2 size={17} /> Escrever a primeira
                </Link>
              ) : null}
            </EmptyState>
          ) : (
            <>
              <p className="mb-3 text-xs text-[var(--color-muted)]">
                {total} {total === 1 ? 'notícia publicada' : 'notícias publicadas'}
              </p>
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((news) => <NewsCard key={news.id} news={news} />)}
              </section>
              {page < pages ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                    Carregar mais
                  </button>
                </div>
              ) : null}
            </>
          )
        ) : null}

        {tab === 'mine' ? (
          loading ? (
            <section className="urban-surface animate-pulse space-y-3 p-4">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-14 rounded-xl bg-[var(--color-border)]" />)}
            </section>
          ) : mine.length === 0 ? (
            <EmptyState
              title="Você ainda não escreveu nenhuma notícia"
              text="Rascunhos ficam invisíveis para o público até você decidir publicar."
            >
              <Link
                to="/Comunidade/nova"
                className="urban-button-accent mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold"
              >
                <FilePlus2 size={17} /> Nova notícia
              </Link>
            </EmptyState>
          ) : (
            <section className="urban-surface overflow-hidden">
              <div className="border-b border-[var(--color-border-subtle)] px-4 py-3">
                <h2 className="text-sm font-bold text-[var(--color-ink)]">Minhas notícias</h2>
                <p className="text-xs text-[var(--color-muted)]">
                  {mine.length} {mine.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>
              {mine.map((news) => (
                <MyNewsRow key={news.id} news={news} busy={deletingId === news.id} onDelete={handleDelete} />
              ))}
            </section>
          )
        ) : null}
      </main>
    </Layout>
  );
}
