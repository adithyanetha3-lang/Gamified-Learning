import { Link } from "react-router-dom";
import AppIcon from "./AppIcon";

function OptionCard({ icon, title, label, href, to }) {
  const target = to || href || "#";

  // Debug logging
  const handleClick = (e) => {
    console.log("🔍 OptionCard clicked:", {
      title,
      target,
      to,
      href,
      icon,
      label,
      event: e.type
    });
  };

  return (
    <Link 
      className="option-card" 
      to={target}
      onClick={handleClick}
    >
      <span className="option-card__icon" aria-hidden="true">
        <AppIcon name={icon} />
      </span>
      <span className="option-card__title">{title}</span>
      <span className="option-card__label">{label}</span>
    </Link>
  );
}

export default OptionCard;
