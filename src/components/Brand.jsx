import { Plus } from 'lucide-react';
import logo from '../../public/AppLogo2.png';

export default function Brand({ light = false, compact = false }) {
  return (
    <div className={`flex items-center pl-2 gap-2.5 ${light ? 'text-white' : 'text-[#142f52]'}`}>
      <span className={`grid place-items-center rounded-xl bg-gradient-to-br from-[#8b5cf6] via-[#6c2bd9] to-[#321084] text-white  ${compact ? 'h-8 w-8 text-lg' : 'h-10 w-10 text-2xl'}`} aria-hidden="true">
        <img src={logo} alt="Logo" className="h-full w-full rounded-xl object-cover" />
      </span>
      {!compact && <span className="text-xl font-extrabold tracking-tight">Urbaniza<span className="text-[#6c2bd9]">+</span></span>}
    </div>
  );
}
