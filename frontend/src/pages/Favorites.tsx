
import { Compass, Heart } from 'lucide-react'
import { Link } from 'react-router'
import { GameCard } from '../components/GameCard'
import { useApp } from '../context/AppContext'

export function Favorites() {
  const { favoriteGames, user, isInitializing } = useApp()

  return (
    <div className="page-shell">
      <div>
        <p className="eyebrow">Tu colección</p>

        <h1 className="page-title">
          Mis videojuegos favoritos
        </h1>

        <p className="page-intro">
          {user
            ? `${user.name}, aquí tienes los juegos que no quieres perder de vista.`
            : 'Inicia sesión para consultar y administrar tus videojuegos favoritos.'}
        </p>
      </div>

      {isInitializing ? (
        <div className="empty-state">
          <Heart size={36} />
          <h2>Cargando tu colección...</h2>
          <p>Estamos consultando tus videojuegos favoritos.</p>
        </div>
      ) : favoriteGames.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteGames.map((game) => (
            <GameCard key={game.mongoId} game={game} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={36} />

          <h2>Tu colección está esperando</h2>

          <p>
            {user
              ? 'Guarda los videojuegos que más te interesan para encontrarlos rápidamente.'
              : 'Inicia sesión para guardar tus videojuegos favoritos y consultarlos desde cualquier sesión.'}
          </p>

          <Link
            to={user ? '/explorar' : '/acceso'}
            className="button-primary mt-5"
          >
            <Compass size={18} />
            {user ? 'Explorar videojuegos' : 'Iniciar sesión'}
          </Link>
        </div>
      )}
    </div>
  )
}
