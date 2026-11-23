
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Flame,
  MessageSquareText,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import { Link } from 'react-router'
import { GameCard } from '../components/GameCard'
import { api } from '../services/api'
import type { Game, GamesResponse } from '../types'

type RankingItem = {
  game: {
    _id: string
    rawgId: number
    name: string
    backgroundImage: string | null
    released: string | null
    genres: string[]
    platforms: string[]
  }
  reviewCount: number
  averageScore: number
  averageGraphics: number
  averageGameplay: number
  averageStory: number
  averageSound: number
}

type RankingsResponse = {
  success: boolean
  count: number
  rankings: RankingItem[]
}

type HomeReview = {
  _id: string
  username: string
  gameName: string
  rawgId: number | null
  averageScore: number
  comment: string
  createdAt: string
}

type HomeDataResponse = {
  success: boolean
  statistics: {
    gameCount: number
    reviewCount: number
    userCount: number
  }
  recentReviews: HomeReview[]
}

function Heading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string
  title: string
  action?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>

      {action && (
        <Link
          to="/explorar"
          className="hidden items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300 sm:flex"
        >
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

export function Home() {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([])
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [recentReviews, setRecentReviews] = useState<HomeReview[]>([])

  const [statistics, setStatistics] = useState({
    gameCount: 0,
    reviewCount: 0,
    userCount: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError('')

        const [gamesResponse, rankingsResponse, homeResponse] =
          await Promise.all([
            api.games<GamesResponse>('?page=1&page_size=4'),
            api.rankings<RankingsResponse>(),
            api.homeData<HomeDataResponse>(),
          ])

        if (cancelled) return

        const mappedGames: Game[] = gamesResponse.results.map((game) => ({
          id: String(game.id),
          title: game.name,
          releaseDate: game.released ?? '',
          genres: game.genres,
          platforms: game.platforms,
          score: 0,
          reviews: 0,
          image: game.backgroundImage ?? '',
          description: '',
          ratings: {
            graficos: 0,
            jugabilidad: 0,
            historia: 0,
            sonido: 0,
          },
        }))

        setFeaturedGames(mappedGames)
        setRankings(rankingsResponse.rankings)
        setRecentReviews(homeResponse.recentReviews)
        setStatistics(homeResponse.statistics)
      } catch (err) {
        console.error('Error loading Home page:', err)

        if (!cancelled) {
          setError(
            'No fue posible cargar toda la información de CritiQuest. Verifica que el backend esté funcionando.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadHomeData()

    return () => {
      cancelled = true
    }
  }, [])

  const trendingGames = [...rankings]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 4)

  const topRatedGames = [...rankings]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3)

  return (
    <>
      <section className="relative min-h-[680px] overflow-hidden">
        <img
          src="/images/hero-critiquest.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,#08090d_0%,rgba(8,9,13,.86)_35%,rgba(8,9,13,.18)_75%),linear-gradient(0deg,#08090d_0%,transparent_50%)]" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              <Sparkles size={14} />
              Tu próxima aventura empieza aquí
            </div>

            <h1 className="text-5xl font-black leading-[.98] tracking-[-0.045em] sm:text-7xl">
              Descubre.
              <br />
              <span className="gradient-text">Juega. Opina.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Explora videojuegos, comparte tus opiniones y descubre qué piensa
              la comunidad.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/explorar" className="button-primary">
                Explorar videojuegos
                <ArrowRight size={18} />
              </Link>

              <Link to="/clasificacion" className="button-secondary">
                <Trophy size={18} />
                Ver clasificación
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-6">
              <div>
                <strong className="block text-xl">
                  {loading ? '...' : statistics.gameCount.toLocaleString('es-CO')}
                </strong>
                <span className="text-xs text-zinc-500">videojuegos</span>
              </div>

              <div>
                <strong className="block text-xl">
                  {loading ? '...' : statistics.reviewCount.toLocaleString('es-CO')}
                </strong>
                <span className="text-xs text-zinc-500">reseñas</span>
              </div>

              <div>
                <strong className="block text-xl">
                  {loading ? '...' : statistics.userCount.toLocaleString('es-CO')}
                </strong>
                <span className="text-xs text-zinc-500">jugadores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-5 pb-24 lg:px-8">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section>
          <Heading
            eyebrow="Selección CritiQuest"
            title="Videojuegos destacados"
            action="Ver catálogo"
          />

          {loading ? (
            <p className="py-10 text-center text-zinc-400">
              Cargando videojuegos...
            </p>
          ) : featuredGames.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-zinc-500">
              No hay videojuegos disponibles en este momento.
            </p>
          )}
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <Heading
              eyebrow="Ahora mismo"
              title="Tendencias de la comunidad"
            />

            {loading ? (
              <p className="py-8 text-center text-zinc-400">
                Cargando tendencias...
              </p>
            ) : trendingGames.length > 0 ? (
              <div className="space-y-3">
                {trendingGames.map((item, index) => (
                  <Link
                    key={item.game._id}
                    to={`/juego/${item.game.rawgId}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[.025] p-3 transition hover:border-violet-500/30 hover:bg-white/[.045]"
                  >
                    <span className="w-8 text-center text-xl font-black text-zinc-700 group-hover:text-violet-400">
                      0{index + 1}
                    </span>

                    <img
                      src={
                        item.game.backgroundImage ||
                        '/images/placeholder-game.png'
                      }
                      alt={item.game.name}
                      className="size-16 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold">
                        {item.game.name}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Flame size={13} className="text-orange-400" />
                        {item.reviewCount.toLocaleString('es-CO')} opiniones
                      </p>
                    </div>

                    <span className="flex items-center gap-1 pr-2 font-bold">
                      <Star
                        size={15}
                        fill="currentColor"
                        className="text-amber-400"
                      />
                      {item.averageScore.toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-zinc-500">
                Todavía no hay suficientes reseñas para mostrar tendencias.
              </p>
            )}
          </div>

          <div>
            <Heading eyebrow="Voces reales" title="Reseñas recientes" />

            {loading ? (
              <p className="py-8 text-center text-zinc-400">
                Cargando reseñas...
              </p>
            ) : recentReviews.length > 0 ? (
              <div className="grid gap-3">
                {recentReviews.map((review) => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-white/8 bg-white/[0.035] p-5 transition hover:border-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 font-bold">
                        {getInitials(review.username)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{review.username}</p>

                        {review.rawgId ? (
                          <Link
                            to={`/juego/${review.rawgId}`}
                            className="text-xs text-zinc-500 hover:text-violet-300"
                          >
                            {review.gameName}
                          </Link>
                        ) : (
                          <p className="text-xs text-zinc-500">
                            {review.gameName}
                          </p>
                        )}
                      </div>

                      <span className="flex items-center gap-1 rounded-lg bg-amber-400/10 px-2.5 py-1.5 font-bold text-amber-300">
                        <Star size={14} fill="currentColor" />
                        {review.averageScore.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {review.comment}
                    </p>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
                      <MessageSquareText size={13} />
                      {formatDate(review.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-zinc-500">
                Todavía no hay reseñas publicadas.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-950/50 via-[#11121b] to-blue-950/35 p-7 md:p-10">
          <Heading eyebrow="La élite" title="Mejor valorados" />

          {loading ? (
            <p className="py-8 text-center text-zinc-400">
              Cargando clasificación...
            </p>
          ) : topRatedGames.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topRatedGames.map((item, index) => (
                <Link
                  to={`/juego/${item.game.rawgId}`}
                  key={item.game._id}
                  className="flex items-center gap-4 rounded-2xl bg-black/25 p-4 transition hover:bg-black/40"
                >
                  <span
                    className={`grid size-11 place-items-center rounded-xl font-black ${
                      index === 0
                        ? 'bg-amber-400 text-black'
                        : index === 1
                          ? 'bg-zinc-300 text-black'
                          : 'bg-orange-700'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{item.game.name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.reviewCount.toLocaleString('es-CO')} reseñas
                    </p>
                  </div>

                  <span className="font-black text-violet-300">
                    {item.averageScore.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-zinc-500">
              Todavía no hay videojuegos con reseñas para clasificarlos.
            </p>
          )}
        </section>
      </div>
    </>
  )
}
