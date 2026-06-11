import { Navigate } from "react-router-dom";
import { useAuthSession } from "../hooks/useAuthSession";

/**
 * Role-based route protection
 * Only allows access if user has one of the allowed roles
 */
function RoleRoute({ children, allowedRoles = [] }) {
  const { loading, profile } = useAuthSession();

  if (loading) {
    return (
      <main className="app-loading">
        <div className="app-loading__card">Loading...</div>
      </main>
    );
  }

  if (!profile?.role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate home based on role
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default RoleRoute;
