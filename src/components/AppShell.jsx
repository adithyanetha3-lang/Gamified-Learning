import { useNavigate } from "react-router-dom";
import TopNav from "./TopNav";
import AIChatbot from "./AIChatbot";
import { useDashboardConfig } from "../hooks/useDashboardConfig";
import { signOutUser } from "../services/authService";
import { clearAuthProfile } from "../services/localStorageService";

function AppShell({ profile, children }) {
  const navigate = useNavigate();
  const dashboardConfig = useDashboardConfig();

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
        navItems={dashboardConfig[profile.role]?.navItems || []}
      />
      <div className="app-container">{children}</div>
      <AIChatbot />
    </main>
  );
}

export default AppShell;
