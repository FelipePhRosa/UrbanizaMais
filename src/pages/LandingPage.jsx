import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Check, ChevronDown, ClipboardList, FileText,
  LayoutDashboard, MapPin, MessageCircle, MousePointer2,
  ShieldCheck, Sparkles, TrendingUp, Users, X,
} from 'lucide-react';
import './LandingPage.css';

const People = Users;

const stats = [
  { value: '+307', label: 'chamados abertos', city: 'Pelotas', Icon: ClipboardList },
  { value: '+423', label: 'usuários online', city: 'Camaquã', Icon: Users },
  { value: '+3', label: 'obras em andamento', city: 'São Lourenço do Sul', Icon: BarChart3 },
];

const features = [
  { Icon: FileText, title: 'Registre ocorrências', text: 'Envie um relato com foto e localização em poucos passos.' },
  { Icon: MapPin, title: 'Mapa interativo', text: 'Veja o que acontece perto de você e encontre padrões no território.' },
  { Icon: TrendingUp, title: 'Acompanhamento transparente', text: 'Saiba em que etapa está cada solicitação, sem ficar no escuro.' },
  { Icon: MessageCircle, title: 'Converse com a comunidade', text: 'Troque informações e fortaleça o cuidado coletivo.' },
  { Icon: LayoutDashboard, title: 'Gestão mais inteligente', text: 'Prefeituras organizam prioridades com dados que ajudam a decidir.' },
];

const faqs = [
  ['É gratuito para o cidadão?', 'Sim. O cidadão pode criar uma conta, registrar ocorrências e acompanhar solicitações sem custo.'],
  ['Como minha prefeitura adota o Urbaniza+?', 'Nossa equipe conversa com o município para entender o fluxo atual, configurar a plataforma e apoiar a implantação.'],
  ['Meus dados ficam protegidos?', 'A plataforma foi pensada com privacidade e transparência em mente. Você controla seus dados e pode consultar nossas políticas.'],
  ['Preciso baixar um aplicativo?', 'Não. O Urbaniza+ funciona no navegador do celular, tablet ou computador.'],
  ['Posso acompanhar uma ocorrência de outra pessoa?', 'As informações públicas aparecem no mapa e os detalhes pessoais permanecem protegidos.'],
];

function ProductMockup() {
  return <div className="landing-mockup" aria-label="Prévia do painel Urbaniza+">
    <div className="mockup-topbar"><div className="mockup-dots"><i /><i /><i /></div><span>urbaniza.plus / painel</span><span className="mockup-status"><span /> ao vivo</span></div>
    <div className="mockup-body">
      <aside className="mockup-sidebar"><div className="mockup-brand"><img src="/AppLogo2.png" alt="" /><b>Urbaniza<span>+</span></b></div><div className="mockup-nav-item active"><LayoutDashboard size={13} /> Visão geral</div><div className="mockup-nav-item"><MapPin size={13} /> Mapa da cidade</div><div className="mockup-nav-item"><ClipboardList size={13} /> Meus relatos</div><div className="mockup-nav-item"><MessageCircle size={13} /> Comunidade</div></aside>
      <div className="mockup-content"><div className="mockup-heading"><div><small>VISÃO DA CIDADE</small><h3>Olá, vizinhança.</h3></div><button><PlusIcon /> Novo relato</button></div><div className="mockup-metrics"><div><small>Relatos totais</small><strong>1.248</strong><em>+18% este mês</em></div><div><small>Em andamento</small><strong>324</strong><em>Atualizado agora</em></div><div><small>Resolvidos</small><strong>924</strong><em>+12% este mês</em></div></div><div className="mockup-map"><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" /><span className="mock-pin pin-a"><MapPin size={16} /></span><span className="mock-pin pin-b"><MapPin size={13} /></span><span className="mock-pin pin-c"><MapPin size={14} /></span><div className="map-label"><b>Relatos na região</b><span>24 atualizados hoje</span></div></div></div>
    </div>
  </div>;
}

function PlusIcon() { return <Sparkles size={13} />; }

function CityMap() {
  return <div className="concept-map-wrap"><div className="map-glow" /><div className="concept-map" aria-hidden="true"><div className="map-grid" /><div className="map-block block-a" /><div className="map-block block-b" /><div className="map-block block-c" /><div className="map-block block-d" /><div className="map-river" /><MapPin className="concept-pin concept-pin-1" /><MapPin className="concept-pin concept-pin-2" /><MapPin className="concept-pin concept-pin-3" /><MapPin className="concept-pin concept-pin-4" /><div className="map-compass"><span>N</span><span className="compass-arrow">↗</span></div></div><div className="map-caption"><span className="live-dot" /> mapa vivo da cidade <b>+12 bairros</b></div></div>;
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.12 });
    document.querySelectorAll('.landing-reveal').forEach((element) => reveal.observe(element));
    return () => reveal.disconnect();
  }, []);

  return <div className="landing-page">
    <header className="landing-header"><div className="landing-container header-inner"><Link className="landing-logo" to="/"><img src="/AppLogo2.png" alt="" /><span>Urbaniza<b>+</b></span></Link><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <MousePointer2 />}</button><nav className={menuOpen ? 'is-open' : ''}><a href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</a><a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a><a href="#prefeituras" onClick={() => setMenuOpen(false)}>Para prefeituras</a><Link className="header-login" to="/login">Entrar <ArrowRight size={15} /></Link></nav></div></header>

    <main>
      <section className="landing-hero"><div className="landing-container hero-grid"><div className="hero-copy landing-reveal"><div className="eyebrow"><span className="eyebrow-dot" /> tecnologia a serviço da cidade</div><h1>Cidade melhor,<br /><span>juntos.</span></h1><p>Uma plataforma simples para registrar, acompanhar e resolver o que importa no seu bairro — com cidadãos e prefeituras no mesmo caminho.</p><div className="hero-actions"><Link className="pill-button primary" to="/registro">Começar agora <ArrowRight size={17} /></Link><a className="text-link" href="#como-funciona">Ver como funciona <span>↗</span></a></div><div className="hero-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><div><b>Feito para quem vive a cidade</b><small>Participação que vira transformação.</small></div></div></div><div className="hero-visual landing-reveal"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><ProductMockup /><span className="float-note note-one"><ShieldCheck size={14} /> mais transparência</span><span className="float-note note-two"><MapPin size={14} /> perto de você</span></div></div><div className="hero-scroll"><span /> role para explorar</div></section>

      <section className="stats-section landing-container landing-reveal" aria-label="Cidades em destaque"><div className="section-kicker"><span>01</span> cidades em destaque <i /></div><div className="stats-grid">{stats.map(({ value, label, city, Icon }) => <div className="stat-card" key={city}><div className="stat-icon"><Icon size={20} /></div><strong>{value}</strong><span>{label}</span><small>{city} <ArrowRight size={13} /></small></div>)}</div><p className="data-note">* Dados ilustrativos para apresentar a experiência. Em breve, conectados aos indicadores reais da sua cidade.</p></section>

      <section className="concept-section"><div className="landing-container concept-grid"><div className="concept-visual landing-reveal"><CityMap /></div><div className="concept-copy landing-reveal"><div className="section-kicker"><span>02</span> o conceito <i /></div><h2>O cuidado com a cidade começa <em>perto da gente.</em></h2><p>O Urbaniza+ nasceu para aproximar quem vive a cidade de quem cuida dela. Cada registro organiza uma necessidade, cada acompanhamento constrói confiança e cada conversa abre espaço para uma cidade mais participativa.</p><div className="concept-signature"><div className="signature-icon"><People size={22} /></div><div><b>Uma cidade, muitas vozes</b><span>Quando todo mundo participa, a mudança encontra caminho.</span></div></div></div></div></section>

      <section id="recursos" className="resources-section landing-container"><div className="section-heading landing-reveal"><div><div className="section-kicker"><span>03</span> tudo em um só lugar <i /></div><h2>Ferramentas para a cidade<br /><em>funcionar melhor.</em></h2></div><p>Do primeiro relato ao resultado final, o Urbaniza+ deixa cada etapa mais clara para todos.</p></div><div className="features-grid">{features.map(({ Icon, title, text }, index) => <article className={`feature-card landing-reveal feature-${index + 1}`} key={title}><div className="feature-icon"><Icon size={21} /></div><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="feature-arrow" size={17} /></article>)}</div></section>

      <section id="como-funciona" className="steps-section"><div className="landing-container"><div className="section-heading centered landing-reveal"><div><div className="section-kicker"><span>04</span> como funciona <i /></div><h2>Do relato à resolução,<br /><em>sem perder o fio.</em></h2></div><p>Um fluxo direto para você acompanhar o que acontece depois do clique.</p></div><div className="steps-grid">{[['01', 'Registrar', 'Conte o que aconteceu, adicione uma foto e marque o ponto no mapa.'], ['02', 'Analisar e resolver', 'A prefeitura recebe, organiza as prioridades e encaminha a solução.'], ['03', 'Acompanhar', 'Você acompanha cada atualização em tempo real, com transparência.']].map(([number, title, text], i) => <div className="step-card landing-reveal" key={number}><span className="step-number">{number}</span><div className={`step-illustration step-illustration-${i + 1}`}><span className="step-circle" />{i === 0 ? <MapPin /> : i === 1 ? <ShieldCheck /> : <TrendingUp />}</div><h3>{title}</h3><p>{text}</p>{i < 2 && <div className="step-connector"><ArrowRight size={18} /></div>}</div>)}</div></div></section>

      <section id="prefeituras" className="city-section"><div className="landing-container city-panel"><div className="city-copy landing-reveal"><div className="section-kicker light"><span>05</span> para prefeituras <i /></div><h2>Mais clareza para decidir.<br /><em>Mais cidade para cuidar.</em></h2><p>Transforme relatos espalhados em dados organizados, prioridades visíveis e respostas que chegam para quem precisa.</p><ul><li><Check size={16} /> Transparência do início ao fim</li><li><Check size={16} /> Indicadores para uma gestão eficiente</li><li><Check size={16} /> Comunicação próxima com a comunidade</li></ul><a className="pill-button light-button" href="mailto:contato@urbaniza.plus">Fale com nossa equipe <ArrowRight size={17} /></a></div><div className="city-dashboard landing-reveal"><div className="dashboard-header"><span><span className="live-dot" /> painel da gestão</span><span>atualizado agora</span></div><div className="dashboard-chart"><div className="chart-label"><b>Solicitações resolvidas</b><strong>86%</strong></div><div className="chart-bars"><i style={{ height: '34%' }} /><i style={{ height: '48%' }} /><i style={{ height: '42%' }} /><i style={{ height: '64%' }} /><i style={{ height: '58%' }} /><i style={{ height: '78%' }} /><i style={{ height: '92%' }} /></div><div className="chart-axis"><span>jan</span><span>fev</span><span>mar</span><span>abr</span><span>mai</span><span>jun</span><span>jul</span></div></div><div className="dashboard-footer"><span><b>24</b> bairros ativos</span><span><b>2,4d</b> tempo médio</span></div></div></div></section>

      <section className="faq-section landing-container"><div className="faq-intro landing-reveal"><div className="section-kicker"><span>06</span> perguntas frequentes <i /></div><h2>Ficou alguma<br /><em>dúvida?</em></h2><p>A gente acredita que transparência também começa por explicar bem.</p><Link className="text-link" to="/login">Fale com a gente <span>↗</span></Link></div><div className="faq-list landing-reveal">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><span>{question}</span><ChevronDown size={18} /></button><div className="faq-answer"><p>{answer}</p></div></div>)}</div></section>
    </main>

    <footer className="landing-footer"><div className="landing-container"><div className="footer-top"><div className="footer-brand"><Link className="landing-logo" to="/"><img src="/AppLogo2.png" alt="" /><span>Urbaniza<b>+</b></span></Link><p>Cidade melhor, juntos.</p></div><div className="footer-column"><b>Produto</b><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#prefeituras">Para prefeituras</a></div><div className="footer-column"><b>Para prefeituras</b><a href="mailto:contato@urbaniza.plus">Fale com a equipe</a><a href="#prefeituras">Gestão pública</a><a href="#prefeituras">Indicadores</a></div><div className="footer-column"><b>Suporte</b><Link to="/login">Entrar</Link><Link to="/registro">Criar conta</Link><a href="mailto:oi@urbaniza.plus">Contato</a></div><div className="footer-column"><b>Redes</b><a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:oi@urbaniza.plus">E-mail</a></div></div><div className="footer-bottom"><span>© 2026 Urbaniza+. Todos os direitos reservados.</span><span>Feito para cuidar do que é nosso <Sparkles size={14} /></span></div></div></footer>
  </div>;
}
