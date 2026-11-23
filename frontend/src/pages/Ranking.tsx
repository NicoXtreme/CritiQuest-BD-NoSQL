
import { useEffect, useState } from 'react'
import { Crown, Star, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { api } from '../services/api'

type RankingItem = {
  reviewCount: number
  averageScore: number
  averageGraphics: number
  averageGameplay: number
  averageStory: number
  averageSound: number
  game: {
    _id: string
    rawgId: number
    name: string
    backgroundImage?: string | null
    released?: string | null
    genres: string[]
    platforms: string[]
  }
}

type RankingsResponse = {
  success: boolean
  count: number
  rankings: RankingItem[]
}

export function Ranking() {
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.rankings<RankingsResponse>()

        setRanking(response.rankings)
      } catch (err) {
        console.error('Error loading rankings:', err)
        setError('No fue posible cargar la clasificación.')
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [])

  return (
    <div className="page-shell">
      <div className="text-center">
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-amber-400/12 text-amber-300">
          <Trophy size={28} />
        </span>

        <p className="eyebrow">La élite de CritiQuest</p>
        <h1 className="page-title">Clasificación de la comunidad</h1>
        <p className="page-intro mx-auto">
          Los videojuegos mejor valorados según las reseñas reales de nuestra comunidad.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 py-16 text-center text-zinc-500">
          Cargando clasificación...
        </div>
      ) : error ? (
        <div className="mt-12 py-16 text-center text-red-400">
          {error}
        </div>
      ) : ranking.length === 0 ? (
        <div className="mt-12 py-16 text-center text-zinc-500">
          Todavía no hay suficientes reseñas para generar una clasificación.
        </div>
      ) : (
        <>
          <div className="mt-12 overflow-hidden rounded-3xl border border-white/8 bg-[#101117]">
            <div className="hidden grid-cols-[70px_1fr_100px_120px_280px] gap-4 border-b border-white/8 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-600 lg:grid">
              <span>Posición</span>
              <span>Videojuego</span>
              <span>Nota</span>
              <span>Reseñas</span>
              <span>Puntuaciones</span>
            </div>

            {ranking.map((item, index) => {
              const ratings = [
                { key: 'Gráficos', value: item.averageGraphics },
                { key: 'Juego', value: item.averageGameplay },
                { key: 'Historia', value: item.averageStory },
                { key: 'Sonido', value: item.averageSound },
              ]

              return (
                <Link
                  to={`/juego/${item.game.rawgId}`}
                  key={item.game._id}
                  className={`grid items-center gap-4 border-b border-white/6 px-4 py-4 transition last:border-0 hover:bg-white/[.035] sm:grid-cols-[60px_1fr_auto] lg:grid-cols-[70px_1fr_100px_120px_280px] lg:px-6 ${
                    index < 3
                      ? 'bg-gradient-to-r from-violet-500/[.07] to-transparent'
                      : ''
                  }`}
                >
                  <div
                    className={`grid size-10 place-items-center rounded-xl font-black ${
                      index === 0
                        ? 'bg-amber-400 text-black'
                        : index === 1
                          ? 'bg-zinc-300 text-black'
                          : index === 2
                            ? 'bg-orange-700'
                            : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {index === 0 ? <Crown size={20} /> : index + 1}
                  </div>

                  <div className="flex min-w-0 items-center gap-4">
                    <img
                      src={item.game.backgroundImage || '/images/placeholder-game.png'}
                      alt={item.game.name}
                      className="size-16 rounded-xl object-cover"
                    />

                    <div className="min-w-0">
                      <h2 className="truncate font-bold">{item.game.name}</h2>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.game.genres.join(' · ') || 'Sin géneros registrados'}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 font-black text-amber-300">
                    <Star size={15} fill="currentColor" />
                    {item.averageScore.toFixed(2)}
                  </span>

                  <span className="hidden text-sm text-zinc-500 lg:block">
                    {item.reviewCount.toLocaleString('es-CO')}
                  </span>

                  <div className="hidden grid-cols-4 gap-2 lg:grid">
                    {ratings.map((rating) => (
                      <div
                        key={rating.key}
                        className="rounded-lg bg-white/5 p-2 text-center"
                      >
                        <strong className="block text-sm">
                          {rating.value.toFixed(1)}
                        </strong>
                        <span className="text-[9px] capitalize text-zinc-600">
                          {rating.key}
                        </span>
                      </div>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>

          <p className="mt-5 text-center text-xs text-zinc-600">
            Clasificación calculada a partir de las reseñas verificadas de la comunidad.
            {` ${ranking.length} videojuegos clasificados.`}
          </p>
        </>
      )}
    </div>
  )
}
