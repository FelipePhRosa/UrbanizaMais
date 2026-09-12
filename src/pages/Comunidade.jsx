import { useContext } from 'react';
import { ArrowRight, FolderPlus, Info, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const PROJECT_MANAGER_ROLES = [1, 2, 3, 4, 7];

function EmptyProjects({ canManageProjects }) {
  return (
    <section className="urban-surface overflow-hidden">
      <div className="border-b border-[var(--color-border-subtle)] px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="urban-eyebrow">Projetos publicados</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Respostas que viram ação</h2>
          </div>
          <Sparkles size={19} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
      </div>

      <div className="grid min-h-64 place-items-center px-6 py-10 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
            <FolderPlus size={22} />
          </span>
          <h3 className="mt-4 text-base font-bold text-[var(--color-ink)]">Ainda não há projetos publicados</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Quando o backend de projetos estiver disponível, esta área mostrará o orçamento, a fase, os objetivos e o acompanhamento da comunidade.
          </p>
          {canManageProjects && (
            <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-[var(--color-warning-tint)] px-3 py-2 text-left text-xs font-semibold text-[var(--color-warning)]">
              <Info size={15} className="mt-0.5 shrink-0" />
              A criação está reservada para prefeito/admin, mas aguarda a modelagem do backend.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Comunidade() {
  const { user } = useContext(AuthContext);
  const canManageProjects = PROJECT_MANAGER_ROLES.includes(Number(user?.role));

  return (
    <Layout>
      <main className="mx-auto max-w-[1200px] px-4 py-5 md:px-8">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="urban-eyebrow">Comunidade</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Projetos da cidade</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
              Acompanhe as iniciativas da prefeitura criadas a partir das demandas da população.
            </p>
          </div>

          {canManageProjects && (
            <button
              type="button"
              disabled
              title="A criação de projetos depende de suporte do backend"
              className="inline-flex min-h-10 w-fit cursor-not-allowed items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white opacity-50"
            >
              <FolderPlus size={17} />
              Criar projeto
            </button>
          )}
        </header>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="urban-surface p-4"><p className="urban-eyebrow">Projetos</p><strong className="mt-2 block text-2xl text-[var(--color-ink)]">—</strong><span className="text-xs text-[var(--color-muted)]">Aguardando dados</span></div>
          <div className="urban-surface p-4"><p className="urban-eyebrow">Investimento</p><strong className="mt-2 block text-2xl text-[var(--color-ink)]">—</strong><span className="text-xs text-[var(--color-muted)]">Sem orçamento modelado</span></div>
          <div className="urban-surface p-4"><p className="urban-eyebrow">Participação</p><strong className="mt-2 block text-2xl text-[var(--color-ink)]">—</strong><span className="text-xs text-[var(--color-muted)]">Comentários e likes pendentes</span></div>
        </div>

        <EmptyProjects canManageProjects={canManageProjects} />

        <aside className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-muted)]">
          <Info size={17} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <p>Os dados exibidos nesta etapa não são simulados. Assim que as rotas de projetos existirem, o feed poderá abrir o detalhe completo e reaproveitar o padrão de interação das denúncias.</p>
          <ArrowRight size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
        </aside>
      </main>
    </Layout>
  );
}
