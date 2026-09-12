import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { ArrowRight, Chrome, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import Brand from './Brand';

function GoogleLoginAction() {
  const googleLogin = useGoogleLogin({ flow: 'auth-code', ux_mode: 'redirect', onSuccess: () => toast.success('Login bem sucedido!'), redirect_uri: `${import.meta.env.VITE_API_URL}/auth/google/callback`, onError: console.error });
  return <button type="button" onClick={() => googleLogin()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]"><Chrome size={18} className="text-[var(--color-primary)]" /> Continuar com Google</button>;
}

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const googleEnabled = __GOOGLE_LOGIN_ENABLED__;

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
      if (!res.ok) throw new Error('Login inválido');
      const data = await res.json();
      login(data.token, { userId: data.userId, nameUser: data.name, fullName: data.fullName, birth_date: data.birth_date, email: data.email, telefone: data.telefone, role: data.role, avatar_url: data.avatar_url, is_verified: data.is_verified, requiresOTP: data.requiresOTP });
      navigate(data.requiresOTP === 'true' || data.requiresOTP === true ? '/verifyEmail' : '/');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--color-surface-muted)] lg:grid-cols-[minmax(360px,.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[#142f52] p-10 text-white dark:bg-[#0b1220] lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[var(--color-primary)]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#8b5cf6]/20 blur-3xl" />
        <div className="relative"><Brand light /></div>
        <div className="relative max-w-md">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.18em] text-[#cfc0ff]">Tecnologia a serviço da cidade</p>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight">Uma cidade melhor começa com a sua participação.</h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-white/70">Registre problemas, acompanhe soluções e ajude a transformar o lugar onde você vive.</p>
        </div>
        <p className="relative text-sm text-white/45">Urbaniza+ · Cidade melhor, juntos.</p>
      </section>

      <section className="flex items-center justify-center bg-[var(--color-surface)] px-5 py-10 sm:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <div className="mb-8">
            <p className="urban-eyebrow mb-3">Acesso seguro</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">Entre na sua conta</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Bem-vindo de volta ao Urbaniza+.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">E-mail ou nome de usuário</span><span className="relative block"><Mail size={17} className="absolute left-3 top-3.5 text-[var(--color-muted)]" /><input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="voce@exemplo.com" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-10 pr-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">Senha</span><span className="relative block"><LockKeyhole size={17} className="absolute left-3 top-3.5 text-[var(--color-muted)]" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Digite sua senha" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-10 pr-4 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" /></span></label>
            <div className="-mt-2 flex justify-end"><Link to="/redefinirsenha" className="text-sm font-bold text-[var(--color-primary)] hover:underline">Esqueci minha senha</Link></div>
            {error && <p role="alert" className="rounded-xl bg-[#fff1f1] px-3 py-2 text-sm font-medium text-[#c44747]">{error}</p>}
            <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-tint)]">Entrar <ArrowRight size={17} /></button>
          </form>

          {googleEnabled && <><div className="my-6 flex items-center gap-3 text-xs text-[var(--color-muted)]"><span className="h-px flex-1 bg-[var(--color-border)]" /><span>ou continue com</span><span className="h-px flex-1 bg-[var(--color-border)]" /></div><GoogleLoginAction /></>}

          <div className="mt-7 flex items-center justify-between gap-4 text-sm"><span className="text-[var(--color-muted)]">Ainda não tem conta?</span><Link to="/registro" className="font-bold text-[var(--color-primary)] hover:underline">Criar conta</Link></div>
          <div className="mt-10 flex items-center gap-2 text-xs text-[var(--color-muted)]"><ShieldCheck size={16} className="text-[#14956b]" /> Seus dados são protegidos.</div>
        </div>
      </section>
    </main>
  );
}
