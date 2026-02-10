

import * as React from "react";
import SideNav from "../components/SideNav";
import Header from "../components/Header";
export default function RootLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
  <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-full">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar - Hidden on mobile, visible on md+ */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
        <SideNav />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold">ReactJS App</span>
          </div>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"  title="k">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 md:pl-72">
        <div className="h-full overflow-y-auto">
          {/* Top header bar */}
            <Header />
          {/* Page content */}
          <div className="p-6 md:p-8 pt-20 md:pt-8">
            {children}
          </div>
        </div>
      </main>
    </div>
    );
}