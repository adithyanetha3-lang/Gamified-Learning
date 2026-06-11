import { getSubjects, getTopics, seedDemoData } from "../services/storageService.js";
import { attachLogout, requireAuth } from "../services/uiService.js";

seedDemoData();
requireAuth(["student"]);
attachLogout();

document.getElementById("subjectsPageCards").innerHTML = getSubjects().map((subject) => `<a class="subject-card" href="quiz.html?subject=${encodeURIComponent(subject.name)}"><h3>${subject.name}</h3><p>${subject.description}</p><div class="question-meta-row"><span class="meta-tag">Open practice</span></div></a>`).join("");
document.getElementById("subjectsTopicList").innerHTML = getTopics().map((topic) => `<div class="list-card"><strong>${topic.subject}</strong><p>${topic.topic}</p><p class="helper-text">${topic.languageSupport}</p></div>`).join("");
