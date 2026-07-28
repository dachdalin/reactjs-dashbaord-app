
import RootLayout from "./layouts/RootLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Dashboard from "./pages/dashboard/Index";
import Teams from "./pages/team/Index";
import Blogs from "./pages/blog/Index";
import PostEditor from "./pages/blog/PostEditor";
import TagsPage from "./pages/tags/Index";
import Settings from "./pages/settings/Index";
import ProfilePage from "./pages/profile/Index";
import PagesPage from "./pages/pages/Index";
import Comments from "./pages/comments/Index";
import NotFound from "./pages/erorr/NotFound";
import LoginPage from "./pages/auth/login/Login";
import RegisterPage from "./pages/auth/register/Register";
import { useAuth } from "./context/useAuth";
import "./App.css";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (!accessToken) return <Navigate to="/auth/login" replace />;

  return children;
}

function DashboardRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RootLayout>{children}</RootLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes — no sidebar */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Admin routes — with sidebar layout */}
        <Route
          path="/admin/dashboard"
          element={
            <DashboardRoute>
              <Dashboard />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <DashboardRoute>
              <Teams />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <DashboardRoute>
              <Blogs />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/blogs/create"
          element={
            <DashboardRoute>
              <PostEditor />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/blogs/edit/:id"
          element={
            <DashboardRoute>
              <PostEditor />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/tags"
          element={
            <DashboardRoute>
              <TagsPage />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <DashboardRoute>
              <Settings />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/pages"
          element={
            <DashboardRoute>
              <PagesPage />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/comments"
          element={
            <DashboardRoute>
              <Comments />
            </DashboardRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <DashboardRoute>
              <ProfilePage />
            </DashboardRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <DashboardRoute>
              <NotFound />
            </DashboardRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
