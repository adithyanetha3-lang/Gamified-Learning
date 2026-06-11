import ActionButton from "./ActionButton";

function QuickActionPanel({ actions }) {
  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <ActionButton key={action.label} {...action} />
      ))}
    </div>
  );
}

export default QuickActionPanel;
