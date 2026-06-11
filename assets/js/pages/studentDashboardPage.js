import { getCurrentUser, getSubjects, seedDemoData } from "../services/storageService.js";
import { attachLogout, getLevelFromXp, getLevelProgress, requireAuth } from "../services/uiService.js";

seedDemoData();
const currentUser = requireAuth(["student"]);
attachLogout();

if (currentUser) {
  const subjects = getSubjects();
  const level = getLevelFromXp(currentUser.xp);
  const levelProgress = getLevelProgress(currentUser.xp);
  document.getElementById("studentName").textContent = currentUser.name;
  document.getElementById("studentSchool").textContent = currentUser.school;
  document.getElementById("studentSidebarLevel").textContent = `Level ${level}`;
  document.getElementById("studentSidebarProgress").style.width = `${levelProgress}%`;
  document.getElementById("studentXp").textContent = currentUser.xp;
  document.getElementById("studentLevel").textContent = level;
  document.getElementById("studentStreak").textContent = currentUser.streak;
  document.getElementById("studentBadgesCount").textContent = currentUser.badges.length;
  document.getElementById("studentProgressFill").style.width = `${levelProgress}%`;
  document.getElementById("studentProgressText").textContent = `${levelProgress} / 100 XP to next level`;
  document.getElementById("studentSubjectCards").innerHTML = subjects.map((subject) => `<a class="subject-card" href="quiz.html?subject=${encodeURIComponent(subject.name)}"><h3>${subject.name}</h3><p>${subject.description}</p><div class="question-meta-row"><span class="meta-tag">Start quiz</span></div></a>`).join("");
  document.getElementById("studentActivityList").innerHTML = currentUser.activity.map((item) => `<div class="activity-item">${item}</div>`).join("");
  document.getElementById("badgeContainer").innerHTML = currentUser.badges.length ? currentUser.badges.map((badge) => `<span class="badge-chip">${badge}</span>`).join("") : `<span class="badge-chip">No badges yet</span>`;
  document.getElementById("subjectProgressList").innerHTML = subjects.map((subject) => { const value = currentUser.progressBySubject[subject.id] || 0; return `<div class="subject-bar-card"><strong>${subject.name}</strong><div class="subject-bar"><div class="subject-bar-fill" style="width:${value}%"></div></div><p class="helper-text">${value}% completed</p></div>`; }).join("");
}
