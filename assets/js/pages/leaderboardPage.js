import { getStudents, seedDemoData } from "../services/storageService.js";
import { attachLogout, getLevelFromXp, requireAuth } from "../services/uiService.js";

seedDemoData();
requireAuth(["student", "teacher"]);
attachLogout();
const students = getStudents().sort((a, b) => b.xp - a.xp);
const averageXp = students.length ? Math.round(students.reduce((sum, student) => sum + student.xp, 0) / students.length) : 0;
const bestAccuracy = students.length ? Math.max(...students.map((student) => student.accuracy || 0)) : 0;
document.getElementById("leaderboardTopList").innerHTML = students.slice(0, 3).map((student, index) => `<article class="leaderboard-card"><h3>#${index + 1} ${student.name}</h3><p>${student.school}</p><div class="question-meta-row"><span class="meta-tag">${student.xp} XP</span><span class="meta-tag">Level ${getLevelFromXp(student.xp)}</span><span class="meta-tag">${student.streak} day streak</span></div></article>`).join("");
document.getElementById("leaderboardInsightList").innerHTML = `<div class="observation-card">Average XP across active students is ${averageXp}.</div><div class="observation-card">Highest recorded quiz accuracy is ${bestAccuracy}%.</div><div class="observation-card">Leaderboard supports motivation without a cluttered interface.</div>`;
document.getElementById("leaderboardTableBody").innerHTML = students.map((student, index) => `<tr><td>${index + 1}</td><td>${student.name}</td><td>${student.school}</td><td>${getLevelFromXp(student.xp)}</td><td>${student.xp}</td><td>${student.streak}</td></tr>`).join("");
