/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    toast: (opts: Omit<Toast, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirm, setConfirm] = useState<{
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
    } | null>(null);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((opts: Omit<Toast, 'id'>) => {
        setToasts((prev) => {
            // Deduplicate: skip if same title+type already visible
            if (prev.some((t) => t.title === opts.title && t.type === opts.type)) return prev;
            // Cap at 3 toasts max (drop oldest)
            const capped = prev.length >= 3 ? prev.slice(-2) : prev;
            const id = Math.random().toString(36).slice(2);
            const duration = opts.duration ?? 4000;
            if (duration > 0) setTimeout(() => dismiss(id), duration);
            return [...capped, { ...opts, id }];
        });
    }, [dismiss]);

    const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
    const error   = useCallback((title: string, message?: string) => toast({ type: 'error',   title, message }), [toast]);
    const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
    const info    = useCallback((title: string, message?: string) => toast({ type: 'info',    title, message }), [toast]);

    const showConfirm = useCallback((
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
    ) => {
        setConfirm({ message, onConfirm, onCancel });
    }, []);

    const value: ToastContextValue = React.useMemo(() => ({
        toasts,
        toast,
        success,
        error,
        warning,
        info,
        confirm: showConfirm,
        dismiss,
    }), [toasts, toast, success, error, warning, info, showConfirm, dismiss]);


    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast container — top-right */}
            <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 w-80 max-w-sm pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                ))}
            </div>

            {/* Confirm dialog */}
            {confirm && (
                <ConfirmDialog
                    message={confirm.message}
                    onConfirm={() => {
                        confirm.onConfirm();
                        setConfirm(null);
                    }}
                    onCancel={() => {
                        confirm.onCancel?.();
                        setConfirm(null);
                    }}
                />
            )}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}

const TOAST_CONFIG: Record<
    ToastType,
    { bg: string; iconBg: string; label: string; icon: React.ReactNode }
> = {
    success: {
        bg: 'bg-emerald-500',
        iconBg: 'bg-emerald-400',
        label: 'Success',
        icon: (
            <svg className="fill-white" width="16" height="12" viewBox="0 0 16 12">
                <path d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L5.2574 11.4955C5.60506 11.8733 6.18331 11.8733 6.53091 11.4955L15.2984 2.06999C15.6291 1.69683 15.6291 1.19508 15.2984 0.826822Z" />
            </svg>
        ),
    },
    error: {
        bg: 'bg-rose-500',
        iconBg: 'bg-rose-400',
        label: 'Error',
        icon: (
            <svg className="fill-white" width="12" height="12" viewBox="0 0 12 12">
                <path d="M10.3535 9.64645C10.5488 9.84171 10.5488 10.1583 10.3535 10.3536C10.1583 10.5488 9.84171 10.5488 9.64645 10.3536L6 6.70711L2.35355 10.3536C2.15829 10.5488 1.84171 10.5488 1.64645 10.3536C1.45118 10.1583 1.45118 9.84171 1.64645 9.64645L5.29289 6L1.64645 2.35355C1.45118 2.15829 1.45118 1.84171 1.64645 1.64645C1.84171 1.45118 2.15829 1.45118 2.35355 1.64645L6 5.29289L9.64645 1.64645C9.84171 1.45118 10.1583 1.45118 10.3535 1.64645C10.5488 1.84171 10.5488 2.15829 10.3535 2.35355L6.70711 6L10.3535 9.64645Z" />
            </svg>
        ),
    },
    warning: {
        bg: 'bg-amber-400',
        iconBg: 'bg-amber-300',
        label: 'Warning',
        icon: (
            <svg className="fill-white" width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 0C3.13 0 0 3.13 0 7C0 10.87 3.13 14 7 14C10.87 14 14 10.87 14 7C14 3.13 10.87 0 7 0ZM7.7 10.5H6.3V9.1H7.7V10.5ZM7.7 7.7H6.3V3.5H7.7V7.7Z" />
            </svg>
        ),
    },
    info: {
        bg: 'bg-indigo-500',
        iconBg: 'bg-indigo-400',
        label: 'Info',
        icon: (
            <svg className="fill-white" width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 0C3.13 0 0 3.13 0 7C0 10.87 3.13 14 7 14C10.87 14 14 10.87 14 7C14 3.13 10.87 0 7 0ZM7.7 10.5H6.3V6.3H7.7V10.5ZM7.7 4.9H6.3V3.5H7.7V4.9Z" />
            </svg>
        ),
    },
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const c = TOAST_CONFIG[t.type];
    return (
        <div
            className={`flex items-start gap-3 rounded-xl shadow-lg px-4 py-3.5 pointer-events-auto ${c.bg}`}
            style={{ animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
            role="alert"
        >
            {/* Icon badge */}
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.iconBg}`}>
                {c.icon}
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-bold text-white leading-snug">{t.title}</p>
                {t.message && <p className="text-xs text-white/80 mt-0.5 leading-snug">{t.message}</p>}
            </div>

            {/* Close */}
            <button
                title="close"
                onClick={onDismiss}
                className="shrink-0 mt-0.5 rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            >
                <svg className="fill-current" width="10" height="10" viewBox="0 0 12 12">
                    <path d="M10.3535 9.64645C10.5488 9.84171 10.5488 10.1583 10.3535 10.3536C10.1583 10.5488 9.84171 10.5488 9.64645 10.3536L6 6.70711L2.35355 10.3536C2.15829 10.5488 1.84171 10.5488 1.64645 10.3536C1.45118 10.1583 1.45118 9.84171 1.64645 9.64645L5.29289 6L1.64645 2.35355C1.45118 2.15829 1.45118 1.84171 1.64645 1.64645C1.84171 1.45118 2.15829 1.45118 2.35355 1.64645L6 5.29289L9.64645 1.64645C9.84171 1.45118 10.1583 1.45118 10.3535 1.64645C10.5488 1.84171 10.5488 2.15829 10.3535 2.35355L6.70711 6L10.3535 9.64645Z" />
                </svg>
            </button>
        </div>
    );
}


/* ---------- Confirm Dialog ---------- */

function ConfirmDialog({
    message,
    onConfirm,
    onCancel,
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

            {/* Dialog */}
            <div className="relative w-full max-w-sm rounded-sm border border-stroke bg-white px-8 py-10 shadow-default dark:border-strokedark dark:bg-boxdark text-center">
                <span className="mx-auto mb-5.5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-warning">
                    <svg className="fill-warning" width="28" height="28" viewBox="0 0 28 28">
                        <path d="M14 2.333C7.557 2.333 2.333 7.557 2.333 14S7.557 25.667 14 25.667 25.667 20.443 25.667 14 20.443 2.333 14 2.333Zm1.167 15.167H12.833V12.833h2.334v4.667Zm0-7H12.833V8.167h2.334V10.5Z" />
                    </svg>
                </span>
                <h3 className="mb-2 text-xl font-bold text-black dark:text-white">Are you sure?</h3>
                <p className="mb-6 text-body">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="btn-cancel flex-1 py-3 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded bg-danger py-3 font-medium text-white hover:bg-opacity-90"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
