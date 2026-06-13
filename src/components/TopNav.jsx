import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppIcon from "./AppIcon";
import LanguageSwitcher from "./LanguageSwitcher";

function TopNav({ title, role, onLogout, navItems = [] }) {
  const { t } = useTranslation();
  
  return (
    <nav className="top-nav" aria-label="Primary">
      <div className="top-nav__brand">
        <span className="top-nav__mark">SP</span>
        <div>
          <strong>{title}</strong>
          <span>{role === "teacher" ? t('auth.teacher') + " Access" : t('auth.student') + " Access"}</span>
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
        <LanguageSwitcher />
        <span className="role-pill">{role === "teacher" ? t('auth.teacher') : t('auth.student')}</span>
        <button className="ghost-button" type="button" onClick={onLogout}>
          {t('auth.logout')}
        </button>
      </div>
    </nav>
  );
}

export default TopNav;
