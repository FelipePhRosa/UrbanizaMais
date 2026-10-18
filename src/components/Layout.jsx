import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { AuthContext } from '../context/AuthContext';

function Layout({ children, hideMobileNavigation = false, fullScreen = false }) {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar');
    return saved === null ? true : JSON.parse(saved);
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      localStorage.setItem('sidebar', JSON.stringify(!prev));
      return !prev;
    });
  };

  const avatar = user?.avatar_url
    ? user.avatar_url.startsWith('blob:') || user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${import.meta.env.VITE_API_URL}/uploads/${user.avatar_url.replace(/^\/+/, '')}`
    : '/cityIcon.png';

  return (
    <div className={`urban-shell relative flex ${fullScreen ? 'h-dvh overflow-hidden' : 'min-h-screen'}`}>
      {/* Sidebar desktop */}
      <Navigation isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} hideMobileNavigation={hideMobileNavigation} />

      {/* Conteúdo principal */}
      <div className={`flex-1 min-w-0 transition-[margin] duration-300 ease-linear motion-reduce:transition-none ${isSidebarOpen ? 'md:ml-60' : 'md:ml-16'} ${hideMobileNavigation ? '' : 'md:mb-0'}`}>
        <header className="sticky top-0 z-[1500] flex h-[64px] items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-white)] dark:bg-[#162338] px-4 md:h-[72px] md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/home" aria-label="Urbaniza+, ir para início" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] md:hidden">
              <img src="/AppLogo2.png" alt="Urbaniza+" className="h-8 w-8 rounded-lg object-contain" />
            </Link>
            <div className="hidden min-w-0 md:block">
              <Link to="/home" className="urban-eyebrow inline-flex min-h-6 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">Urbaniza+</Link>
              <p className="truncate text-sm font-bold text-[var(--color-ink)]">{location.pathname === '/' ? 'Visão geral' : 'Gestão da cidade'}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Link to="/settings" aria-label={`Abrir perfil de ${user?.nameUser || 'Visitante'}`} className="flex min-h-11 min-w-11 items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-[var(--color-primary-tint)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
              <img src={avatar} alt="" className="h-9 w-9 rounded-xl object-cover" />
              <span className="hidden max-w-28 truncate text-xs font-bold text-[var(--color-ink)] lg:block">{user?.nameUser || 'Visitante'}</span>
            </Link>
          </div>
        </header>
        <div id="main-content" tabIndex={-1} className="min-w-0 scroll-mt-16 focus-visible:outline-none md:scroll-mt-[72px]">
          {children}
        </div>
      </div>

    </div>
  );
}

export default Layout;
