import { useEffect } from "react";
import { getAuthProfile } from "../services/localStorageService";

function DashboardRedirect() {
  useEffect(() => {
    const profile = getAuthProfile();

    if (!profile?.role) {
      window.location.replace("/");
      return;
    }

    if (profile.role === "teacher") {
      window.location.replace("/teacher.html");
      return;
    }

    window.location.replace("/welcome.html");
  }, []);

  return (
    <main className="redirect-screen">
      <div className="redirect-card">
        <p className="auth-brand">Skill Park</p>
        <h1>Entering dashboard</h1>
        <p className="auth-muted">Please wait while we open your learning space.</p>
      </div>
    </main>
  );
}

export default DashboardRedirect;
