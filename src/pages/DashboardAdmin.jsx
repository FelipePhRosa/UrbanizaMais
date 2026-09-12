import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, CheckCircle2, ChevronRight, FileText, LockKeyhole, Map, ShieldCheck, Users, UsersRound, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import { ActionCard, MetricCard } from '../components/DashboardCards';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const API = import.meta.env.VITE_API_URL;
const statusMeta = {
  aprovado: { label: 'Aprovadas', icon: CheckCircle2, tone: 'var(--color-primary)' },
  pendente: { label: 'Pendentes', icon: AlertTriangle, tone: 'var(--color-warning)' },
  rejeitado: { label: 'Rejeitadas', icon: XCircle, tone: 'var(--color-danger)' },
  resolvida: { label: 'Resolvidas', icon: ShieldCheck, tone: 'var(--color-success)' }
};
const toList = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

function Restricted() {
  return <Layout><main className="grid min-h-[70vh] place-items-center p-6"><div className="max-w-sm text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-danger-tint)] text-[var(--color-danger)]"><LockKeyhole /></span><h1 className="mt-4 text-xl font-bold text-[var(--color-ink)]">Acesso restrito</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Este painel é exclusivo para administradores da plataforma.</p></div></main></Layout>;
}

export default function DashboardAdmin() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({ users: [], reports: [], pending: [], cities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('all');
  const hasAccess = ['1', '2'].includes(String(user?.role));

  useEffect(() => {
    if (!hasAccess) return;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const request = (path, label) => fetch(`${API}${path}`, { headers }).then((response) => { if (!response.ok) throw new Error(label); return response.json(); });
    Promise.all([request('/userList', 'usuários'), request('/reportList', 'relatos'), request('/reportPending', 'pendências'), request('/allCities', 'municípios')])
      .then(([users, reports, pending, cities]) => setDashboard({ users: toList(users), reports: toList(reports), pending: toList(pending), cities: toList(cities) }))
      .catch(() => setError('Não foi possível carregar os dados administrativos. Tente novamente mais tarde.'))
      .finally(() => setLoading(false));
  }, [hasAccess, token]);

  const summary = useMemo(() => {
    const count = (status) => dashboard.reports.filter((report) => report.status === status).length;
    const latest = [...dashboard.reports].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)).slice(0, 5);
    return { approved: count('aprovado'), rejected: count('rejeitado'), latest };
  }, [dashboard.reports]);

  const analytics = useMemo(() => {
    const cutoff = period === '30' ? Date.now() - 30 * 86400000 : period === '90' ? Date.now() - 90 * 86400000 : 0;
    const reports = dashboard.reports.filter((report) => {
      const date = new Date(report.created_at || report.updated_at || 0).getTime();
      const reportCity = String(report.city_name || report.city || report.city_id || '');
      return (!cutoff || date >= cutoff) && (city === 'all' || reportCity === city) && (status === 'all' || report.status === status);
    });
    const group = (selector) => [...reports.reduce((map, report) => { const key = selector(report); map.set(key, (map.get(key) || 0) + 1); return map; }, new globalThis.Map()).entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
    const trendMap = reports.reduce((map, report) => { const date = new Date(report.created_at || report.updated_at); if (Number.isNaN(date.getTime())) return map; const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }); const current = map.get(key) || { name: key, recebidos: 0, aprovados: 0 }; current.recebidos += 1; if (report.status === 'aprovado' || report.status === 'resolvida') current.aprovados += 1; map.set(key, current); return map; }, new globalThis.Map());
    return { reports, trend: [...trendMap.values()].slice(-6), categories: group((report) => report.category || `Categoria #${report.category_id || '—'}`), locations: group((report) => report.city_name || report.city || `Município #${report.city_id || '—'}`), cities: [...new Set(dashboard.reports.map((report) => String(report.city_name || report.city || report.city_id || '')).filter(Boolean))] };
  }, [dashboard.reports, period, city, status]);

  const downloadCsv = () => {
    const rows = [['Título', 'Status', 'Categoria', 'Cidade', 'Data'], ...analytics.reports.map((report) => [report.reportTitle || '', report.status || '', report.category || report.category_id || '', report.city_name || report.city || report.city_id || '', report.created_at || report.updated_at || ''])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); link.download = 'relatorio-administrativo.csv'; link.click(); URL.revokeObjectURL(link.href);
  };

  if (!hasAccess) return <Restricted />;
  if (loading) return <Layout><main className="grid min-h-[70vh] place-items-center p-6 text-sm text-[var(--color-muted)]">Carregando painel administrativo…</main></Layout>;
  if (error) return <Layout><main className="p-4 md:p-8"><div role="alert" className="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-tint)] p-4 text-sm text-[var(--color-danger)]">{error}</div></main></Layout>;

  return <Layout><main className="w-full px-4 py-4 md:px-8 md:py-6">
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="urban-eyebrow">Administração da plataforma</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Visão geral</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Acompanhe a moderação e os principais dados do Urbaniza+.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-success-tint)] px-3 py-1.5 text-xs font-bold text-[var(--color-success)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" /> Dados atuais</span></header>

    <section aria-label="Indicadores administrativos" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard icon={Users} label="Usuários" value={dashboard.users.length} description="Pessoas cadastradas" tone="var(--color-primary)" onClick={() => navigate('/userList')} />
      <MetricCard icon={AlertTriangle} label="Pendentes" value={dashboard.pending.length} description="Aguardando aprovação" tone="var(--color-warning)" onClick={() => navigate('/pendingreports')} />
      <MetricCard icon={CheckCircle2} label="Aprovadas" value={summary.approved} description="Relatos publicados" tone="var(--color-success)" onClick={() => navigate('/Report')} />
      <MetricCard icon={XCircle} label="Rejeitadas" value={summary.rejected} description="Relatos não publicados" tone="var(--color-danger)" onClick={() => navigate('/Report')} />
      <MetricCard icon={Building2} label="Municípios" value={dashboard.cities.length} description={`${dashboard.reports.length} relatos no sistema`} tone="var(--color-primary)" onClick={() => navigate('/Report')} />
    </section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
      <section className="urban-surface min-h-[300px] p-4 md:p-5"><div><h2 className="font-bold text-[var(--color-ink)]">Tendência de relatos</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Relatos recebidos e aprovados no período selecionado.</p></div>{analytics.trend.length ? <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.trend}><CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} /><Area type="monotone" dataKey="recebidos" name="Recebidos" stroke="#6c2bd9" fill="#6c2bd9" fillOpacity={0.16} strokeWidth={2} /><Area type="monotone" dataKey="aprovados" name="Aprovados/resolvidos" stroke="#14956b" fill="#14956b" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer></div> : <p className="grid h-56 place-items-center text-sm text-[var(--color-muted)]">Sem datas suficientes para exibir a tendência.</p>}</section>
      <section className="urban-surface min-h-[300px] p-4 md:p-5"><div><h2 className="font-bold text-[var(--color-ink)]">Tipos de relatos</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Distribuição por categoria.</p></div>{analytics.categories.length ? <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analytics.categories.slice(0, 5)} dataKey="total" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>{analytics.categories.slice(0, 5).map((entry, index) => <Cell key={entry.name} fill={['#6c2bd9', '#14956b', '#8b5cf6', '#d68b18', '#c44747'][index]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div> : <p className="grid h-56 place-items-center text-sm text-[var(--color-muted)]">Sem categorias disponíveis.</p>}</section>
    </section>

    <section className="urban-surface mt-4 min-h-[250px] p-4 md:p-5"><div><h2 className="font-bold text-[var(--color-ink)]">Relatos por município</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Comparação com base nos relatos carregados.</p></div>{analytics.locations.length ? <div className="mt-4 h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.locations.slice(0, 7)} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="var(--color-border-subtle)" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} /><YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} /><Tooltip /><Bar dataKey="total" name="Relatos" fill="#6c2bd9" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div> : <p className="grid h-48 place-items-center text-sm text-[var(--color-muted)]">Sem localização disponível.</p>}</section>

    <section className="urban-surface mt-4 p-4 md:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-bold text-[var(--color-ink)]">Relatórios administrativos</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Filtre os relatos carregados e exporte em CSV.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={downloadCsv} className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white">Baixar CSV</button><button type="button" disabled className="cursor-not-allowed rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-muted)]">PDF · Em breve</button></div></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-ink)]"><option value="all">Todo o período</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select><select value={city} onChange={(event) => setCity(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-ink)]"><option value="all">Todos os municípios</option>{analytics.cities.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-ink)]"><option value="all">Todos os status</option><option value="pendente">Pendentes</option><option value="aprovado">Aprovados</option><option value="rejeitado">Rejeitados</option><option value="resolvida">Resolvidos</option></select></div></section>

    <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,.7fr)]">
      <section className="urban-surface overflow-hidden" aria-labelledby="admin-pending-title"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-4"><div><h2 id="admin-pending-title" className="font-bold text-[var(--color-ink)]">Fila de aprovação</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Relatos que ainda precisam de uma decisão.</p></div><button type="button" onClick={() => navigate('/pendingreports')} className="text-xs font-bold text-[var(--color-primary)] hover:underline">Abrir fila</button></div>{dashboard.pending.length ? <div className="divide-y divide-[var(--color-border-subtle)]">{dashboard.pending.slice(0, 4).map((report) => <article key={report.id} className="flex min-w-0 items-center gap-3 px-4 py-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-warning-tint)] text-[var(--color-warning)]"><AlertTriangle size={17} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-[var(--color-ink)]">{report.reportTitle || 'Relato sem título'}</h3><p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">{report.address || 'Localização não informada'}</p></div><button type="button" onClick={() => navigate('/pendingreports')} className="shrink-0 text-xs font-bold text-[var(--color-primary)]">Revisar</button></article>)}</div> : <div className="px-4 py-12 text-center"><CheckCircle2 className="mx-auto text-[var(--color-success)]" size={24} /><p className="mt-3 text-sm font-bold text-[var(--color-ink)]">Nenhuma pendência</p><p className="mt-1 text-xs text-[var(--color-muted)]">A fila de aprovação está limpa.</p></div>}</section>
      <section className="urban-surface p-4" aria-labelledby="admin-actions-title"><div><h2 id="admin-actions-title" className="font-bold text-[var(--color-ink)]">Ações rápidas</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Acesse as funções administrativas.</p></div><div className="mt-4 grid gap-2"><ActionCard icon={AlertTriangle} title="Revisar pendências" description="Aprovar ou rejeitar relatos" onClick={() => navigate('/pendingreports')} /><ActionCard icon={UsersRound} title="Gerenciar usuários" description="Consultar e atualizar papéis" onClick={() => navigate('/userList')} /><ActionCard icon={FileText} title="Ver relatos" description="Acompanhar registros publicados" onClick={() => navigate('/Report')} /><ActionCard icon={Map} title="Abrir mapa" description="Visualizar problemas no território" onClick={() => navigate('/mapa')} /></div></section>
    </section>

    <section className="urban-surface mt-5 overflow-hidden" aria-labelledby="admin-recent-title"><div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-4"><div><h2 id="admin-recent-title" className="font-bold text-[var(--color-ink)]">Relatos recentes</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Últimos registros enviados à plataforma.</p></div><button type="button" onClick={() => navigate('/Report')} className="text-xs font-bold text-[var(--color-primary)] hover:underline">Ver todos</button></div>{summary.latest.length ? <div className="grid divide-y divide-[var(--color-border-subtle)] md:grid-cols-2 md:divide-x md:divide-y-0">{summary.latest.map((report) => { const meta = statusMeta[report.status] || { label: report.status || 'Relato', icon: FileText, tone: 'var(--color-muted)' }; const Icon = meta.icon; return <button type="button" key={report.id} onClick={() => navigate(`/report/${report.id}`)} className="flex min-w-0 items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-surface-muted)]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-soft)]" style={{ color: meta.tone }}><Icon size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[var(--color-ink)]">{report.reportTitle || 'Relato sem título'}</strong><small className="mt-0.5 block truncate text-xs text-[var(--color-muted)]">{meta.label} · {report.category || 'Problema urbano'}</small></span><ChevronRight size={17} className="shrink-0 text-[var(--color-muted)]" /></button>; })}</div> : <div className="px-4 py-12 text-center"><FileText className="mx-auto text-[var(--color-muted)]" size={24} /><p className="mt-3 text-sm font-bold text-[var(--color-ink)]">Ainda não há relatos</p><p className="mt-1 text-xs text-[var(--color-muted)]">Os novos registros aparecerão aqui.</p></div>}</section>
  </main></Layout>;
}
