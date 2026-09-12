import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ChevronLeft, EllipsisVertical, Heart, Laugh, MessageCircle, MoreHorizontal, SendHorizonal, Smile, ThumbsUp, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { db } from '../Firebase/index';

const FORBIDDEN_WORDS = [
  'merda', 'bosta', 'porra', 'caralho', 'puta', 'put4', 'pu74', 'fod4', 'porr4',
  'fdp', 'foda', 'desgraça', 'desgraca', 'arrombado', 'viado', 'piranha', 'corno',
  'cu', 'cuzao', 'cacete', 'babaca', 'otario', 'otário', 'burro', 'imbecil', 'idiota',
];

const REACTIONS = [
  { key: 'like', label: 'Curtir', icon: ThumbsUp },
  { key: 'heart', label: 'Amar', icon: Heart },
  { key: 'laugh', label: 'Rir', icon: Laugh },
];

function isModerator(role) {
  return ['1', '2', '3'].includes(String(role));
}

function messageDate(timestamp) {
  if (!timestamp) return null;
  return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
}

function getRelativeTime(timestamp, now) {
  const date = messageDate(timestamp);
  if (!date) return '';

  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function groupMessages(messages, currentUserId) {
  const groups = [];

  messages.forEach((message, index) => {
    const previous = index > 0 ? messages[index - 1] : null;
    const sameUser = previous?.user?.uid && previous.user.uid === message.user?.uid;
    const previousDate = messageDate(previous?.data);
    const currentDate = messageDate(message.data);
    const minutesBetween = previousDate && currentDate
      ? (currentDate.getTime() - previousDate.getTime()) / 60000
      : Infinity;

    if (sameUser && minutesBetween < 5) {
      groups[groups.length - 1].messages.push(message);
      return;
    }

    groups.push({
      user: message.user || {},
      messages: [message],
      isCurrentUser: message.user?.uid === currentUserId,
    });
  });

  return groups;
}

function UserAvatar({ user, current = false, name = 'Anônimo' }) {
  const source = user?.foto || '/cityIcon.png';
  return <img src={source} alt={current ? 'Seu avatar' : `Avatar de ${name}`} className="h-7 w-7 shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] object-cover" />;
}

function ReactionSummary({ message, isCurrentUser, userId }) {
  const reactions = message.reactions || {};
  const items = REACTIONS.map(({ key, icon: Icon }) => ({ key, Icon, count: reactions[key]?.length || 0 })).filter((item) => item.count > 0);

  if (!items.length) return null;

  return (
    <div className={`mt-2 flex flex-wrap gap-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {items.map(({ key, Icon, count }) => (
        <span key={key} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${isCurrentUser ? 'border-white/20 bg-white/15 text-white' : 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted)]'} ${reactions[key]?.includes(userId) ? 'ring-1 ring-[var(--color-primary)]' : ''}`}>
          <Icon size={11} /> {count}
        </span>
      ))}
    </div>
  );
}

function ReactionMenu({ message, onReact, userId, isCurrentUser, isOpen }) {
  return (
    <div className={`absolute bottom-0 z-20 ${isOpen ? 'flex' : 'hidden'} items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg ${isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'}`}>
      {REACTIONS.map(({ key, label, icon: Icon }) => (
        <button type="button" key={key} onClick={() => onReact(message.id, key)} title={label} className={`grid h-7 w-7 place-items-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)] ${message.reactions?.[key]?.includes(userId) ? 'bg-[var(--color-primary-tint)] text-[var(--color-primary)]' : ''}`}>
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

function ChatMessage({ group, now, userId, role, currentAvatar, reactionMessageId, onToggleReactions, onReact, onDelete }) {
  const isCurrentUser = group.isCurrentUser;

  return (
    <div className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && <UserAvatar user={group.user} name={group.user.userName} />}
      <div className={`flex max-w-[min(78%,620px)] flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[11px] font-bold text-[var(--color-ink)]">{group.user.userName || 'Anônimo'}</span>
            <span className="text-[10px] text-[var(--color-muted)]">{getRelativeTime(group.messages[0].data, now)}</span>
          </div>
        )}

        {group.messages.map((message, index) => (
          <div key={message.id} className="group relative">
            <div className={`rounded-2xl px-3 py-2 ${isCurrentUser ? 'rounded-br-md bg-[var(--color-primary)] text-white' : 'rounded-bl-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]'} ${index > 0 ? (isCurrentUser ? 'rounded-tr-md' : 'rounded-tl-md') : ''}`}>
              <p className="break-words text-sm leading-5">{message.texto}</p>
              <ReactionSummary message={message} isCurrentUser={isCurrentUser} userId={userId} />
            </div>

            <div className={`absolute top-1/2 -translate-y-1/2 ${isCurrentUser ? 'right-full mr-1' : 'left-full ml-1'} hidden items-center gap-1 group-hover:flex`}>
              <div className="relative">
                <button type="button" onClick={() => onToggleReactions(message.id)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] shadow-sm hover:text-[var(--color-primary)]" aria-label="Reagir">
                  <Smile size={14} />
                </button>
                <ReactionMenu message={message} onReact={onReact} userId={userId} isCurrentUser={isCurrentUser} isOpen={reactionMessageId === message.id} />
              </div>
              {isModerator(role) && <button type="button" onClick={() => onDelete(message.id)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-danger)] shadow-sm" title="Apagar mensagem"><Trash2 size={13} /></button>}
            </div>

            {isCurrentUser && index === group.messages.length - 1 && <span className="text-[10px] text-[var(--color-muted)]">{getRelativeTime(message.data, now)}</span>}
          </div>
        ))}
      </div>
      {isCurrentUser && <UserAvatar user={{ foto: currentAvatar }} current name="Você" />}
    </div>
  );
}

function ChatComunidade() {
  const { token, user } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [nome, setNome] = useState(localStorage.getItem('userName') || 'Anônimo');
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar_url') || '/cityIcon.png');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mostrarReacoes, setMostrarReacoes] = useState(null);
  const ultimaMensagemRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    setRole(user.role);
    setNome(user.nameUser || 'Anônimo');
    if (user.avatar_url) setAvatar(user.avatar_url);
  }, [user]);

  useEffect(() => {
    if (!token) return undefined;

    const messagesQuery = query(collection(db, 'messages'), orderBy('data', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMensagens(snapshot.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() })));
    });

    return () => unsubscribe();
  }, [token]);

  useEffect(() => {
    ultimaMensagemRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const mensagensAgrupadas = useMemo(() => groupMessages(mensagens, user?.userId), [mensagens, user?.userId]);

  async function enviarMensagem() {
    if (!texto.trim()) return;
    if (FORBIDDEN_WORDS.some((word) => texto.toLowerCase().includes(word))) {
      alert('Sua mensagem contém palavras inadequadas. Por favor, seja respeitoso.');
      return;
    }

    const textoParaEnviar = texto;
    setTexto('');
    await addDoc(collection(db, 'messages'), {
      texto: textoParaEnviar,
      data: serverTimestamp(),
      user: { userName: nome || 'Anônimo', foto: avatar || '', uid: user?.userId || null },
      reactions: { like: [], heart: [], laugh: [] },
    });
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      enviarMensagem();
    }
  }

  async function chatClear() {
    const messagesReference = collection(db, 'messages');
    const snapshot = await getDocs(messagesReference);
    if (snapshot.empty) {
      window.alert('Não há nada para apagar!');
      return;
    }
    if (!window.confirm('Tem certeza que deseja apagar todas as mensagens do chat?')) return;
    await Promise.all(snapshot.docs.map((messageDoc) => deleteDoc(doc(db, 'messages', messageDoc.id))));
    window.alert('Todas as mensagens foram apagadas!');
  }

  async function msgDelete(docId) {
    if (!isModerator(role)) {
      alert('Apenas Owner, Admin ou Moderador podem apagar esta mensagem.');
      return;
    }
    if (!window.confirm('Quer mesmo apagar esta mensagem?')) return;
    try {
      await deleteDoc(doc(db, 'messages', docId));
    } catch (error) {
      console.error('Erro ao apagar mensagem:', error);
    }
  }

  async function adicionarReacao(msgId, tipo) {
    if (!user?.userId) return;
    try {
      const message = mensagens.find((item) => item.id === msgId);
      if (!message) return;
      const messageReference = doc(db, 'messages', msgId);
      const reacted = message.reactions?.[tipo]?.includes(user.userId);
      await updateDoc(messageReference, { [`reactions.${tipo}`]: reacted ? arrayRemove(user.userId) : arrayUnion(user.userId) });
      setMostrarReacoes(null);
    } catch (error) {
      console.error('Erro ao adicionar reação:', error);
    }
  }

  if (!token) return <Navigate to="/login" />;

  return (
    <Layout hideMobileNavigation>
      <main className="min-h-[calc(100dvh-64px)] bg-[var(--color-surface-muted)] p-0 md:min-h-[calc(100dvh-72px)] md:p-3 lg:p-4">
        <div className="grid h-[calc(100dvh-64px)] w-full overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm md:h-[calc(100dvh-96px)] md:grid-cols-[260px_minmax(0,1fr)] md:rounded-2xl md:border">
          <aside className="chat-conversation-sidebar hidden border-r border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 md:block">
            <div className="flex items-center justify-between">
              <div><p className="urban-eyebrow">Comunidade</p><h1 className="mt-1 text-lg font-extrabold text-[var(--color-ink)]">Conversas</h1></div>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]" aria-label="Mais opções"><MoreHorizontal size={17} /></button>
            </div>
            <div className="mt-5 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-tint)] p-3">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] text-white"><MessageCircle size={17} /></span><div className="min-w-0"><strong className="block truncate text-sm text-[var(--color-ink)]">Chat da comunidade</strong><span className="text-[11px] text-[var(--color-muted)]">{mensagens.length} mensagens</span></div></div>
            </div>
            <p className="mt-6 text-xs leading-5 text-[var(--color-muted)]">Converse com moradores e mantenha o foco em soluções para a cidade.</p>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col">
            <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5"><Link to="/" aria-label="Voltar" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]"><ChevronLeft size={18} /></Link><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)] md:hidden"><MessageCircle size={16} /></span><div className="min-w-0"><h2 className="truncate text-sm font-extrabold text-[var(--color-ink)] sm:text-base">Chat da comunidade</h2><p className="text-[11px] text-[var(--color-muted)]">{mensagens.length} mensagens · espaço público</p></div></div>{isModerator(role) && <button type="button" onClick={chatClear} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-danger)]/20 px-2.5 py-2 text-[11px] font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger-tint)]"><Trash2 size={13} /> <span className="hidden sm:inline">Limpar chat</span></button>}</header>

            <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 text-center text-[11px] text-[var(--color-muted)]">Mantenha o respeito e foque em soluções para a comunidade.</div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
              {mensagensAgrupadas.length === 0 ? <div className="grid h-full place-items-center py-16 text-center"><div><span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-primary-tint)] text-[var(--color-primary)]"><MessageCircle size={20} /></span><h3 className="mt-3 text-sm font-bold text-[var(--color-ink)]">Comece a conversa</h3><p className="mt-1 max-w-xs text-xs leading-5 text-[var(--color-muted)]">Ainda não há mensagens. Compartilhe uma ideia ou uma atualização do seu bairro.</p></div></div> : <div className="space-y-4">{mensagensAgrupadas.map((group, index) => <ChatMessage key={`${group.messages[0].id}-${index}`} group={group} now={currentTime} userId={user?.userId} role={role} currentAvatar={avatar} reactionMessageId={mostrarReacoes} onToggleReactions={(messageId) => setMostrarReacoes((current) => current === messageId ? null : messageId)} onReact={adicionarReacao} onDelete={msgDelete} />)}<div ref={ultimaMensagemRef} /></div>}
            </div>

            <form onSubmit={(event) => { event.preventDefault(); enviarMensagem(); }} className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 sm:p-3">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1.5">
                <button type="button" onClick={() => alert('Emoji picker em breve!')} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]" aria-label="Adicionar emoji"><Smile size={17} /></button>
                <input type="text" value={texto} onChange={(event) => setTexto(event.target.value)} onKeyDown={handleKeyPress} className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]" placeholder="Escreva uma mensagem..." aria-label="Mensagem" />
                <button type="submit" disabled={!texto.trim()} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-35" aria-label="Enviar mensagem"><SendHorizonal size={16} /></button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default ChatComunidade;
