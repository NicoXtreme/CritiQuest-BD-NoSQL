import { Compass } from 'lucide-react'
import { Link } from 'react-router'

export function NotFound() {
  return <div className="page-shell"><div className="empty-state"><p className="text-6xl font-black text-violet-400">404</p><h1>Esta misión no existe</h1><p>La página que buscas se perdió en otro universo.</p><Link to="/" className="button-primary mt-5"><Compass size={18} /> Volver al inicio</Link></div></div>
}
