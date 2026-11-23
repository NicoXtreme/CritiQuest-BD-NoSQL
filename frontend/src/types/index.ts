
export type Game = {
  id: string
  mongoId?: string
  title: string
  releaseDate: string
  genres: string[]
  platforms: string[]
  score: number
  reviews: number
  image: string
  description: string
  ratings: {
    graficos: number
    jugabilidad: number
    historia: number
    sonido: number
  }
}

export type Review = {
  _id: string
  user: {
    _id: string
    username: string
  }
  game: string
  ratings: {
    graphics: number
    gameplay: number
    story: number
    sound: number
  }
  comment: string
  createdAt: string
  updatedAt: string
}

export type ReviewsResponse = {
  success: boolean
  count: number
  reviews: Review[]
}

export type ReviewMutationResponse = {
  success: boolean
  message: string
  review?: Review
}

export type User = {
  id: string
  name: string
  email: string
  token: string
}

export type AuthResponse = {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export type MeResponse = {
  success: boolean
  user: {
    id: string
    username: string
    email: string
  }
}

// Videojuego almacenado en MongoDB
export type FavoriteGameData = {
  _id: string
  rawgId: number
  name: string
  backgroundImage?: string | null
  released?: string | null
  genres: string[]
  platforms: string[]
}

// Elemento devuelto por GET /api/favorites
export type FavoriteItem = {
  _id: string
  user: string
  game: FavoriteGameData
}

export type FavoritesResponse = {
  success: boolean
  count: number
  favorites: FavoriteItem[]
}

// Videojuego recibido desde el catálogo de RAWG
export type RawgGame = {
  id: number
  name: string
  backgroundImage: string | null
  released: string | null
  genres: string[]
  platforms: string[]
}

// Respuesta de GET /api/games
export type GamesResponse = {
  success: boolean
  count: number
  page: number
  pageSize: number
  nextPage: number | null
  previousPage: number | null
  results: RawgGame[]
}

// Respuesta de GET /api/games/:id
export type GameDetailResponse = {
  success: boolean
  game: {
    _id: string
    rawgId: number
    name: string
    backgroundImage: string | null
    released: string | null
    genres: string[]
    platforms: string[]
  }
}