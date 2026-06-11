import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const STORAGE_KEYS = {
  user: "gamified_user",
  role: "gamified_role",
  users: "gamified_users",
  missions: "gamified_missions"
};

const SUBJECTS = {
  logic: {
    title: "Village Logic Trail",
    icon: "LG",
    badge: "Problem Solver",
    description: "Pattern games and decision making with real village situations.",
    xp: 35,
    questions: [
      {
        q: "A water tank fills 2 buckets every minute. How many buckets fill in 5 minutes?",
        opts: ["5", "7", "10", "12"],
        a: 2
      },
      {
        q: "If the school bell rings after every 3 classes, when will it ring again after 9 classes?",
        opts: ["Once", "Twice", "Three times", "Four times"],
        a: 2
      },
      {
        q: "Which choice best completes the pattern: seed, plant, flower, ?",
        opts: ["Tree", "Fruit", "Soil", "Rain"],
        a: 1
      }
    ]
  },
  math: {
    title: "Market Math Mission",
    icon: "MT",
    badge: "Number Ninja",
    description: "Money, measurement, and quick arithmetic through market stories.",
    xp: 40,
    questions: [
      {
        q: "A farmer sells 8 mangoes in each basket. How many mangoes are in 6 baskets?",
        opts: ["42", "44", "48", "56"],
        a: 2
      },
      {
        q: "A notebook costs Rs. 18. What is the cost of 3 notebooks?",
        opts: ["Rs. 36", "Rs. 48", "Rs. 54", "Rs. 60"],
        a: 2
      },
      {
        q: "If a road is 125 meters long and workers repair 25 meters today, how much is left?",
        opts: ["75", "90", "100", "110"],
        a: 2
      }
    ]
  },
  science: {
    title: "Nature Science Quest",
    icon: "SC",
    badge: "Eco Explorer",
    description: "Hands-on science with weather, farming, water, and daily life.",
    xp: 45,
    questions: [
      {
        q: "Which source gives us the energy needed for plants to grow?",
        opts: ["Moonlight", "Sunlight", "Dust", "Wind"],
        a: 1
      },
      {
        q: "Clean drinking water should usually be stored in a container that is:",
        opts: ["Open", "Dirty", "Covered", "Broken"],
        a: 2
      },
      {
        q: "What do we call water changing into vapor because of heat?",
        opts: ["Condensation", "Evaporation", "Freezing", "Melting"],
        a: 1
      }
    ]
  },
  english: {
    title: "Story and English Journey",
    icon: "EN",
    badge: "Story Speaker",
    description: "Build confidence in reading, speaking, and useful vocabulary.",
    xp: 35,
    questions: [
      {
        q: "Choose the word closest in meaning to 'brave'.",
        opts: ["Fearful", "Courageous", "Silent", "Sleepy"],
        a: 1
      },
      {
        q: "Which sentence is correct?",
        opts: ["She go to school.", "She goes to school.", "She going to school.", "She gone to school."],
        a: 1
      },
      {
        q: "What is the plural of 'leaf'?",
        opts: ["Leafs", "Leaves", "Leafes", "Leavs"],
        a: 1
      }
    ]
  }
};

let selectedRole = "student";
let currentQuiz = [];
let currentSubject = "logic";
let currentQuestionIndex = 0;
let currentScore = 0;

function getCurrentUserName() {
  return localStorage.getItem(STORAGE_KEYS.user) || "";
}

function getCurrentRole() {
  return localStorage.getItem(STORAGE_KEYS.role) || "student";
}

function getLocalUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "{}");
}

function setLocalUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getLocalMissions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.missions) || "[]");
}

function setLocalMissions(missions) {
  localStorage.setItem(STORAGE_KEYS.missions, JSON.stringify(missions));
}

function getDefaultUser(name, role = "student") {
  return {
    name,
    role,
    school: role === "teacher" ? "Community Learning Hub" : "Sunrise Village School",
    xp: 0,
    streak: 1,
    completedLessons: 0,
    badges: [],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
}

function calculateLevel(xp = 0) {
  return Math.floor(xp / 120) + 1;
}

function calculateXpWithinLevel(xp = 0) {
  return xp % 120;
}

function badgeLabel(count) {
  return count === 1 ? "badge" : "badges";
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

async function saveUser(user) {
  const localUsers = getLocalUsers();
  localUsers[user.name] = user;
  setLocalUsers(localUsers);

  try {
    await setDoc(doc(db, "users", user.name), user, { merge: true });
  } catch (error) {
    console.warn("Firebase save skipped, using local data.", error);
  }

  return user;
}

async function loadUser(name) {
  const localUsers = getLocalUsers();

  try {
    const snapshot = await getDoc(doc(db, "users", name));
    if (snapshot.exists()) {
      const remoteUser = snapshot.data();
      localUsers[name] = remoteUser;
      setLocalUsers(localUsers);
      return remoteUser;
    }
  } catch (error) {
    console.warn("Firebase load skipped, using local data.", error);
  }

  return localUsers[name] || null;
}

async function updateUser(userName, patch) {
  const existing = (await loadUser(userName)) || getDefaultUser(userName, getCurrentRole());
  const nextUser = { ...existing, ...patch };
  const localUsers = getLocalUsers();
  localUsers[userName] = nextUser;
  setLocalUsers(localUsers);

  try {
    await updateDoc(doc(db, "users", userName), patch);
  } catch (error) {
    try {
      await setDoc(doc(db, "users", userName), nextUser, { merge: true });
    } catch (setError) {
      console.warn("Firebase update skipped, using local data.", setError);
    }
  }

  return nextUser;
}

async function loadAllUsers() {
  const localUsers = Object.values(getLocalUsers());

  try {
    const leaderboardQuery = query(collection(db, "users"), orderBy("xp", "desc"), limit(20));
    const snapshot = await getDocs(leaderboardQuery);
    const remoteUsers = snapshot.docs.map((entry) => entry.data());
    if (remoteUsers.length) {
      const merged = { ...getLocalUsers() };
      remoteUsers.forEach((user) => {
        merged[user.name] = user;
      });
      setLocalUsers(merged);
      return Object.values(merged).sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }
  } catch (error) {
    console.warn("Firebase leaderboard skipped, using local data.", error);
  }

  return localUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

function ensureSeedData() {
  const users = getLocalUsers();
  if (!Object.keys(users).length) {
    const starterUsers = {
      "Asha": { ...getDefaultUser("Asha"), xp: 220, streak: 8, completedLessons: 9, badges: ["Reading Star", "Math Spark"] },
      "Ravi": { ...getDefaultUser("Ravi"), xp: 180, streak: 6, completedLessons: 7, badges: ["Science Scout"] },
      "Meena": { ...getDefaultUser("Meena"), xp: 140, streak: 5, completedLessons: 6, badges: ["Logic Leader"] },
      "Sana Teacher": { ...getDefaultUser("Sana Teacher", "teacher"), school: "Community Learning Hub", xp: 320, badges: ["Mentor"] }
    };
    setLocalUsers(starterUsers);
  }

  if (!getLocalMissions().length) {
    setLocalMissions([
      {
        title: "Water Wisdom Quiz",
        subject: "Science",
        grade: "Middle School",
        goal: "Teach clean water habits through a 5-question mission.",
        createdBy: "Sana Teacher",
        createdAt: new Date().toISOString()
      },
      {
        title: "Market Math Sprint",
        subject: "Math",
        grade: "Primary",
        goal: "Practice multiplication using village market stories.",
        createdBy: "Sana Teacher",
        createdAt: new Date().toISOString()
      }
    ]);
  }
}

function requireUser() {
  const currentUser = getCurrentUserName();
  const page = window.location.pathname.split("/").pop() || "index.html";
  if (!currentUser && page !== "index.html") {
    window.location.href = "index.html";
  }
}

window.selectRole = function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll("[data-role-option]").forEach((button) => {
    button.classList.toggle("active", button.dataset.roleOption === role);
  });
};

window.enterPark = async function enterPark() {
  const nameField = document.getElementById("username");
  const schoolField = document.getElementById("schoolName");
  const status = document.getElementById("loginStatus");
  const name = nameField ? nameField.value.trim() : "";
  const school = schoolField ? schoolField.value.trim() : "";

  if (!name) {
    if (status) {
      status.textContent = "Please enter the learner or teacher name to continue.";
    }
    return;
  }

  const existing = (await loadUser(name)) || getDefaultUser(name, selectedRole);
  const user = {
    ...existing,
    name,
    role: selectedRole,
    school: school || existing.school || getDefaultUser(name, selectedRole).school,
    streak: Math.max(1, existing.streak || 1),
    lastLogin: new Date().toISOString()
  };

  await saveUser(user);
  localStorage.setItem(STORAGE_KEYS.user, name);
  localStorage.setItem(STORAGE_KEYS.role, selectedRole);

  window.location.href = selectedRole === "teacher" ? "teacher.html" : "home.html";
};

window.logout = function logout() {
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.role);
  window.location.href = "index.html";
};

window.showSection = function showSection(id, trigger) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("hidden", section.id !== id);
  });

  if (trigger) {
    document.querySelectorAll("[data-section-trigger]").forEach((item) => {
      item.classList.toggle("active", item === trigger);
    });
  }
};

window.startSubjectQuiz = function startSubjectQuiz(subject) {
  window.location.href = `quiz.html?subject=${encodeURIComponent(subject)}`;
};

function populateUserSummary(user) {
  const level = calculateLevel(user.xp || 0);
  const xpLevel = calculateXpWithinLevel(user.xp || 0);
  const badgeCount = (user.badges || []).length;
  const fill = `${(xpLevel / 120) * 100}%`;

  const bindings = {
    userName: user.name,
    displayName: user.name,
    userSchool: user.school || "Community Learning Hub",
    levelName: `Level ${level}`,
    levelNumber: String(level),
    xpText: `${xpLevel} / 120 XP`,
    totalXp: `${user.xp || 0}`,
    streakCount: `${user.streak || 1}`,
    badgeCount: `${badgeCount}`,
    badgeSummary: `${badgeCount} ${badgeLabel(badgeCount)}`,
    completedCount: `${user.completedLessons || 0}`
  };

  Object.entries(bindings).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-progress-fill]").forEach((bar) => {
    bar.style.width = fill;
  });
}

function renderSubjectCards() {
  const host = document.getElementById("subjectGrid");
  const miniHost = document.getElementById("subjectPreviewGrid");
  const cards = Object.entries(SUBJECTS).map(([key, subject]) => `
    <button class="subject-card" onclick="startSubjectQuiz('${key}')">
      <div class="subject-icon">${subject.icon}</div>
      <h3>${subject.title}</h3>
      <p>${subject.description}</p>
      <div class="subject-meta">
        <span class="meta-pill">+${subject.xp} XP</span>
        <span class="meta-pill">${subject.badge}</span>
      </div>
    </button>
  `).join("");

  if (host) {
    host.innerHTML = cards;
  }

  if (miniHost) {
    miniHost.innerHTML = cards;
  }
}

function renderMissionList() {
  const host = document.getElementById("missionList");
  if (!host) {
    return;
  }

  const missions = getLocalMissions().slice(0, 3);
  host.innerHTML = missions.map((mission) => `
    <article class="mission-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${mission.title}</h3>
          <p class="card-copy">${mission.goal}</p>
        </div>
        <span class="meta-pill">${mission.subject}</span>
      </div>
      <div class="inline-meta">
        <span class="meta-pill">${mission.grade}</span>
        <span class="meta-pill">By ${mission.createdBy}</span>
      </div>
    </article>
  `).join("");
}

async function renderLeaderboardPreview(currentUserName) {
  const users = await loadAllUsers();
  const previewHost = document.getElementById("leaderPreview");
  const podiumHost = document.getElementById("topThreeList");
  const tableHost = document.getElementById("leaderboardTableBody");

  if (previewHost) {
    previewHost.innerHTML = users.slice(0, 4).map((user, index) => `
      <article class="ranking-row">
        <div class="ranking-number">${index + 1}</div>
        <div>
          <h4 class="ranking-name">${user.name}${user.name === currentUserName ? " (You)" : ""}</h4>
          <p>${user.school || "Village Learning Hub"}</p>
        </div>
        <div class="ranking-score">${user.xp || 0} XP</div>
      </article>
    `).join("") || '<p class="empty-state">No learners yet. Add a learner from the login page to start the community board.</p>';
  }

  if (podiumHost) {
    podiumHost.innerHTML = users.slice(0, 3).map((user, index) => `
      <article class="ranking-row">
        <div class="ranking-number">${index + 1}</div>
        <div>
          <h4 class="ranking-name">${user.name}</h4>
          <p>${(user.badges || []).length} ${badgeLabel((user.badges || []).length)} earned</p>
        </div>
        <div class="ranking-score">${user.xp || 0} XP</div>
      </article>
    `).join("") || '<p class="empty-state">Leaderboard will appear after learners sign in.</p>';
  }

  if (tableHost) {
    tableHost.innerHTML = users.map((user, index) => `
      <tr>
        <td>#${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.role}</td>
        <td>${user.school || "Village Learning Hub"}</td>
        <td>${user.xp || 0}</td>
      </tr>
    `).join("") || '<tr><td colspan="5">No learners available yet.</td></tr>';
  }
}

function renderBadges(user) {
  const badgeHost = document.getElementById("badgeList");
  if (!badgeHost) {
    return;
  }

  const badges = user.badges && user.badges.length ? user.badges : ["Village Starter", "Daily Learner"];
  badgeHost.innerHTML = badges.map((badge) => `<span class="meta-pill">${badge}</span>`).join("");
}

async function initHomePage() {
  const userName = getCurrentUserName();
  const user = (await loadUser(userName)) || getDefaultUser(userName);
  populateUserSummary(user);
  renderSubjectCards();
  renderMissionList();
  renderBadges(user);
  renderLeaderboardPreview(userName);

  const nextLesson = document.getElementById("nextLessonName");
  if (nextLesson) {
    nextLesson.textContent = SUBJECTS.logic.title;
  }
}

function renderQuizMeta(subjectKey) {
  const subject = SUBJECTS[subjectKey];
  const title = document.getElementById("quizSubjectTitle");
  const copy = document.getElementById("quizSubjectCopy");
  const badge = document.getElementById("quizBadge");
  const reward = document.getElementById("quizReward");

  if (title) title.textContent = subject.title;
  if (copy) copy.textContent = subject.description;
  if (badge) badge.textContent = subject.badge;
  if (reward) reward.textContent = `Up to ${subject.xp} XP`;
}

function loadQuestion() {
  const question = currentQuiz[currentQuestionIndex];
  if (!question) {
    return;
  }

  const questionText = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");
  const progressBar = document.getElementById("quizProgressBar");
  const questionCount = document.getElementById("questionCount");
  const continueButton = document.getElementById("continueButton");

  if (questionText) questionText.textContent = question.q;
  if (questionCount) questionCount.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
  if (continueButton) continueButton.classList.add("hidden");
  if (progressBar) progressBar.style.width = `${(currentQuestionIndex / currentQuiz.length) * 100}%`;

  if (optionsContainer) {
    optionsContainer.innerHTML = "";
    question.opts.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "quiz-opt";
      button.textContent = option;
      button.onclick = () => verifyChoice(index, question.a);
      optionsContainer.appendChild(button);
    });
  }
}

function verifyChoice(selectedIndex, answerIndex) {
  const options = Array.from(document.querySelectorAll(".quiz-opt"));
  options.forEach((button, index) => {
    button.disabled = true;
    if (index === answerIndex) {
      button.classList.add("correct");
    }
    if (index === selectedIndex && selectedIndex !== answerIndex) {
      button.classList.add("wrong");
    }
  });

  if (selectedIndex === answerIndex) {
    currentScore += Math.round(SUBJECTS[currentSubject].xp / currentQuiz.length);
  }

  const continueButton = document.getElementById("continueButton");
  if (continueButton) {
    continueButton.classList.remove("hidden");
  }
}

window.nextQuestion = async function nextQuestion() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex < currentQuiz.length) {
    loadQuestion();
    return;
  }

  const userName = getCurrentUserName();
  const user = (await loadUser(userName)) || getDefaultUser(userName);
  const earnedBadge = SUBJECTS[currentSubject].badge;
  const nextBadges = Array.from(new Set([...(user.badges || []), earnedBadge]));
  const updatedUser = await updateUser(userName, {
    xp: (user.xp || 0) + currentScore,
    streak: (user.streak || 0) + 1,
    completedLessons: (user.completedLessons || 0) + 1,
    badges: nextBadges,
    lastLogin: new Date().toISOString()
  });

  const questionText = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");
  const continueButton = document.getElementById("continueButton");
  const progressBar = document.getElementById("quizProgressBar");
  const quizSummary = document.getElementById("quizSummary");

  if (questionText) {
    questionText.textContent = `Mission complete. ${updatedUser.name} earned ${currentScore} XP in ${SUBJECTS[currentSubject].title}.`;
  }

  if (optionsContainer) {
    optionsContainer.innerHTML = `
      <article class="surface-card">
        <h3 class="card-title">New progress unlocked</h3>
        <p class="card-copy">You are now on Level ${calculateLevel(updatedUser.xp || 0)} with ${updatedUser.completedLessons || 0} lessons completed.</p>
        <div class="inline-meta" style="margin-top:14px;">
          <span class="meta-pill">Badge earned: ${earnedBadge}</span>
          <span class="meta-pill">Total XP: ${updatedUser.xp || 0}</span>
        </div>
      </article>
    `;
  }

  if (continueButton) {
    continueButton.classList.add("hidden");
  }

  if (progressBar) {
    progressBar.style.width = "100%";
  }

  if (quizSummary) {
    quizSummary.textContent = `Great work. Your streak is now ${updatedUser.streak || 1} days.`;
  }
};

async function initQuizPage() {
  const userName = getCurrentUserName();
  const user = (await loadUser(userName)) || getDefaultUser(userName);
  populateUserSummary(user);

  const params = new URLSearchParams(window.location.search);
  const requestedSubject = params.get("subject");
  currentSubject = SUBJECTS[requestedSubject] ? requestedSubject : "logic";
  currentQuiz = SUBJECTS[currentSubject].questions;
  currentQuestionIndex = 0;
  currentScore = 0;

  renderSubjectCards();
  renderQuizMeta(currentSubject);
  loadQuestion();
}

async function initLeaderboardPage() {
  const userName = getCurrentUserName();
  const user = (await loadUser(userName)) || getDefaultUser(userName);
  populateUserSummary(user);
  renderLeaderboardPreview(userName);
}

function renderTeacherMissions() {
  const host = document.getElementById("teacherMissionList");
  if (!host) {
    return;
  }

  const missions = getLocalMissions().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  host.innerHTML = missions.map((mission) => `
    <article class="action-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${mission.title}</h3>
          <p class="card-copy">${mission.goal}</p>
        </div>
        <span class="meta-pill">${mission.subject}</span>
      </div>
      <div class="inline-meta">
        <span class="meta-pill">${mission.grade}</span>
        <span class="meta-pill">${formatDate(mission.createdAt)}</span>
        <span class="meta-pill">By ${mission.createdBy}</span>
      </div>
    </article>
  `).join("") || '<p class="empty-state">No missions published yet.</p>';
}

async function initTeacherPage() {
  const userName = getCurrentUserName();
  const user = (await loadUser(userName)) || getDefaultUser(userName, "teacher");
  populateUserSummary(user);
  renderTeacherMissions();
  renderLeaderboardPreview(userName);

  const totalLearners = document.getElementById("totalLearners");
  const missionCount = document.getElementById("missionCount");
  const engagementRate = document.getElementById("engagementRate");
  const users = await loadAllUsers();
  const learners = users.filter((entry) => entry.role !== "teacher");

  if (totalLearners) totalLearners.textContent = String(learners.length);
  if (missionCount) missionCount.textContent = String(getLocalMissions().length);
  if (engagementRate) {
    const engaged = learners.filter((entry) => (entry.completedLessons || 0) > 0).length;
    const rate = learners.length ? Math.round((engaged / learners.length) * 100) : 0;
    engagementRate.textContent = `${rate}%`;
  }

  const form = document.getElementById("missionForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const mission = {
        title: String(formData.get("title") || "").trim(),
        subject: String(formData.get("subject") || "").trim(),
        grade: String(formData.get("grade") || "").trim(),
        goal: String(formData.get("goal") || "").trim(),
        createdBy: user.name,
        createdAt: new Date().toISOString()
      };

      if (!mission.title || !mission.subject || !mission.goal) {
        const teacherStatus = document.getElementById("teacherStatus");
        if (teacherStatus) {
          teacherStatus.textContent = "Please complete the title, subject, and goal fields before publishing.";
        }
        return;
      }

      const missions = [mission, ...getLocalMissions()];
      setLocalMissions(missions);
      renderTeacherMissions();

      const teacherStatus = document.getElementById("teacherStatus");
      if (teacherStatus) {
        teacherStatus.textContent = `Mission published: ${mission.title}`;
      }

      form.reset();
      const missionCountEl = document.getElementById("missionCount");
      if (missionCountEl) {
        missionCountEl.textContent = String(missions.length);
      }
    });
  }
}

function initLoginPage() {
  window.selectRole("student");
}

window.addEventListener("DOMContentLoaded", async () => {
  ensureSeedData();
  requireUser();

  const page = window.location.pathname.split("/").pop() || "index.html";
  if (page === "index.html") {
    initLoginPage();
    return;
  }

  if (page === "home.html") {
    await initHomePage();
    return;
  }

  if (page === "quiz.html") {
    await initQuizPage();
    return;
  }

  if (page === "leaderboard.html") {
    await initLeaderboardPage();
    return;
  }

  if (page === "teacher.html") {
    await initTeacherPage();
  }
});
