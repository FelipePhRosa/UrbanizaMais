import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Camera, Check, Clock, HelpCircle, Info, Moon, Palette, Pencil, Sun, User } from 'lucide-react';
import Layout from './Layout';
import History from './History';
import About from './About';
import useSettingsData from '../hooks/useSettingsData';

const TABS = [
  { id: 'account', label: 'Minha conta', icon: User },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'history', label: 'Histórico', icon: Clock },
  { id: 'help', label: 'Ajuda e suporte', icon: HelpCircle },
  { id: 'about', label: 'Sobre', icon: Info },
];

const FIELD = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15';

function Section({ title, description, children, className = '' }) {
  return (
    <section className={`urban-surface p-4 sm:p-6 ${className}`}>
      <div className="mb-5 border-b border-[var(--color-border-subtle)] pb-4">
        <h2 className="text-base font-extrabold text-[var(--color-ink)]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">{label}</span>{children}</label>;
}

function Avatar({ preview, user, avatarUrl, onChange }) {
  const source = preview || (user?.avatar_url?.startsWith('http') ? user.avatar_url : avatarUrl ? `${import.meta.env.VITE_API_URL}/uploads/${avatarUrl.replace(/^\/+/, '')}` : '/cityIcon.png');
  return (
    <div className="relative h-20 w-20 shrink-0">
      <img src={source} alt="Avatar" className="h-20 w-20 rounded-2xl border border-[var(--color-border)] object-cover" />
      <label className="absolute -bottom-2 -right-2 grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-2 border-[var(--color-surface)] bg-[var(--color-primary)] text-white shadow-sm" aria-label="Alterar avatar">
        <Camera size={14} />
        <input type="file" accept="image/*" onChange={onChange} className="hidden" />
      </label>
    </div>
  );
}

function AccountTab(data) {
  const { user, edit, setEdit, nome, setNome, username, setUsername, email, setEmail, telefone, setTelefone, avatarUrl, preview, handleFileChange, handleSave } = data;

  return (
    <div className="space-y-4">
      <Section title="Perfil" description="Atualize como seu perfil aparece na plataforma.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4"><Avatar preview={preview} user={user} avatarUrl={avatarUrl} onChange={handleFileChange} /><div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-[var(--color-ink)]">{nome || 'Seu nome'}</h2><p className="truncate text-sm text-[var(--color-muted)]">@{username || 'usuario'}</p><Link to="/verifyEmail" className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold ${user?.is_verified ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}><span className={`h-1.5 w-1.5 rounded-full ${user?.is_verified ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`} />{user?.is_verified ? 'E-mail verificado' : 'Verificar e-mail'}</Link></div></div>
          <button type="button" onClick={() => setEdit((value) => !value)} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]"><Pencil size={14} />{edit ? 'Cancelar' : 'Editar perfil'}</button>
        </div>
      </Section>

      <Section title="Informações pessoais" description="Seus dados básicos e de contato.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo">{edit ? <input value={nome} onChange={(event) => setNome(event.target.value)} className={FIELD} placeholder="Seu nome completo" /> : <p className={`${FIELD} min-h-11`}>{nome || 'Não informado'}</p>}</Field>
          <Field label="Nome de usuário">{edit ? <input value={username} onChange={(event) => setUsername(event.target.value)} className={FIELD} placeholder="@seuusuario" /> : <p className={`${FIELD} min-h-11`}>@{username || 'usuario'}</p>}</Field>
          <Field label="E-mail">{edit ? <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={FIELD} placeholder="seu@email.com" /> : <p className={`${FIELD} min-h-11 truncate`}>{email || 'Não informado'}</p>}</Field>
          <Field label="Telefone">{edit ? <input type="tel" value={telefone} onChange={(event) => setTelefone(event.target.value)} className={FIELD} placeholder="(00) 00000-0000" /> : <p className={`${FIELD} min-h-11`}>{telefone || 'Não informado'}</p>}</Field>
          <Field label="Senha"><div className={`${FIELD} flex min-h-11 items-center justify-between gap-3`}><span>••••••••••</span><Link to="/redefinirsenha" className="shrink-0 font-bold text-[var(--color-primary)] hover:underline">Alterar</Link></div></Field>
          <Field label="Data de nascimento"><p className={`${FIELD} min-h-11`}>21/11/2003</p></Field>
        </div>
        {edit && <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setEdit(false)} className="min-h-10 rounded-xl border border-[var(--color-border)] px-4 text-sm font-bold text-[var(--color-muted)]">Cancelar</button><button type="button" onClick={handleSave} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white hover:brightness-95"><Check size={16} /> Salvar alterações</button></div>}
      </Section>
    </div>
  );
}

function NotificationsTab({ notifications, toggleNotification }) {
  const labels = { email: 'E-mail', push: 'Push', sms: 'SMS' };
  return <Section title="Preferências de notificação" description="Escolha como deseja receber atualizações da plataforma."><div className="divide-y divide-[var(--color-border-subtle)]">{Object.entries(notifications).map(([key, enabled]) => <div key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><h3 className="text-sm font-bold text-[var(--color-ink)]">Notificações por {labels[key] || key}</h3><p className="mt-1 text-xs text-[var(--color-muted)]">Receber avisos por {labels[key]?.toLowerCase() || key}.</p></div><button type="button" onClick={() => toggleNotification(key)} aria-pressed={enabled} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} /></button></div>)}</div></Section>;
}

function AppearanceTab({ darkMode, setDarkMode }) {
  return <Section title="Aparência" description="Ajuste o tema para o seu ambiente de uso."><div className="space-y-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]">Tema</p><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setDarkMode(false)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-bold ${!darkMode ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'}`}><Sun size={17} /> Claro</button><button type="button" onClick={() => setDarkMode(true)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-bold ${darkMode ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-muted)]'}`}><Moon size={17} /> Escuro</button></div></div><Field label="Tamanho da fonte"><select className={FIELD} defaultValue="medium"><option value="small">Pequeno</option><option value="medium">Médio</option><option value="large">Grande</option></select></Field></div></Section>;
}

export default function SettingsInterface() {
  const settings = useSettingsData();
  const [activeTab, setActiveTab] = useState('account');

  function renderTab() {
    if (activeTab === 'account') return <AccountTab {...settings} />;
    if (activeTab === 'notifications') return <NotificationsTab notifications={settings.notifications} toggleNotification={settings.toggleNotification} />;
    if (activeTab === 'appearance') return <AppearanceTab darkMode={settings.darkMode} setDarkMode={settings.setDarkMode} />;
    if (activeTab === 'history') return <div className="urban-surface overflow-hidden"><History /></div>;
    if (activeTab === 'about') return <About />;
    return <Section title="Ajuda e suporte" description="Encontre respostas e entre em contato com a comunidade."><Link to="/help" className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white">Abrir central de ajuda</Link></Section>;
  }

  return (
    <Layout>
      <main className="urban-settings min-h-[calc(100dvh-72px)] bg-[var(--color-surface-muted)] px-3 py-4 sm:px-5 md:px-8 md:py-6">
        <div className="mx-auto max-w-[1120px]">
          <header className="mb-5"><p className="urban-eyebrow">Preferências</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">Configurações</h1><p className="mt-1 text-sm text-[var(--color-muted)]">Conta, notificações e aparência do Urbaniza+.</p></header>
          <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px" aria-label="Seções de configurações">{TABS.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${activeTab === id ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}><Icon size={15} />{label}</button>)}</nav>
          {renderTab()}
        </div>
      </main>
    </Layout>
  );
}
