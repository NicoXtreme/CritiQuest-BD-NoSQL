
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { api } from '../services/api'
import type {
  FavoriteItem,
  FavoritesResponse,
  Game,
  User,
} from '../types'

const SESSION_KEY = 'critiquest_session'

type AppContextValue = {
  user: User | null
  favorites: string[]
  favoriteGames: Game[]
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  toggleFavorite: (game: Game) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

// Convierte el videojuego almacenado en MongoDB
// al formato que utiliza actualmente el frontend.
function mapFavoriteGame(favorite: FavoriteItem): Game {
  const game = favorite.game

  return {
    id: String(game.rawgId),
    mongoId: game._id,
    title: game.name,
    releaseDate: game.released ?? '',
    genres: game.genres ?? [],
    platforms: game.platforms ?? [],
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
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([])
  const [isInitializing, setIsInitializing] = useState(true)

  // Consulta los favoritos del usuario autenticado.
  const loadFavorites = useCallback(async (token: string) => {
    try {
      const response = await api.favorites<FavoritesResponse>(token)

      const validFavorites = response.favorites.filter(
        (favorite) => favorite.game != null,
      )

      setFavorites(
        validFavorites.map((favorite) => favorite.game._id),
      )

      setFavoriteGames(
        validFavorites.map(mapFavoriteGame),
      )
    } catch (error) {
      console.error('No fue posible cargar los favoritos:', error)
      setFavorites([])
      setFavoriteGames([])
    }
  }, [])

  // Recupera la sesión cuando se recarga la aplicación.
  useEffect(() => {
    const initializeSession = async () => {
      const storedSession = localStorage.getItem(SESSION_KEY)

      if (!storedSession) {
        setIsInitializing(false)
        return
      }

      try {
        const session = JSON.parse(storedSession)

        if (!session.token) {
          throw new Error('Sesión inválida')
        }

        const response = await api.me(session.token)

        setUser({
          id: response.user.id,
          name: response.user.username,
          email: response.user.email,
          token: session.token,
        })

        await loadFavorites(session.token)
      } catch {
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
        setFavorites([])
        setFavoriteGames([])
      } finally {
        setIsInitializing(false)
      }
    }

    void initializeSession()
  }, [loadFavorites])

  const saveSession = (
    token: string,
    authenticatedUser: {
      id: string
      username: string
      email: string
    },
  ) => {
    const nextUser: User = {
      id: authenticatedUser.id,
      name: authenticatedUser.username,
      email: authenticatedUser.email,
      token,
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ token }))
    setUser(nextUser)
  }

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password })

    saveSession(response.token, response.user)
    await loadFavorites(response.token)
  }

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const response = await api.register({
      username: name,
      email,
      password,
    })

    saveSession(response.token, response.user)
    await loadFavorites(response.token)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setFavorites([])
    setFavoriteGames([])
  }

  // Agrega o elimina un favorito utilizando el ID de MongoDB.
  const toggleFavorite = useCallback(
    async (game: Game) => {
      if (!user || !game.mongoId) {
        return
      }

      const mongoGameId = game.mongoId
      const isFavorite = favorites.includes(mongoGameId)

      if (isFavorite) {
        await api.deleteFavorite(mongoGameId, user.token)

        setFavorites((current) =>
          current.filter((id) => id !== mongoGameId),
        )

        setFavoriteGames((current) =>
          current.filter((item) => item.mongoId !== mongoGameId),
        )
      } else {
        await api.addFavorite(mongoGameId, user.token)

        setFavorites((current) =>
          current.includes(mongoGameId)
            ? current
            : [...current, mongoGameId],
        )

        setFavoriteGames((current) =>
          current.some((item) => item.mongoId === mongoGameId)
            ? current
            : [...current, game],
        )
      }
    },
    [user, favorites],
  )

  const value = useMemo(
    () => ({
      user,
      favorites,
      favoriteGames,
      isInitializing,
      login,
      register,
      logout,
      toggleFavorite,
    }),
    [
      user,
      favorites,
      favoriteGames,
      isInitializing,
      toggleFavorite,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp debe utilizarse dentro de AppProvider')
  }

  return context
}
