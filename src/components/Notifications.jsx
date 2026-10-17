import { useEffect, useRef, useState } from 'react';
import { Check, Mail, MessageCircle, RefreshCw, Shield, Smartphone, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const TINTS = {
  violet: 'bg-violet-100 text-violet-600 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30',
  sky: 'bg-sky-100 text-sky-600 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30',
  amber: 'bg-amber-100 text-amber-600 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  emerald: 'bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  pink: 'bg-pink-100 text-pink-600 ring-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:ring-pink-500/30',
};

const CHANNELS = [
  { key: 'email', icon: Mail, tint: 'violet', title: 'Alertas por E-mail', desc: 'Resumos diários e avisos importantes no seu e-mail cadastrado.' },
  { key: 'mobile', icon: Smartphone, tint: 'sky', title: 'Notificações no Celular', desc: 'Push em tempo real no aplicativo iOS e Android.' },
];

const ACTIVITY = [
  { key: 'community', icon: MessageCircle, tint: 'amber', title: 'Mensagens da Comunidade', desc: 'Respostas e menções em tópicos que você participa.' },
  { key: 'security', icon: Shield, tint: 'emerald', title: 'Alertas de Segurança', desc: 'Novos acessos, alterações de senha e avisos críticos da conta.' },
  { key: 'updates', icon: RefreshCw, tint: 'pink', title: 'Alertas de Atualizações', desc: 'Novidades e melhorias lançadas na plataforma Urbaniza+.' },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''
          }`}
      />
    </button>
  );
}

function Card({ title, children }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gray-600/15 border border-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors duration-700">
      <h2 className="border-b border-slate-300 bg-slate-300/50 dark:bg-slate-800/40 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:border-slate-800 transition-colors duration-700">
        {title}
      </h2>
      <div className="divide-y divide-slate-300 dark:divide-slate-800 transition-colors duration-700">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, tint, title, desc, children }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 p-4 transition-colors duration-700 hover:bg-slate-50 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:gap-4 sm:p-5 dark:hover:bg-slate-800/40">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${TINTS[tint]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 text-[10px] sm:text-sm">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="mt-0.5 leading-snug text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

export default function Notificacoes({ embedded = false }) {
  const [prefs, setPrefs] = useState({
    email: true,
    mobile: true,
    community: true,
    security: true,
    updates: true,
  });
  const [unread, setUnread] = useState(3);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  };

  const togglePref = (key, title) => {
    const next = !prefs[key];
    setPrefs({ ...prefs, [key]: next });
    showToast(`${title} ${next ? 'ativado' : 'desativado'}`);
  };

  const markAsRead = () => {
    setUnread(0);
    showToast('3 mensagens marcadas como lidas');
  };

  const activeChannels = CHANNELS.filter((c) => prefs[c.key]).length;

  const renderRow = ({ key, icon, tint, title, desc }) => (
    <Row key={key} icon={icon} tint={tint} title={title} desc={desc}>
      {key === 'community' &&
        (unread > 0 ? (
          <button
            type="button"
            onClick={markAsRead}
            className="whitespace-nowrap rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-200 transition hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30 dark:hover:bg-violet-500/25"
          >
            {unread} não lidas
          </button>
        ) : (
          <span className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-slate-400 ring-1 ring-inset ring-slate-200 dark:text-slate-500 dark:ring-slate-700">
            Tudo lido
          </span>
        ))}
      <Toggle checked={prefs[key]} onChange={() => togglePref(key, title)} label={title} />
    </Row>
  );

  const content = (
    <>
      <div className="flex w-full flex-col gap-y-5">
        <Card title="Canais de entrega">{CHANNELS.map(renderRow)}</Card>
        <Card title="Atividade e avisos">{ACTIVITY.map(renderRow)}</Card><p className="text-center text-xs text-slate-400 dark:text-slate-500">
          As alterações são aplicadas imediatamente em todos os seus dispositivos.
        </p>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-18 md:bottom-10 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
        {toastMsg}
      </div>
    </>
  );

  return embedded ? content : <Layout>{content}</Layout>;
}