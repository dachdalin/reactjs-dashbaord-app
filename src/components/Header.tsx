import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationsApi, type NotificationResponse } from "../lib/api";
import SendNotificationModal from "./notifications/SendNotificationModal";

const TYPE_ICONS: Record<string, string> = {
  SYSTEM: "⚙️",
  COMMENT: "💬",
  LIKE: "❤️",
};

function timeAgo(isoDate: string): string {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Header() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [open, setOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    notificationsApi
      .list(user.id)
      .then(setNotifications)
      .catch(() => {});
  }, [user]);

  // Load notifications for this user
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function markRead(id: number) {
    try {
      const updated = await notificationsApi.update(id, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch {/* ignore */}
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.allSettled(
      unread.map((n) => notificationsApi.update(n.id, { isRead: true }))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const displayName = user?.name ?? "Guest";

  return (
    <>
      <header className="sticky top-0 z-30 hidden md:flex items-center justify-between px-8 py-4 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div>
          <h2 className="text-lg font-semibold text-white">Welcome back, {displayName}!</h2>
          <p className="text-sm text-white/60">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Send Notification Button */}
          <button
            onClick={() => setShowSendModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md shadow-black/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Push Notification
          </button>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all" />
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="notifications-bell"
              onClick={() => setOpen((o) => !o)}
              className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-black text-xs text-white flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-black border border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-white/80 hover:text-white transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-white/40 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors ${!n.isRead ? "bg-white/10" : ""}`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${n.isRead ? "text-white/80" : "text-white"}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <div className="h-2 w-2 rounded-full bg-white shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-white/40 line-clamp-1">{n.message}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-white/10 bg-white/2">
                  <p className="text-xs text-center text-white/40">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>

    {showSendModal && (
      <SendNotificationModal
        onClose={() => setShowSendModal(false)}
        onSent={() => fetchNotifications()}
      />
    )}
    </>
  );
}
