import { useState, useEffect } from "react";
import { notificationsApi, usersApi, type UserResponse, type NotificationResponse } from "../../lib/api";

interface SendNotificationModalProps {
  defaultUserId?: number;
  onClose: () => void;
  onSent?: (notification: NotificationResponse) => void;
}

const TYPE_OPTIONS: Array<{ value: "SYSTEM" | "COMMENT" | "LIKE"; label: string; icon: string; desc: string }> = [
  { value: "SYSTEM", label: "System", icon: "⚙️", desc: "System maintenance or feature updates" },
  { value: "COMMENT", label: "Comment", icon: "💬", desc: "Comment or interaction notification" },
  { value: "LIKE", label: "Activity / Like", icon: "❤️", desc: "User activity, likes, or applause" },
];

const QUICK_TEMPLATES = [
  { title: "System Maintenance", message: "We will be performing scheduled system maintenance shortly.", type: "SYSTEM" as const },
  { title: "New Feature Released", message: "Check out our latest dashboard features and updates!", type: "SYSTEM" as const },
  { title: "New Comment Received", message: "Someone commented on your post. Click to view details.", type: "COMMENT" as const },
  { title: "Account Update", message: "Your account settings or role permissions have been updated.", type: "SYSTEM" as const },
];

export default function SendNotificationModal({
  defaultUserId,
  onClose,
  onSent,
}: SendNotificationModalProps) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    defaultUserId ? String(defaultUserId) : "ALL"
  );
  const [type, setType] = useState<"SYSTEM" | "COMMENT" | "LIKE">("SYSTEM");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoadingUsers(true);
    usersApi
      .list()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  function applyTemplate(tmpl: (typeof QUICK_TEMPLATES)[number]) {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setType(tmpl.type);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }

    setSending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (selectedUserId === "ALL") {
        // Send to all users or broadcast
        if (users.length > 0) {
          const promises = users.map((u) =>
            notificationsApi.create({
              title: title.trim(),
              message: message.trim(),
              type,
              userId: u.id,
              isRead: false,
            })
          );
          const results = await Promise.all(promises);
          if (onSent && results[0]) onSent(results[0]);
        } else {
          const res = await notificationsApi.create({
            title: title.trim(),
            message: message.trim(),
            type,
            isRead: false,
          });
          if (onSent) onSent(res);
        }
        setSuccessMsg("Notification broadcast to all users successfully!");
      } else {
        const uId = Number(selectedUserId);
        const res = await notificationsApi.create({
          title: title.trim(),
          message: message.trim(),
          type,
          userId: uId,
          isRead: false,
        });
        if (onSent) onSent(res);
        const recipientName = users.find((u) => u.id === uId)?.name ?? `User #${uId}`;
        setSuccessMsg(`Notification sent to ${recipientName} successfully!`);
      }

      // Reset form or auto close after brief delay
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send notification.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/70 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-200/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Create & Push Notification</h2>
              <p className="text-xs text-slate-500">Send custom notification alerts to users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-950 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Quick Templates */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-sky-700 transition-all"
                >
                  ⚡ {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient User */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient User *</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loadingUsers}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:opacity-50"
            >
              <option value="ALL">📢 All Users (Broadcast Notification)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.name} ({u.email}) — [{u.type}]
                </option>
              ))}
            </select>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === opt.value
                      ? "bg-slate-100 border-slate-200 text-slate-950 shadow-lg shadow-sky-200/60"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <div className="text-xl mb-1">{opt.icon}</div>
                  <div className="text-sm font-semibold text-slate-950">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Maintenance Scheduled"
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-transparent transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write notification message content here..."
              required
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-200/60"
            >
              {sending && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {sending ? "Pushing…" : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
