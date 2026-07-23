
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

        {/* Dashboard routes — with sidebar layout */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <DashboardRoute>
              <Dashboard />
            </DashboardRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <DashboardRoute>
              <Teams />
            </DashboardRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <DashboardRoute>
              <Blogs />
            </DashboardRoute>
          }
        />
        <Route
          path="/blogs/create"
          element={
            <DashboardRoute>
              <PostEditor />
            </DashboardRoute>
          }
        />
        <Route
          path="/blogs/edit/:id"
          element={
            <DashboardRoute>
              <PostEditor />
            </DashboardRoute>
          }
        />
        <Route
          path="/tags"
          element={
            <DashboardRoute>
              <TagsPage />
            </DashboardRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardRoute>
              <Settings />
            </DashboardRoute>
          }
        />
        <Route
          path="/pages"
          element={
            <DashboardRoute>
              <PagesPage />
            </DashboardRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <DashboardRoute>
              <Comments />
            </DashboardRoute>
          }
        />
        <Route
          path="/profile"
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
