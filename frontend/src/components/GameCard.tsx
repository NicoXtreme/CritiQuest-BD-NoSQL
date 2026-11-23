
import { Heart, Star } from 'lucide-react'
import { Link } from 'react-router'
import { useApp } from '../context/AppContext'
import type { Game } from '../types'

export function GameCard({ game, rank }: { game: Game; rank?: number }) {
  const { user, favorites, toggleFavorite } = useApp()

  // Los favoritos se identifican mediante el ID de MongoDB.
  const favorite = game.mongoId
    ? favorites.includes(game.mongoId)
    : false

  // Solo se pueden gestionar favoritos con sesión y videojuegos
  // que ya existan en nuestra colección de MongoDB.
  const canManageFavorite = Boolean(user && game.mongoId)

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(game)
    } catch (error) {
      console.error('No fue posible actualizar el favorito:', error)
    }
  }

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#12131a] transition duration-300 hover:-translate-y-1 hover:border-violet-500/35 hover:shadow-2xl hover:shadow-violet-950/30">
      <Link to={`/juego/${game.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={game.image}
            alt={`Portada de ${game.title}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#12131a] via-transparent to-transparent" />

          {rank && (
            <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-xl bg-violet-500 font-black shadow-lg">
              #{rank}
            </span>
          )}

          {game.reviews > 0 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/75 px-2.5 py-1.5 font-bold backdrop-blur">
              <Star
                size={14}
                fill="currentColor"
                className="text-amber-400"
              />
              <span>{game.score.toFixed(1)}</span>
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link to={`/juego/${game.id}`}>
              <h3 className="truncate font-bold transition group-hover:text-violet-300">
                {game.title}
              </h3>
            </Link>

            <p className="mt-1 text-xs text-zinc-500">
              {game.releaseDate}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleToggleFavorite()}
            disabled={!canManageFavorite}
            title={
              !user
                ? 'Inicia sesión para gestionar tus favoritos'
                : !game.mongoId
                  ? 'Este videojuego todavía no está registrado en MongoDB'
                  : favorite
                    ? 'Eliminar de favoritos'
                    : 'Agregar a favoritos'
            }
            className={`rounded-lg p-2 transition ${
              favorite
                ? 'bg-violet-500/15 text-violet-400'
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={
              favorite
                ? 'Eliminar de favoritos'
                : 'Agregar a favoritos'
            }
          >
            <Heart
              size={18}
              fill={favorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="tag">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
