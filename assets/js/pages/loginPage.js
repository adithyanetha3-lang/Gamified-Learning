import { loginUser, seedDemoData } from "../services/storageService.js";

seedDemoData();
let selectedRole = "student";
const studentRoleBtn = document.getElementById("studentRoleBtn");
const teacherRoleBtn = document.getElementById("teacherRoleBtn");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

function setRole(role) {
  selectedRole = role;
  studentRoleBtn.classList.toggle("active", role === "student");
  teacherRoleBtn.classList.toggle("active", role === "teacher");
}

studentRoleBtn.addEventListener("click", () => setRole("student"));
teacherRoleBtn.addEventListener("click", () => setRole("teacher"));
loginBtn.addEventListener("click", () => {
  const name = document.getElementById("username").value.trim();
  const school = document.getElementById("schoolName").value.trim() || "Village Learning Center";
  if (!name) {
    loginStatus.textContent = "Please enter a name to continue.";
    return;
  }
  const user = loginUser({ name, school, role: selectedRole });
  loginStatus.textContent = `Welcome ${user.name}. Opening dashboard...`;
  window.location.href = user.role === "teacher" ? "teacher.html" : "welcome.html";
});
