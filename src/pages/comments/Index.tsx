import { useState, useEffect, useCallback } from "react";
import { contactsApi, notificationsApi, type ContactResponse, type NotificationResponse } from "../../lib/api";
import SendNotificationModal from "../../components/notifications/SendNotificationModal";

// ── Helpers ───────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Detail Modal ──────────────────────────────────────────
function ContactModal({
  contact,
  onClose,
  onDelete,
  onUpdate,
}: {
  contact: ContactResponse;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdate: (updated: ContactResponse) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(contact.subject);
  const [message, setMessage] = useState(contact.message);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await contactsApi.update(contact.id, {
        name: contact.name,
        email: contact.email,
        subject,
        message,
      });
      onUpdate(updated);
      setEditing(false);
    } catch {/* ignore */}
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await contactsApi.delete(contact.id);
      onDelete(contact.id);
      onClose();
    } catch {/* ignore */}
    finally { setDeleting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-black border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
              <span className="text-black text-sm font-bold">{getInitials(contact.name)}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{contact.name}</p>
              <p className="text-xs text-white/60">{contact.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">{timeAgo(contact.createdAt)}</span>
            <button onClick={onClose} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Subject</label>
            {editing ? (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            ) : (
              <p className="text-white font-medium">{contact.subject}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Message</label>
            {editing ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
              />
            ) : (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{contact.message}</p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-white/40 pt-1">
            <span>Received: {new Date(contact.createdAt).toLocaleString()}</span>
            {contact.updatedAt !== contact.createdAt && (
              <span>Updated: {new Date(contact.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/2">
          {/* Delete */}
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white text-black text-xs transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white hover:bg-white/10 border border-white/20 text-xs transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>

          {/* Edit / Save */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Comment Notifications Row ────────────────────────────
function NotificationRow({ n, onMarkRead }: { n: NotificationResponse; onMarkRead: (id: number) => void }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? "bg-white/3" : "bg-white/10 border border-white/10"}`}>
      <span className="text-xl shrink-0">💬</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-medium truncate ${n.isRead ? "text-white/60" : "text-white"}`}>{n.title}</p>
          {!n.isRead && <div className="h-2 w-2 rounded-full bg-white shrink-0" />}
        </div>
        <p className="text-xs text-white/40 line-clamp-1">{n.message}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.isRead && (
        <button
          onClick={() => onMarkRead(n.id)}
          className="shrink-0 text-xs text-white/80 hover:text-white transition-colors whitespace-nowrap"
        >
          Mark read
        </button>
      )}
    </div>
  );
}

// ── Main Comments Page ────────────────────────────────────
export default function Comments() {
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [commentNotifs, setCommentNotifs] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactResponse | null>(null);
  const [tab, setTab] = useState<"messages" | "notifications">("messages");
  const [showNotifModal, setShowNotifModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsData, notifsData] = await Promise.all([
        contactsApi.list(),
        notificationsApi.list(),
      ]);
      setContacts(contactsData);
      setCommentNotifs(notifsData.filter((n) => n.type === "COMMENT"));
    } catch {/* API might not be up */}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDelete(id: number) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function handleUpdate(updated: ContactResponse) {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelected(updated);
  }

  async function handleMarkRead(id: number) {
    try {
      const updated = await notificationsApi.update(id, { isRead: true });
      setCommentNotifs((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {/* ignore */}
  }

  async function handleMarkAllRead() {
    const unread = commentNotifs.filter((n) => !n.isRead);
    await Promise.allSettled(unread.map((n) => notificationsApi.update(n.id, { isRead: true })));
    setCommentNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  const unreadNotifs = commentNotifs.filter((n) => !n.isRead).length;

  // Stats
  const today = new Date().toDateString();
  const todayCount = contacts.filter((c) => new Date(c.createdAt).toDateString() === today).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Comments & Messages</h1>
          <p className="text-white/60 mt-1">
            Manage contact messages and comment notifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition-all shadow-md shadow-black/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Push Notification
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages", value: loading ? "—" : contacts.length, color: "bg-white text-black", icon: "💬" },
          { label: "Today", value: loading ? "—" : todayCount, color: "bg-white text-black", icon: "📅" },
          { label: "Comment Notifs", value: loading ? "—" : commentNotifs.length, color: "bg-white text-black", icon: "🔔" },
          { label: "Unread Notifs", value: loading ? "—" : unreadNotifs, color: "bg-white text-black", icon: "📌" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center text-lg shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("messages")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "messages"
              ? "bg-white text-black shadow-lg shadow-black/20"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          Contact Messages
          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{contacts.length}</span>
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "notifications"
              ? "bg-white text-black shadow-lg shadow-black/20"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          Comment Notifications
          {unreadNotifs > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white text-black text-xs text-white">{unreadNotifs}</span>
          )}
        </button>
      </div>

      {/* ── Contact Messages Tab ── */}
      {tab === "messages" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Search by name, email, subject…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/5 border border-white/10">
              <svg className="h-16 w-16 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-white/60 text-lg font-medium">No messages found</p>
              <p className="text-white/40 text-sm mt-1">
                {search ? "Try a different search term." : "No contact messages yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/10 text-xs font-semibold text-white/60 uppercase tracking-wider">
                <span>Sender</span>
                <span>Email</span>
                <span>Subject</span>
                <span>Preview</span>
                <span>Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/5">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="group grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 md:gap-4 items-center px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                      <span className="text-black text-xs font-bold">{getInitials(c.name)}</span>
                    </div>

                    {/* Name + time */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <p className="text-xs text-white/40">{timeAgo(c.createdAt)}</p>
                    </div>

                    {/* Email */}
                    <p className="text-sm text-white/60 truncate hidden md:block">{c.email}</p>

                    {/* Subject */}
                    <p className="text-sm text-white/80 font-medium truncate hidden md:block">{c.subject}</p>

                    {/* Message preview */}
                    <p className="text-xs text-white/40 line-clamp-1 hidden md:block">
                      {c.message.slice(0, 60)}{c.message.length > 60 ? "…" : ""}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                        title="View message"
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await contactsApi.delete(c.id);
                          setContacts((prev) => prev.filter((x) => x.id !== c.id));
                        }}
                        title="Delete message"
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer count */}
              <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  Showing <span className="text-white/80 font-medium">{filtered.length}</span> of{" "}
                  <span className="text-white/80 font-medium">{contacts.length}</span> messages
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {commentNotifs.length} comment notification{commentNotifs.length !== 1 ? "s" : ""}
              {unreadNotifs > 0 && `, ${unreadNotifs} unread`}
            </p>
            {unreadNotifs > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : commentNotifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-5xl mb-4">💬</span>
              <p className="text-white/60 text-lg font-medium">No comment notifications</p>
              <p className="text-white/40 text-sm mt-1">Comment activity will appear here.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
              {commentNotifs.map((n) => (
                <NotificationRow key={n.id} n={n} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <ContactModal
          contact={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      {/* Push Notification Modal */}
      {showNotifModal && (
        <SendNotificationModal
          onClose={() => setShowNotifModal(false)}
          onSent={() => loadData()}
        />
      )}
    </div>
  );
}
