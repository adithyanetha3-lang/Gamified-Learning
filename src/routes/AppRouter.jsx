import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "../pages/Auth";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

// Lazy load pages for better performance
const LearnPage = lazy(() => import("../pages/LearnPage"));
const LessonPage = lazy(() => import("../pages/LessonPage"));
const CoursesPage = lazy(() => import("../pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("../pages/CourseDetailPage"));
const QuizPage = lazy(() => import("../pages/QuizPage"));
const QuizAttemptPage = lazy(() => import("../pages/QuizAttemptPage"));
const LeaderboardPage = lazy(() => import("../pages/LeaderboardPage"));
const ProgressPage = lazy(() => import("../pages/ProgressPage"));
const RewardsPage = lazy(() => import("../pages/RewardsPage"));
const TeacherDashboard = lazy(() => import("../pages/TeacherDashboard"));
const QuestionGeneratorPage = lazy(() => import("../pages/QuestionGeneratorPage"));
const QuestionBankPage = lazy(() => import("../pages/QuestionBankPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const SubjectManagementPage = lazy(() => import("../pages/SubjectManagementPage"));

// Loading fallback
function PageLoader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f7f7f7",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #3182ce",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem",
        }}></div>
        <p style={{ color: "#4a5568" }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />

        {/* Protected routes - Common */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/learn"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <LearnPage />
            </RoleRoute>
          }
        />
        <Route
          path="/learn/section/:topicId"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <LessonPage />
            </RoleRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <CoursesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <CourseDetailPage />
            </RoleRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <QuizPage />
            </RoleRoute>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <QuizAttemptPage />
            </RoleRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <LeaderboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <ProgressPage />
            </RoleRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <RoleRoute allowedRoles={["student"]}>
              <RewardsPage />
            </RoleRoute>
          }
        />

        {/* Teacher routes */}
        <Route
          path="/teacher"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <QuestionGeneratorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/question-bank"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <QuestionBankPage />
            </RoleRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <RoleRoute allowedRoles={["teacher"]}>
              <SubjectManagementPage />
            </RoleRoute>
          }
        />

        {/* Redirects and fallbacks */}
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="/app/:sectionKey" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
