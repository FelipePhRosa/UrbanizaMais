import { useContext, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  MapPin,
  Target,
  Users,
  XCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const API = import.meta.env.VITE_API_URL;

const STATUS = {
  aprovado: { label: 'Aprovados', color: 'var(--color-primary)' },
  resolvida: { label: 'Resolvidos', color: 'var(--color-success)' },
  pendente: { label: 'Pendentes', color: 'var(--color-warning)' },
  rejeitado: { label: 'Rejeitados', color: 'var(--color-danger)' }
};

function useAuthFetch() {
  const { token } = useContext(AuthContext);

  return (path) => fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
}

function Metric({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="min-w-0 px-3 py-3 first:pl-0 sm:px-5">
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-soft)]" style={{ color: tone }}>
          <Icon size={17} />
        </span>
        <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
          {hint}
        </span>
      </div>
      <strong className="mt-2 block truncate text-2xl font-extrabold text-[var(--color-ink)]">
        {value ?? '—'}
      </strong>
      <p className="truncate text-xs text-[var(--color-muted)]">{label}</p>
    </div>
  );
}

function StatusRow({ status, total, max }) {
  const config = STATUS[status] || {
    label: status,
    color: 'var(--color-muted)'
  };
  const width = max ? Math.max(4, (Number(total) / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: config.color }} />
      <span className="w-24 shrink-0 text-xs font-medium text-[var(--color-muted)]">
        {config.label}
      </span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-soft)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, backgroundColor: config.color }} />
      </div>
      <strong className="w-10 text-right text-sm text-[var(--color-ink)]">
        {Number(total || 0).toLocaleString('pt-BR')}
      </strong>
    </div>
  );
}

function Signal({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-soft)]" style={{ color: tone }}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <strong className="mt-0.5 block truncate text-lg text-[var(--color-ink)]">{value}</strong>
        <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">{detail}</p>
      </div>
    </div>
  );
}

function Restricted() {
  return (
    <Layout>
      <div className="grid min-h-[70vh] place-items-center p-6">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-danger-tint)] text-[var(--color-danger)]">
            <LockKeyhole />
          </span>
          <h1 className="mt-4 text-xl font-bold text-[var(--color-ink)]">Acesso restrito</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Este painel é exclusivo para administradores.</p>
        </div>
      </div>
    </Layout>
  );
}

export default function DashboardAdmin() {
  const { user } = useContext(AuthContext);
  const authFetch = useAuthFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/admin')
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar os dados do painel.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (Number(user?.role) > 2 || !user?.role) return <Restricted />;
  if (loading) return <Layout><div className="grid min-h-[70vh] place-items-center text-sm text-[var(--color-muted)]">Carregando dados da cidade…</div></Layout>;
  if (error) return <Layout><div className="m-6 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-tint)] p-4 text-sm text-[var(--color-danger)]">{error}</div></Layout>;

  const stats = data?.globalStats || {};
  const status = data?.reportsByStatus || [];
  const neighborhoods = data?.topNeighborhoods || [];
  const maxStatus = Math.max(...status.map((item) => Number(item.total) || 0), 1);
  const totalReports = Number(stats.totalReports || 0);
  const pending = Number(status.find((item) => item.status === 'pendente')?.total || 0);
  const resolved = Number(status.find((item) => item.status === 'resolvida')?.total || 0);
  const rejected = Number(status.find((item) => item.status === 'rejeitado')?.total || 0);
  const resolutionRate = totalReports ? `${Math.round((resolved / totalReports) * 100)}%` : '—';
  const pendingRate = totalReports ? `${Math.round((pending / totalReports) * 100)}% do total` : 'Sem registros';
  const priorityNeighborhood = neighborhoods[0];

  return (
    <Layout>
      <main className="w-full max-w-[1440px] px-4 py-4 md:px-8 md:py-5">
        <header className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="urban-eyebrow">Operação municipal</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Visão geral</h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Indicadores consolidados da plataforma.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-success-tint)] px-3 py-1.5 text-xs font-bold text-[var(--color-success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" /> Dados em tempo real
          </span>
        </header>

        <section aria-label="Métricas administrativas" className="grid grid-cols-2 divide-x divide-y divide-[var(--color-border)] overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] sm:grid-cols-4 sm:divide-y-0">
          <Metric icon={FileText} label="Relatos no sistema" value={stats.totalReports} hint="total" tone="var(--color-primary)" />
          <Metric icon={Building2} label="Cidades" value={stats.totalCities} hint={`${stats.totalNeighborhoods ?? 0} bairros`} tone="var(--color-success)" />
          <Metric icon={Users} label="Usuários" value={stats.totalUsers} hint="comunidade" tone="var(--color-primary)" />
          <Metric icon={AlertTriangle} label="Aguardando revisão" value={pending} hint="prioridade" tone="var(--color-warning)" />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-bold text-[var(--color-ink)]">Distribuição dos relatos</h2><p className="text-xs text-[var(--color-muted)]">Status atual dos registros</p></div>
              <FileText size={18} className="text-[var(--color-muted)]" />
            </div>
            <div className="space-y-4">{status.length ? status.map((item) => <StatusRow key={item.status} status={item.status} total={item.total} max={maxStatus} />) : <p className="text-sm text-[var(--color-muted)]">Nenhum dado disponível.</p>}</div>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-bold text-[var(--color-ink)]">Bairros com mais registros</h2><p className="text-xs text-[var(--color-muted)]">Visão territorial</p></div>
              <MapPin size={18} className="text-[var(--color-muted)]" />
            </div>
            <div className="space-y-3">{neighborhoods.length ? neighborhoods.slice(0, 6).map((bairro, index) => <div key={`${bairro.neighborhood}-${index}`} className="flex items-center gap-3"><span className="w-5 text-xs font-bold text-[var(--color-muted)]">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm"><span className="truncate font-medium text-[var(--color-ink)]">{bairro.neighborhood}</span><strong className="text-[var(--color-ink)]">{bairro.totalReports}</strong></div><p className="truncate text-[11px] text-[var(--color-muted)]">{bairro.city}</p></div></div>) : <p className="text-sm text-[var(--color-muted)]">Nenhum dado disponível.</p>}</div>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm md:p-5">
          <div className="mb-4"><h2 className="font-bold text-[var(--color-ink)]">Sinais para decisão</h2><p className="text-xs text-[var(--color-muted)]">Indicadores derivados dos dados atuais, sem estimativas externas.</p></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Signal icon={Target} label="Taxa de resolução" value={resolutionRate} detail={`${resolved.toLocaleString('pt-BR')} relatos resolvidos`} tone="var(--color-success)" />
            <Signal icon={Clock3} label="Fila de revisão" value={pending.toLocaleString('pt-BR')} detail={pendingRate} tone="var(--color-warning)" />
            <Signal icon={MapPin} label="Bairro prioritário" value={priorityNeighborhood?.neighborhood || '—'} detail={priorityNeighborhood ? `${priorityNeighborhood.totalReports} registros · ${priorityNeighborhood.city}` : 'Sem dados territoriais'} tone="var(--color-primary)" />
          </div>
        </section>

        <section className="mt-4 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:grid-cols-3 md:p-5">
          <div className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-success)]" size={18} /><div><p className="text-xs text-[var(--color-muted)]">Resolvidos</p><strong className="text-lg text-[var(--color-ink)]">{resolved}</strong></div></div>
          <div className="flex items-center gap-3"><Clock3 className="text-[var(--color-warning)]" size={18} /><div><p className="text-xs text-[var(--color-muted)]">Em análise</p><strong className="text-lg text-[var(--color-ink)]">{pending}</strong></div></div>
          <div className="flex items-center gap-3"><XCircle className="text-[var(--color-danger)]" size={18} /><div><p className="text-xs text-[var(--color-muted)]">Rejeitados</p><strong className="text-lg text-[var(--color-ink)]">{rejected}</strong></div></div>
        </section>
      </main>
    </Layout>
  );
}
