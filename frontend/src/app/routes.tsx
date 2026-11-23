import { createBrowserRouter } from 'react-router'
import { Layout } from '../components/Layout'
import { Auth } from '../pages/Auth'
import { Explore } from '../pages/Explore'
import { Favorites } from '../pages/Favorites'
import { GameDetail } from '../pages/GameDetail'
import { Home } from '../pages/Home'
import { NotFound } from '../pages/NotFound'
import { Profile } from '../pages/Profile'
import { Ranking } from '../pages/Ranking'

export const router = createBrowserRouter([{
  path: '/',
  Component: Layout,
  children: [
    { index: true, Component: Home },
    { path: 'explorar', Component: Explore },
    { path: 'juego/:id', Component: GameDetail },
    { path: 'clasificacion', Component: Ranking },
    { path: 'favoritos', Component: Favorites },
    { path: 'acceso', Component: Auth },
    { path: 'registro', element: <Auth registerMode /> },
    { path: 'perfil', Component: Profile },
    { path: '*', Component: NotFound },
  ],
}])
