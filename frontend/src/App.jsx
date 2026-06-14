import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Subjects from "./pages/Subjects.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import Exams from "./pages/Exams.jsx";
import Analytics from "./pages/Analytics.jsx";
import Focus from "./pages/Focus.jsx";
import Planner from "./pages/Planner.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

function Protected() {
  const { isAuthed } = useApp();
  return isAuthed ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="exams" element={<Exams />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="focus" element={<Focus />} />
        <Route path="planner" element={<Planner />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
