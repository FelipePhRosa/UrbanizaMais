import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, FileText, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const CATEGORY_NAMES = { 2: 'Alagamento', 3: 'Assalto/Roubo', 5: 'Iluminação', 6: 'Buraco na via', 7: 'Desabamento', 8: 'Outro' };
const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'rejeitado', label: 'Rejeitados' },
];
const STATUS_META = {
  pendente: { label: 'Pendente', empty: 'pendentes', icon: AlertTriangle, chip: 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]' },
  aprovado: { label: 'Aprovado', empty: 'aprovados', icon: CheckCircle2, chip: 'bg-[var(--color-success-tint)] text-[var(--color-success)]' },
  rejeitado: { label: 'Rejeitado', empty: 'rejeitados', icon: XCircle, chip: 'bg-[var(--color-danger-tint)] text-[var(--color-danger)]' },
};
const norm = (value) => String(value || '').trim().toLowerCase();
const statusMeta = (value) => STATUS_META[norm(value)] || { label: String(value || 'Relato'), empty: 'encontrados', icon: FileText, chip: 'bg-[var(--color-soft)] text-[var(--color-muted)]' };
const field = 'h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-sm text-[var(--color-ink)]';
const categoryName = (report) => report.category || report.category_name || CATEGORY_NAMES[report.category_id] || `Categoria #${report.category_id || '—'}`;
const neighborhoodName = (report, neighborhoods = []) => {
  const directName =
    report.neighborhood_name ||
    report.neighborhoodName ||
    report.neighborhood?.name ||
    (typeof report.neighborhood === 'string' ? report.neighborhood : null);

  if (directName) return directName;

  const neighborhoodId = report.neighborhood_id ?? report.neighborhoodId;

  if (neighborhoodId) {
    const neighborhood = neighborhoods.find(
      (item) => String(item.id) === String(neighborhoodId)
    );

    if (neighborhood?.name) return neighborhood.name;

    return `Bairro #${neighborhoodId}`;
  }

  return 'Bairro não informado';
};
const formatDate = (report) => {
  const date = new Date(report.created_at || report.updated_at);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
};

export default function MunicipalReports({ cityName, token, initialStatus = 'all', initialNeighborhoodId = 'all', neighborhoods = [], backLabel = 'Voltar para o dashboard', onBack }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState(initialNeighborhoodId && initialNeighborhoodId !== 'all' ? String(initialNeighborhoodId) : 'all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Escopo da cidade é resolvido pelo backend a partir do token; o prefeito nunca envia city_id.
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (neighborhoodFilter !== 'all') params.set('neighborhood_id', neighborhoodFilter);
        const query = params.toString();
        const response = await fetch(`${API}/reportsByCity${query ? `?${query}` : ''}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const payload = await response.json().catch(() => ({}));
        
        if (!response.ok) throw new Error(payload?.message || 'Não foi possível carregar os relatos.');
        if (active) setReports(Array.isArray(payload?.data) ? payload.data : []);
      } catch (requestError) {
        if (active) {
          setReports([]);
          setError(requestError.message || 'Não foi possível carregar os relatos.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [statusFilter, neighborhoodFilter, token, reloadKey]);

  const scope = neighborhoodFilter !== 'all' ? (neighborhoods.find((item) => String(item.id) === neighborhoodFilter)?.name || 'este bairro') : (cityName || 'este município');
  const empty = STATUS_META[statusFilter] || { label: 'registrado', empty: 'registrados' };

  return (
    <section className="urban-surface overflow-hidden">
      <div className="border-b border-[var(--color-border-subtle)] p-4 md:p-5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline">
          <ArrowLeft size={14} /> {backLabel}
        </button>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--color-ink)]">Relatos municipais</h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Relatos {cityName ? `de ${cityName}` : 'do município'} disponíveis para consulta — abra um relato para ver os detalhes.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary-tint)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
            <FileText size={13} /> {loading ? 'Carregando…' : `${reports.length} ${reports.length === 1 ? 'relato' : 'relatos'}`}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${statusFilter === tab.value ? 'bg-[var(--color-primary)] text-white' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:max-w-xs">
          <select value={neighborhoodFilter} onChange={(event) => setNeighborhoodFilter(event.target.value)} className={field} aria-label="Filtrar por bairro">
            <option value="all">Todos os bairros</option>
            {neighborhoods.map((item) => (
              <option key={item.id} value={String(item.id)}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <p className="grid h-56 place-items-center text-sm text-[var(--color-muted)]">Carregando relatos…</p>
      ) : error ? (
        <div className="p-4 md:p-5">
          <p role="alert" className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-tint)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Tentar novamente
          </button>
        </div>
      ) : reports.length ? (
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {reports.map((report) => {
            const meta = statusMeta(report.status);
            const Icon = meta.icon;
            return (
              <button
                type="button"
                key={report.id}
                onClick={() => navigate(`/report/${report.id}`)}
                className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-muted)]"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.chip}`}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-[var(--color-ink)]">{report.reportTitle || 'Relato sem título'}</strong>
                  <small className="mt-0.5 block truncate text-xs text-[var(--color-muted)]">{categoryName(report)} · {neighborhoodName(report, neighborhoods)}{formatDate(report) ? ` · ${formatDate(report)}` : ''}</small>
                </span>
                <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${meta.chip}`}>{meta.label}</span>
                <ChevronRight size={16} className="shrink-0 text-[var(--color-muted)]" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <FileText className="mx-auto text-[var(--color-muted)]" size={24} />
          <p className="mt-3 text-sm font-bold text-[var(--color-ink)]">Nenhum relato {empty.label}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Não existem relatos {empty.empty} para {scope} neste momento.</p>
        </div>
      )}
    </section>
  );
}