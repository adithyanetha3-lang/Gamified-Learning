const STORAGE_KEY = "Skill Park.auth";
const LEGACY_KEYS = {
  session: "ruralEdu.session",
  users: "ruralEdu.users"
};

function readJson(key, fallback) {
  const rawValue = localStorage.getItem(key);
  return rawValue ? JSON.parse(rawValue) : fallback;
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function buildLegacyUser(profile) {
  return {
    id: profile.uid,
    name: profile.name,
    role: profile.role,
    school: profile.school || "Village Learning Center",
    xp: profile.xp || 0,
    streak: profile.streak || 0,
    badges: profile.badges || [],
    completedQuizzes: profile.completedQuizzes || 0,
    accuracy: profile.accuracy || 0,
    progressBySubject: profile.progressBySubject || {
      math: 0,
      science: 0,
      english: 0,
      social: 0
    },
    activity: profile.activity || ["Signed in to Skill Park."]
  };
}

function syncLegacySession(profile) {
  const users = readJson(LEGACY_KEYS.users, []);
  const nextUser = buildLegacyUser(profile);
  const existingIndex = users.findIndex((user) => user.id === profile.uid);

  if (existingIndex >= 0) {
    users[existingIndex] = {
      ...users[existingIndex],
      ...nextUser
    };
  } else {
    users.push(nextUser);
  }

  writeJson(LEGACY_KEYS.users, users);
  writeJson(LEGACY_KEYS.session, {
    userId: profile.uid,
    role: profile.role
  });
}

export function saveAuthProfile(profile) {
  writeJson(STORAGE_KEY, profile);
  syncLegacySession(profile);
}

export function getAuthProfile() {
  return readJson(STORAGE_KEY, null);
}

export function getLegacyUserStats(uid) {
  const users = readJson(LEGACY_KEYS.users, []);
  return users.find((user) => user.id === uid) || null;
}

export function clearAuthProfile() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEYS.session);
}

