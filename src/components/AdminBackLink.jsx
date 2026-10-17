import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminBackLink() {
  const { user } = useContext(AuthContext);

  if (!['1', '2'].includes(String(user?.role))) return null;
  return <Link to="/dashboard" className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 mt-2 ml-11 border border-black/20 bg-[#94A3B8]/70 dark:bg-gray-900  text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-tint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"><ArrowLeft size={15} /> Voltar para Administração</Link>;
}
