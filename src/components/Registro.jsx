import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import loginImage from '../assets/login.jpg';

const fieldClass = 'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--color-primary-tint)] disabled:cursor-not-allowed disabled:opacity-60';

export default function Registro() {
  const [step, setStep] = useState(1);
  const [nameUser, setNameUser] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityId, setCityId] = useState('');
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCities() {
      try { const res = await fetch(`${import.meta.env.VITE_API_URL}/allCities`); if (!res.ok) throw new Error('Erro ao buscar cidades'); setCities(await res.json()); }
      catch (err) { setError(err.message); }
    }
    fetchCities();
  }, []);

  useEffect(() => {
    if (!cityId) { setNeighborhoods([]); setNeighborhoodId(''); return; }
    async function fetchNeighborhoods() {
      try { const res = await fetch(`${import.meta.env.VITE_API_URL}/neighborhood/${cityId}`); if (!res.ok) throw new Error('Erro ao buscar bairros'); const data = await res.json(); setNeighborhoods(data.InfNeighborhoods); }
      catch (err) { setError(err.message); }
    }
    fetchNeighborhoods();
  }, [cityId]);

  function handleNextStep(e) {
    e.preventDefault();
    if (!nameUser || !fullName || !email) { setError('Por favor, preencha todos os campos obrigatórios'); return; }
    setError(null); setStep(2);
  }

  async function handleRegistro(e) {
    e.preventDefault();
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nameUser, fullName, email, telefone, birth_date: birthDate, city_id: cityId, neighborhood_id: neighborhoodId, password }) });
      if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message || 'Erro ao registrar'); }
      const data = await res.json();
      console.log('Registro response:', data);
      setError(null); navigate('/login');
    } catch (err) { setError(err.message); }
  }

  const labelClass = 'mb-1.5 block text-xs font-bold text-[var(--color-ink)]';
  return <AuthShell eyebrow={`Cadastro · Etapa ${step} de 2`} title="Criar conta" description={step === 1 ? 'Comece com seus dados básicos para participar da cidade.' : 'Complete seu cadastro para registrar e acompanhar relatos.'} sideImage={loginImage}>
    <div className="mb-7 flex gap-2" aria-label={`Etapa ${step} de 2`}>
      <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
        <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />

        </div>
    {error && <p role="alert" className="mb-5 rounded-xl border border-[#f2caca] bg-[#fff6f6] px-3 py-2 text-sm font-medium text-[#b23d3d]">{error}</p>}
    {step === 1 && 
    <form onSubmit={handleNextStep} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Nome de usuário</span>
        <input type="text" placeholder="Seu apelido" className={fieldClass} value={nameUser} onChange={(e) => setNameUser(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Nome completo</span>
          <input type="text" placeholder="Seu nome completo" className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>E-mail</span>
          <input type="email" placeholder="voce@exemplo.com" className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Telefone <span className="font-normal text-[var(--color-muted)]">(opcional)</span></span>
          <input type="text" placeholder="(00) 00000-0000" className={fieldClass} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </label>
      </div>
      <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] font-bold text-white transition hover:brightness-95">Prosseguir <ArrowRight size={17} /></button>
    </form>}
    {step === 2 && 
    <form onSubmit={handleRegistro} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Data de nascimento</span>
          <input type="date" className={fieldClass} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Cidade</span>
          <select className={fieldClass} value={cityId} onChange={(e) => setCityId(e.target.value)} required>
            <option value="">Selecione</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span className={labelClass}>Bairro</span>
        <select className={fieldClass} value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} required disabled={!cityId}>
          <option value="">Selecione seu bairro</option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood.id} value={neighborhood.id}>
              {neighborhood.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2 pt-2">
      <label>
        <span className={labelClass}>Senha</span>
        <input type="password" placeholder="Crie uma senha forte" className={fieldClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      <label>
        <span className={labelClass}>Confirmar senha</span>
        <input type="password" placeholder="Confirme sua senha" className={fieldClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
      </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep(1)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white text-sm font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)]">
          <ArrowLeft size={17} /> Voltar
        </button>
        <button type="submit" className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white transition hover:brightness-95">
          Finalizar
        </button>
      </div>
    </form>}
    <p className="mt-7 text-center text-sm text-[var(--color-muted)]">Já tem uma conta? <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline">Faça login</Link></p>
  </AuthShell>;
}
