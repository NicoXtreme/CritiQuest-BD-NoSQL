import { Star } from 'lucide-react'
import type { Review } from '../types'

export function ReviewCard({ review, showGame }: { review: Review; showGame?: string }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-5 transition hover:border-white/15">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 font-bold">{review.avatar}</span>
        <div className="min-w-0 flex-1"><p className="font-semibold">{review.user}</p><p className="text-xs text-zinc-500">{showGame || review.date}</p></div>
        <span className="flex items-center gap-1 rounded-lg bg-amber-400/10 px-2.5 py-1.5 font-bold text-amber-300"><Star size={14} fill="currentColor" /> {review.score}</span>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">{review.comment}</p>
      {showGame && <p className="mt-3 text-xs text-zinc-600">{review.date}</p>}
    </article>
  )
}
