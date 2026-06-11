import { Navigate } from "react-router-dom";
import { useAuthSession } from "../hooks/useAuthSession";

function ProtectedRoute({ children }) {
  const { loading, profile } = useAuthSession();

  if (loading) {
    return (
      <main className="app-loading">
        <div className="app-loading__card">Opening Skill Park...</div>
      </main>
    );
  }

  if (!profile?.role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
