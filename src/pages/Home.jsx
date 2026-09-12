import Layout from '../components/Layout';
import MapaDenuncia from '../components/MapaLeaflet';
import ReportCard from '../components/ReportCard';
import { Link } from 'react-router-dom';
import { ChartColumn, CheckCircle2, Clock3, Plus, TrendingUp } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const periodStart = (daysAgo) => Date.now() - daysAgo * 24 * 60 * 60 * 1000;

function variationLabel(current, previous) {
  if (!previous) return current ? '+100%' : '—';
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value >= 0 ? '+' : ''}${value}%`;
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reportList`)
      .then((response) => response.json())
      .then((data) => setReports(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setReports([]));
  }, []);

  const metrics = useMemo(() => {
    const currentStart = periodStart(30);
    const previousStart = periodStart(60);
    const inCurrent = (report) => new Date(report.updated_at || report.created_at).getTime() >= currentStart;
    const inPrevious = (report) => {
      const date = new Date(report.updated_at || report.created_at).getTime();
      return date >= previousStart && date < currentStart;
    };
    const currentReports = reports.filter(inCurrent);
    const previousReports = reports.filter(inPrevious);
    const countStatus = (items, statuses) => items.filter((report) => statuses.includes(report.status)).length;

    return [
      { label: 'Relatos totais', value: reports.length, current: currentReports.length, previous: previousReports.length, Icon: ChartColumn, color: 'var(--color-primary)' },
      { label: 'Em andamento', value: countStatus(reports, ['aprovado', 'pendente']), current: countStatus(currentReports, ['aprovado', 'pendente']), previous: countStatus(previousReports, ['aprovado', 'pendente']), Icon: Clock3, color: 'var(--color-warning)' },
      { label: 'Resolvidos', value: countStatus(reports, ['resolvida']), current: countStatus(currentReports, ['resolvida']), previous: countStatus(previousReports, ['resolvida']), Icon: CheckCircle2, color: 'var(--color-success)' }
    ].map((metric) => ({ ...metric, variation: variationLabel(metric.current, metric.previous) }));
  }, [reports]);

  return <Layout>
    <main className="w-full max-w-[1440px] px-4 py-4 md:px-8 md:py-5">
      <header className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div><p className="urban-eyebrow">Visão da cidade</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Olá, {user?.nameUser?.split(' ')[0] || 'você'}.</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Acompanhe os relatos públicos da sua região.</p></div>
        <Link to="/reportar" className="hidden h-10 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white transition hover:brightness-95 sm:inline-flex"><Plus size={16} /> Novo relato</Link>
      </header>

      <section aria-label="Métricas da cidade" className="mb-4 grid grid-cols-3 divide-x divide-[var(--color-border)] overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        {metrics.map(({ label, value, variation, Icon, color }) => <div key={label} className="min-w-0 px-3 py-2.5 first:pl-5 sm:px-5 sm:py-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-soft)]" style={{ color }}><Icon size={15} /></span><span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)]"><TrendingUp size={11} />{variation}</span></div><strong className="mt-1.5 block truncate text-xl font-extrabold text-[var(--color-ink)] sm:text-2xl">{value}</strong><span className="block truncate text-[10px] text-[var(--color-muted)] sm:text-xs">{label}</span></div>)}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,.78fr)]">
        <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm"><div className="flex items-center justify-between px-2 pb-2 pt-1"><div><h2 className="text-sm font-bold text-[var(--color-ink)]">Mapa de problemas</h2><p className="text-xs text-[var(--color-muted)]">Atualizações da comunidade</p></div><Link to="/mapa" className="text-xs font-bold text-[var(--color-primary)] hover:underline">Abrir mapa</Link></div><div className="h-[300px] overflow-hidden rounded-lg md:h-[420px]"><MapaDenuncia /></div></section>
        <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm"><div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5"><div><h2 className="text-sm font-bold text-[var(--color-ink)]">Últimos relatos</h2><p className="mt-0.5 text-xs text-[var(--color-muted)]">Registros mais recentes.</p></div><Link to="/Report" className="text-xs font-bold text-[var(--color-primary)] hover:underline">Ver todos</Link></div><ReportCard reports={reports.slice(0, 8)} /></section>
      </div>
    </main>
    <Link to="/reportar" className="fixed bottom-20 right-4 z-40 grid h-11 w-11 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-lg sm:hidden" aria-label="Novo relato"><Plus size={19} /></Link>
  </Layout>;
}
