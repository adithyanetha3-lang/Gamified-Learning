import { useNavigate } from "react-router-dom";
import TopNav from "./TopNav";
import { DASHBOARD_CONFIG } from "../data/dashboardConfig";
import { signOutUser } from "../services/authService";
import { clearAuthProfile } from "../services/localStorageService";

function AppShell({ profile, children }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOutUser();
    clearAuthProfile();
    navigate("/", { replace: true });
  }

  return (
    <main className="app-shell">
      <TopNav
        title="Skill Park"
        role={profile.role}
        onLogout={handleLogout}
        navItems={DASHBOARD_CONFIG[profile.role]?.navItems || []}
      />
      <div className="app-container">{children}</div>
    </main>
  );
}

export default AppShell;
