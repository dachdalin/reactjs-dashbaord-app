import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersApi } from "../../lib/api";

export default function ProfilePage() {
  const { user, setUser, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
      setPosition(user.position ?? "");
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      const updated = await usersApi.update(user.id, { name, email, phone, position });
      setUser(updated);
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    setMsg(null);
    try {
      const updated = await usersApi.uploadAvatar(user.id, file);
      setUser(updated);
      setMsg({ type: "success", text: "Avatar updated successfully!" });
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to upload avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleDeleteAvatar() {
    if (!user) return;
    setUploadingAvatar(true);
    setMsg(null);
    try {
      await usersApi.deleteAvatar(user.id);
      setUser({ ...user, avatar: undefined });
      setMsg({ type: "success", text: "Avatar removed." });
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to remove avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setPwdMsg(null);
    try {
      const updated = await usersApi.update(user.id, { name, email, password: newPassword });
      setUser(updated);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setPwdMsg({ type: "success", text: "Password changed successfully!" });
    } catch (err: unknown) {
      setPwdMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to change password." });
    }
  }

  const initials = (name || "Guest")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">User Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account information, profile avatar, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar Card */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500 shadow-xl"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs text-white">
                  Uploading...
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white">{user?.name}</h3>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Change Photo
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {msg && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    msg.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Security & Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {pwdMsg && (
                <div
                  className={`p-3.5 rounded-xl text-sm ${
                    pwdMsg.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Account Overview */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-gray-300">User ID</span>
                <span className="font-mono text-white">#{user?.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-gray-300">Role Type</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-xs">
                  {user?.type}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-gray-300">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Email Verification</span>
                <span className="text-indigo-300 font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Privileges</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Dashboard Access", allowed: true },
                { label: "Manage Own Posts", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Create Tags", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Manage All Users", allowed: isAdmin() },
                { label: "System Settings", allowed: isAdmin() },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                      item.allowed ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-500"
                    }`}
                  >
                    {item.allowed ? "✓" : "✕"}
                  </div>
                  <span className={item.allowed ? "text-gray-300" : "text-gray-500"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
