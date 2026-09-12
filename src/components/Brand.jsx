import { Plus } from 'lucide-react';

export default function Brand({ light = false, compact = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${light ? 'text-white' : 'text-[#142f52]'}`}>
      <span className={`grid place-items-center rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#6c2bd9] to-[#321084] text-white shadow-[0_6px_16px_rgba(108,43,217,.24)] ${compact ? 'h-8 w-8 text-lg' : 'h-10 w-10 text-2xl'}`} aria-hidden="true">
        <span className="font-black leading-none">U<Plus size={compact ? 11 : 14} strokeWidth={4} className="inline -ml-0.5 -mt-1" /></span>
      </span>
      {!compact && <span className="text-xl font-extrabold tracking-tight">Urbaniza<span className="text-[#6c2bd9]">+</span></span>}
    </div>
  );
}
