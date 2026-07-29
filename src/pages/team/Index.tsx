import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hook/useToast'
import { usersApi, uploadsApi, type UserResponse } from '../../lib/api'
import SendNotificationModal from '../../components/notifications/SendNotificationModal'
import ImageUploader from '../../components/ui/ImageUploader'
import { usePageTitle } from '../../hook/usePageTitle'

// ── Role config ───────────────────────────────────────────
const ROLE_CONFIG: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
  ADMIN:  { gradient: 'from-rose-500 to-pink-600',     bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/30' },
  AUTHOR: { gradient: 'from-violet-500 to-indigo-600', bg: 'bg-violet-500/15',  text: 'text-violet-300',  border: 'border-violet-500/30' },
  USER:   { gradient: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
}

const ROLE_STATS_GRADIENT: Record<string, string> = {
  ADMIN:  'from-rose-500/20 to-pink-600/10 border-rose-500/20',
  AUTHOR: 'from-violet-500/20 to-indigo-600/10 border-violet-500/20',
  USER:   'from-emerald-500/20 to-teal-600/10 border-emerald-500/20',
}

// ── Shared dark input class ───────────────────────────────
const inputCls = 'w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 hover:border-slate-600 transition-all duration-200'

// ── Initials helper ───────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── User Modal ────────────────────────────────────────────
interface UserModalProps {
  user?: UserResponse
  onClose: () => void
  onSaved: () => void
}

function UserModal({ user: editUser, onClose, onSaved }: UserModalProps) {
  const { success: toastSuccess, error: toastError } = useToast()
  const [name, setName] = useState(editUser?.name ?? '')
  const [email, setEmail] = useState(editUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState(editUser?.phone ?? '')
  const [position, setPosition] = useState(editUser?.position ?? '')
  const [type, setType] = useState<string>(editUser?.type ?? 'USER')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(editUser?.avatar)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isSubmitting = useRef(false)

  useEffect(() => { setAvatarUrl(editUser?.avatar) }, [editUser?.avatar])

  const handleAvatarUpload = async (file: File, onProgress: (pct: number) => void): Promise<string> => {
    try {
      onProgress(20)
      let result
      if (avatarUrl) {
        result = await uploadsApi.replace(file, avatarUrl, 'avatars')
      } else {
        result = await uploadsApi.upload(file, 'avatars')
      }
      onProgress(100)
      setAvatarUrl(result.url)
      return result.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload avatar.'
      toastError('Upload Failed', msg)
      throw err
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting.current) return
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      toastError('Validation Error', 'Name and email are required.')
      return
    }
    isSubmitting.current = true
    setSaving(true); setError(null)
    try {
      if (editUser) {
        await usersApi.update(editUser.id, { name, email, password: password || undefined, phone, position, type: type as UserResponse['type'], avatar: avatarUrl })
        toastSuccess('User Updated', `User ${name} updated successfully.`)
      } else {
        if (!password) {
          setError('Password is required for new users.')
          toastError('Validation Error', 'Password is required for new users.')
          setSaving(false); isSubmitting.current = false; return
        }
        await usersApi.create({ name, email, password, phone, position, type: type as UserResponse['type'], avatar: avatarUrl })
        toastSuccess('User Created', `User ${name} created successfully.`)
      }
      onSaved(); onClose()
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Failed to save user'
      setError(errMsg)
      toastError('Failed to save user', errMsg)
    } finally {
      setSaving(false); isSubmitting.current = false
    }
  }

  const initials = name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  const roleConf = ROLE_CONFIG[type] ?? ROLE_CONFIG.USER

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editUser ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'} />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">{editUser ? 'Edit User' : 'Create User'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Avatar */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Profile Avatar</label>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || 'Avatar'} className="h-16 w-16 rounded-xl object-cover border-2 border-slate-600 shadow-sm" />
                ) : (
                  <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${roleConf.gradient} flex items-center justify-center font-bold text-lg text-white`}>
                    {initials}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <ImageUploader value={avatarUrl} onChange={(val) => setAvatarUrl(val)} onUpload={handleAvatarUpload} heightClass="h-20" />
              </div>
              {avatarUrl && (
                <button type="button" onClick={() => setAvatarUrl(undefined)} className="text-xs text-red-400 hover:text-red-300 font-semibold shrink-0 transition-colors">
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              {editUser ? 'New Password (blank = keep current)' : 'Password *'}
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Developer" className={inputCls} />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['USER', 'AUTHOR', 'ADMIN'] as const).map((r) => {
                const rc = ROLE_CONFIG[r]
                const selected = type === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setType(r)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      selected
                        ? `${rc.bg} ${rc.border} ${rc.text} shadow-sm`
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="relative px-5 py-2.5 rounded-xl font-semibold text-white text-sm overflow-hidden group disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                {saving && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                {saving ? 'Saving…' : editUser ? 'Update User' : 'Create User'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Teams/Users Page ─────────────────────────────────
export default function Teams() {
  usePageTitle('Team Users')
  const { isAdmin } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<UserResponse | undefined>(undefined)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [notifModalUser, setNotifModalUser] = useState<{ show: boolean; userId?: number }>({ show: false })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await usersApi.list()
      setUsers(data)
    } catch (e: unknown) {
      toast.error('Failed to load users', e instanceof Error ? e.message : undefined)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isAdmin()) loadUsers()
    else setLoading(false)
  }, [isAdmin, loadUsers])

  async function handleDelete(id: number) {
    try {
      await usersApi.delete(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setDeleteConfirm(null)
      toast.success('User deleted', 'User has been deleted successfully.')
    } catch (e: unknown) {
      toast.error('Failed to delete user', e instanceof Error ? e.message : undefined)
    }
  }

  // Grouped counts
  const grouped: Record<string, UserResponse[]> = { ADMIN: [], AUTHOR: [], USER: [] }
  users.forEach((u) => { (grouped[u.type] ??= []).push(u) })

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.type === roleFilter
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.position ?? '').toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  // ── Access denied ─────────────────────────────────────
  if (!isAdmin()) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-700/60 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-slate-400 mt-2">User management is restricted to administrators.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800 p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 blur-xl" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/80 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Admin panel
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Users</h1>
            <p className="text-white/60 text-sm mt-1">Manage all {users.length} registered member{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setNotifModalUser({ show: true })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-medium hover:bg-white/25 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Broadcast
            </button>
            <button
              onClick={() => { setEditUser(undefined); setShowModal(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* ── Role Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {(['ADMIN', 'AUTHOR', 'USER'] as const).map((role) => {
          const rc = ROLE_CONFIG[role]
          const rsg = ROLE_STATS_GRADIENT[role]
          const count = grouped[role]?.length ?? 0
          return (
            <button
              key={role}
              onClick={() => setRoleFilter((prev) => prev === role ? 'ALL' : role)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${rsg} ${roleFilter === role ? 'ring-2 ring-violet-500/50' : ''}`}
            >
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${rc.gradient} opacity-10 blur-xl`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center mb-3 shadow-md`}>
                  <span className="text-xs font-extrabold text-white">{role[0]}</span>
                </div>
                <p className="text-3xl font-extrabold text-white">{count}</p>
                <p className={`text-xs font-semibold mt-1 ${rc.text}`}>
                  {role === 'ADMIN' ? 'Admins' : role === 'AUTHOR' ? 'Authors' : 'Users'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or position…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ADMIN', 'AUTHOR', 'USER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                roleFilter === r
                  ? r === 'ALL'
                    ? 'bg-slate-600 text-white border border-slate-500'
                    : `${ROLE_CONFIG[r]?.bg ?? ''} ${ROLE_CONFIG[r]?.text ?? ''} border ${ROLE_CONFIG[r]?.border ?? ''}`
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── User Table ── */}
      {loading ? (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-16 rounded-xl bg-slate-700/50 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-12 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/60 flex items-center justify-center">
            <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold">No users found</p>
          <p className="text-slate-400 text-sm">{search ? 'Try a different search term or clear the filter.' : 'No users registered yet.'}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['User', 'Role', 'Contact', 'Position', 'Status', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/40 ${i === 5 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filteredUsers.map((u) => {
                  const rc = ROLE_CONFIG[u.type] ?? ROLE_CONFIG.USER
                  return (
                    <tr key={u.id} className="group hover:bg-slate-700/30 transition-colors duration-150">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-xl object-cover shrink-0 ring-2 ring-slate-600/50" />
                          ) : (
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shrink-0 shadow-md`}>
                              <span className="text-xs font-bold text-white">{getInitials(u.name)}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">{u.name}</p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${rc.bg} ${rc.text} ${rc.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {u.type}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {u.phone || <span className="text-slate-600">—</span>}
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4 text-slate-400 text-xs max-w-[140px]">
                        <span className="truncate block">{u.position || <span className="text-slate-600">—</span>}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          u.emailVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-500 border-slate-600/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.emailVerified ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          {u.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setNotifModalUser({ show: true, userId: u.id })}
                            title={`Send notification to ${u.name}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setEditUser(u); setShowModal(true) }}
                            title="Edit user"
                            className="p-2 rounded-lg text-slate-500 hover:text-sky-300 hover:bg-sky-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(u.id)}
                            title="Delete user"
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-slate-700/50 bg-slate-900/30 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-400">{filteredUsers.length}</span> of <span className="font-semibold text-slate-400">{users.length}</span> users
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {notifModalUser.show && (
        <SendNotificationModal
          defaultUserId={notifModalUser.userId}
          onClose={() => setNotifModalUser({ show: false })}
        />
      )}

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(undefined) }}
          onSaved={loadUsers}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/60 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete User?</h3>
                <p className="text-slate-400 text-sm mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
