import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hook/useToast'
import { settingsApi, uploadsApi, type SettingResponse } from '../../lib/api'
import ImageUploader from '../../components/ui/ImageUploader'

const COMMON_SETTING_PRESETS = [
  { key: 'SITE_NAME', value: 'ReactJS Dashboard App' },
  { key: 'MAINTENANCE_MODE', value: 'false' },
  { key: 'API_RATE_LIMIT', value: '100' },
  { key: 'NOTIFICATIONS_ENABLED', value: 'true' },
  { key: 'DEFAULT_USER_ROLE', value: 'USER' },
  { key: 'SYSTEM_VERSION', value: 'v1.0.0' },
]

/** Keys that are handled by the Branding Assets card (excluded from generic table) */
const BRANDING_KEYS = ['WEB_LOGO', 'WEB_FAV'] as const
type BrandingKey = (typeof BRANDING_KEYS)[number]

// ── Branding Upload Card ──────────────────────────────────
interface BrandingSlotProps {
  label: string
  description: string
  icon: string
  settingKey: BrandingKey
  settings: SettingResponse[]
  onSaved: (updated: SettingResponse) => void
}

function BrandingSlot({ label, description, icon, settingKey, settings, onSaved }: BrandingSlotProps) {
  const { error: toastError, success: toastSuccess } = useToast()
  const existing = settings.find((s) => s.key === settingKey)
  const currentUrl = existing?.value || undefined

  const handleUpload = async (file: File, onProgress: (pct: number) => void): Promise<string> => {
    try {
      onProgress(20)
      let result
      if (currentUrl) {
        result = await uploadsApi.replace(file, currentUrl, 'branding')
      } else {
        result = await uploadsApi.upload(file, 'branding')
      }
      onProgress(70)

      let saved: SettingResponse
      if (existing) {
        saved = await settingsApi.update(existing.id, settingKey, result.url)
      } else {
        saved = await settingsApi.create(settingKey, result.url)
      }

      onProgress(100)
      onSaved(saved)
      toastSuccess(`${label} Updated`, `The ${label} image has been saved successfully.`)
      return result.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to upload ${label}.`
      toastError('Upload Failed', msg)
      throw err
    }
  }

  const handleRemove = async () => {
    if (!existing) return
    try {
      await settingsApi.update(existing.id, settingKey, '')
      onSaved({ ...existing, value: '' })
      toastSuccess(`${label} Removed`, `The ${label} image has been cleared.`)
    } catch (err: unknown) {
      toastError('Remove Failed', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="rounded-2xl bg-slate-50/60 border border-slate-200 p-5 space-y-3 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-bold text-slate-950">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-slate-200 text-slate-600">
          {settingKey}
        </span>
      </div>

      {/* Current value preview */}
      {currentUrl && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
          <img
            src={currentUrl}
            alt={label}
            className="h-10 w-10 rounded-lg object-contain border border-slate-100 bg-slate-50 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-700 truncate">Active URL</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentUrl}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Uploader */}
      <ImageUploader
        value={currentUrl}
        onChange={() => {/* handled via onUpload */}}
        onUpload={handleUpload}
        heightClass="h-32"
      />
    </div>
  )
}

// ── Main Settings Page ────────────────────────────────────
export default function Settings() {
  const { isAdmin } = useAuth()
  const { success: toastSuccess, error: toastError, confirm: toastConfirm } = useToast()

  const [settings, setSettings] = useState<SettingResponse[]>([])
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [searchKey, setSearchKey] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editKey, setEditKey] = useState('')
  const [editValue, setEditValue] = useState('')
  const isSubmitting = useRef(false)

  const loadSystemSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const data = await settingsApi.list()
      setSettings(data)
    } catch (err: unknown) {
      toastError('Failed to load settings', err instanceof Error ? err.message : undefined)
    } finally {
      setSettingsLoading(false)
    }
  }, [toastError])

  useEffect(() => {
    loadSystemSettings()
  }, [loadSystemSettings])

  /** Upsert a single setting in local state after branding upload */
  function handleBrandingSaved(updated: SettingResponse) {
    setSettings((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
  }

  async function handleCreateSetting(k = newKey, v = newValue) {
    if (isSubmitting.current) return
    if (!k.trim() || !v.trim()) {
      toastError('Validation Error', 'Both Key and Value are required.')
      return
    }
    isSubmitting.current = true
    try {
      const s = await settingsApi.create(k.trim(), v.trim())
      setSettings((prev) => [...prev, s])
      setNewKey('')
      setNewValue('')
      toastSuccess('Setting Created', `Setting '${k}' created successfully.`)
    } catch (err: unknown) {
      toastError('Failed to create setting', err instanceof Error ? err.message : undefined)
    } finally {
      isSubmitting.current = false
    }
  }

  async function handleUpdateSetting(id: number) {
    if (isSubmitting.current) return
    if (!editKey.trim() || !editValue.trim()) {
      toastError('Validation Error', 'Both Key and Value are required.')
      return
    }
    isSubmitting.current = true
    try {
      const s = await settingsApi.update(id, editKey.trim(), editValue.trim())
      setSettings((prev) => prev.map((x) => (x.id === id ? s : x)))
      setEditingId(null)
      toastSuccess('Setting Updated', `Setting '${editKey}' updated successfully.`)
    } catch (err: unknown) {
      toastError('Failed to update setting', err instanceof Error ? err.message : undefined)
    } finally {
      isSubmitting.current = false
    }
  }

  function handleDeleteSetting(id: number, keyName: string) {
    toastConfirm(`Are you sure you want to delete setting '${keyName}'?`, async () => {
      try {
        await settingsApi.delete(id)
        setSettings((prev) => prev.filter((x) => x.id !== id))
        toastSuccess('Setting Deleted', `Setting '${keyName}' removed successfully.`)
      } catch (err: unknown) {
        toastError('Failed to delete setting', err instanceof Error ? err.message : undefined)
      }
    })
  }

  // Exclude branding keys from the generic table
  const filteredSettings = settings.filter(
    (s) =>
      !(BRANDING_KEYS as readonly string[]).includes(s.key) &&
      (s.key.toLowerCase().includes(searchKey.toLowerCase()) ||
        s.value.toLowerCase().includes(searchKey.toLowerCase()))
  )

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

      {/* ── Branding Assets Card ── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-9 w-9 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Branding Assets</h2>
            <p className="text-xs text-slate-500">
              Upload your website logo and favicon. Images are stored in S3 and the URL is saved as a system setting.
            </p>
          </div>
        </div>

        {settingsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((n) => (
              <div key={n} className="h-52 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BrandingSlot
              label="Website Logo"
              description="Main logo shown in the header / sidebar."
              icon="🖼️"
              settingKey="WEB_LOGO"
              settings={settings}
              onSaved={handleBrandingSaved}
            />
            <BrandingSlot
              label="Website Favicon"
              description="Small icon shown in browser tabs (ICO/PNG/SVG)."
              icon="⭐"
              settingKey="WEB_FAV"
              settings={settings}
              onSaved={handleBrandingSaved}
            />
          </div>
        )}
      </div>

      {/* ── System Config Table ── */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">System Parameters &amp; Configurations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin()
                ? 'Full administrative access to add, update, or delete system variables.'
                : 'Read-only configuration view for non-admin users.'}
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
                            setEditingId(s.id)
                            setEditKey(s.key)
                            setEditValue(s.value)
                          }}
                          title="Edit setting"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-200/60 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(s.id, s.key)}
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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSetting()}
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
  )
}
