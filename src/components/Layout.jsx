import { useState, useContext } from 'react';
import { Bell, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Brand from './Brand';
import { AuthContext } from '../context/AuthContext';

function Layout({ children, hideMobileNavigation = false }) {
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
    <div className="urban-shell flex min-h-screen relative">
      {/* Sidebar desktop */}
      <Navigation isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} hideMobileNavigation={hideMobileNavigation} />

      {/* Conteúdo principal */}
      <div className={`flex-1 min-w-0 transition-[margin] duration-300 ease-linear ${isSidebarOpen ? 'md:ml-60' : 'md:ml-16'} ${hideMobileNavigation ? '' : 'pb-20 md:pb-0'}`}>
        <header className="urban-topbar sticky top-0 z-40 flex h-[64px] items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 backdrop-blur md:h-[72px] md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden"><Brand compact /></div>
            <div className="hidden min-w-0 md:block">
              <p className="urban-eyebrow">Urbaniza+</p>
              <p className="truncate text-sm font-bold text-[var(--color-ink)]">{location.pathname === '/' ? 'Visão geral' : 'Gestão da cidade'}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <Link to="/settings" aria-label="Abrir perfil" className="flex min-w-0 items-center gap-2 rounded-xl p-1 transition hover:bg-[var(--color-primary-tint)]">
              <img src={avatar} alt="" className="h-9 w-9 rounded-xl object-cover" />
              <span className="hidden max-w-28 truncate text-xs font-bold text-[var(--color-ink)] lg:block">{user?.nameUser || 'Visitante'}</span>
            </Link>
          </div>
        </header>
        {children}
      </div>

    </div>
  );
}

export default Layout;
