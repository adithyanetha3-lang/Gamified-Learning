function FormInput({
  autoComplete,
  error,
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value
}) {
  return (
    <div className="form-section">
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`auth-input ${error ? "auth-input--error" : ""}`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export default FormInput;
