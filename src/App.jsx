import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Specialist
import SpecialistDashboard from "./pages/specialist/SpecialistDashboard";
import PatientsPage from "./pages/specialist/PatientsPage";
import PatientDetailPage from "./pages/specialist/PatientDetailPage";
import ReportsPage from "./pages/specialist/ReportsPage";
import ChatPage from "./pages/specialist/ChatPage";
import PostsPage from "./pages/specialist/PostsPage";
import AccueilPage from "./pages/specialist/AccueilPage";
import ExercisesPage from "./pages/specialist/ExercisesPage";
import SearchPage from "./pages/specialist/SearchPage";
import PlanningPage from "./pages/specialist/PlanningPage";
import ProfilePage from "./pages/specialist/ProfilePage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSpecialists from "./pages/admin/AdminSpecialists";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminProfile from "./pages/admin/AdminProfile";

// Routes
import { PrivateRoute } from "./routes/PrivateRoute";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === "ADMIN" ? "/admin/dashboard" : "/specialist/dashboard"}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* Specialist routes */}
        <Route
          path="/specialist/dashboard"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <SpecialistDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/patients"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <PatientsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/patients/:id"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <PatientDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/reports"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <ReportsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/chat"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/posts"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <PostsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/accueil"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <AccueilPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/exercises"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <ExercisesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/search"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <SearchPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/planning"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <PlanningPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/specialist/profile"
          element={
            <PrivateRoute allowedRoles={["DOCTOR"]}>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/specialists"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminSpecialists />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminPatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminPosts />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
