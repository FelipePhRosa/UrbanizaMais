import { useContext, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const PUBLIC_STATUSES = ['aprovado', 'resolvida'];

function getCityId(user) {
  if (user?.city_id !== undefined && user?.city_id !== null) return String(user.city_id);
  if (user?.cityId !== undefined && user?.cityId !== null) return String(user.cityId);
  if (typeof user?.city === 'object' && user.city?.id !== undefined) return String(user.city.id);
  return '';
}

function getCityName(user) {
  if (user?.city_name) return user.city_name;
  if (user?.cityName) return user.cityName;
  if (typeof user?.city === 'string') return user.city;
  if (typeof user?.city === 'object') return user.city.name || '';
  return '';
}

function getReportCityId(report) {
  return String(report.city_id ?? report.cityId ?? report.city?.id ?? report.city ?? '');
}

function getReportCityName(report) {
  if (report.city_name) return report.city_name;
  if (report.cityName) return report.cityName;
  if (typeof report.city === 'string') return report.city;
  if (typeof report.city === 'object') return report.city.name || '';
  return '';
}

function getNeighborhood(report) {
  return report.neighborhood_name
    || report.neighborhoodName
    || report.neighborhood?.name
    || report.neighborhood
    || 'Bairro não informado';
}

function ReportRow({ report }) {
  return (
    <article className="grid gap-3 border-b border-[var(--color-border-subtle)] p-3 last:border-0 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-4">
      <img
        src={report.image ? `${import.meta.env.VITE_API_URL}/uploads/${report.image}` : '/placeholder.png'}
        alt=""
        className="h-20 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] object-cover sm:h-16 sm:w-[88px]"
      />
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            {report.category || 'Problema urbano'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
            <MapPin size={12} /> {getNeighborhood(report)}
          </span>
        </div>
        <h2 className="mt-1 truncate text-sm font-bold text-[var(--color-ink)] sm:text-base">
          {report.reportTitle || 'Relato da comunidade'}
        </h2>
        <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
          {report.address || 'Localização não informada'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-muted)]">
          <span>{report.updated_at ? formatDistanceToNow(new Date(report.updated_at), { addSuffix: true, locale: ptBR }) : 'Agora'}</span>
          <span aria-hidden="true">·</span>
          <span>{report.likes ?? 0} curtidas</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <span className="rounded-full bg-[var(--color-success-tint)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-success)]">
          {report.status === 'resolvida' ? 'Resolvido' : 'Aprovado'}
        </span>
        <Link to={`/report/${report.id}`} className="text-xs font-bold text-[var(--color-primary)] hover:underline">
          Ver relato
        </Link>
      </div>
    </article>
  );
}

function Report() {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/reportList`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const source = Array.isArray(data) ? data : data.data;
        setReports(Array.isArray(source) ? source.map((report) => ({ ...report, likedByCurrentUser: !!report.likedByCurrentUser })) : []);
      })
      .catch((error) => console.error('Erro ao buscar os relatos:', error));
  }, [token]);

  const cityOptions = useMemo(() => {
    const cities = new Map();
    reports.forEach((report) => {
      const id = getReportCityId(report);
      const name = getReportCityName(report);
      if (id && name) cities.set(id, name);
    });
    return [...cities.entries()];
  }, [reports]);

  useEffect(() => {
    if (cityFilter || !reports.length) return;

    const userCityId = getCityId(user);
    const userCityName = getCityName(user).toLowerCase();
    const matchingCity = cityOptions.find(([id, name]) => id === userCityId || name.toLowerCase() === userCityName);

    if (matchingCity) setCityFilter(matchingCity[0]);
  }, [cityFilter, cityOptions, reports.length, user]);

  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Aprovadas', value: 'aprovado' },
    { label: 'Resolvidas', value: 'resolvida' },
  ];

  const filteredReports = reports.filter((report) => {
    const searchableText = `${report.reportTitle || ''} ${report.address || ''} ${report.category || ''} ${getNeighborhood(report)}`.toLowerCase();
    if (search && !searchableText.includes(search.toLowerCase())) return false;
    if (cityFilter && getReportCityId(report) !== String(cityFilter)) return false;
    if (!PUBLIC_STATUSES.includes(report.status)) return false;
    return statusFilter === 'all' || report.status === statusFilter;
  });

  return (
    <Layout>
      <main className="mx-auto max-w-[1500px] px-4 py-5 md:px-8">
        <header className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="urban-eyebrow">Participação cidadã</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Relatos da comunidade</h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Acompanhe problemas registrados e suas atualizações.</p>
          </div>
          <Link to="/reportar" className="urban-button-accent inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold">
            <Plus size={18} /> Reportar
          </Link>
        </header>

        <section className="urban-surface mb-4 flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:justify-between" aria-label="Filtros de relatos">
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 text-[var(--color-muted)] sm:max-w-xs">
              <Search size={15} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar relato ou bairro" className="w-full bg-transparent text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]" />
            </label>
            <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="h-9 max-w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 text-xs font-semibold text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]">
              <option value="">Todas as cidades</option>
              {cityOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => <button type="button" key={filter.value} onClick={() => setStatusFilter(filter.value)} className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition ${statusFilter === filter.value ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]'}`}>{filter.label}</button>)}
          </div>
        </section>

        <section className="urban-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3">
            <div><h2 className="text-sm font-bold text-[var(--color-ink)]">Registros públicos</h2><p className="text-xs text-[var(--color-muted)]">{filteredReports.length} encontrados</p></div>
            <SlidersHorizontal size={16} className="text-[var(--color-muted)]" aria-hidden="true" />
          </div>
          {filteredReports.length > 0 ? filteredReports.map((report) => <ReportRow key={report.id} report={report} />) : <div className="py-12 text-center"><SlidersHorizontal className="mx-auto text-[var(--color-muted)]" size={22} /><h2 className="mt-3 text-sm font-bold text-[var(--color-ink)]">Nenhum relato encontrado</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Tente outro filtro ou registre um novo problema.</p></div>}
        </section>
      </main>
    </Layout>
  );
}

export default Report;
