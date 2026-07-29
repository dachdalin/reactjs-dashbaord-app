import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hook/useToast'
import { usersApi, uploadsApi } from '../../lib/api'
import ImageUploader from '../../components/ui/ImageUploader'
import { usePageTitle } from '../../hook/usePageTitle'

// ── Role config ───────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; gradient: string; bg: string; text: string }> = {
  ADMIN:  { label: 'Admin',  gradient: 'from-rose-500 to-pink-600',    bg: 'bg-rose-500/15 border-rose-500/25',   text: 'text-rose-300' },
  AUTHOR: { label: 'Author', gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500/15 border-violet-500/25', text: 'text-violet-300' },
  USER:   { label: 'User',   gradient: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-500/15 border-emerald-500/25', text: 'text-emerald-300' },
}

// ── Eye toggle icon ───────────────────────────────────────
const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: '', bar: '' }
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  const map: Record<number, { label: string; bar: string }> = {
    1: { label: 'Weak', bar: 'bg-red-500' },
    2: { label: 'Fair', bar: 'bg-amber-500' },
    3: { label: 'Good', bar: 'bg-sky-400' },
    4: { label: 'Strong', bar: 'bg-emerald-500' },
  }
  return { score: s, ...(map[s] ?? { label: '', bar: '' }) }
}

// ── Shared dark input class ────────────────────────────────
const inputCls = 'w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 hover:border-slate-600 transition-all duration-200'

export default function ProfilePage() {
  usePageTitle('My Profile')
  const { user, setUser, isAdmin } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [position, setPosition] = useState(user?.position ?? '')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const strength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword === confirmPassword || confirmPassword === ''

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ?? '')
      setPosition(user.position ?? '')
    }
  }, [user])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setMsg(null)
    try {
      const updated = await usersApi.update(user.id, { name, email, phone, position })
      setUser(updated)
      setMsg({ type: 'success', text: 'Profile updated successfully!' })
      toastSuccess('Profile Updated', 'Your profile information has been saved.')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update profile.'
      setMsg({ type: 'error', text: errMsg })
      toastError('Failed to update profile', errMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File, onProgress: (percent: number) => void) => {
    if (!user) throw new Error('User not found')
    try {
      onProgress(20)
      let result
      if (user.avatar) {
        result = await uploadsApi.replace(file, user.avatar, 'avatars')
      } else {
        result = await uploadsApi.upload(file, 'avatars')
      }
      onProgress(80)
      const updated = await usersApi.update(user.id, { avatar: result.url })
      onProgress(100)
      setUser(updated)
      toastSuccess('Avatar Updated', 'Your profile picture has been updated.')
      return result.url
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to upload avatar.'
      toastError('Failed to upload avatar', errMsg)
      throw err
    }
  }

  const handleAvatarRemove = async () => {
    if (!user) return
    setMsg(null)
    try {
      const updated = await usersApi.update(user.id, { avatar: undefined })
      setUser(updated)
      toastSuccess('Avatar Removed', 'Your profile picture has been removed.')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to remove avatar.'
      toastError('Failed to remove avatar', errMsg)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' })
      toastError('Validation Error', 'New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters long.' })
      toastError('Validation Error', 'Password must be at least 8 characters long.')
      return
    }
    setPwdMsg(null)
    try {
      const updated = await usersApi.update(user.id, { name, email, password: newPassword })
      setUser(updated)
      setNewPassword('')
      setConfirmPassword('')
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' })
      toastSuccess('Password Changed', 'Your account password has been updated.')
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to change password.'
      setPwdMsg({ type: 'error', text: errMsg })
      toastError('Failed to change password', errMsg)
    }
  }

  const role = user?.type ?? 'USER'
  const roleConf = ROLE_CONFIG[role] ?? ROLE_CONFIG.USER
  const initials = (user?.name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const privileges = [
    { label: 'Dashboard Access',  allowed: true },
    { label: 'Manage Own Posts',  allowed: isAdmin() || user?.type === 'AUTHOR' },
    { label: 'Create Tags',        allowed: isAdmin() || user?.type === 'AUTHOR' },
    { label: 'Manage All Users',   allowed: isAdmin() },
    { label: 'System Settings',    allowed: isAdmin() },
  ]

  return (
    <div className="space-y-6 pb-12">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-800 p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl" />
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${roleConf.gradient} flex items-center justify-center ring-4 ring-white/20 shadow-xl`}>
                <span className="text-2xl font-extrabold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>

          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-2 ${roleConf.bg} ${roleConf.text}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {roleConf.label}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{user?.name ?? 'Your Profile'}</h1>
            <p className="text-white/60 text-sm mt-0.5 truncate">{user?.email}</p>
            {user?.position && <p className="text-white/50 text-xs mt-1">{user.position}</p>}
          </div>
        </div>
      </div>

      {/* ── Body Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Avatar upload */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Profile Picture</h3>
                <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click to browse. Max 5 MB.</p>
              </div>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <ImageUploader
              value={user?.avatar}
              onChange={(val) => { if (!val && user?.avatar) handleAvatarRemove() }}
              onUpload={handleAvatarUpload}
              heightClass="h-44 sm:h-52"
            />
          </div>

          {/* Personal info */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Personal Information</h2>
                <p className="text-xs text-slate-400">Update your name, email, phone and position</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {msg && (
                <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm border ${
                  msg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={msg.type === 'success'
                        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                  </svg>
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Display Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+855 12 345 678" className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Position / Title</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Software Engineer" className={inputCls} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="relative px-6 py-2.5 rounded-xl font-semibold text-white text-sm overflow-hidden group disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    {saving && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                    {saving ? 'Saving…' : 'Save Profile'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Security &amp; Password</h2>
                <p className="text-xs text-slate-400">Choose a strong password to protect your account</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {pwdMsg && (
                <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm border ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}>
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={pwdMsg.type === 'success'
                        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} />
                  </svg>
                  {pwdMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
                  <div className="relative group">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputCls + ' pr-10'}
                    />
                    <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon open={showNew} />
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.bar : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-xs font-medium ${strength.score === 1 ? 'text-red-400' : strength.score === 2 ? 'text-amber-400' : strength.score === 3 ? 'text-sky-400' : 'text-emerald-400'}`}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</label>
                  <div className="relative group">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${inputCls} pr-10 ${!passwordsMatch && confirmPassword ? 'border-red-500/60 focus:ring-red-500/30' : ''}`}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {!passwordsMatch && confirmPassword && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Password requirements */}
              <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-700/40">
                {[
                  { label: '8+ characters', ok: newPassword.length >= 8 },
                  { label: 'Uppercase letter', ok: /[A-Z]/.test(newPassword) },
                  { label: 'Number', ok: /[0-9]/.test(newPassword) },
                  { label: 'Special character', ok: /[^A-Za-z0-9]/.test(newPassword) },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-200 ${ok ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      {ok && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-xs ${ok ? 'text-emerald-400' : 'text-slate-500'}`}>{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl border border-slate-600/60 bg-slate-700/60 text-slate-200 font-medium text-sm hover:bg-slate-700 hover:border-slate-500 transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Account overview */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account Information
            </h3>

            <div className="space-y-3 text-sm">
              {[
                { label: 'User ID', value: <span className="font-mono text-violet-300 font-semibold">#{user?.id}</span> },
                { label: 'Role',
                  value: (
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${roleConf.bg} ${roleConf.text}`}>
                      {roleConf.label}
                    </span>
                  )
                },
                { label: 'Status',
                  value: (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  )
                },
                { label: 'Email',
                  value: (
                    <span className="text-sky-400 font-medium flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      Verified
                    </span>
                  )
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privileges */}
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 backdrop-blur-sm">
            <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Account Privileges
            </h3>

            <ul className="space-y-2.5">
              {privileges.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    item.allowed
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-slate-700/60 border border-slate-600/40'
                  }`}>
                    <svg className={`w-3 h-3 ${item.allowed ? 'text-emerald-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={item.allowed ? 3 : 2}
                        d={item.allowed ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                    </svg>
                  </div>
                  <span className={`text-sm ${item.allowed ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/20 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-300">Security Tip</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Use a unique password with uppercase, numbers, and special characters to keep your account secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
