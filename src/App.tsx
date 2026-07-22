
import RootLayout from "./layouts/RootLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Index";
import Teams from "./pages/team/Index";
import Blogs from "./pages/blog/Index";
import Settings from "./pages/settings/Index";
import PagesPage from "./pages/pages/Index";
import Comments from "./pages/comments/Index";
import NotFound from "./pages/erorr/NotFound";
import LoginPage from "./pages/auth/login/Login";
import RegisterPage from "./pages/auth/register/Register";
import "./App.css";
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
            <RootLayout>
              <Dashboard />
            </RootLayout>
          }
        />
        <Route
          path="/teams"
          element={
            <RootLayout>
              <Teams />
            </RootLayout>
          }
        />
        <Route
          path="/blogs"
          element={
            <RootLayout>
              <Blogs />
            </RootLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <RootLayout>
              <Settings />
            </RootLayout>
          }
        />
        <Route
          path="/pages"
          element={
            <RootLayout>
              <PagesPage />
            </RootLayout>
          }
        />
        <Route
          path="/comments"
          element={
            <RootLayout>
              <Comments />
            </RootLayout>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <RootLayout>
              <NotFound />
            </RootLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
