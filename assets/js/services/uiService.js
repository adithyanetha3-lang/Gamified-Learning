import { getCurrentUser, logoutUser } from "./storageService.js";

export function requireAuth(allowedRoles = []) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = "index.html"; return null; }
  if (allowedRoles.length && !allowedRoles.includes(currentUser.role)) { window.location.href = currentUser.role === "teacher" ? "teacher.html" : "student.html"; return null; }
  return currentUser;
}

export function attachLogout() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => { logoutUser(); window.location.href = "index.html"; });
  });
}

export function getLevelFromXp(xp) { return Math.floor(xp / 100) + 1; }
export function getLevelProgress(xp) { return xp % 100; }
