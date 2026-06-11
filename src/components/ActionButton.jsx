import { Link } from "react-router-dom";

function ActionButton({ href, to, label, primary = false }) {
  const target = to || href || "#";

  return (
    <Link className={primary ? "primary-action" : "soft-action"} to={target}>
      {label}
    </Link>
  );
}

export default ActionButton;
