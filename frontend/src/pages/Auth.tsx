
import { Eye, Gamepad2, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useApp } from '../context/AppContext'
import { ApiError } from '../services/api'

export function Auth({ registerMode = false }: { registerMode?: boolean }) {
  const navigate = useNavigate()
  const { login, register } = useApp()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const translateError = (message: string) => {
    const translations: Record<string, string> = {
      'Invalid email or password': 'El correo o la contraseña son incorrectos.',
      'An account with this email already exists': 'Ya existe una cuenta registrada con este correo.',
      'Username must have between 3 and 30 characters': 'El nombre de usuario debe tener entre 3 y 30 caracteres.',
      'Please provide a valid email': 'Introduce un correo electrónico válido.',
      'Password must have at least 8 characters': 'La contraseña debe tener al menos 8 caracteres.',
      'Validation failed': 'Revisa los datos introducidos.',
    }

    return translations[message] || message
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Introduce un correo electrónico válido.')
      return
    }

    if (password.length < (registerMode ? 8 : 1)) {
      setError(registerMode
        ? 'La contraseña debe tener al menos 8 caracteres.'
        : 'Introduce tu contraseña.')
      return
    }

    if (registerMode && (name.trim().length < 3 || name.trim().length > 30)) {
      setError('El nombre de usuario debe tener entre 3 y 30 caracteres.')
      return
    }

    setLoading(true)

    try {
      if (registerMode) {
        await register(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }

      navigate('/perfil')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(translateError(err.message))
      } else {
        setError('Ocurrió un error inesperado. Inténtalo nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/images/hero-critiquest.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-violet-950/35 to-black/20" />

        <div className="absolute inset-x-0 bottom-0 p-12">
          <Gamepad2 className="mb-5 text-violet-300" size={40} />

          <blockquote className="max-w-xl text-3xl font-bold leading-tight">
            “Cada partida cuenta una historia. En CritiQuest, tu opinión le da valor.”
          </blockquote>

          <p className="mt-4 text-sm text-zinc-400">
            Únete a miles de jugadores apasionados.
          </p>
        </div>
      </div>

      <div className="grid place-items-center px-5 py-16">
        <form onSubmit={submit} className="w-full max-w-md">
          <p className="eyebrow">
            {registerMode ? 'Empieza tu aventura' : 'Qué bueno verte de nuevo'}
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            {registerMode ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h1>

          <p className="mt-3 text-zinc-500">
            {registerMode
              ? 'Forma parte de la comunidad y comparte tus experiencias.'
              : 'Accede a tus reseñas, favoritos y recomendaciones.'}
          </p>

          <div className="mt-8 space-y-5">
            {registerMode && (
              <label className="form-label">
                Nombre de usuario

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field mt-2"
                  placeholder="Tu alias de jugador"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </label>
            )}

            <label className="form-label">
              Correo electrónico

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field mt-2"
                placeholder="tu@correo.com"
                required
              />
            </label>

            <label className="form-label">
              Contraseña

              <div className="relative mt-2">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-11"
                  placeholder={registerMode ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                  minLength={registerMode ? 8 : undefined}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Eye size={18} />
                </button>
              </div>
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/8 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Procesando...'
              : registerMode
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {registerMode
              ? '¿Ya tienes una cuenta?'
              : '¿Todavía no tienes cuenta?'}{' '}

            <Link
              className="font-semibold text-violet-400"
              to={registerMode ? '/acceso' : '/registro'}
            >
              {registerMode ? 'Inicia sesión' : 'Regístrate gratis'}
            </Link>
          </p>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <ShieldCheck size={14} />
            Tus datos se mantienen protegidos.
          </p>
        </form>
      </div>
    </div>
  )
}
