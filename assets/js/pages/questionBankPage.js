import { getPublishedQuestions, getSubjects, seedDemoData } from "../services/storageService.js";
import { attachLogout, requireAuth } from "../services/uiService.js";

seedDemoData();
requireAuth(["teacher"]);
attachLogout();

const questionBankSubjectFilter = document.getElementById("questionBankSubjectFilter");
const questionBankList = document.getElementById("questionBankList");
questionBankSubjectFilter.innerHTML = `<option value="All">All Subjects</option>${getSubjects().map((subject) => `<option value="${subject.name}">${subject.name}</option>`).join("")}`;
function renderQuestionBank() {
  const filterValue = questionBankSubjectFilter.value;
  const questions = getPublishedQuestions().filter((question) => filterValue === "All" ? true : question.subject === filterValue);
  questionBankList.innerHTML = questions.length ? questions.map((question) => `<article class="question-card"><h3>${question.question}</h3><p class="muted-text">${question.subject} • ${question.topic} • ${question.classLevel}</p><div class="stack-list">${question.options.map((option, index) => `<div class="list-card">${index + 1}. ${option}${question.correctAnswer === index ? " (Correct)" : ""}</div>`).join("")}</div></article>`).join("") : `<div class="list-card">No questions found for the selected subject.</div>`;
}
questionBankSubjectFilter.addEventListener("change", renderQuestionBank);
renderQuestionBank();
