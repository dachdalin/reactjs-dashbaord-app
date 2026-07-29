import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

export default function SigninForm() {
  const { login, isPending } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string
    const err = await login(email, password)
    if (err) {
      setError(err)
    } else {
      navigate('/admin/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── Left panel – branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* animated gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-3/4 left-1/2 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '3s' }}
          />
        </div>

        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Dashboard</span>
          </div>

          {/* Centre content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Trusted by 10,000+ teams
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Welcome<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-sky-300">
                back.
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
              Your command center awaits. Sign in to manage your content, team, and analytics.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['Analytics', 'Team management', 'Content editor', 'Real-time data'].map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 text-xs"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-slate-300 text-sm leading-relaxed">
              "This dashboard transformed how our team collaborates. Everything is exactly where you need it."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400" />
              <div>
                <p className="text-white text-sm font-medium">Sarah Chen</p>
                <p className="text-slate-400 text-xs">Head of Product, Acme Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* subtle bg blobs */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-800/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">Dashboard</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Sign in</h2>
            <p className="text-slate-400 mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-fade-in">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="block text-sm font-medium text-slate-300">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-slate-600 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 hover:border-slate-600 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <input
                id="signin-remember"
                name="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500/30 focus:ring-offset-0 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="signin-remember" className="text-sm text-slate-400 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              id="signin-submit"
              type="submit"
              disabled={isPending}
              className="relative w-full py-3 px-6 rounded-xl font-semibold text-white text-sm overflow-hidden group disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-300 mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />
              <span className="relative flex items-center justify-center gap-2">
                {isPending && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isPending ? 'Signing in…' : 'Sign in'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-slate-950 text-slate-500 text-xs">or continue with</span>
              </div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm hover:bg-slate-700/60 hover:border-slate-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26 9.77A7.24 7.24 0 0112 4.75c1.74 0 3.32.63 4.55 1.65l3.4-3.4A12 12 0 0012 0C7.38 0 3.4 2.7 1.38 6.64l3.88 3.13z" />
                  <path fill="#34A853" d="M16.04 19.6A7.19 7.19 0 0112 20.75a7.24 7.24 0 01-6.72-4.54l-3.87 3.03A12 12 0 0012 24c3.24 0 6.3-1.22 8.6-3.37l-4.56-3.03z" />
                  <path fill="#4A90E2" d="M20.6 13.98c.1-.63.15-1.3.15-1.98s-.05-1.35-.16-1.98H12v3.96h4.82a4.1 4.1 0 01-1.78 2.7l4.56 3.03c2.66-2.45 4.2-6.1 4.2-7.73z" />
                  <path fill="#FBBC05" d="M5.28 14.21A7.29 7.29 0 014.75 12c0-.77.13-1.52.35-2.23L1.38 6.64A11.95 11.95 0 000 12c0 1.92.45 3.74 1.38 5.36l3.9-3.15z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm hover:bg-slate-700/60 hover:border-slate-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <a href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Create one
            </a>
          </p>

          {/* Terms */}
          <p className="mt-3 text-center text-slate-600 text-xs">
            By signing in, you agree to our{' '}
            <a href="#" className="hover:text-slate-400 transition-colors underline underline-offset-2">Terms</a>
            {' '}and{' '}
            <a href="#" className="hover:text-slate-400 transition-colors underline underline-offset-2">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
