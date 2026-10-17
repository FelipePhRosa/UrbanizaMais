import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CircleHelp,
  House,
  Landmark,
  ChartNoAxesCombined,
  LogOut,
  Map,
  MessageSquare,
  MoreHorizontal,
  Moon,
  Settings,
  Sun,
  TriangleAlert,
  Users,
} from 'lucide-react';
import Brand from './Brand';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Administração',
    path: '/dashboard',
    icon: ChartNoAxesCombined,
    admin: true,
    primary: false,
  },
  {
    id: 'municipal-dashboard',
    label: 'Painel municipal',
    path: '/Prefeitura',
    icon: Landmark,
    municipal: true,
    primary: false,
  },
  {
    id: 'home',
    label: 'Início',
    path: '/home',
    icon: House,
    primary: true,
  },
  {
    id: 'map',
    label: 'Mapa',
    path: '/mapa',
    icon: Map,
    primary: true,
  },
  {
    id: 'reports',
    label: 'Denúncias',
    path: '/Report',
    icon: TriangleAlert,
    primary: true,
  },
  {
    id: 'chat',
    label: 'Chat',
    path: '/chat',
    icon: MessageSquare,
    primary: true,
  },
  {
    id: 'community',
    label: 'Comunidade',
    path: '/Comunidade',
    icon: Users,
    primary: true,
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/settings',
    icon: Settings,
    primary: true,
  },
  {
    id: 'help',
    label: 'Ajuda',
    path: '/help',
    icon: CircleHelp,
    primary: false,
  },
  {
    id: 'logout',
    label: 'Sair',
    path: '/login',
    icon: LogOut,
    action: 'logout',
    primary: false,
  },
];

const isActivePath = (pathname, path) => {
  const current = pathname.toLowerCase();
  const target = path.toLowerCase();

  if (target === '/dashboard') {
    return ['/dashboard', '/pendingreports', '/userlist'].includes(current);
  }

  return target === '/'
    ? current === '/'
    : current === target || current.startsWith(`${target}/`);
};

function Avatar({ user, className = 'h-10 w-10' }) {
  const source = user?.avatar_url
    ? user.avatar_url.startsWith('blob:') || user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${import.meta.env.VITE_API_URL}/uploads/${user.avatar_url.replace(/^\/+/, '')}`
    : '/cityIcon.png';

  return <img src={source} alt="" className={`${className} rounded-xl object-cover`} />;
}

export default function Navigation({
  isSidebarOpen,
  toggleSidebar,
  hideMobileNavigation = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [visiblePrimaryCount, setVisiblePrimaryCount] = useState(5);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const mobileNavRef = useRef(null);
  const moreButtonRef = useRef(null);

  const isPlatformAdmin = ['1', '2'].includes(String(user?.role));
  const isMunicipalAdmin = String(user?.role) === '7';

  const visibleItems = useMemo(
    () =>
      navigationItems.filter(
        (item) =>
          (!item.admin || isPlatformAdmin) &&
          (!item.municipal || isMunicipalAdmin),
      ),
    [isPlatformAdmin, isMunicipalAdmin],
  );

  const primaryItems = useMemo(
    () => visibleItems.filter((item) => item.primary && item.id !== 'settings'),
    [visibleItems],
  );

  const moreItems = useMemo(
    () => visibleItems.filter((item) => item.id !== 'logout' && (!item.primary || item.id === 'settings')),
    [visibleItems],
  );

  const mobileOverflowItems = useMemo(
    () => [...primaryItems.slice(visiblePrimaryCount), ...moreItems],
    [moreItems, primaryItems, visiblePrimaryCount],
  );

  const handleLogout = () => {
    setIsMoreOpen(false);
    logout();
    navigate('/login');
  };

  const closeMore = () => setIsMoreOpen(false);

  useLayoutEffect(() => {
    const nav = mobileNavRef.current;
    if (!nav) return undefined;

    const updateVisibleItems = () => {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setVisiblePrimaryCount(primaryItems.length);
        setIsMoreOpen(false);
        return;
      }
      if (!nav.clientWidth) return;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const fontSize = window.matchMedia('(min-width: 450px)').matches
        ? 12
        : window.matchMedia('(min-width: 400px)').matches ? 10 : 9;
      context.font = `600 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
      const buttonWidth = (label, iconWidth) => Math.max(
        44,
        Math.ceil(context.measureText(label).width + iconWidth + 12),
      );
      const availableWidth = nav.clientWidth - 8;
      let usedWidth = buttonWidth('Mais', 22);
      let count = 0;

      for (const item of primaryItems) {
        const requiredWidth = buttonWidth(item.label, 20) + 4;
        if (usedWidth + requiredWidth > availableWidth) break;
        usedWidth += requiredWidth;
        count += 1;
      }

      setVisiblePrimaryCount((current) => current === count ? current : count);
    };

    updateVisibleItems();
    const observer = new ResizeObserver(updateVisibleItems);
    observer.observe(nav);
    window.addEventListener('resize', updateVisibleItems);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateVisibleItems);
    };
  }, [primaryItems]);

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setIsMoreOpen(false);
      moreButtonRef.current?.focus();
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [isMoreOpen]);

  const desktopItemClass = (item) => `flex min-h-11 w-full items-center gap-3 border-l-4 px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
    isActivePath(location.pathname, item.path)
      ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] font-bold text-[var(--color-primary)]'
      : 'border-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]'
  }`;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-[var(--color-surface)] px-4 py-3 font-bold text-[var(--color-ink)] shadow-lg focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        Pular para o conteúdo
      </a>

      <aside
        className={`fixed left-0 top-0 z-[1200] hidden h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] transition-all duration-300 motion-reduce:transition-none md:flex ${
          isSidebarOpen ? 'w-60 px-3' : 'w-16 px-2'
        }`}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="desktop-primary-navigation"
          className={`mb-8 mt-5 flex h-10 items-center overflow-hidden text-left ${
            isSidebarOpen ? 'w-full justify-start px-1' : 'w-10 justify-center'
          } motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]`}
        >
          <span
            className={`block shrink-0 transition-transform duration-300 motion-reduce:transition-none ${
              isSidebarOpen ? '' : 'scale-90'
            }`}
          >
            <Brand compact />
          </span>

          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 motion-reduce:transition-none ${
              isSidebarOpen
                ? 'ml-2 max-w-[150px] opacity-100'
                : 'ml-0 max-w-0 opacity-0'
            }`}
          >
            <span className="text-xl font-extrabold tracking-tight">
              Urbaniza
              <span className="text-[var(--color-primary)]">+</span>
            </span>
          </span>
        </button>

        <nav
          id="desktop-primary-navigation"
          aria-label="Navegação principal"
          className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="space-y-0.5">
            {visibleItems.filter((item) => item.id !== 'logout').map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.path);

              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={`${desktopItemClass(item)} ${isSidebarOpen ? '' : 'justify-center px-0'}`}
                  >
                    <Icon aria-hidden="true" size={19} />
                    <span className={isSidebarOpen ? '' : 'sr-only'}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-4 space-y-2 border-t border-[var(--color-border-subtle)] pt-4">
          <Link
            to="/settings"
            aria-label={`Abrir perfil de ${user?.nameUser || 'Visitante'}`}
            className={`flex min-h-11 min-w-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              isSidebarOpen ? '' : 'justify-center'
            }`}
          >
            <Avatar user={user} className="h-9 w-9" />

            <span className={isSidebarOpen ? 'min-w-0' : 'sr-only'}>
              <strong className="block truncate text-xs">
                {user?.nameUser || 'Visitante'}
              </strong>
              <small className="block max-w-32 truncate text-[11px] text-[var(--color-muted)]">
                {user?.email || 'Acesse seu perfil'}
              </small>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className={`${desktopItemClass({ path: '__theme' })} ${
              isSidebarOpen ? '' : 'justify-center px-0'
            }`}
          >
            <span className="grid h-5 w-5 place-items-center">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span className={isSidebarOpen ? '' : 'sr-only'}>
              {darkMode ? 'Modo claro' : 'Modo escuro'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`${desktopItemClass({ path: '__logout' })} mb-4 ${
              isSidebarOpen ? '' : 'justify-center px-0'
            }`}
          >
            <LogOut size={19} />
            <span className={isSidebarOpen ? '' : 'sr-only'}>Sair</span>
          </button>
        </div>
      </aside>

      {!hideMobileNavigation && <nav ref={mobileNavRef} aria-label="Navegação mobile" className="fixed bottom-0 left-0 right-0 z-[1200] h-[var(--mobile-nav-height)] bg-[var(--color-nav-surface)] px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
        <ul className="flex h-full w-full items-stretch justify-around gap-1">
          {primaryItems.slice(0, visiblePrimaryCount).map((item) => {
            const Icon = item.icon;
            const active = isActivePath(location.pathname, item.path);
            return <li key={item.id} className="flex-none"><Link to={item.path} aria-current={active ? 'page' : undefined} onClick={closeMore} className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-1 text-[var(--color-muted)] focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${active ? 'font-bold text-[var(--color-primary)]' : 'hover:text-[var(--color-ink)]'}`}><Icon aria-hidden="true" size={20} /><span className="whitespace-nowrap text-[9px] font-semibold leading-none min-[400px]:text-[10px] min-[450px]:text-xs">{item.label}</span></Link></li>;
          })}
          <li className="flex-none"><button ref={moreButtonRef} id="mobile-more-button" type="button" aria-label="Mais opções" aria-expanded={isMoreOpen} aria-controls="mobile-more-panel" onClick={() => setIsMoreOpen((open) => !open)} className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 px-1 text-[var(--color-muted)] focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${isMoreOpen ? 'font-bold text-[var(--color-primary)]' : 'hover:text-[var(--color-ink)]'}`}><MoreHorizontal aria-hidden="true" size={22} /><span className="whitespace-nowrap text-[9px] font-semibold leading-none min-[400px]:text-[10px] min-[450px]:text-xs">Mais</span></button></li>
        </ul>
      </nav>}

      {!hideMobileNavigation && isMoreOpen && <>
        <button type="button" aria-label="Fechar menu Mais" tabIndex={-1} onClick={closeMore} className="fixed inset-0 z-[1501] cursor-default bg-[var(--color-ink)]/30 dark:bg-[var(--color-gray-600)]/30 md:hidden" />
        <div id="mobile-more-panel" role="region" aria-labelledby="mobile-more-button" className="fixed inset-x-3 bottom-[calc(var(--mobile-nav-height)+0.5rem)] z-[1502] max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] dark:bg-[var(--color-gray-900)] p-2 text-[var(--color-ink)] shadow-xl md:hidden">
          <ul className="space-y-1">
            {mobileOverflowItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.path);
              return <li key={item.id}><Link to={item.path} aria-current={active ? 'page' : undefined} onClick={closeMore} className={`${desktopItemClass(item)} rounded-lg border-l-0 ${active ? 'ring-1 ring-inset ring-[var(--color-primary)]' : ''}`}><Icon aria-hidden="true" size={18} /><span>{item.label}</span></Link></li>;
            })}
            <li><button type="button" aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'} onClick={() => setDarkMode((value) => !value)} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"><span className="grid h-5 w-5 place-items-center">{darkMode ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}</span>{darkMode ? 'Modo claro' : 'Modo escuro'}</button></li>
            <li><button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"><LogOut className='text-red-700' aria-hidden="true" size={18} /><span className='text-red-600'>Sair</span></button></li>
          </ul>
        </div>
      </>}
    </>
  );
}
