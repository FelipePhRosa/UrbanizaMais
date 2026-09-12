import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock5, MessageSquare, ArrowDownRight } from 'lucide-react';
import LikeButton from './LikeButton';
import { Link } from 'react-router-dom';

const statusCopy = { aprovado: 'Aprovado', resolvida: 'Resolvido', pendente: 'Em análise', rejeitado: 'Rejeitado' };
const statusStyle = { aprovado: 'bg-[var(--color-primary-tint)] text-[var(--color-primary)]', resolvida: 'bg-[var(--color-success-tint)] text-[var(--color-success)]', pendente: 'bg-[var(--color-warning-tint)] text-[var(--color-warning)]', rejeitado: 'bg-[var(--color-danger-tint)] text-[var(--color-danger)]' };

function EmptyReports() {
  return <div className="flex flex-col items-center justify-center py-7 text-center"><span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary-tint)] text-lg font-bold text-[var(--color-primary)]">+</span><p className="text-sm font-semibold text-[var(--color-ink)]">Nenhum relato disponível</p><p className="mt-1 text-xs text-[var(--color-muted)]">Os novos registros aparecerão aqui.</p></div>;
}

function ReportRow({ id, image, status, icon, category, title, address, time, likes, comments, likedByCurrentUser }) {
  return <article className="group flex min-w-0 items-center gap-3 border-b border-[var(--color-border-subtle)] py-3 last:border-0"><img src={image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2"><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[status] || 'bg-[var(--color-soft)] text-[var(--color-muted)]'}`}>{statusCopy[status] || status || 'Relato'}</span><span className="flex min-w-0 items-center truncate text-[11px] font-medium text-[var(--color-muted)]">{icon}{category || 'Problema urbano'}</span></div><h2 className="mt-1 truncate text-sm font-semibold text-[var(--color-ink)]">{title}</h2><p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">{address || 'Localização não informada'}</p><div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--color-muted)]"><span className="flex items-center gap-1"><Clock5 size={13} />{time || 'Agora'}</span><LikeButton reportId={id} initialLiked={likedByCurrentUser} initialLikes={likes} /><span className="flex items-center gap-1"><MessageSquare size={13} />{comments ?? 0}</span></div></div><Link to={`/report/${id}`} aria-label="Abrir relato" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-soft)] text-[var(--color-ink)] opacity-80 transition group-hover:bg-[var(--color-primary-tint)] group-hover:text-[var(--color-primary)]"><ArrowDownRight size={15} /></Link></article>;
}

function ReportCard({ reports, id, image, status, statusColor, icon, category, title, address, time, likes, comments, likedByCurrentUser }) {
  if (Array.isArray(reports)) {
    if (reports.length === 0) return <EmptyReports />;
    return <div>{reports.map((report) => <ReportRow key={report.id} id={report.id} image={report.image ? `${import.meta.env.VITE_API_URL}/uploads/${report.image}` : '/placeholder.png'} status={report.status} category={report.category} title={report.reportTitle} address={report.address} time={report.updated_at ? formatDistanceToNow(new Date(report.updated_at), { addSuffix: true, locale: ptBR }) : undefined} likes={report.likes} likedByCurrentUser={report.likedByCurrentUser} comments={report.comments ?? 0} />)}</div>;
  }
  return <ReportRow id={id} image={image} status={status} statusColor={statusColor} icon={icon} category={category} title={title} address={address} time={time} likes={likes} comments={comments} likedByCurrentUser={likedByCurrentUser} />;
}

export default ReportCard;
