import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, FileWarning, Pencil } from 'lucide-react';
import Brand from '../components/Brand';
import NewsBlocks from '../components/news/NewsBlocks';
import { newsImageUrl, requestNews } from '../components/news/newsApi';
import { AuthContext } from '../context/AuthContext';

const EDITOR_ROLES = ['1', '2', '7'];

function longDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function LoadingArticle() {
  return (
    <div className="mx-auto max-w-[720px] animate-pulse px-4 py-10 md:px-6">
      <div className="h-3 w-28 rounded bg-[var(--color-border)]" />
      <div className="mt-5 h-9 w-full rounded bg-[var(--color-border)]" />
      <div className="mt-3 h-9 w-2/3 rounded bg-[var(--color-border)]" />
      <div className="mt-6 h-4 w-1/2 rounded bg-[var(--color-border)]" />
      <div className="mt-8 aspect-video w-full rounded-2xl bg-[var(--color-border)]" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded bg-[var(--color-border)]" />
        <div className="h-4 w-11/12 rounded bg-[var(--color-border)]" />
        <div className="h-4 w-4/5 rounded bg-[var(--color-border)]" />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { id } = useParams();
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Esta página vive fora do Layout, então aplica o tema salvo por conta própria.
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    document.documentElement.classList.toggle('dark', saved ? JSON.parse(saved) : false);
  }, []);

  useEffect(() => {
    if (!id || authLoading) return;
    let active = true;
    setLoading(true);
    setError('');
    requestNews(`/news/${id}`, { token })
      .then((data) => { if (active) setNews(data?.newsInf ?? null); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token, authLoading]);

  const canEdit = EDITOR_ROLES.includes(String(user?.role));

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-3 px-4 md:h-[72px] md:px-8">
          <Link to="/" aria-label="Urbaniza+"><Brand /></Link>
          <div className="flex items-center gap-2">
            {canEdit && news && (
              <Link
                to={`/Comunidade/${news.id}/editar`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3.5 text-xs font-bold text-white transition hover:brightness-95"
              >
                <Pencil size={15} /> <span className="max-sm:hidden">Editar</span>
              </Link>
            )}
            <Link
              to="/Comunidade"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3.5 text-xs font-bold text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} /> <span className="max-sm:hidden">Comunidade</span>
            </Link>
          </div>
        </div>
      </header>

      {loading || authLoading ? <LoadingArticle /> : null}

      {!loading && !authLoading && (error || !news) ? (
        <main className="mx-auto grid max-w-[720px] place-items-center px-4 py-24 text-center">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-danger-tint)] text-[var(--color-danger)]">
              <FileWarning size={22} />
            </span>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-[var(--color-ink)]">
              Não encontramos esta matéria
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-muted)]">
              {error || 'O endereço pode estar errado ou a matéria ainda não foi publicada.'}
            </p>
            <Link
              to="/Comunidade"
              className="urban-button-accent mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold"
            >
              <ArrowLeft size={16} /> Voltar para a Comunidade
            </Link>
          </div>
        </main>
      ) : null}

      {!loading && !authLoading && news ? (
        <main className="mx-auto max-w-[720px] px-4 pb-20 pt-8 md:px-6 md:pt-12">
          {news.status === 'rascunho' ? (
            <p className="mb-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-warning-tint)] px-3 py-2 text-xs font-bold text-[var(--color-warning)]">
              <FileWarning size={15} /> Rascunho — só a equipe da prefeitura vê esta página.
            </p>
          ) : null}

          <p className="urban-eyebrow">Comunidade</p>

          <h1 className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--color-ink)] md:text-[44px]">
            {news.title}
          </h1>

          {news.subtitle ? (
            <p className="mt-4 text-lg font-medium leading-snug text-[var(--color-muted)] md:text-xl">
              {news.subtitle}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-[var(--color-border-subtle)] py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={newsImageUrl(news.authorAvatar) || '/cityIcon.png'}
                alt=""
                className="h-9 w-9 rounded-full border border-[var(--color-border)] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-ink)]">
                  {news.authorName || 'Urbaniza+'}
                </p>
                {news.cityName ? (
                  <p className="truncate text-xs text-[var(--color-muted)]">{news.cityName}</p>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              {longDate(news.published_at || news.created_at)}
            </p>
          </div>

          {news.cover_image ? (
            <figure className="mt-8">
              <img
                src={newsImageUrl(news.cover_image)}
                alt={news.cover_caption || news.title}
                className="aspect-video w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] object-cover"
              />
              {news.cover_caption ? (
                <figcaption className="mt-2 text-center text-[13px] leading-5 text-[var(--color-muted)]">
                  {news.cover_caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <article className="mt-2">
            <NewsBlocks blocks={news.content} />
          </article>

          <footer className="mt-12 border-t border-[var(--color-border-subtle)] pt-6">
            <Link
              to="/Comunidade"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--color-primary)] transition hover:underline"
            >
              <ArrowLeft size={16} /> Ver outras notícias da comunidade
            </Link>
          </footer>
        </main>
      ) : null}
    </div>
  );
}
