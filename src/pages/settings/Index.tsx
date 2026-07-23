import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
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
  const { isAdmin } = useAuth();

  // App / System settings state
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
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
    settingsApi
      .list()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
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
          <h1 className="text-3xl font-bold text-slate-950">System Settings</h1>
          <p className="text-slate-500 mt-1">
            Configure core system environment variables, parameters, and global behaviors.
          </p>
        </div>
        <button
          onClick={loadSystemSettings}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-950 text-sm hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Settings
        </button>
      </div>

      {/* System Config Table / Cards */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">System Parameters & Configurations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin()
                ? "Full administrative access to add, update, or delete system variables."
                : "Read-only configuration view for non-admin users."}
            </p>
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search parameter..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
          </div>
        </div>

        {systemMsg && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
              systemMsg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {systemMsg.text}
          </div>
        )}

        {/* Quick Presets */}
        {isAdmin() && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick System Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SETTING_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleCreateSetting(preset.key, preset.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-950 transition-all"
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
              <div key={n} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-slate-500 text-sm">No system settings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSettings.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
              >
                {editingId === s.id ? (
                  <>
                    <input
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-950 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                      placeholder="Key"
                    />
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-950 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                      placeholder="Value"
                    />
                    <button
                      onClick={() => handleUpdateSetting(s.id)}
                      className="px-3.5 py-2 rounded-lg bg-sky-500 text-slate-950 font-medium text-sm hover:bg-sky-400 transition-colors shadow-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-950 font-mono truncate">{s.key}</p>
                      <p className="text-xs text-slate-600 truncate font-mono mt-0.5">{s.value}</p>
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-200/60 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(s.id)}
                          title="Delete setting"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Create New Configuration Parameter
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                placeholder="SETTING_KEY"
              />
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateSetting()}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-950 text-sm font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                placeholder="Setting value"
              />
              <button
                onClick={() => handleCreateSetting()}
                className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium text-sm hover:bg-sky-400 transition-colors shrink-0 shadow-sm"
              >
                Add Parameter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
