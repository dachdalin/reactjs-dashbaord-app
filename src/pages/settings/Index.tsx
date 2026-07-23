import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersApi, settingsApi, type SettingResponse } from "../../lib/api";

// ── Settings Page ─────────────────────────────────────────
export default function Settings() {
  const { user, isAdmin, setUser } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // App settings (admin only)
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
      setPosition(user.position ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin()) {
      setSettingsLoading(true);
      settingsApi.list()
        .then(setSettings)
        .catch(() => {})
        .finally(() => setSettingsLoading(false));
    }
  }, [isAdmin]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await usersApi.update(user.id, { name, email, phone, position });
      setUser(updated);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      setProfileMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleCreateSetting() {
    if (!newKey.trim() || !newValue.trim()) return;
    try {
      const s = await settingsApi.create(newKey.trim(), newValue.trim());
      setSettings((prev) => [...prev, s]);
      setNewKey("");
      setNewValue("");
    } catch {/* ignore */}
  }

  async function handleUpdateSetting(id: number) {
    try {
      const s = await settingsApi.update(id, editKey, editValue);
      setSettings((prev) => prev.map((x) => (x.id === id ? s : x)));
      setEditingId(null);
    } catch {/* ignore */}
  }

  async function handleDeleteSetting(id: number) {
    try {
      await settingsApi.delete(id);
      setSettings((prev) => prev.filter((x) => x.id !== id));
    } catch {/* ignore */}
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/60 mt-1">Manage your account preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile + Security + App Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Profile Settings ── */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-white/10 text-white border border-white/20" : "bg-white/10 border border-white/20 text-white"}`}>
                  {profileMsg.text}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Display Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="+1 234 567 890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Position / Job Title</label>
                <input value={position} onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                  placeholder="e.g. Software Engineer" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={profileSaving}
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Security Settings ── */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-white/60">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors">Enable</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-white font-medium">Change Password</p>
                  <p className="text-sm text-white/60">Update your account password</p>
                </div>
                <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">Update</button>
              </div>
            </div>
          </div>

          {/* ── App Settings (ADMIN only) ── */}
          {isAdmin() && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">App Settings</h2>

              {settingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                      {editingId === s.id ? (
                        <>
                          <input value={editKey} onChange={(e) => setEditKey(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                            placeholder="Key" />
                          <input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                            placeholder="Value" />
                          <button onClick={() => handleUpdateSetting(s.id)} className="px-3 py-2 rounded-lg bg-white text-black text-sm hover:bg-white/90 transition-colors">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors">Cancel</button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white font-mono truncate">{s.key}</p>
                            <p className="text-xs text-white/60 truncate font-mono">{s.value}</p>
                          </div>
                          <button onClick={() => { setEditingId(s.id); setEditKey(s.key); setEditValue(s.value); }}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteSetting(s.id)}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add new setting */}
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                    <input value={newKey} onChange={(e) => setNewKey(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
                      placeholder="New key..." />
                    <input value={newValue} onChange={(e) => setNewValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSetting()}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
                      placeholder="Value..." />
                    <button onClick={handleCreateSetting} className="px-3 py-2 rounded-lg bg-white text-black text-sm hover:bg-white/90 transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full bg-white text-black" />
              <span className="text-white font-medium">Active</span>
            </div>
            {user && (
              <div className="space-y-1 text-sm">
                <p className="text-white/80">
                  Role: <span className="font-semibold text-white">{user.type}</span>
                </p>
                {user.emailVerified !== undefined && (
                  <p className="text-white/80">
                    Email: <span className={user.emailVerified ? "text-white" : "text-white/70"}>
                      {user.emailVerified ? "Verified" : "Not verified"}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Role Capabilities */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Permissions</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Read public content", allowed: true },
                { label: "Create & edit own posts", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Manage tags", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Manage all users", allowed: isAdmin() },
                { label: "Delete any post", allowed: isAdmin() },
                { label: "App settings", allowed: isAdmin() },
              ].map((cap) => (
                <li key={cap.label} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${cap.allowed ? "bg-white/20 text-white" : "bg-white/10 text-white/40"}`}>
                    {cap.allowed ? "✓" : "✕"}
                  </div>
                  <span className={cap.allowed ? "text-white/80" : "text-white/40"}>{cap.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
            <p className="text-white/60 text-sm mb-4">Once you delete your account, there is no going back.</p>
            <button className="w-full py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
