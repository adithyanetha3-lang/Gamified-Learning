import { getPublishedQuestions, getQuizBankBySubject, recordQuizAttempt, seedDemoData } from "../services/storageService.js";
import { attachLogout, requireAuth } from "../services/uiService.js";

seedDemoData();
const currentUser = requireAuth(["student"]);
attachLogout();

const subjectCards = document.getElementById("quizSubjectCards");
const quizTitle = document.getElementById("quizTitle");
const quizDescription = document.getElementById("quizDescription");
const quizMetaBadge = document.getElementById("quizMetaBadge");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizNextBtn = document.getElementById("quizNextBtn");
const quizRestartBtn = document.getElementById("quizRestartBtn");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizProgressText = document.getElementById("quizProgressText");
const quizFeedback = document.getElementById("quizFeedback");

let activeSubject = "";
let currentQuestions = [];
let questionIndex = 0;
let score = 0;
let answered = false;

function getSubjectsFromBank() {
  const publishedQuestions = getPublishedQuestions();
  const publishedSubjects = [...new Set(publishedQuestions.map((item) => item.subject))];
  return ["Mathematics", "Science", "English", "Social Studies"].map((name) => ({ name, hasPublished: publishedSubjects.includes(name) }));
}

function loadSubjectCards() {
  subjectCards.innerHTML = getSubjectsFromBank().map((subject) => `<button class="subject-card" type="button" data-subject="${subject.name}"><h3>${subject.name}</h3><p>${subject.hasPublished ? "Published questions available." : "Using sample quiz set."}</p></button>`).join("");
  subjectCards.querySelectorAll("[data-subject]").forEach((button) => button.addEventListener("click", () => startQuiz(button.dataset.subject)));
}

function startQuiz(subjectName) {
  activeSubject = subjectName;
  questionIndex = 0;
  score = 0;
  answered = false;
  const publishedQuestions = getPublishedQuestions().filter((item) => item.subject === subjectName).map((item) => ({ question: item.question, options: item.options, correctAnswer: item.correctAnswer }));
  currentQuestions = publishedQuestions.length ? publishedQuestions : getQuizBankBySubject(subjectName);
  quizTitle.textContent = subjectName;
  quizDescription.textContent = "Answer the questions clearly. Each quiz uses simple, readable options.";
  quizMetaBadge.textContent = `${currentQuestions.length} questions`;
  quizRestartBtn.classList.add("hidden");
  renderQuestion();
}

function renderQuestion() {
  if (!currentQuestions.length) { quizQuestion.textContent = "No questions found for this subject."; quizOptions.innerHTML = ""; quizNextBtn.classList.add("hidden"); return; }
  const current = currentQuestions[questionIndex];
  quizQuestion.textContent = current.question;
  quizOptions.innerHTML = current.options.map((option, index) => `<button class="option-button" type="button" data-index="${index}">${option}</button>`).join("");
  quizProgressFill.style.width = `${(questionIndex / currentQuestions.length) * 100}%`;
  quizProgressText.textContent = `Question ${questionIndex + 1} of ${currentQuestions.length}`;
  quizFeedback.textContent = "";
  quizNextBtn.classList.add("hidden");
  quizOptions.querySelectorAll("[data-index]").forEach((button) => button.addEventListener("click", () => handleAnswer(Number(button.dataset.index))));
}

function handleAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  const current = currentQuestions[questionIndex];
  const optionButtons = quizOptions.querySelectorAll("[data-index]");
  optionButtons.forEach((button) => {
    const index = Number(button.dataset.index);
    if (index === current.correctAnswer) button.classList.add("correct");
    else if (index === selectedIndex) button.classList.add("incorrect");
    button.disabled = true;
  });
  if (selectedIndex === current.correctAnswer) { score += 1; quizFeedback.textContent = "Correct answer."; }
  else quizFeedback.textContent = "Incorrect answer. Review the highlighted correct option.";
  quizNextBtn.classList.remove("hidden");
}

function finishQuiz() {
  const accuracy = Math.round((score / currentQuestions.length) * 100);
  const updatedUser = recordQuizAttempt({ subjectName: activeSubject, score, totalQuestions: currentQuestions.length, accuracy });
  quizQuestion.textContent = `Quiz completed. You scored ${score} out of ${currentQuestions.length}.`;
  quizOptions.innerHTML = "";
  quizProgressFill.style.width = "100%";
  quizProgressText.textContent = `Accuracy: ${accuracy}%`;
  quizFeedback.textContent = updatedUser ? `${updatedUser.name} earned XP and updated progress in ${activeSubject}.` : "Quiz result saved.";
  quizNextBtn.classList.add("hidden");
  quizRestartBtn.classList.remove("hidden");
}

quizNextBtn.addEventListener("click", () => { questionIndex += 1; answered = false; if (questionIndex >= currentQuestions.length) { finishQuiz(); return; } renderQuestion(); });
quizRestartBtn.addEventListener("click", () => { if (activeSubject) startQuiz(activeSubject); });
if (currentUser) { loadSubjectCards(); const requestedSubject = new URLSearchParams(window.location.search).get("subject"); if (requestedSubject) startQuiz(requestedSubject); }
