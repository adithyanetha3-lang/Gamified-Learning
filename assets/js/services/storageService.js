// Local storage keeps the prototype usable even without backend connectivity.
import { MOCK_PUBLISHED_QUESTIONS, MOCK_TOPICS, MOCK_USERS, QUIZ_BANK, SUBJECTS } from "../data/mockData.js";

const KEYS = {
  session: "ruralEdu.session",
  users: "ruralEdu.users",
  topics: "ruralEdu.topics",
  generatedQuestions: "ruralEdu.generatedQuestions",
  publishedQuestions: "ruralEdu.publishedQuestions",
  subjectCatalog: "ruralEdu.subjectCatalog",
  quizAttempts: "ruralEdu.quizAttempts"
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function read(key, fallback) { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : clone(fallback); }
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export function seedDemoData() {
  if (!localStorage.getItem(KEYS.users)) write(KEYS.users, MOCK_USERS);
  if (!localStorage.getItem(KEYS.topics)) write(KEYS.topics, MOCK_TOPICS);
  if (!localStorage.getItem(KEYS.generatedQuestions)) write(KEYS.generatedQuestions, []);
  if (!localStorage.getItem(KEYS.publishedQuestions)) write(KEYS.publishedQuestions, MOCK_PUBLISHED_QUESTIONS);
  if (!localStorage.getItem(KEYS.subjectCatalog)) write(KEYS.subjectCatalog, SUBJECTS);
  if (!localStorage.getItem(KEYS.quizAttempts)) write(KEYS.quizAttempts, []);
}

export function loginUser({ name, school, role }) {
  const users = getUsers();
  let existingUser = users.find((user) => user.name.toLowerCase() === name.toLowerCase() && user.role === role);
  if (!existingUser) {
    existingUser = { id: `${role}-${Date.now()}`, name, role, school, xp: 0, streak: 0, badges: [], completedQuizzes: 0, accuracy: 0, progressBySubject: { math: 0, science: 0, english: 0, social: 0 }, activity: ["Signed in to the platform."] };
    users.push(existingUser);
    write(KEYS.users, users);
  }
  write(KEYS.session, { userId: existingUser.id, role: existingUser.role });
  return existingUser;
}

export function logoutUser() { localStorage.removeItem(KEYS.session); }
export function getSession() { return read(KEYS.session, null); }
export function getCurrentUser() { const session = getSession(); return session ? getUsers().find((user) => user.id === session.userId) || null : null; }
export function getUsers() { return read(KEYS.users, MOCK_USERS); }
export function getStudents() { return getUsers().filter((user) => user.role === "student"); }
export function getSubjects() { return read(KEYS.subjectCatalog, SUBJECTS); }
export function getTopics() { return read(KEYS.topics, MOCK_TOPICS); }
export function getGeneratedQuestions() { return read(KEYS.generatedQuestions, []); }
export function getPublishedQuestions() { return read(KEYS.publishedQuestions, MOCK_PUBLISHED_QUESTIONS); }
export function getQuizBankBySubject(subjectName) { return QUIZ_BANK[subjectName] || []; }
export function getQuizAttempts() { return read(KEYS.quizAttempts, []); }

export function addTopic(subject, topic) {
  const topics = getTopics();
  const nextTopic = { id: `topic-${Date.now()}`, subject, topic, languageSupport: "English / future local language" };
  topics.unshift(nextTopic);
  write(KEYS.topics, topics);
  return nextTopic;
}

export function saveGeneratedQuestions(generatedQuestions) { write(KEYS.generatedQuestions, generatedQuestions); }
export function updateGeneratedQuestion(updatedQuestion) { const questions = getGeneratedQuestions().map((question) => question.id === updatedQuestion.id ? updatedQuestion : question); write(KEYS.generatedQuestions, questions); return updatedQuestion; }

export function publishApprovedQuestions(questionIds) {
  const generated = getGeneratedQuestions();
  const published = getPublishedQuestions();
  const approvedItems = generated.filter((item) => questionIds.includes(item.id) && item.approved).map((item) => ({ ...item, status: "published" }));
  write(KEYS.publishedQuestions, [...approvedItems, ...published]);
  write(KEYS.generatedQuestions, generated.map((item) => questionIds.includes(item.id) ? { ...item, status: "published" } : item));
  return approvedItems;
}

export function addManualQuestion(question) {
  const published = getPublishedQuestions();
  const nextQuestion = { ...question, id: `manual-${Date.now()}`, status: "published" };
  write(KEYS.publishedQuestions, [nextQuestion, ...published]);
  return nextQuestion;
}

function mapSubjectNameToKey(subjectName) { return ({ Mathematics: "math", Science: "science", English: "english", "Social Studies": "social" })[subjectName] || "math"; }

export function recordQuizAttempt({ subjectName, score, totalQuestions, accuracy }) {
  const attempts = read(KEYS.quizAttempts, []);
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  // Persist every attempt so analytics can stay lightweight and table-driven.
  attempts.push({ id: `attempt-${Date.now()}`, studentId: currentUser.id, subjectName, score, totalQuestions, accuracy, date: new Date().toISOString() });
  write(KEYS.quizAttempts, attempts);

  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === currentUser.id);
  if (userIndex < 0) return null;
  const updatedUser = { ...users[userIndex] };
  updatedUser.xp += score * 10;
  updatedUser.completedQuizzes += 1;
  updatedUser.streak += 1;
  updatedUser.accuracy = Math.round((updatedUser.accuracy + accuracy) / 2 || accuracy);
  const subjectKey = mapSubjectNameToKey(subjectName);
  updatedUser.progressBySubject[subjectKey] = Math.min(100, (updatedUser.progressBySubject[subjectKey] || 0) + 15);
  if (updatedUser.xp >= 100 && !updatedUser.badges.includes("First 100 XP")) updatedUser.badges.push("First 100 XP");
  if (accuracy >= 80 && !updatedUser.badges.includes(`${subjectName} Achiever`)) updatedUser.badges.push(`${subjectName} Achiever`);
  updatedUser.activity = [`Completed ${subjectName} quiz with ${accuracy}% accuracy.`, ...updatedUser.activity].slice(0, 5);
  users[userIndex] = updatedUser;
  write(KEYS.users, users);
  return updatedUser;
}

export function getTeacherSummary() {
  const subjects = getSubjects();
  const students = getStudents();
  const published = getPublishedQuestions();
  const generated = getGeneratedQuestions();
  return { subjectsCount: subjects.length, publishedCount: published.length, pendingCount: generated.filter((item) => item.status !== "published").length, activeStudents: students.filter((student) => student.completedQuizzes > 0).length };
}
