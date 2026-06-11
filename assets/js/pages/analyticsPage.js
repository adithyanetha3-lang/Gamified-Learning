import { getQuizAttempts, getStudents, getSubjects, seedDemoData } from "../services/storageService.js";
import { attachLogout, getLevelFromXp, requireAuth } from "../services/uiService.js";

seedDemoData();
requireAuth(["teacher"]);
attachLogout();
const students = getStudents();
const attempts = getQuizAttempts();
const subjects = getSubjects();
const averageXp = students.length ? Math.round(students.reduce((sum, student) => sum + student.xp, 0) / students.length) : 0;
const averageAccuracy = students.length ? Math.round(students.reduce((sum, student) => sum + (student.accuracy || 0), 0) / students.length) : 0;
const highestStreak = students.length ? Math.max(...students.map((student) => student.streak || 0)) : 0;
document.getElementById("analyticsStudentCount").textContent = students.length;
document.getElementById("analyticsAverageXp").textContent = averageXp;
document.getElementById("analyticsAverageAccuracy").textContent = `${averageAccuracy}%`;
document.getElementById("analyticsBestStreak").textContent = highestStreak;
document.getElementById("analyticsSubjectBars").innerHTML = subjects.map((subject) => { const subjectAttempts = attempts.filter((attempt) => attempt.subjectName === subject.name); const average = subjectAttempts.length ? Math.round(subjectAttempts.reduce((sum, attempt) => sum + attempt.accuracy, 0) / subjectAttempts.length) : 0; return `<div class="subject-bar-card"><strong>${subject.name}</strong><div class="subject-bar"><div class="subject-bar-fill" style="width:${average}%"></div></div><p class="helper-text">${average}% average accuracy</p></div>`; }).join("");
document.getElementById("analyticsObservationList").innerHTML = `<div class="observation-card">Students with higher streaks generally show higher quiz completion.</div><div class="observation-card">Readable analytics helps teachers act quickly without complex charts.</div><div class="observation-card">Low-bandwidth presentation uses simple bars and tables instead of heavy graphics.</div>`;
document.getElementById("analyticsTableBody").innerHTML = students.map((student) => `<tr><td>${student.name}</td><td>${student.xp}</td><td>${getLevelFromXp(student.xp)}</td><td>${student.streak}</td><td>${student.accuracy || 0}%</td><td>${student.completedQuizzes}</td></tr>`).join("");
