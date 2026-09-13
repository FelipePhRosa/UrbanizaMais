import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from './Brand';

export default function AuthShell({ eyebrow = 'Urbaniza+', title, description, backTo = '/login', backLabel = 'Voltar ao login', sideImage, children }) {
  return (
    <main className="grid min-h-screen bg-[var(--color-surface-muted)] lg:grid-cols-[minmax(360px,.9fr)_minmax(520px,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-[var(--color-ink)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        {sideImage && <img src={sideImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {sideImage && <div className="absolute inset-0 bg-black/35" />}
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
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:bg-white">
        <div className="w-full max-w-[520px]">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <Link to={backTo} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"><ArrowLeft size={16} /> {backLabel}</Link>
          <div className="mb-8"><p className="urban-eyebrow mb-3">{eyebrow}</p><h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-ink)]">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>}</div>
          {children}
        </div>
      </section>
    </main>
  );
}
