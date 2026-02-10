
import RootLayout from "./layouts/RootLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Index";
import Projects from "./pages/projects/Index";
import Teams from "./pages/team/Index";
import Analytics from "./pages/analytics/Index";
import Calendar from "./pages/calendar/Index";
import Blogs from "./pages/blog/Index";
import Settings from "./pages/settings/Index";
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
          path="/projects"
          element={
            <RootLayout>
              <Projects />
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
          path="/analytics"
          element={
            <RootLayout>
              <Analytics />
            </RootLayout>
          }
        />
        <Route
          path="/calendar"
          element={
            <RootLayout>
              <Calendar />
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
