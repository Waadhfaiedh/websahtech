import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SpecialistLayout from "./components/layout/SpecialistLayout";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./context/AuthContext";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Specialist
import SpecialistDashboard from "./pages/specialist/SpecialistDashboard";
import PatientsPage from "./pages/specialist/PatientsPage";
import PatientDetailPage from "./pages/specialist/PatientDetailPage";
import SessionDetailPage from "./pages/specialist/SessionDetailPage";
import ReportsPage from "./pages/specialist/ReportsPage";
import ChatPage from "./pages/specialist/ChatPage";
import PostsPage from "./pages/specialist/PostsPage";
import AccueilPage from "./pages/specialist/AccueilPage";
import ExercisesPage from "./pages/specialist/ExercisesPage";
import SearchPage from "./pages/specialist/SearchPage";
import PlanningPage from "./pages/specialist/PlanningPage";
import ProfilePage from "./pages/specialist/ProfilePage";
import FeedbackPage from "./pages/specialist/FeedbackPage";
import ReviewsPage from "./pages/specialist/ReviewsPage";
import ClinicsPage from "./pages/specialist/ClinicsPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSpecialists from "./pages/admin/AdminSpecialists";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminReviews from "./pages/admin/AdminReviews";

// Routes
import { PrivateRoute } from "./routes/PrivateRoute";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/landing" replace />;
  return (
    <Navigate
      to={user.role === "ADMIN" ? "/admin/dashboard" : "/specialist/dashboard"}
      replace
    />
  );
}

// Layout route: SpecialistLayout mounts once and persists across specialist pages.
// This prevents the scroll position from resetting on every navigation.
function SpecialistRoutes() {
  return (
    <PrivateRoute allowedRoles={["DOCTOR"]}>
      <SpecialistLayout />
    </PrivateRoute>
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
        <Route path="/landing" element={<LandingPage />} />

        {/* Specialist — single persistent layout, children rendered via Outlet */}
        <Route path="/specialist" element={<SpecialistRoutes />}>
          <Route path="dashboard"                              element={<SpecialistDashboard />} />
          <Route path="patients"                               element={<PatientsPage />} />
          <Route path="patients/:id"                           element={<PatientDetailPage />} />
          <Route path="patients/:patientId/sessions/:sessionId" element={<SessionDetailPage />} />
          <Route path="reports"                                element={<ReportsPage />} />
          <Route path="chat"                                   element={<ChatPage />} />
          <Route path="posts"                                  element={<PostsPage />} />
          <Route path="accueil"                                element={<AccueilPage />} />
          <Route path="exercises"                              element={<ExercisesPage />} />
          <Route path="search"                                 element={<SearchPage />} />
          <Route path="planning"                               element={<PlanningPage />} />
          <Route path="profile"                                element={<ProfilePage />} />
          <Route path="feedback"                               element={<FeedbackPage />} />
          <Route path="reviews"                                element={<ReviewsPage />} />
          <Route path="clinics"                                element={<ClinicsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminDashboard /></PrivateRoute>}
        />
        <Route
          path="/admin/specialists"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminSpecialists /></PrivateRoute>}
        />
        <Route
          path="/admin/admins"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminAdmins /></PrivateRoute>}
        />
        <Route
          path="/admin/patients"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminPatients /></PrivateRoute>}
        />
        <Route
          path="/admin/posts"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminPosts /></PrivateRoute>}
        />
        <Route
          path="/admin/profile"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminProfile /></PrivateRoute>}
        />
        <Route
          path="/admin/reviews"
          element={<PrivateRoute allowedRoles={["ADMIN"]}><AdminReviews /></PrivateRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
