import { useState } from 'react'
import { Gamepad2, Heart, Menu, Search, UserRound, X } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'

const links = [
  ['/', 'Inicio'],
  ['/explorar', 'Explorar'],
  ['/clasificacion', 'Clasificación'],
  ['/favoritos', 'Favoritos'],
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user } = useApp()
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(`/explorar?q=${encodeURIComponent(search)}`)
    setOpen(false)
  }
  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#08090d]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-5 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 font-black tracking-tight text-xl">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-600/25"><Gamepad2 size={20} /></span>
            Criti<span className="text-violet-400">Quest</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-lg px-3.5 py-2 text-sm font-medium transition ${isActive ? 'bg-white/8 text-white' : 'text-zinc-400 hover:text-white'}`}>{label}</NavLink>)}
          </nav>
          <form onSubmit={submit} className="ml-auto hidden w-full max-w-xs md:block">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-white/8 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:bg-white/7" placeholder="Buscar videojuegos..." />
            </label>
          </form>
          <Link to={user ? '/perfil' : '/acceso'} className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold transition hover:bg-white/10 sm:flex">
            <UserRound size={17} /> {user ? user.name : 'Iniciar sesión'}
          </Link>
          <button onClick={() => setOpen(!open)} className="ml-auto rounded-lg p-2 lg:hidden" aria-label="Abrir menú">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-white/8 bg-[#0d0e14] p-5 lg:hidden">
          <form onSubmit={submit} className="mb-4"><input value={search} onChange={(e) => setSearch(e.target.value)} className="field" placeholder="Buscar videojuegos..." /></form>
          <nav className="grid gap-1">{links.map(([to, label]) => <NavLink onClick={() => setOpen(false)} key={to} to={to} className="rounded-lg px-4 py-3 text-zinc-300 hover:bg-white/5">{label}</NavLink>)}<NavLink onClick={() => setOpen(false)} to={user ? '/perfil' : '/acceso'} className="rounded-lg px-4 py-3 text-violet-300">{user ? 'Mi perfil' : 'Iniciar sesión'}</NavLink></nav>
        </div>}
      </header>
      <main className="pt-18"><Outlet /></main>
      <footer className="border-t border-white/8 bg-[#06070a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-bold text-zinc-300"><Gamepad2 className="text-violet-400" size={20} /> CritiQuest</div>
          <p>Tu voz. Tus juegos. Tu comunidad.</p>
          <div className="flex gap-5"><Link to="/explorar">Catálogo</Link><Link to="/clasificacion">Clasificación</Link><Heart size={17} /></div>
        </div>
      </footer>
    </div>
  )
}
