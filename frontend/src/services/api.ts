
import type { AuthResponse, MeResponse } from '../types'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/$/, '')

type ApiOptions = RequestInit & {
  token?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options

  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new ApiError(
      'No fue posible conectar con el servidor. Verifica que el backend esté funcionando.',
      0,
    )
  }

  const responseText = await response.text()

  let data: any = null

  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new ApiError(
        'El servidor devolvió una respuesta no válida.',
        response.status,
      )
    }
  }

  if (!response.ok) {
    const validationMessage = data?.errors?.[0]?.msg

    throw new ApiError(
      validationMessage ||
        data?.message ||
        'No se pudo completar la solicitud.',
      response.status,
    )
  }

  return data as T
}

export const api = {
  register: (body: {
    username: string
    email: string
    password: string
  }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: {
    email: string
    password: string
  }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: (token: string) =>
    request<MeResponse>('/api/auth/me', { token }),

  games: <T>(query = '') =>
    request<T>(`/api/games${query}`),

  game: <T>(id: string) =>
    request<T>(`/api/games/${id}`),

  reviews: <T>(mongoGameId: string) =>
    request<T>(`/api/reviews/${mongoGameId}`),

  myReviewCount: <T>(token: string) =>
    request<T>('/api/reviews/mine/count', { token }),

  myReviews: <T>(token: string) =>
    request<T>('/api/reviews/mine', { token }),

  createReview: <T>(body: unknown, token: string) =>
    request<T>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),

  updateReview: <T>(id: string, body: unknown, token: string) =>
    request<T>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),

  deleteReview: (id: string, token: string) =>
    request(`/api/reviews/${id}`, {
      method: 'DELETE',
      token,
    }),

  favorites: <T>(token: string) =>
    request<T>('/api/favorites', { token }),

  addFavorite: <T>(mongoGameId: string, token: string) =>
    request<T>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ gameId: mongoGameId }),
      token,
    }),

  deleteFavorite: (mongoGameId: string, token: string) =>
    request(`/api/favorites/${mongoGameId}`, {
      method: 'DELETE',
      token,
    }),

  rankings: <T>() =>
    request<T>('/api/statistics/rankings'),

  homeData: <T>() =>
    request<T>('/api/statistics/home'),

  statistics: <T>(mongoGameId: string) =>
    request<T>(`/api/statistics/${mongoGameId}`),
}
