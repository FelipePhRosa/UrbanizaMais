import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { newsImageUrl, uploadNewsImage } from './newsApi';

export default function ImagePicker({ filename, onPick, token, label = 'Enviar imagem', className = '' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      onPick(await uploadNewsImage(file, token));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {uploading && (
        <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted)]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {!uploading && filename && (
        <div className="group relative overflow-hidden rounded-xl border border-[var(--color-border)]">
          <img src={newsImageUrl(filename)} alt="" className="aspect-video w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-[var(--color-ink)]/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-[var(--urban-navy)] transition hover:bg-white"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onPick('')}
              aria-label="Remover imagem"
              className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-[var(--color-danger)] transition hover:bg-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {!uploading && !filename && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-muted)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)] hover:text-[var(--color-primary)]"
        >
          <ImagePlus size={20} />
          <span className="text-xs font-bold">{label}</span>
          <span className="text-[11px] font-medium opacity-80">JPG, PNG ou WebP até 10 MB</span>
        </button>
      )}
    </div>
  );
}
