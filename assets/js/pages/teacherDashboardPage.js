import { addManualQuestion, addTopic, getTeacherSummary, getTopics, seedDemoData } from "../services/storageService.js";
import { attachLogout, requireAuth } from "../services/uiService.js";

seedDemoData();
const currentUser = requireAuth(["teacher"]);
attachLogout();
if (currentUser) {
  document.getElementById("teacherName").textContent = currentUser.name;
  document.getElementById("teacherSchool").textContent = currentUser.school;
}

function renderSummary() {
  const summary = getTeacherSummary();
  document.getElementById("teacherSubjectsCount").textContent = summary.subjectsCount;
  document.getElementById("teacherPublishedCount").textContent = summary.publishedCount;
  document.getElementById("teacherPendingCount").textContent = summary.pendingCount;
  document.getElementById("teacherActiveStudents").textContent = summary.activeStudents;
}

function renderTopics() {
  document.getElementById("teacherTopicList").innerHTML = getTopics().slice(0, 6).map((item) => `<div class="list-card"><strong>${item.subject}</strong><p>${item.topic}</p><p class="helper-text">${item.languageSupport}</p></div>`).join("");
}

function renderSummaryList() {
  document.getElementById("teacherSummaryList").innerHTML = `<div class="list-card">Teachers can save topics and move quickly into question generation.</div><div class="list-card">LLM assistance reduces repetitive manual drafting of MCQs.</div><div class="list-card">Approval is still controlled by the teacher before publishing.</div>`;
}

document.getElementById("teacherAddTopicBtn").addEventListener("click", () => {
  const subject = document.getElementById("teacherSubjectName").value.trim();
  const topic = document.getElementById("teacherTopicName").value.trim();
  const status = document.getElementById("teacherTopicStatus");
  if (!subject || !topic) { status.textContent = "Please enter both subject and topic."; return; }
  addTopic(subject, topic);
  status.textContent = `Saved topic "${topic}" under ${subject}.`;
  document.getElementById("teacherSubjectName").value = "";
  document.getElementById("teacherTopicName").value = "";
  renderTopics();
});

document.getElementById("manualQuestionBtn").addEventListener("click", () => {
  const subject = document.getElementById("manualQuestionSubject").value.trim();
  const topic = document.getElementById("manualQuestionTopic").value.trim() || "General";
  const question = document.getElementById("manualQuestionText").value.trim();
  const options = ["manualOption1", "manualOption2", "manualOption3", "manualOption4"].map((id) => document.getElementById(id).value.trim());
  const correctAnswer = Number(document.getElementById("manualCorrectAnswer").value);
  const status = document.getElementById("manualQuestionStatus");
  if (!subject || !question || options.some((item) => !item)) {
    status.textContent = "Please fill subject, question, and all four options.";
    return;
  }
  addManualQuestion({ subject, topic, classLevel: "General", difficulty: "manual", question, options, correctAnswer });
  status.textContent = "Manual question published successfully.";
  ["manualQuestionSubject", "manualQuestionTopic", "manualQuestionText", "manualOption1", "manualOption2", "manualOption3", "manualOption4"].forEach((id) => { document.getElementById(id).value = ""; });
  document.getElementById("manualCorrectAnswer").value = "0";
  renderSummary();
});

renderSummary();
renderTopics();
renderSummaryList();
