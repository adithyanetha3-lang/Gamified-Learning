import { useMemo, useState } from "react";
import { validateAuthForm } from "../utils/authValidation";

const defaultValues = {
  name: "",
  email: "",
  password: "",
  role: ""
};

export function useAuthForm() {
  const [formValues, setFormValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});

  const isFormReady = useMemo(() => {
    return (
      formValues.name.trim() &&
      formValues.email.trim() &&
      formValues.password.trim() &&
      formValues.role
    );
  }, [formValues]);

  function updateField(fieldName, fieldValue) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: fieldValue
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: ""
    }));
  }

  function runValidation() {
    const nextErrors = validateAuthForm(formValues);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return {
    errors,
    formValues,
    isFormReady,
    runValidation,
    updateField
  };
}
