import { NavLink } from "react-router-dom";
import AppIcon from "./AppIcon";

function TopNav({ title, role, onLogout, navItems = [] }) {
  return (
    <nav className="top-nav" aria-label="Primary">
      <div className="top-nav__brand">
        <span className="top-nav__mark">SP</span>
        <div>
          <strong>{title}</strong>
          <span>{role === "teacher" ? "Teacher Access" : "Student Access"}</span>
        </div>
      </div>

      <div className="top-nav__links">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `top-nav__link ${isActive ? "top-nav__link--active" : ""}`}
          >
            <span className="top-nav__link-icon" aria-hidden="true">
              <AppIcon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="top-nav__actions">
        <span className="role-pill">{role}</span>
        <button className="ghost-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default TopNav;
