import { useContext, useEffect, useState } from 'react';
import {
  Camera,
  CarFront,
  CircleDashed,
  CircleHelp,
  Droplet,
  Lightbulb,
  MapPin,
  Trash2,
  Upload,
  UserMinus,
  X,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { id: 2, icon: Droplet, label: 'Alagamento' },
  { id: 6, icon: CircleDashed, label: 'Buraco na via' },
  { id: 3, icon: UserMinus, label: 'Assalto' },
  { id: 7, icon: CarFront, label: 'Acidente de trânsito' },
  { id: 5, icon: Lightbulb, label: 'Iluminação' },
  { id: 8, icon: CircleHelp, label: 'Outro' },
];

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}

function inputClasses() {
  return 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15';
}

export default function ReportModal({ isOpen, onClose, lat, lng }) {
  const { token, user } = useContext(AuthContext);
  const userId = user?.userId;
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoProblema, setTipoProblema] = useState(null);
  const [endereco, setEndereco] = useState('');
  const [imagens, setImagens] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCities() {
      try {
        const response = await fetch(`${API}/allCities`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Erro ao buscar cidades');
        setCities(await response.json());
      } catch (error) {
        console.error(error);
      }
    }

    fetchCities();
  }, [isOpen, token]);

  useEffect(() => {
    if (!selectedCity) {
      setNeighborhoods([]);
      setSelectedNeighborhood('');
      return;
    }

    async function fetchNeighborhoods() {
      setLoadingNeighborhoods(true);
      setSelectedNeighborhood('');
      try {
        const response = await fetch(`${API}/neighborhood/${selectedCity}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Erro ao buscar bairros');
        const data = await response.json();
        setNeighborhoods(data.InfNeighborhoods ?? data);
      } catch (error) {
        console.error(error);
        setNeighborhoods([]);
      } finally {
        setLoadingNeighborhoods(false);
      }
    }

    fetchNeighborhoods();
  }, [selectedCity, token]);

  if (!isOpen || lat === null || lng === null) return null;

  function handleImagemChange(event) {
    const novasImagens = Array.from(event.target.files).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImagens((current) => [...current, ...novasImagens]);
  }

  function removerImagem(index) {
    setImagens((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('reportTitle', titulo);
    formData.append('city_id', selectedCity);
    formData.append('neighborhood_id', selectedNeighborhood);
    formData.append('description', descricao);
    formData.append('category_id', tipoProblema);
    formData.append('address', endereco);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    imagens.forEach((imagem) => formData.append('imagem', imagem.file));

    try {
      const response = await fetch(`${API}/report/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        console.error('Erro ao enviar:', await response.json());
        alert('Erro ao enviar a denúncia');
        return;
      }

      alert('Denúncia enviada com sucesso!');
      setTitulo('');
      setDescricao('');
      setTipoProblema(null);
      setEndereco('');
      setSelectedCity('');
      setSelectedNeighborhood('');
      imagens.forEach((imagem) => URL.revokeObjectURL(imagem.preview));
      setImagens([]);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Erro ao enviar a denúncia');
    }
  }

  const canSubmit = titulo && descricao && endereco && tipoProblema && selectedCity && selectedNeighborhood;

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center p-3 sm:p-6">
      <button type="button" className="absolute inset-0 cursor-default bg-[var(--color-ink)]/45 backdrop-blur-sm" onClick={onClose} aria-label="Fechar modal" />

      <form onSubmit={handleSubmit} className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] shadow-2xl sm:p-7">
        <header className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-5">
          <div>
            <p className="urban-eyebrow">Contribua com a cidade</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">Relatar problema</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">O ponto selecionado será enviado junto do relato.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]" aria-label="Fechar modal">
            <X size={19} />
          </button>
        </header>

        <div className="space-y-5">
          <Field label="Título da denúncia">
            <textarea value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Ex.: Acidente na rua Gonçalves Chaves" className={`${inputClasses()} min-h-20 resize-y`} required />
          </Field>

          <Field label="Descrição">
            <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Descreva o ocorrido em detalhes" className={`${inputClasses()} min-h-24 resize-y`} required />
          </Field>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]">Categoria</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map(({ id, icon: Icon, label }) => {
                const selected = tipoProblema === id;
                return (
                  <button type="button" key={id} onClick={() => setTipoProblema(id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'}`} aria-pressed={selected}>
                    <Icon size={17} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-muted)]"><Camera size={14} className="mr-1 inline" /> Imagens <span className="font-normal normal-case tracking-normal">(opcional)</span></p>
            <label htmlFor="report-images" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
              <Upload size={19} />
              <span>Adicionar fotos do problema</span>
              <input id="report-images" type="file" multiple accept="image/*" onChange={handleImagemChange} className="hidden" />
            </label>
            {imagens.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{imagens.map((imagem, index) => <div key={imagem.preview} className="group relative"><img src={imagem.preview} alt={`Preview ${index + 1}`} className="h-20 w-full rounded-lg border border-[var(--color-border)] object-cover" /><button type="button" onClick={() => removerImagem(index)} className="absolute right-1 top-1 rounded-md bg-[var(--color-danger)] p-1 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remover imagem"><Trash2 size={13} /></button></div>)}</div>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cidade"><select value={selectedCity} onChange={(event) => setSelectedCity(Number(event.target.value))} className={inputClasses()} required><option value="">Selecione a cidade</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></Field>
            <Field label="Bairro"><select value={selectedNeighborhood} onChange={(event) => setSelectedNeighborhood(Number(event.target.value))} disabled={!selectedCity || loadingNeighborhoods} className={`${inputClasses()} disabled:cursor-not-allowed disabled:opacity-50`} required><option value="">{loadingNeighborhoods ? 'Carregando...' : !selectedCity ? 'Selecione uma cidade primeiro' : neighborhoods.length === 0 ? 'Nenhum bairro encontrado' : 'Selecione o bairro'}</option>{neighborhoods.map((neighborhood) => <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>)}</select></Field>
          </div>

          <Field label="Endereço"><textarea value={endereco} onChange={(event) => setEndereco(event.target.value)} placeholder="Confirme o endereço da denúncia" className={`${inputClasses()} min-h-20 resize-y`} required /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude"><input value={lat} readOnly className={`${inputClasses()} cursor-not-allowed opacity-70`} /></Field>
            <Field label="Longitude"><input value={lng} readOnly className={`${inputClasses()} cursor-not-allowed opacity-70`} /></Field>
          </div>
        </div>

        <button type="submit" disabled={!canSubmit} className="mt-7 w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45">
          Enviar denúncia
        </button>
      </form>
    </div>
  );
}
