import Image from 'next/image';

type MediaPlaceholderProps = {
  label: string;
  src?: string;
  aspectRatio: string;
  mediaType?: 'image' | 'video';
  className?: string;
};

export function MediaPlaceholder({
  label,
  src,
  aspectRatio,
  mediaType = 'image',
  className = '',
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative isolate w-full overflow-hidden rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] ${className}`}
      style={{ aspectRatio }}
    >
      {mediaType === 'video' ? (
        // TODO: Add src when the real product screen recording is available.
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-label={label}
          className="absolute inset-0 size-full object-cover"
        />
      ) : src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_92%,transparent)] px-4 py-3 text-center font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.08em] text-[var(--text-secondary)]">
        {label}
      </div>
    </div>
  );
}
