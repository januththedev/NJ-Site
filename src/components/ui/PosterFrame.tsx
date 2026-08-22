interface Props {
  src: string
  label: string
  className?: string
}

/** Glass poster frame for timetable images with hover zoom. */
export default function PosterFrame({ src, label, className = '' }: Props) {
  return (
    <figure className={`glass group overflow-hidden rounded-3xl p-3 ${className}`}>
      <div className="overflow-hidden rounded-2xl">
        <img
          src={src}
          alt={label}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <figcaption className="px-2 pb-1 pt-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </figcaption>
    </figure>
  )
}
