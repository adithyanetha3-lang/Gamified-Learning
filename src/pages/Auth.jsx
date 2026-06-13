import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import RoleSelector from "../components/RoleSelector";
import { useAuthForm } from "../hooks/useAuthForm";
import { getFriendlyFirebaseError, signInWithEmail, signUpWithEmail } from "../services/authService";
import { getAuthProfile, saveAuthProfile } from "../services/localStorageService";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [feedback, setFeedback] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const { errors, formValues, isFormReady, runValidation, updateField } = useAuthForm();

  useEffect(() => {
    if (getAuthProfile()?.role) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ error: "", success: "" });

    if (!runValidation()) {
      return;
    }

    setLoading(true);

    try {
      const authAction = mode === "signup" ? signUpWithEmail : signInWithEmail;
      const user = await authAction({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password.trim(),
        role: formValues.role
      });

      // For sign in, get the actual role from Firestore
      let actualRole = formValues.role;
      if (mode === "signin") {
        const { getUserProfile } = await import("../services/authService");
        const profile = await getUserProfile(user.uid);
        actualRole = profile?.role || formValues.role;
      }

      saveAuthProfile({
        uid: user.uid,
        name: formValues.name.trim(),
        role: actualRole, // Use the actual role from database
        emailOrId: formValues.email.trim()
      });

      setFeedback({
        error: "",
        success: mode === "signup" ? "Account created successfully." : "Signed in successfully."
      });

      navigate("/home", {
        replace: true
      });
    } catch (error) {
      setFeedback({
        error: getFriendlyFirebaseError(error),
        success: ""
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-layout-react auth-layout-react--centered">
        <AuthCard>
          <div className="auth-card__header">
            <div className="auth-title-block">
              <p className="auth-brand">Skill Park</p>
              <h1>Learn. Grow. Shine.</h1>
              <p className="auth-muted">{mode === "signup" ? "Create your account" : "Welcome back"}</p>
            </div>

            <div className="mode-switch">
              <button
                type="button"
                className={`mode-switch__button ${mode === "signin" ? "mode-switch__button--active" : ""}`}
                onClick={() => setMode("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mode-switch__button ${mode === "signup" ? "mode-switch__button--active" : ""}`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <FormInput
              id="name"
              label="Name"
              placeholder="Enter your full name"
              value={formValues.name}
              onChange={(value) => updateField("name", value)}
              error={errors.name}
              autoComplete="name"
            />

            <FormInput
              id="email"
              label="Email"
              placeholder="Enter your email"
              value={formValues.email}
              onChange={(value) => updateField("email", value)}
              error={errors.email}
              autoComplete="email"
              type="email"
            />

            <FormInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={formValues.password}
              onChange={(value) => updateField("password", value)}
              error={errors.password}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              type="password"
            />

            <RoleSelector
              selectedRole={formValues.role}
              error={errors.role}
              onSelect={(role) => updateField("role", role)}
            />

            {feedback.error ? <p className="auth-feedback auth-feedback--error">{feedback.error}</p> : null}
            {feedback.success ? <p className="auth-feedback auth-feedback--success">{feedback.success}</p> : null}

            <button
              type="submit"
              className="auth-submit"
              disabled={!isFormReady || loading}
            >
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Continue to Skill Park"}
            </button>
          </form>
        </AuthCard>
      </section>
    </main>
  );
}

export default Auth;
