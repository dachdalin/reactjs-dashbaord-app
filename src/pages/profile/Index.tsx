import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../hook/useToast";
import { usersApi } from "../../lib/api";
import ImageUploader from "../../components/ui/ImageUploader";

export default function ProfilePage() {
  const { user, setUser, isAdmin } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Form state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
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
      toastSuccess("Profile Updated", "Your profile information has been saved.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update profile.";
      setMsg({ type: "error", text: errMsg });
      toastError("Failed to update profile", errMsg);
    } finally {
      setSaving(false);
    }
  }

  const handleAvatarUpload = async (file: File, onProgress: (percent: number) => void) => {
    if (!user) throw new Error("User not found");
    try {
      onProgress(30);
      const updated = await usersApi.uploadAvatar(user.id, file);
      onProgress(100);
      setUser(updated);
      toastSuccess("Avatar Updated", "Your profile picture has been updated.");
      return updated.avatar ?? URL.createObjectURL(file);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload avatar.";
      toastError("Failed to upload avatar", errMsg);
      throw err;
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    setMsg(null);
    try {
      await usersApi.deleteAvatar(user.id);
      setUser({ ...user, avatar: undefined });
      toastSuccess("Avatar Removed", "Your profile picture has been removed.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to remove avatar.";
      toastError("Failed to remove avatar", errMsg);
    }
  };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      toastError("Validation Error", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: "error", text: "Password must be at least 8 characters long." });
      toastError("Validation Error", "Password must be at least 8 characters long.");
      return;
    }

    setPwdMsg(null);
    try {
      const updated = await usersApi.update(user.id, { name, email, password: newPassword });
      setUser(updated);
      setNewPassword("");
      setConfirmPassword("");
      setPwdMsg({ type: "success", text: "Password changed successfully!" });
      toastSuccess("Password Changed", "Your account password has been updated.");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to change password.";
      setPwdMsg({ type: "error", text: errMsg });
      toastError("Failed to change password", errMsg);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-950">User Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account information, profile avatar, and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Avatar Card using Global ImageUploader Component */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Profile Picture</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload or change your profile picture. Drag and drop or click to browse.
                </p>
              </div>
              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <ImageUploader
              value={user?.avatar}
              onChange={(val) => {
                if (!val && user?.avatar) handleAvatarRemove();
              }}
              onUpload={handleAvatarUpload}
              heightClass="h-44 sm:h-52"
            />
          </div>

          {/* Profile Details Form */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-950 mb-6">Personal Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {msg && (
                <div
                  className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    msg.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium hover:bg-sky-400 disabled:opacity-50 transition-all shadow-sm"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-950 mb-6">Security & Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {pwdMsg && (
                <div
                  className={`p-3.5 rounded-xl text-sm ${
                    pwdMsg.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-950 font-medium hover:bg-slate-50 transition-colors shadow-sm"
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
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-950 font-semibold">#{user?.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Role Type</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs">
                  {user?.type}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email Verification</span>
                <span className="text-sky-700 font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4">Account Privileges</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Dashboard Access", allowed: true },
                { label: "Manage Own Posts", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Create Tags", allowed: isAdmin() || user?.type === "AUTHOR" },
                { label: "Manage All Users", allowed: isAdmin() },
                { label: "System Settings", allowed: isAdmin() },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      item.allowed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.allowed ? "✓" : "✕"}
                  </div>
                  <span className={item.allowed ? "text-slate-800 font-medium" : "text-slate-400"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
