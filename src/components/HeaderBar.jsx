function HeaderBar({ profile, onLogout }) {
  const firstName = profile?.name?.split(" ")[0] || "Learner";

  return (
    <header className="header-bar">
      <div>
        <p className="eyebrow">Skill Park</p>
        <h1>{profile?.role === "teacher" ? "Teacher Home" : `Hi, ${firstName}`}</h1>
      </div>
      <div className="header-actions">
        <span className="role-pill">{profile?.role}</span>
        <button className="ghost-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default HeaderBar;
