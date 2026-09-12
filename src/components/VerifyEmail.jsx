import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AuthShell from './AuthShell';

export default function VerifyEmail() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [code, setCode] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState(null);

  async function handleVerificar(e) {
    e.preventDefault();
    if (!email || !code) { setError('Preencha todos os campos.'); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao verificar e-mail.');
      setMensagem('E-mail verificado com sucesso!');
      setUser((prev) => ({ ...prev, is_verified: 1 }));
      setError(null);
      navigate('/settings');
    } catch (err) { setError(err.message || String(err)); }
  }

  async function handleSendCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) { setError('Informe seu e-mail para reenviar o código.'); return; }
    try {
      setError(null); setMensagem('Enviando código...');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao reenviar código.');
      setMensagem(data.message || 'Código reenviado com sucesso.'); setError(null);
    } catch (err) { setError(err.message || String(err)); setMensagem(''); }
  }

  return <AuthShell eyebrow="Verificação de segurança" title="Verificar e-mail" description="Confirme o código enviado para concluir a autenticação da sua conta.">
    <form onSubmit={handleVerificar} className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-[var(--color-primary-tint)] p-4 text-sm leading-5 text-[var(--color-ink)]"><MailCheck size={20} className="shrink-0 text-[var(--color-primary)]" /><span>Um código de verificação foi enviado para o seu e-mail.</span></div>
      <label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">E-mail</span><input type="email" placeholder="seu@email.com" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">Código de verificação</span><input type="text" inputMode="numeric" placeholder="000000" className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-center text-2xl tracking-[.35em] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" value={code} onChange={(e) => setCode(e.target.value)} required /></label>
      {error && <p role="alert" className="rounded-xl border border-[#f2caca] bg-[#fff6f6] px-3 py-2 text-sm font-medium text-[#b23d3d]">{error}</p>}
      {mensagem && <p role="status" className="flex items-center gap-2 rounded-xl border border-[#bfe5d2] bg-[#effaf4] px-3 py-2 text-sm font-medium text-[#16734f]"><ShieldCheck size={16} />{mensagem}</p>}
      <button type="submit" className="h-12 w-full rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95">Verificar e-mail</button>
      <button type="button" onClick={handleSendCode} className="w-full text-sm font-bold text-[var(--color-primary)] hover:underline">Reenviar código</button>
    </form>
  </AuthShell>;
}
