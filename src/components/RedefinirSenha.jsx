import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import AuthShell from './AuthShell';

export default function RedefinirSenha() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setMessage(data.message || 'Erro ao enviar código.'); return; }
      setIsError(false); setMessage(data.message || 'Código enviado com sucesso!'); setStep(2);
    } catch (error) { setIsError(true); setMessage('Erro inesperado. Tente novamente.'); } finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setMessage(data.message || 'Código inválido.'); return; }
      setIsError(false); setMessage(data.message || 'Código verificado com sucesso!'); setStep(3);
    } catch (error) { setIsError(true); setMessage('Erro inesperado. Tente novamente.'); } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resetpass`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, newPassword }) });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setMessage(data.message || 'Erro ao redefinir senha.'); return; }
      setIsError(false); setMessage(data.message || 'Senha redefinida com sucesso!');
      setTimeout(() => { navigate('/settings'); }, 1000);
    } catch (error) { setIsError(true); setMessage('Erro inesperado. Tente novamente.'); } finally { setLoading(false); }
  };

  const titles = { 1: ['Recuperar senha', 'Digite seu e-mail para receber o código de verificação'], 2: ['Verificar código', 'Digite o código que enviamos para seu e-mail'], 3: ['Nova senha', 'Escolha uma senha forte para sua conta'] };
  const [title, description] = titles[step];

  return <AuthShell eyebrow={`Recuperação · Etapa ${step} de 3`} title={title} description={description}>
    <div className="mb-6 flex items-center gap-2" aria-label={`Etapa ${step} de 3`}>{[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />)}</div>
    {message && <div role={isError ? 'alert' : 'status'} className={`mb-5 rounded-xl border px-3 py-3 text-sm font-medium ${isError ? 'border-[#f2caca] bg-[#fff6f6] text-[#b23d3d]' : 'border-[#bfe5d2] bg-[#effaf4] text-[#16734f]'}`}>{message}</div>}
    {step === 1 && <div className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">E-mail da conta</span><span className="relative block"><Mail size={17} className="absolute left-3 top-3.5 text-[var(--color-muted)]" /><input type="email" placeholder="voce@exemplo.com" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" value={email} onChange={(e) => setEmail(e.target.value)} required /></span></label><button onClick={handleSendEmail} disabled={loading} className="h-12 w-full rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar código'}</button></div>}
    {step === 2 && <div className="space-y-5"><div className="flex items-center gap-3 rounded-xl bg-[var(--color-primary-tint)] p-4 text-sm text-[var(--color-ink)]"><ShieldCheck size={18} className="shrink-0 text-[var(--color-primary)]" /><span>Código enviado para <strong>{email}</strong></span></div><label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">Código de verificação</span><input type="text" inputMode="numeric" placeholder="000000" className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 text-center text-2xl tracking-[.35em] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required /></label><button onClick={handleVerifyCode} disabled={loading} className="h-12 w-full rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Verificando...' : 'Verificar código'}</button><button type="button" onClick={handleSendEmail} disabled={loading} className="w-full text-sm font-bold text-[var(--color-primary)] hover:underline">Reenviar código</button></div>}
    {step === 3 && <div className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-[var(--color-ink)]">Nova senha</span><span className="relative block"><KeyRound size={17} className="absolute left-3 top-3.5 text-[var(--color-muted)]" /><input type="password" placeholder="Digite a nova senha" className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-tint)]" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></span></label><button onClick={handleResetPassword} disabled={loading} className="h-12 w-full rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Redefinindo...' : 'Redefinir senha'}</button></div>}
  </AuthShell>;
}
