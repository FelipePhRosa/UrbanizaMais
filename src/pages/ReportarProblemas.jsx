import { useContext, useEffect, useState } from 'react';
import { CircleDashed, CircleHelp, Droplet, House, Lightbulb, MapPin, Send, UserMinus } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const FIELD = 'h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-tint)]';

const problemTypes = [
  { id: 2, icon: Droplet, label: 'Alagamento' },
  { id: 6, icon: CircleDashed, label: 'Buraco na via' },
  { id: 3, icon: UserMinus, label: 'Assalto/Roubo' },
  { id: 7, icon: House, label: 'Desabamento' },
  { id: 5, icon: Lightbulb, label: 'Iluminação' },
  { id: 8, icon: CircleHelp, label: 'Outro' }
];

export default function ReportarProblemas() {
  const { token, user } = useContext(AuthContext);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoProblema, setTipoProblema] = useState(null);
  const [endereco, setEndereco] = useState('');
  const [urlImagem, setUrlImagem] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/allCities`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then(setCities)
      .catch(console.error);
  }, [token]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setTipoProblema(null);
    setEndereco('');
    setUrlImagem('');
    setSelectedCity('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCity) {
      alert('Selecione a cidade do problema');
      return;
    }

    const novoRelato = {
      reportTitle: titulo,
      description: descricao,
      category_id: tipoProblema,
      address: endereco,
      city_id: selectedCity,
      latitude: 0,
      longitude: 0,
      image: urlImagem
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/report/${user?.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(novoRelato)
      });

      if (response.ok) {
        alert('Denúncia enviada com sucesso!');
        resetForm();
        return;
      }

      const error = await response.json();
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar a denúncia');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar a denúncia');
    }
  };

  return (
    <Layout>
      <main className="mx-auto w-full max-w-[900px] px-4 py-5 md:px-8">
        <header className="mb-5">
          <p className="urban-eyebrow">Participação cidadã</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-ink)]">Novo relato</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Registre um problema para encaminhar à cidade.</p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">Título <b className="text-[var(--color-danger)]">*</b></span><input value={titulo} onChange={(event) => setTitulo(event.target.value)} required placeholder="Ex.: Buraco na Rua Dom Pedro" className={FIELD} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">Cidade <b className="text-[var(--color-danger)]">*</b></span><select value={selectedCity} onChange={(event) => setSelectedCity(Number(event.target.value))} required className={FIELD}><option value="">Selecione a cidade</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">Endereço <b className="text-[var(--color-danger)]">*</b></span><span className="relative block"><MapPin size={15} className="absolute left-3 top-3 text-[var(--color-muted)]" /><input value={endereco} onChange={(event) => setEndereco(event.target.value)} required placeholder="Rua, número e bairro" className={`${FIELD} pl-9`} /></span></label>
            <label className="block md:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">Descrição <b className="text-[var(--color-danger)]">*</b></span><textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} required rows={4} placeholder="Descreva o que aconteceu e onde podemos encontrar o problema." className={`${FIELD} h-auto py-2.5`} /></label>
          </div>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs font-semibold text-[var(--color-ink)]">Tipo de problema <b className="text-[var(--color-danger)]">*</b></legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{problemTypes.map(({ id, icon: Icon, label }) => <button type="button" key={id} onClick={() => setTipoProblema(id)} className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-left text-xs font-medium transition ${tipoProblema === id ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-soft)]'}`}><Icon size={17} />{label}</button>)}</div>
          </fieldset>

          <label className="mt-5 block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-ink)]">URL da imagem <span className="font-normal text-[var(--color-muted)]">(opcional)</span></span><input type="url" value={urlImagem} onChange={(event) => setUrlImagem(event.target.value)} placeholder="https://exemplo.com/imagem.jpg" className={FIELD} /></label>
          <div className="mt-6 flex justify-end"><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:brightness-95"><Send size={15} /> Enviar relato</button></div>
        </form>
      </main>
    </Layout>
  );
}
