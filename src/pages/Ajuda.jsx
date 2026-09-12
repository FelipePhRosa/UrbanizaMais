import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, CircleHelp, FilePlus2, LockKeyhole, MessageCircle, Search, ShieldCheck, TriangleAlert, UserRound } from 'lucide-react';
import Layout from '../components/Layout';
import problemaImg from '../assets/buraco.jpeg';
import solucaoImg from '../assets/concertada.jpeg';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'comece', label: 'Comece aqui' },
  { id: 'relatos', label: 'Relatos' },
  { id: 'conta', label: 'Conta e segurança' },
];

const FAQS = [
  { id: 'create', category: 'comece', title: 'Como criar uma denúncia?', icon: FilePlus2, text: 'Abra “Reportar”, escolha a categoria, informe a cidade e o bairro, descreva o problema e confirme o endereço. Você também pode adicionar imagens para contextualizar o registro.', action: 'Criar denúncia', path: '/reportar' },
  { id: 'approval', category: 'relatos', title: 'O que acontece depois que eu envio?', icon: ShieldCheck, text: 'O relato entra em uma fila de análise. A equipe verifica se há informações suficientes, se o conteúdo é apropriado e se o registro pode ser publicado para acompanhamento da comunidade.', action: 'Ver relatos', path: '/Report' },
  { id: 'status', category: 'relatos', title: 'Como acompanho o andamento?', icon: TriangleAlert, text: 'Depois da publicação, você pode abrir o relato pelo histórico ou pela lista pública para acompanhar o status, as atualizações e as interações.', action: 'Abrir histórico', path: '/myreports' },
  { id: 'rejected', category: 'relatos', title: 'Por que um relato pode não ser aprovado?', icon: LockKeyhole, text: 'Um registro pode voltar para revisão quando faltam dados essenciais, há duplicidade, conteúdo ofensivo ou quando não é possível identificar um problema urbano concreto. A ideia é manter informações úteis e respeitosas.', action: 'Falar com a comunidade', path: '/chat' },
  { id: 'account', category: 'conta', title: 'Como atualizo meus dados?', icon: UserRound, text: 'Acesse Configurações para editar nome, usuário, e-mail, telefone e avatar. As alterações são salvas na sua conta Urbaniza+.', action: 'Abrir configurações', path: '/settings' },
  { id: 'security', category: 'conta', title: 'Como protejo minha conta?', icon: LockKeyhole, text: 'Mantenha seu e-mail verificado, não compartilhe sua senha e use a recuperação de senha quando precisar. O Urbaniza+ não solicita sua senha pelo chat.', action: 'Verificar e-mail', path: '/verifyEmail' },
  { id: 'chat', category: 'comece', title: 'Onde posso conversar com outros moradores?', icon: MessageCircle, text: 'O Chat da comunidade é um espaço para trocar informações sobre o bairro com respeito e foco em soluções.', action: 'Abrir chat', path: '/chat' },
];

const STEPS = [
  { number: '01', title: 'Registre o problema', text: 'Escolha a categoria, indique o local e conte o que aconteceu. Uma foto pode ajudar a equipe a entender a situação.', image: problemaImg, icon: FilePlus2 },
  { number: '02', title: 'A equipe analisa', text: 'O relato passa por uma fila de análise para conferir informações básicas, respeito às regras e utilidade pública.', image: null, icon: ShieldCheck },
  { number: '03', title: 'Acompanhe a resposta', text: 'Quando aprovado, o registro fica disponível para acompanhamento, atualizações e participação da comunidade.', image: solucaoImg, icon: CheckCircle2 },
];

function HowItWorks() {
  return (
    <section className="mb-8" aria-labelledby="how-it-works-title">
      <div className="mb-5 text-center"><p className="urban-eyebrow">Primeiros passos</p><h2 id="how-it-works-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-3xl">Como funciona</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)]">Da criação do relato ao acompanhamento da resposta, você sempre sabe o que acontece depois.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ number, title, text, image, icon: Icon }) => (
          <article key={number} className="urban-surface overflow-hidden">
            <div className="relative h-36 overflow-hidden bg-[var(--color-primary-tint)]">
              {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[var(--color-primary)]"><Icon size={42} strokeWidth={1.4} /></div>}
              <span className="absolute left-3 top-3 rounded-lg bg-[var(--color-ink)]/75 px-2 py-1 text-xs font-bold text-white">{number}</span>
            </div>
            <div className="p-4"><h3 className="text-base font-bold text-[var(--color-ink)]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{text}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ faq, open, onToggle, onNavigate }) {
  const Icon = faq.icon;
  return (
    <article className="urban-surface overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--color-primary-tint)]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]"><Icon size={17} /></span>
        <span className="min-w-0 flex-1"><strong className="block text-sm font-bold text-[var(--color-ink)]">{faq.title}</strong><span className="mt-0.5 block truncate text-xs text-[var(--color-muted)]">{faq.text}</span></span>
        <ChevronDown size={17} className={`shrink-0 text-[var(--color-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-[var(--color-border-subtle)] px-4 pb-4 pt-3 sm:pl-16"><p className="text-sm leading-6 text-[var(--color-muted)]">{faq.text}</p><button type="button" onClick={() => onNavigate(faq.path)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline">{faq.action}<ArrowRight size={14} /></button></div>}
    </article>
  );
}

export default function Ajuda() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState(null);

  const visibleFaqs = useMemo(() => FAQS.filter((faq) => {
    const matchesCategory = category === 'all' || faq.category === category;
    const matchesSearch = `${faq.title} ${faq.text}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, search]);

  return (
    <Layout>
      <main className="mx-auto max-w-[1180px] px-3 py-5 sm:px-5 md:px-8 md:py-7">
        <header className="mb-7"><p className="urban-eyebrow">Central de ajuda</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-3xl">Como podemos ajudar?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">Respostas rápidas para registrar problemas, acompanhar soluções e participar da cidade.</p><label className="urban-surface mt-4 flex h-11 max-w-xl items-center gap-2 px-3 text-[var(--color-muted)]"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar uma dúvida" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]" /></label></header>

        <HowItWorks />

        <section aria-labelledby="faq-title"><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="urban-eyebrow">Perguntas frequentes</p><h2 id="faq-title" className="mt-1 text-xl font-extrabold text-[var(--color-ink)]">Encontre uma resposta</h2></div><div className="flex gap-1 overflow-x-auto pb-1">{CATEGORIES.map((item) => <button type="button" key={item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${category === item.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]'}`}>{item.label}</button>)}</div></div><div className="grid gap-3 md:grid-cols-2">{visibleFaqs.map((faq) => <FaqItem key={faq.id} faq={faq} open={open === faq.id} onToggle={() => setOpen(open === faq.id ? null : faq.id)} onNavigate={navigate} />)}</div>{visibleFaqs.length === 0 && <div className="urban-surface py-12 text-center"><CircleHelp className="mx-auto text-[var(--color-muted)]" /><p className="mt-3 text-sm font-bold text-[var(--color-ink)]">Nenhuma resposta encontrada</p><p className="mt-1 text-xs text-[var(--color-muted)]">Tente buscar por outra palavra.</p></div>}</section>

        <section className="urban-surface mt-6 flex flex-col items-start justify-between gap-4 bg-[var(--color-ink)] p-5 text-white sm:flex-row sm:items-center sm:p-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10"><MessageCircle size={17} /></span><div><h2 className="text-sm font-bold">Ainda precisa de ajuda?</h2><p className="mt-1 text-xs leading-5 text-white/70">Converse com a comunidade no canal que já está disponível no Urbaniza+.</p></div></div><button type="button" onClick={() => navigate('/chat')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-primary-tint)]">Abrir chat <ArrowRight size={14} /></button></section>
      </main>
    </Layout>
  );
}
