import { PROMPT_TEMPLATES } from "../data/mockData.js";
import { generateQuestions, getPromptTemplate } from "../services/questionService.js";
import { getGeneratedQuestions, getSubjects, publishApprovedQuestions, saveGeneratedQuestions, seedDemoData, updateGeneratedQuestion } from "../services/storageService.js";
import { attachLogout, requireAuth } from "../services/uiService.js";

seedDemoData();
requireAuth(["teacher"]);
attachLogout();

const generatorSubject = document.getElementById("generatorSubject");
const generatorClassLevel = document.getElementById("generatorClassLevel");
const generatorDifficulty = document.getElementById("generatorDifficulty");
const generatorQuestionCount = document.getElementById("generatorQuestionCount");
const generatorTopic = document.getElementById("generatorTopic");
const generatorLessonText = document.getElementById("generatorLessonText");
const generatorStatus = document.getElementById("generatorStatus");
const promptTemplatePreview = document.getElementById("promptTemplatePreview");
const generatedQuestionList = document.getElementById("generatedQuestionList");
const publishApprovedBtn = document.getElementById("publishApprovedBtn");

function renderSubjectOptions() {
  generatorSubject.innerHTML = getSubjects().map((subject) => `<option value="${subject.name}">${subject.name}</option>`).join("");
}

function renderPromptTemplate() {
  promptTemplatePreview.textContent = getPromptTemplate(generatorDifficulty.value);
}

function handleQuestionEdit(event) {
  const { id, field, optionIndex } = event.target.dataset;
  const question = getGeneratedQuestions().find((item) => item.id === id);
  if (!question) return;

  const updatedQuestion = { ...question };
  if (field === "question") updatedQuestion.question = event.target.value;
  else if (field === "option") {
    updatedQuestion.options = [...updatedQuestion.options];
    updatedQuestion.options[Number(optionIndex)] = event.target.value;
  } else if (field === "correctAnswer") {
    updatedQuestion.correctAnswer = Number(event.target.value);
  }

  updateGeneratedQuestion(updatedQuestion);
}

function attachEditorEvents() {
  document.querySelectorAll("[data-field='question']").forEach((input) => input.addEventListener("input", handleQuestionEdit));
  document.querySelectorAll("[data-field='option']").forEach((input) => input.addEventListener("input", handleQuestionEdit));
  document.querySelectorAll("[data-field='correctAnswer']").forEach((input) => input.addEventListener("change", handleQuestionEdit));
  document.querySelectorAll("[data-approve-id]").forEach((button) => button.addEventListener("click", () => {
    const question = getGeneratedQuestions().find((item) => item.id === button.dataset.approveId);
    if (!question) return;
    updateGeneratedQuestion({ ...question, approved: !question.approved });
    renderGeneratedQuestions();
  }));
  document.querySelectorAll("[data-reject-id]").forEach((button) => button.addEventListener("click", () => {
    const question = getGeneratedQuestions().find((item) => item.id === button.dataset.rejectId);
    if (!question) return;
    updateGeneratedQuestion({ ...question, approved: false });
    renderGeneratedQuestions();
  }));
}

function renderGeneratedQuestions() {
  const generatedQuestions = getGeneratedQuestions();
  publishApprovedBtn.classList.toggle("hidden", !generatedQuestions.some((item) => item.approved && item.status !== "published"));
  generatedQuestionList.innerHTML = generatedQuestions.length
    ? generatedQuestions.map((question, index) => `<article class="question-card"><h3>Question ${index + 1}</h3><div class="question-editor-grid"><input class="text-input" data-field="question" data-id="${question.id}" value="${question.question}">${question.options.map((option, optionIndex) => `<input class="text-input" data-field="option" data-option-index="${optionIndex}" data-id="${question.id}" value="${option}">`).join("")}<select class="text-input" data-field="correctAnswer" data-id="${question.id}">${question.options.map((_, optionIndex) => `<option value="${optionIndex}" ${question.correctAnswer === optionIndex ? "selected" : ""}>Correct Option ${optionIndex + 1}</option>`).join("")}</select></div><div class="question-meta-row"><span class="meta-tag">${question.subject}</span><span class="meta-tag">${question.classLevel}</span><span class="meta-tag">${question.difficulty}</span></div><div class="button-row"><button class="primary-button" type="button" data-approve-id="${question.id}">${question.approved ? "Approved" : "Approve"}</button><button class="secondary-button" type="button" data-reject-id="${question.id}">Reject</button></div></article>`).join("")
    : `<div class="list-card">Generated questions will appear here after you run the LLM workflow.</div>`;
  attachEditorEvents();
}

document.getElementById("generateQuestionsBtn").addEventListener("click", async () => {
  const payload = {
    subject: generatorSubject.value,
    topic: generatorTopic.value.trim(),
    classLevel: generatorClassLevel.value.trim(),
    difficulty: generatorDifficulty.value,
    count: Number(generatorQuestionCount.value),
    lessonText: generatorLessonText.value.trim(),
    template: PROMPT_TEMPLATES[generatorDifficulty.value]
  };

  if (!payload.topic && !payload.lessonText) {
    generatorStatus.textContent = "Enter either a topic or lesson text before generating.";
    return;
  }

  generatorStatus.textContent = "Generating questions through the LLM service...";

  try {
    const result = await generateQuestions(payload, { mockOnError: true });
    saveGeneratedQuestions(result.questions);
    renderGeneratedQuestions();

    if (result.source === "llm") {
      generatorStatus.textContent = `${result.questions.length} questions generated using the LLM. Review and publish approved items.`;
      return;
    }

    generatorStatus.textContent = result.warning || `${result.questions.length} sample questions generated. Review and publish approved items.`;
  } catch (error) {
    generatorStatus.textContent = error.message;
  }
});

document.getElementById("loadSamplePromptBtn").addEventListener("click", () => {
  generatorLessonText.value = "Water should be clean and safe for drinking. Students should understand boiling, filtering, and storage.";
  generatorTopic.value = "Safe Drinking Water";
  generatorClassLevel.value = "Class 5";
  renderPromptTemplate();
  generatorStatus.textContent = "Sample prompt inputs loaded.";
});

publishApprovedBtn.addEventListener("click", () => {
  const approvedQuestions = getGeneratedQuestions().filter((item) => item.approved && item.status !== "published");
  if (!approvedQuestions.length) {
    generatorStatus.textContent = "No approved questions are ready to publish.";
    return;
  }

  publishApprovedQuestions(approvedQuestions.map((item) => item.id));
  generatorStatus.textContent = `${approvedQuestions.length} approved questions published successfully.`;
  renderGeneratedQuestions();
});

generatorDifficulty.addEventListener("change", renderPromptTemplate);
renderSubjectOptions();
renderPromptTemplate();
renderGeneratedQuestions();
