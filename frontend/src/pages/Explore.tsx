
import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { GameCard } from '../components/GameCard'
import { api } from '../services/api'
import type { Game, GamesResponse } from '../types'

export function Explore() {
  const [params] = useSearchParams()

  const [search, setSearch] = useState(params.get('q') ?? '')
  const [genre, setGenre] = useState('Todos')
  const [platform, setPlatform] = useState('Todas')
  const [order, setOrder] = useState('Más recientes')

  const [games, setGames] = useState<Game[]>([])
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGames = async () => {
      setLoading(true)
      setError('')
      setPage(1)

      try {
        const query = new URLSearchParams({
          page: '1',
          page_size: '20',
        })

        if (search.trim()) {
          query.set('search', search.trim())
        }

        const response = await api.games<GamesResponse>(
          `?${query.toString()}`
        )

        if (cancelled) return

        const mappedGames: Game[] = response.results.map((game) => ({
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

        setGames(mappedGames)
        setNextPage(response.nextPage)
      } catch {
        if (!cancelled) {
          setError(
            'No pudimos cargar el catálogo. Verifica que el backend esté funcionando.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timeout = setTimeout(loadGames, 350)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [search])

  const filtered = useMemo(() => {
    let result = games.filter(
      (game) =>
        (genre === 'Todos' || game.genres.includes(genre)) &&
        (platform === 'Todas' || game.platforms.includes(platform))
    )

    if (order === 'Más recientes') {
      result = [...result].sort((a, b) =>
        b.releaseDate.localeCompare(a.releaseDate)
      )
    }

    if (order === 'Nombre A-Z') {
      result = [...result].sort((a, b) =>
        a.title.localeCompare(b.title)
      )
    }

    return result
  }, [games, genre, platform, order])

  const loadMore = async () => {
    if (!nextPage || loadingMore) return

    setLoadingMore(true)

    try {
      const query = new URLSearchParams({
        page: String(nextPage),
        page_size: '20',
      })

      if (search.trim()) {
        query.set('search', search.trim())
      }

      const response = await api.games<GamesResponse>(
        `?${query.toString()}`
      )

      const mappedGames: Game[] = response.results.map((game) => ({
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

      setGames((previous) => [...previous, ...mappedGames])
      setNextPage(response.nextPage)
      setPage(nextPage)
    } catch {
      setError('No pudimos cargar más videojuegos.')
    } finally {
      setLoadingMore(false)
    }
  }

  const genres = [...new Set(games.flatMap((game) => game.genres))].sort()
  const platforms = [...new Set(games.flatMap((game) => game.platforms))].sort()

  return (
    <div className="page-shell">
      <div className="max-w-2xl">
        <p className="eyebrow">Catálogo</p>
        <h1 className="page-title">Encuentra tu próxima aventura</h1>
        <p className="page-intro">
          Explora mundos nuevos y descubre qué opina la comunidad antes de empezar a jugar.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-white/8 bg-[#101117] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-11"
              placeholder="Buscar por nombre..."
            />
          </label>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="field min-w-40"
          >
            <option value="Todos">Todos los géneros</option>
            {genres.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="field min-w-44"
          >
            <option value="Todas">Todas las plataformas</option>
            {platforms.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="field min-w-48"
          >
            <option value="Más recientes">Más recientes</option>
            <option value="Nombre A-Z">Nombre A-Z</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          <strong className="text-white">{filtered.length}</strong> videojuegos encontrados
        </p>
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <SlidersHorizontal size={15} />
          Filtros activos
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          Cargando videojuegos...
        </div>
      ) : error && games.length === 0 ? (
        <div className="empty-state">
          <h2>Error al cargar el catálogo</h2>
          <p>{error}</p>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {nextPage !== null && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="button-secondary"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más resultados'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Search size={32} />
          <h2>No encontramos resultados</h2>
          <p>Prueba con otro nombre o cambia los filtros seleccionados.</p>
          <button
            onClick={() => {
              setSearch('')
              setGenre('Todos')
              setPlatform('Todas')
            }}
            className="button-secondary mt-4"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {error && games.length > 0 && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
