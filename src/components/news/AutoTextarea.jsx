import { useEffect, useRef } from 'react';

export default function AutoTextarea({ value, onChange, onKeyDown, placeholder, className = '', registerRef, name }) {
  const localRef = useRef(null);

  useEffect(() => {
    const element = localRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={(element) => {
        localRef.current = element;
        registerRef?.(name, element);
      }}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={`block w-full resize-none overflow-hidden bg-transparent text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 focus:outline-none ${className}`}
    />
  );
}
