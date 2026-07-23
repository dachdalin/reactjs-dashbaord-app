import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { settingsApi, type SettingResponse } from "../../lib/api";

const COMMON_SETTING_PRESETS = [
  { key: "SITE_NAME", value: "ReactJS Dashboard App" },
  { key: "MAINTENANCE_MODE", value: "false" },
  { key: "API_RATE_LIMIT", value: "100" },
  { key: "NOTIFICATIONS_ENABLED", value: "true" },
  { key: "DEFAULT_USER_ROLE", value: "USER" },
  { key: "SYSTEM_VERSION", value: "v1.0.0" },
];

export default function Settings() {
  const { user, isAdmin } = useAuth();

  // App / System settings state
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");
  const [systemMsg, setSystemMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function loadSystemSettings() {
    setSettingsLoading(true);
    settingsApi
      .list()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }

  useEffect(() => {
    loadSystemSettings();
  }, []);

  async function handleCreateSetting(k = newKey, v = newValue) {
    if (!k.trim() || !v.trim()) {
      setSystemMsg({ type: "error", text: "Both Key and Value are required." });
      return;
    }
    setSystemMsg(null);
    try {
      const s = await settingsApi.create(k.trim(), v.trim());
      setSettings((prev) => [...prev, s]);
      setNewKey("");
      setNewValue("");
      setSystemMsg({ type: "success", text: `Setting '${k}' created successfully.` });
    } catch (err: unknown) {
      setSystemMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to create setting" });
    }
  }

  async function handleUpdateSetting(id: number) {
    if (!editKey.trim() || !editValue.trim()) return;
    setSystemMsg(null);
    try {
      const s = await settingsApi.update(id, editKey.trim(), editValue.trim());
      setSettings((prev) => prev.map((x) => (x.id === id ? s : x)));
      setEditingId(null);
      setSystemMsg({ type: "success", text: "Setting updated successfully." });
    } catch (err: unknown) {
      setSystemMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update setting" });
    }
  }

  async function handleDeleteSetting(id: number) {
    setSystemMsg(null);
    try {
      await settingsApi.delete(id);
      setSettings((prev) => prev.filter((x) => x.id !== id));
      setSystemMsg({ type: "success", text: "Setting removed successfully." });
    } catch (err: unknown) {
      setSystemMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to delete setting" });
    }
  }

  const filteredSettings = settings.filter(
    (s) =>
      s.key.toLowerCase().includes(searchKey.toLowerCase()) ||
      s.value.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure core system environment variables, parameters, and global behaviors.
          </p>
        </div>
        <button
          onClick={loadSystemSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* System Config Table / Cards */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">System Parameters & Configurations</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAdmin()
                    ? "Full administrative access to add, update, or delete system variables."
                    : "Read-only configuration view for non-admin users."}
                </p>
              </div>
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search parameter..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {systemMsg && (
              <div
                className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                  systemMsg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {systemMsg.text}
              </div>
            )}

            {/* Quick Presets */}
            {isAdmin() && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Quick System Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SETTING_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleCreateSetting(preset.key, preset.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all"
                    >
                      + {preset.key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            {settingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-400 text-sm">No system settings found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSettings.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    {editingId === s.id ? (
                      <>
                        <input
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Key"
                        />
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => handleUpdateSetting(s.id)}
                          className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 rounded-lg bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white font-mono truncate">{s.key}</p>
                          <p className="text-xs text-gray-400 truncate font-mono mt-0.5">{s.value}</p>
                        </div>
                        {isAdmin() && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingId(s.id);
                                setEditKey(s.key);
                                setEditValue(s.value);
                              }}
                              title="Edit setting"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSetting(s.id)}
                              title="Delete setting"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Setting Form */}
            {isAdmin() && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Create New Configuration Parameter
                </label>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="SETTING_KEY"
                  />
                  <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSetting()}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Setting value"
                  />
                  <button
                    onClick={() => handleCreateSetting()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0 shadow-md shadow-indigo-500/20"
                  >
                    Add Parameter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - System Overview */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">System Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-gray-300">API Endpoint</span>
                <span className="font-mono text-xs text-white">/api/v1</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-gray-300">Backend Server</span>
                <span className="font-mono text-xs text-emerald-400">http://localhost:8081</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-gray-300">Total System Parameters</span>
                <span className="font-semibold text-white">{settings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* System Permissions Card */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Access Matrix</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Read System Variables", allowed: true },
                { label: "Modify System Parameters", allowed: isAdmin() },
                { label: "Delete System Parameters", allowed: isAdmin() },
                { label: "Manage User Accounts", allowed: isAdmin() },
                { label: "Publish Blog Articles", allowed: isAdmin() || user?.type === "AUTHOR" },
              ].map((cap) => (
                <li key={cap.label} className="flex items-center gap-2.5">
                  <div
                    className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                      cap.allowed ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-500"
                    }`}
                  >
                    {cap.allowed ? "✓" : "✕"}
                  </div>
                  <span className={cap.allowed ? "text-gray-300" : "text-gray-500"}>{cap.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
