export function validateAuthForm({ name, email, password, role }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Name is required.";
  }

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  } else if (password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!role) {
    errors.role = "Please choose Student or Teacher.";
  }

  return errors;
}
