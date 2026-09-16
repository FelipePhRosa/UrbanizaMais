import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  House,
  LogOut,
  Map,
  MessageSquare,
  MoreHorizontal,
  Moon,
  Settings,
  Sun,
  TriangleAlert,
  Users
} from 'lucide-react';
import Brand from './Brand';
import { AuthContext } from '../context/AuthContext';


const navigationItems = [
  { id: 'dashboard', label: 'Administração', path: '/dashboard', icon: House, admin: true, primary: false },
  { id: 'municipal-dashboard', label: 'Painel municipal', path: '/Prefeitura', icon: House, municipal: true, primary: false },
  { id: 'home', label: 'Início', path: '/home', icon: House, primary: true },
  { id: 'map', label: 'Mapa', path: '/mapa', icon: Map, primary: true },
  { id: 'reports', label: 'Denúncias', path: '/Report', icon: TriangleAlert, primary: true },
  { id: 'chat', label: 'Chat', path: '/chat', icon: MessageSquare, primary: true },
  { id: 'community', label: 'Comunidade', path: '/Comunidade', icon: Users, primary: true },
  { id: 'settings', label: 'Configurações', path: '/settings', icon: Settings, primary: true },
  { id: 'help', label: 'Ajuda', path: '/help', icon: CircleHelp, primary: false },
  { id: 'logout', label: 'Sair', path: '/login', icon: LogOut, action: 'logout', primary: false }
];

const isActivePath = (pathname, path) => {
  const current = pathname.toLowerCase();
  const target = path.toLowerCase();
  if (target === '/dashboard') return ['/dashboard', '/pendingreports', '/userlist'].includes(current);
  return target === '/' ? current === '/' : current === target || current.startsWith(`${target}/`);
};

function Avatar({ user, className = 'h-10 w-10' }) {
  const source = user?.avatar_url
    ? user.avatar_url.startsWith('blob:') || user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${import.meta.env.VITE_API_URL}/uploads/${user.avatar_url.replace(/^\/+/, '')}`
    : '/cityIcon.png';
  return <img src={source} alt="" className={`${className} rounded-xl object-cover`} />;
}

export default function Navigation({ isSidebarOpen, toggleSidebar, hideMobileNavigation = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : document.documentElement.classList.contains('dark');
  });
  const isPlatformAdmin = ['1', '2'].includes(String(user?.role));
  const isMunicipalAdmin = String(user?.role) === '7';
  const visibleItems = useMemo(() => navigationItems.filter((item) => (!item.admin || isPlatformAdmin) && (!item.municipal || isMunicipalAdmin)), [isPlatformAdmin, isMunicipalAdmin]);
  const primaryItems = visibleItems.filter((item) => item.primary && item.id !== 'settings').slice(0, 5);
  const moreItems = visibleItems.filter((item) => !item.primary || item.id === 'settings');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleItem = (item) => {
    if (item.action === 'logout') {
      logout();
      navigate('/login');
      return;
    }
    navigate(item.path);
    setIsMoreOpen(false);
  };

  const itemClass = (item) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
    isActivePath(location.pathname, item.path)
      ? 'bg-[var(--color-primary-tint)] font-bold text-[var(--color-primary)]'
      : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]'
  }`;

  return (
    <>
      <aside className={`fixed left-0 top-0 z-[1200] hidden h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-all duration-300 md:flex ${isSidebarOpen ? 'w-60 px-3' : 'w-16 px-2'}`}>
        <button type="button" onClick={toggleSidebar} aria-label={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'} className={`mb-8 mt-5 flex h-10 items-center overflow-hidden text-left ${isSidebarOpen ? 'w-full justify-start px-1' : 'w-10 justify-center'}`}>
          <span className={`block shrink-0 transition-transform duration-300 ${isSidebarOpen ? '' : 'scale-90'}`}><Brand compact /></span>
          <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'ml-2 max-w-[150px] opacity-100' : 'ml-0 max-w-0 opacity-0'}`}>
            <span className="text-xl font-extrabold tracking-tight">Urbaniza<span className="text-[var(--color-primary)]">+</span></span>
          </span>
        </button>

        <nav aria-label="Navegação principal" className="flex-1 min-h-0 space-y-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleItems.filter((item) => item.id !== 'logout').map((item) => {
            const Icon = item.icon;
            return <button key={item.id} type="button" aria-current={isActivePath(location.pathname, item.path) ? 'page' : undefined} onClick={() => handleItem(item)} title={!isSidebarOpen ? item.label : undefined} className={`${itemClass(item)} w-full ${isSidebarOpen ? '' : 'justify-center px-0'}`}><Icon size={19} /><span className={isSidebarOpen ? 'truncate' : 'sr-only'}>{item.label}</span></button>;
          })}
        </nav>

        <div className="mt-4 space-y-2 border-t border-[var(--color-border-subtle)] pt-4">
          <Link to="/settings" className={`flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <Avatar user={user} className="h-9 w-9" />
            <span className={isSidebarOpen ? 'min-w-0' : 'sr-only'}><strong className="block truncate text-xs">{user?.nameUser || 'Visitante'}</strong><small className="block max-w-32 truncate text-[11px] text-[var(--color-muted)]">{user?.email || 'Acesse seu perfil'}</small></span>
          </Link>
          <button type="button" onClick={() => setDarkMode((value) => !value)} title={darkMode ? 'Modo claro' : 'Modo escuro'} className={`${itemClass({ path: '__theme' })} w-full ${isSidebarOpen ? '' : 'justify-center px-0'}`}><span className="grid h-5 w-5 place-items-center">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</span><span className={isSidebarOpen ? '' : 'sr-only'}>{darkMode ? 'Modo claro' : 'Modo escuro'}</span></button>
          <button type="button" onClick={() => handleItem(navigationItems.find((item) => item.id === 'logout'))} title={!isSidebarOpen ? 'Sair' : undefined} className={`${itemClass({ path: '__logout' })} mb-4 w-full ${isSidebarOpen ? '' : 'justify-center px-0'}`}><LogOut size={19} /><span className={isSidebarOpen ? '' : 'sr-only'}>Sair</span></button>
        </div>
      </aside>

      {!hideMobileNavigation && <nav aria-label="Navegação mobile" className="fixed bottom-0 left-0 right-0 z-[1200] flex items-stretch justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {primaryItems.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" aria-label={item.label} aria-current={isActivePath(location.pathname, item.path) ? 'page' : undefined} onClick={() => handleItem(item)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[var(--color-muted)] transition ${isActivePath(location.pathname, item.path) ? 'font-bold text-[var(--color-primary)]' : ''}`}><Icon size={20} /><span className="max-w-full truncate text-[10px] leading-none">{item.label}</span></button>; })}
        <button type="button" aria-label="Mais opções" aria-expanded={isMoreOpen} onClick={() => setIsMoreOpen((value) => !value)} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[var(--color-muted)] transition ${isMoreOpen ? 'font-bold text-[var(--color-primary)]' : ''}`}><MoreHorizontal size={20} /><span className="max-w-full truncate text-[10px] leading-none">Mais</span></button>
      </nav>}

      {!hideMobileNavigation && isMoreOpen && <div className="fixed inset-x-3 bottom-[76px] z-[1201] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg md:hidden">
        {moreItems.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => handleItem(item)} className={`${itemClass(item)} w-full`}><Icon size={18} /><span>{item.label}</span></button>; })}
        <button type="button" onClick={() => setDarkMode((value) => !value)} className={`${itemClass({ path: '__theme' })} w-full`}><span>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</span><span>{darkMode ? 'Modo claro' : 'Modo escuro'}</span></button>
        <button type="button" onClick={() => handleItem(navigationItems.find((item) => item.id === 'logout'))} className={`${itemClass({ path: '__logout' })} w-full`}><LogOut size={18} /><span>Sair</span></button>
      </div>}
    </>
  );
}
