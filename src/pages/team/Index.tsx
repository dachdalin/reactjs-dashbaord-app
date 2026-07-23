import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { usersApi, type UserResponse } from "../../lib/api";
import SendNotificationModal from "../../components/notifications/SendNotificationModal";

// ── User Modal ────────────────────────────────────────────
interface UserModalProps {
  user?: UserResponse;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ user: editUser, onClose, onSaved }: UserModalProps) {
  const [name, setName] = useState(editUser?.name ?? "");
  const [email, setEmail] = useState(editUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(editUser?.phone ?? "");
  const [position, setPosition] = useState(editUser?.position ?? "");
  const [type, setType] = useState<string>(editUser?.type ?? "USER");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    setSaving(true); setError(null);
    try {
      if (editUser) {
        await usersApi.update(editUser.id, { name, email, password: password || undefined, phone, position, type: type as UserResponse["type"] });
      } else {
        if (!password) { setError("Password is required for new users."); setSaving(false); return; }
        await usersApi.create({ name, email, password, phone, position, type: type as UserResponse["type"] });
      }
      onSaved(); onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save user");
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-950">{editUser ? "Edit User" : "Create User"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-50 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{editUser ? "New Password (leave blank to keep)" : "Password *"}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                placeholder="e.g. Developer" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40">
              <option value="USER">USER</option>
              <option value="AUTHOR">AUTHOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? "Saving..." : editUser ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role badge helpers ────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-slate-100 text-slate-950 border-sky-500/30",
  AUTHOR: "bg-slate-100 text-slate-950 border-sky-500/30",
  USER: "bg-slate-100 text-slate-950 border-sky-500/30",
};

// ── Main Teams/Users Page ─────────────────────────────────
export default function Teams() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserResponse | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [notifModalUser, setNotifModalUser] = useState<{ show: boolean; userId?: number }>({ show: false });

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin()) loadUsers();
    else setLoading(false);
  }, [isAdmin]);

  async function handleDelete(id: number) {
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  // Group by role for visual clarity
  const grouped: Record<string, UserResponse[]> = { ADMIN: [], AUTHOR: [], USER: [] };
  users.forEach((u) => { (grouped[u.type] ??= []).push(u); });

  if (!isAdmin()) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Team</h1>
          <p className="text-slate-500 mt-1">User management is restricted to administrators.</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <svg className="h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-slate-500 text-lg font-medium">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Users</h1>
          <p className="text-slate-500 mt-1">Manage all registered users — {users.length} total.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotifModalUser({ show: true })}
            className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-sky-200/60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Push Notification
          </button>
          <button
            onClick={() => { setEditUser(undefined); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-sky-200/70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {(["ADMIN", "AUTHOR", "USER"] as const).map((role) => (
          <div key={role} className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${ROLE_COLORS[role]}`}>
              <span className="text-xs font-bold">{role[0]}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{grouped[role]?.length ?? 0}</p>
              <p className="text-xs text-slate-500">{role === "ADMIN" ? "Admins" : role === "AUTHOR" ? "Authors" : "Users"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 flex flex-col items-center text-center">
          <svg className="h-16 w-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-slate-500">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="group rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-200 transition-all p-4 flex items-center gap-4">
              {/* Avatar */}
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0">
                  <span className="text-slate-950 font-semibold">{getInitials(u.name)}</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-slate-950 font-medium truncate">{u.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.type]}`}>
                    {u.type}
                  </span>
                  {u.emailVerified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{u.email}</p>
                {u.position && <p className="text-xs text-slate-500 truncate">{u.position}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setNotifModalUser({ show: true, userId: u.id })}
                  title={`Send notification to ${u.name}`}
                  className="p-2 rounded-lg text-slate-700 hover:text-sky-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button
                  onClick={() => { setEditUser(u); setShowModal(true); }}
                  title="Edit user"
                  className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteConfirm(u.id)}
                  title="Delete user"
                  className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {notifModalUser.show && (
        <SendNotificationModal
          defaultUserId={notifModalUser.userId}
          onClose={() => setNotifModalUser({ show: false })}
        />
      )}

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(undefined); }}
          onSaved={loadUsers}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Delete User?</h3>
            <p className="text-slate-500 text-sm">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
