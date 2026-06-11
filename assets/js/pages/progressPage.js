import { getCurrentUser, getSubjects, seedDemoData } from "../services/storageService.js";
import { attachLogout, getLevelFromXp, requireAuth } from "../services/uiService.js";

seedDemoData();
const currentUser = requireAuth(["student"]);
attachLogout();

if (currentUser) {
  document.getElementById("progressXp").textContent = currentUser.xp;
  document.getElementById("progressLevel").textContent = getLevelFromXp(currentUser.xp);
  document.getElementById("progressQuizzes").textContent = currentUser.completedQuizzes;
  document.getElementById("progressAccuracy").textContent = `${currentUser.accuracy || 0}%`;

  document.getElementById("progressSubjectBars").innerHTML = getSubjects().map((subject) => {
    const value = currentUser.progressBySubject[subject.id] || 0;
    return `<div class="subject-bar-card"><strong>${subject.name}</strong><div class="subject-bar"><div class="subject-bar-fill" style="width:${value}%"></div></div><p class="helper-text">${value}% completed</p></div>`;
  }).join("");

  document.getElementById("progressNotesList").innerHTML = currentUser.activity.map((item) => `<div class="activity-item">${item}</div>`).join("");
}
