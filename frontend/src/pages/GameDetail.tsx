
import {
  ArrowLeft,
  Heart,
  Pencil,
  Star,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import type {
  Game,
  GameDetailResponse,
  Review,
  ReviewsResponse,
  ReviewMutationResponse,
} from '../types'

type ReviewRatings = {
  graphics: number
  gameplay: number
  story: number
  sound: number
}

const ratingLabels = [
  ['graphics', 'Gráficos'],
  ['gameplay', 'Jugabilidad'],
  ['story', 'Historia'],
  ['sound', 'Sonido'],
] as const

const initialRatings: ReviewRatings = {
  graphics: 8,
  gameplay: 8,
  story: 8,
  sound: 8,
}

function getReviewAverage(ratings: ReviewRatings): number {
  return (
    (ratings.graphics +
      ratings.gameplay +
      ratings.story +
      ratings.sound) /
    4
  )
}

export function GameDetail() {
  const { id } = useParams()
  const { favorites, toggleFavorite, user } = useApp()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [comment, setComment] = useState('')
  const [ratings, setRatings] = useState<ReviewRatings>(initialRatings)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  // Cargar información del videojuego desde el backend.
  useEffect(() => {
    let cancelled = false

    const loadGame = async () => {
      if (!id || !/^\d+$/.test(id)) {
        setError('El identificador del videojuego no es válido.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await api.game<GameDetailResponse>(id)

        if (cancelled) return

        const rawgGame = response.game

        const mappedGame: Game = {
          id: String(rawgGame.rawgId),
          mongoId: rawgGame._id,
          title: rawgGame.name,
          releaseDate: rawgGame.released ?? '',
          genres: rawgGame.genres,
          platforms: rawgGame.platforms,
          score: 0,
          reviews: 0,
          image: rawgGame.backgroundImage ?? '',
          description: '',
          ratings: {
            graficos: 0,
            jugabilidad: 0,
            historia: 0,
            sonido: 0,
          },
        }

        setGame(mappedGame)
      } catch (err) {
        console.error('Error al cargar el videojuego:', err)

        if (!cancelled) {
          setError(
            'No fue posible cargar este videojuego. Comprueba que el backend esté funcionando.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadGame()

    return () => {
      cancelled = true
    }
  }, [id])

  // Consultar las reseñas cuando el videojuego ya está registrado en MongoDB.
  useEffect(() => {
    if (!game?.mongoId) return

    let cancelled = false

    const loadReviews = async () => {
      setReviewsLoading(true)

      try {
        const response = await api.reviews<ReviewsResponse>(game.mongoId!)

        if (!cancelled) {
          setReviews(response.reviews)
        }
      } catch (err) {
        console.error('Error al cargar las reseñas:', err)

        if (!cancelled) {
          setReviewError('No fue posible cargar las reseñas.')
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [game?.mongoId])

  const refreshReviews = async () => {
    if (!game?.mongoId) return

    const response = await api.reviews<ReviewsResponse>(game.mongoId)
    setReviews(response.reviews)
  }

  const favorite = game?.mongoId
    ? favorites.includes(game.mongoId)
    : false

  const canManageFavorite = Boolean(user && game?.mongoId)

  const handleToggleFavorite = async () => {
    if (!game || !canManageFavorite) return

    try {
      await toggleFavorite(game)
    } catch (err) {
      console.error('No fue posible actualizar el favorito:', err)
    }
  }

  const ownReview = user
    ? reviews.find((review) => review.user._id === user.id)
    : undefined

  const handleRatingChange = (
    key: keyof ReviewRatings,
    value: number
  ) => {
    setRatings((previous) => ({
      ...previous,
      [key]: Math.min(10, Math.max(1, value)),
    }))
  }

  const resetReviewForm = () => {
    setComment('')
    setRatings(initialRatings)
    setEditingReviewId(null)
    setReviewError('')
    setReviewMessage('')
  }

  const startEditing = (review: Review) => {
    setEditingReviewId(review._id)
    setComment(review.comment)
    setRatings({
      graphics: review.ratings.graphics,
      gameplay: review.ratings.gameplay,
      story: review.ratings.story,
      sound: review.ratings.sound,
    })
    setReviewError('')
    setReviewMessage('')

    document.getElementById('review-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  const handleSubmitReview = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!user || !game?.mongoId) return

    if (!comment.trim()) {
      setReviewError('Escribe un comentario antes de publicar.')
      return
    }

    setSubmitting(true)
    setReviewError('')
    setReviewMessage('')

    try {
      if (editingReviewId) {
        await api.updateReview<ReviewMutationResponse>(
          editingReviewId,
          {
            ratings,
            comment: comment.trim(),
          },
          user.token
        )

        setReviewMessage('Tu reseña se actualizó correctamente.')
      } else {
        await api.createReview<ReviewMutationResponse>(
          {
            gameId: game.mongoId,
            ratings,
            comment: comment.trim(),
          },
          user.token
        )

        setReviewMessage('¡Tu reseña se publicó correctamente!')
      }

      setComment('')
      setRatings(initialRatings)
      setEditingReviewId(null)

      await refreshReviews()
    } catch (err) {
      console.error('Error al guardar la reseña:', err)

      setReviewError(
        err instanceof Error
          ? err.message
          : 'No fue posible guardar la reseña.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar tu reseña?'
    )

    if (!confirmed) return

    try {
      await api.deleteReview(reviewId, user.token)

      resetReviewForm()
      setReviewMessage('Tu reseña fue eliminada correctamente.')

      await refreshReviews()
    } catch (err) {
      console.error('Error al eliminar la reseña:', err)

      setReviewError(
        err instanceof Error
          ? err.message
          : 'No fue posible eliminar la reseña.'
      )
    }
  }

  // Calcular promedios reales a partir de las reseñas almacenadas.
  const categoryAverages = {
    graphics: 0,
    gameplay: 0,
    story: 0,
    sound: 0,
  }

  let overallAverage = 0

  if (reviews.length > 0) {
    for (const review of reviews) {
      categoryAverages.graphics += review.ratings.graphics
      categoryAverages.gameplay += review.ratings.gameplay
      categoryAverages.story += review.ratings.story
      categoryAverages.sound += review.ratings.sound
    }

    categoryAverages.graphics /= reviews.length
    categoryAverages.gameplay /= reviews.length
    categoryAverages.story /= reviews.length
    categoryAverages.sound /= reviews.length

    overallAverage =
      (categoryAverages.graphics +
        categoryAverages.gameplay +
        categoryAverages.story +
        categoryAverages.sound) /
      4
  }

  if (loading) {
    return (
      <div className="page-shell py-24 text-center text-zinc-400">
        Cargando información del videojuego...
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="page-shell py-24 text-center">
        <h1 className="text-2xl font-bold">
          No pudimos cargar el videojuego
        </h1>

        <p className="mt-3 text-zinc-400">
          {error || 'El videojuego solicitado no existe.'}
        </p>

        <Link to="/explorar" className="button-secondary mt-6 inline-flex">
          <ArrowLeft size={17} />
          Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <section className="relative min-h-[570px] overflow-hidden">
        {game.image ? (
          <img
            src={game.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#171525]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(0deg,#08090d_0%,rgba(8,9,13,.42)_65%,rgba(8,9,13,.2)),linear-gradient(90deg,rgba(8,9,13,.9),transparent_65%)]" />

        <div className="relative mx-auto flex min-h-[570px] max-w-7xl flex-col justify-end px-5 pb-14 lg:px-8">
          <Link
            to="/explorar"
            className="mb-auto mt-8 flex w-fit items-center gap-2 text-sm text-zinc-300 hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver al catálogo
          </Link>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span className="tag" key={genre}>
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                {game.title}
              </h1>

              <p className="mt-4 text-zinc-300">
                {game.releaseDate || 'Fecha de lanzamiento no disponible'}
                {game.platforms.length > 0 &&
                  ` · ${game.platforms.join(' · ')}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleToggleFavorite()}
                disabled={!canManageFavorite}
                title={
                  !user
                    ? 'Inicia sesión para gestionar tus favoritos'
                    : !game.mongoId
                      ? 'Videojuego no registrado en MongoDB'
                      : favorite
                        ? 'Eliminar de favoritos'
                        : 'Agregar a favoritos'
                }
                className="button-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Heart
                  size={18}
                  fill={favorite ? 'currentColor' : 'none'}
                  className={favorite ? 'text-violet-400' : ''}
                />
                {favorite ? 'En favoritos' : 'Agregar a favoritos'}
              </button>

              {user && !ownReview && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('review-form')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                  className="button-primary"
                >
                  <Pencil size={17} />
                  Escribir reseña
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 py-14 lg:grid-cols-[1fr_440px]">
          <div>
            <p className="eyebrow">Sobre el juego</p>

            <h2 className="section-title">
              Descubre todos los detalles
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
              Explora este videojuego y comparte tu experiencia con
              la comunidad de CritiQuest. Las puntuaciones y opiniones
              que aparecen a continuación son aportadas por usuarios
              de la plataforma.
            </p>
          </div>

          <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/50 to-[#12131b] p-6">
            <div className="flex items-center gap-5 border-b border-white/8 pb-5">
              <div className="grid size-20 place-items-center rounded-2xl bg-violet-500 text-3xl font-black shadow-lg shadow-violet-500/25">
                <Star size={32} />
              </div>

              <div>
                <p className="text-sm text-zinc-400">
                  Puntuación CritiQuest
                </p>

                <p className="text-3xl font-black">
                  {reviews.length > 0
                    ? overallAverage.toFixed(1)
                    : '—'}
                  <span className="ml-1 text-sm font-normal text-zinc-500">
                    / 10
                  </span>
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {reviews.length === 0
                    ? 'Aún no hay reseñas'
                    : `${reviews.length} ${
                        reviews.length === 1 ? 'reseña' : 'reseñas'
                      } de la comunidad`}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {ratingLabels.map(([key, label]) => {
                const value = categoryAverages[key]

                return (
                  <div key={key}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-zinc-400">{label}</span>
                      <strong>
                        {reviews.length > 0 ? value.toFixed(1) : '—'}
                      </strong>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{
                          width: `${reviews.length > 0 ? value * 10 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <section className="border-t border-white/8 pt-14">
          <div>
            <p className="eyebrow">Opiniones auténticas</p>

            <h2 className="section-title">
              Reseñas de la comunidad
            </h2>
          </div>

          {reviewMessage && (
            <p className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
              {reviewMessage}
            </p>
          )}

          {reviewError && (
            <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {reviewError}
            </p>
          )}

          {reviewsLoading ? (
            <div className="mt-7 rounded-2xl border border-white/8 bg-[#101117] p-10 text-center text-zinc-400">
              Cargando reseñas...
            </div>
          ) : reviews.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-white/8 bg-[#101117] p-10 text-center">
              <p className="text-zinc-400">
                Todavía no hay reseñas para este videojuego.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                ¡Sé uno de los primeros en compartir tu opinión!
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              {reviews.map((review) => {
                const average = getReviewAverage(review.ratings)
                const isOwnReview = user?.id === review.user._id

                return (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-white/8 bg-[#101117] p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">
                          {review.user.username}
                          {isOwnReview && (
                            <span className="ml-2 text-xs font-normal text-violet-400">
                              (Tú)
                            </span>
                          )}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            'es-CO',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-violet-500/10 px-3 py-2 text-violet-300">
                        <Star size={17} fill="currentColor" />
                        <strong>{average.toFixed(1)}</strong>
                        <span className="text-xs text-violet-300/70">
                          / 10
                        </span>
                      </div>
                    </div>

                    <p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-300">
                      {review.comment}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {ratingLabels.map(([key, label]) => (
                        <div
                          key={key}
                          className="rounded-xl bg-white/5 p-3"
                        >
                          <p className="text-xs text-zinc-500">
                            {label}
                          </p>
                          <p className="mt-1 font-bold text-white">
                            {review.ratings[key]}/10
                          </p>
                        </div>
                      ))}
                    </div>

                    {isOwnReview && (
                      <div className="mt-5 flex gap-3 border-t border-white/8 pt-4">
                        <button
                          type="button"
                          onClick={() => startEditing(review)}
                          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteReview(review._id)}
                          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={15} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {user && (!ownReview || editingReviewId) && (
            <div
              id="review-form"
              className="mt-10 rounded-2xl border border-violet-400/20 bg-[#101117] p-6 sm:p-8"
            >
              <div className="mb-6">
                <p className="eyebrow">
                  {editingReviewId ? 'Actualizar opinión' : 'Tu opinión'}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {editingReviewId
                    ? 'Edita tu reseña'
                    : 'Comparte tu experiencia'}
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Califica cada aspecto del videojuego del 1 al 10 y
                  cuéntale a la comunidad qué te pareció.
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {ratingLabels.map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-2 block text-sm text-zinc-400">
                        {label}
                      </span>

                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={ratings[key]}
                        onChange={(event) =>
                          handleRatingChange(
                            key,
                            Number(event.target.value)
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-[#191a23] px-4 py-3 text-white outline-none focus:border-violet-500"
                      />
                    </label>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="mb-2 block text-sm text-zinc-400"
                  >
                    Tu comentario
                  </label>

                  <textarea
                    id="review-comment"
                    required
                    minLength={1}
                    maxLength={2000}
                    rows={5}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="¿Qué te pareció este videojuego?"
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#191a23] px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
                  />

                  <p className="mt-1 text-right text-xs text-zinc-500">
                    {comment.length}/2000 caracteres
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={17} />
                    {submitting
                      ? 'Guardando...'
                      : editingReviewId
                        ? 'Guardar cambios'
                        : 'Publicar reseña'}
                  </button>

                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      className="button-secondary"
                    >
                      <X size={17} />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {!user && (
            <div className="mt-7 rounded-2xl border border-white/8 bg-[#101117] p-7 text-center">
              <p className="text-zinc-300">
                ¿Quieres compartir tu opinión?
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Inicia sesión para publicar y gestionar tus propias reseñas.
              </p>
            </div>
          )}

          {user && ownReview && !editingReviewId && (
            <p className="mt-7 text-center text-sm text-zinc-500">
              Ya has publicado una reseña para este videojuego. Puedes
              editarla o eliminarla desde tu publicación.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
