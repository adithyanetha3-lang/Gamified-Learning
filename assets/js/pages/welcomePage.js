import { getCurrentUser, getSubjects, seedDemoData } from "../services/storageService.js";
import { attachLogout, getLevelFromXp, getLevelProgress, requireAuth } from "../services/uiService.js";

seedDemoData();
const currentUser = requireAuth(["student"]);
attachLogout();

if (currentUser) {
  const level = getLevelFromXp(currentUser.xp);
  const levelProgress = getLevelProgress(currentUser.xp);
  document.getElementById("portalStudentName").textContent = currentUser.name;
  document.getElementById("portalWelcomeName").textContent = currentUser.name;
  document.getElementById("portalStudentSchool").textContent = currentUser.school;
  document.getElementById("portalSidebarLevel").textContent = `Level ${level}`;
  document.getElementById("portalSidebarProgress").style.width = `${levelProgress}%`;
  document.getElementById("portalXp").textContent = currentUser.xp;
  document.getElementById("portalLevel").textContent = level;
  document.getElementById("portalStreak").textContent = currentUser.streak;

  document.getElementById("portalActionCards").innerHTML = [
    { title: "Start Quiz", copy: "Open quiz only when you are ready to begin practice.", href: "quiz.html", tag: "Main action" },
    { title: "Dashboard", copy: "See XP, badges, streaks, and your learning summary.", href: "student.html", tag: "Overview" },
    { title: "Subjects", copy: "Browse subject-wise learning paths and topic areas.", href: "subjects.html", tag: "Academy" },
    { title: "Progress", copy: "View your subject completion and quiz performance.", href: "progress.html", tag: "Tracking" },
    { title: "Leaderboard", copy: "Check progress among learners in the community.", href: "leaderboard.html", tag: "Motivation" }
  ].map((item) => `<a class="action-tile" href="${item.href}"><h3>${item.title}</h3><p>${item.copy}</p><div class="question-meta-row"><span class="meta-tag">${item.tag}</span></div></a>`).join("");

  document.getElementById("portalSummaryList").innerHTML = `
    <span class="meta-tag">Beginner-friendly</span>
    <span class="meta-tag">Low-bandwidth friendly</span>
    <span class="meta-tag">Quiz starts on click</span>
  `;

  document.getElementById("portalGoalsList").innerHTML = `
    <div class="list-card">Complete one quiz today.</div>
    <div class="list-card">Review one subject from the academy page.</div>
    <div class="list-card">Maintain your learning streak.</div>
  `;

  const achievements = currentUser.badges.length ? currentUser.badges : ["No badge earned yet", "Start a quiz to unlock achievements"];
  document.getElementById("portalAchievementsList").innerHTML = achievements.map((item) => `<div class="list-card">${item}</div>`).join("");
}
