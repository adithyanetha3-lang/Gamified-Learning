import { motion } from "framer-motion";

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Learn and track"
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "Manage class"
  }
];

function RoleSelector({ selectedRole, error, onSelect }) {
  return (
    <div className="form-section">
      <label className="auth-label">Choose Role</label>
      <div className="role-grid">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;

          return (
            <motion.button
              key={role.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className={`role-card ${isSelected ? "role-card--selected" : ""}`}
              onClick={() => onSelect(role.id)}
            >
              <span className="role-card__title">{role.title}</span>
              <span className="role-card__description">{role.description}</span>
            </motion.button>
          );
        })}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default RoleSelector;
