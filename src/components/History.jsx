import { useEffect, useState } from 'react';
import { Clock5 } from 'lucide-react';
import ReportCard from './ReportCard';

function History() {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Usuário não autenticado');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_URL}/myreports`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar os relatos do usuário.');
        }

        return response.json();
      })
      .then((data) => {
        setUserReports(Array.isArray(data.data) ? data.data : []);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Erro ao buscar o histórico:', error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="urban-surface w-full min-w-0 overflow-hidden rounded-xl">
      {loading ? (
        <div className="flex min-h-48 items-center justify-center px-4 py-10 sm:min-h-64 sm:px-6">
          <div
            className="flex items-center gap-3"
            role="status"
            aria-live="polite"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border-subtle)] border-t-[var(--color-primary)]" />
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Carregando seu histórico...
            </p>
          </div>
        </div>
      ) : userReports.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:min-h-64 sm:px-6 sm:py-12">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
            <Clock5 size={20} aria-hidden="true" />
          </span>

          <div className="flex max-w-sm flex-col gap-1.5">
            <h2 className="text-base font-bold leading-snug text-[var(--color-ink)] sm:text-lg">
              Nenhuma denúncia registrada
            </h2>

            <p className="text-sm leading-6 text-[var(--color-muted)]">
              Você ainda não fez nenhuma denúncia. Seus registros aparecerão
              aqui assim que você realizar uma.
            </p>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-1 border-b border-[var(--color-border-subtle)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--color-ink)]">
                Suas denúncias
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)] sm:text-sm">
                {userReports.length}{' '}
                {userReports.length === 1 ? 'registro' : 'registros'} no seu
                histórico
              </p>
            </div>
          </header>

          <div className="w-full min-w-0 p-3 sm:p-5 lg:p-6">
            <ReportCard reports={userReports} />
          </div>
        </>
      )}
    </section>
  );
}

export default History;
