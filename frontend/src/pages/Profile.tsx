
import { useEffect, useState } from 'react'
import { Heart, LogOut, MessageSquareText, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { ReviewCard } from '../components/ReviewCard'
import { useApp } from '../context/AppContext'
import { api } from '../services/api'
import type { Review } from '../types'

type MyReviewCountResponse = {
  success: boolean
  count: number
}

type BackendReview = {
  _id: string
  user: {
    _id: string
    username: string
  }
  game: {
    _id: string
    name: string
    rawgId: number
    backgroundImage?: string
  }
  ratings: {
    graphics: number
    gameplay: number
    story: number
    sound: number
  }
  comment: string
  createdAt: string
}

type MyReviewsResponse = {
  success: boolean
  count: number
  reviews: BackendReview[]
}

export function Profile() {
  const { user, favorites, logout } = useApp()
  const navigate = useNavigate()

  const [reviewCount, setReviewCount] = useState<number | null>(null)
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setReviewsLoading(false)
      return
    }

    let cancelled = false

    api.myReviewCount<MyReviewCountResponse>(user.token)
      .then((response) => {
        if (!cancelled) {
          setReviewCount(response.count)
        }
      })
      .catch((error) => {
        console.error(
          'No fue posible obtener la cantidad de reseñas:',
          error,
        )
      })

    api.myReviews<MyReviewsResponse>(user.token)
      .then((response) => {
        if (cancelled) return

        const formattedReviews: Review[] = response.reviews.map((review) => {
          const { graphics, gameplay, story, sound } = review.ratings

          const averageScore =
            (graphics + gameplay + story + sound) / 4

          return {
            id: review._id,
            user: user.name,
            avatar: user.name[0].toUpperCase(),
            gameId: String(review.game.rawgId),
            score: Number(averageScore.toFixed(1)),
            comment: review.comment,
            date: new Date(review.createdAt).toLocaleDateString('es-CO'),
          }
        })

        setMyReviews(formattedReviews)
      })
      .catch((error) => {
        console.error(
          'No fue posible obtener las reseñas del usuario:',
          error,
        )
      })
      .finally(() => {
        if (!cancelled) {
          setReviewsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <UserRound size={36} />
          <h1>Inicia sesión para ver tu perfil</h1>
          <p>Accede a tus reseñas, favoritos y actividad.</p>
          <Link to="/acceso" className="button-primary mt-5">
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-violet-950/50 via-[#12131a] to-blue-950/30 p-7 md:p-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <span className="grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-blue-500 text-4xl font-black">
            {user.name[0].toUpperCase()}
          </span>

          <div className="flex-1">
            <p className="text-sm text-violet-300">
              Miembro de CritiQuest
            </p>
            <h1 className="mt-1 text-3xl font-black">
              {user.name}
            </h1>
            <p className="mt-1 text-zinc-500">
              {user.email}
            </p>
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="button-secondary"
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-5">
            <MessageSquareText className="mb-3 text-violet-400" />
            <strong className="text-2xl">
              {reviewCount === null ? '...' : reviewCount}
            </strong>
            <p className="text-sm text-zinc-500">
              reseñas publicadas
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 p-5">
            <Heart className="mb-3 text-blue-400" />
            <strong className="text-2xl">
              {favorites.length}
            </strong>
            <p className="text-sm text-zinc-500">
              videojuegos favoritos
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <p className="eyebrow">Tu actividad</p>
        <h2 className="section-title">Reseñas recientes</h2>

        {reviewsLoading ? (
          <p className="mt-6 text-sm text-zinc-500">
            Cargando tus reseñas...
          </p>
        ) : myReviews.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {myReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.035] p-6 text-center">
            <MessageSquareText
              size={30}
              className="mx-auto mb-3 text-zinc-500"
            />
            <p className="font-semibold">
              Todavía no has publicado reseñas
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Explora videojuegos y comparte tu opinión con la comunidad.
            </p>
            <Link
              to="/explorar"
              className="button-primary mt-5 inline-flex"
            >
              Explorar videojuegos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
