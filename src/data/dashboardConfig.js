export const DASHBOARD_CONFIG = {
  student: {
    header: {
      eyebrow: "Learning Hub",
      subtitle: "Pick a path and keep moving."
    },
    options: [
      { key: "learn", icon: "learn", title: "Learn", label: "Academy", to: "/learn" },
      { key: "courses", icon: "courses", title: "Courses", label: "Subjects", to: "/courses" },
      { key: "quiz", icon: "quiz", title: "Quiz", label: "Practice", to: "/quiz" },
      { key: "rewards", icon: "rewards", title: "Rewards", label: "Badges", to: "/rewards" },
      { key: "leaderboard", icon: "leaderboard", title: "Rank", label: "Leaderboard", to: "/leaderboard" },
      { key: "progress", icon: "progress", title: "Track", label: "Progress", to: "/progress" }
    ],
    actions: [
      { label: "Continue Learning", to: "/learn", primary: true },
      { label: "View Rewards", to: "/rewards" },
      { label: "Practice Quiz", to: "/quiz" }
    ],
    navItems: [
      { label: "Home", to: "/home", icon: "home" },
      { label: "Learn", to: "/learn", icon: "learn" },
      { label: "Quiz", to: "/quiz", icon: "quiz" },
      { label: "Rewards", to: "/rewards", icon: "rewards" },
      { label: "Track", to: "/progress", icon: "progress" }
    ]
  },
  teacher: {
    header: {
      eyebrow: "Teaching Hub",
      subtitle: "Review, publish, and track class activity."
    },
    options: [
      { key: "subjects", icon: "students", title: "Subjects", label: "Manage", to: "/subjects" },
      { key: "generator", icon: "questions", title: "Generate", label: "AI Questions", to: "/generator" },
      { key: "bank", icon: "bank", title: "Bank", label: "Questions", to: "/question-bank" },
      { key: "analytics", icon: "analytics", title: "Analytics", label: "Reports", to: "/analytics" },
      { key: "teacher", icon: "manage", title: "Dashboard", label: "Overview", to: "/teacher" }
    ],
    actions: [
      { label: "Generate Questions", to: "/generator", primary: true },
      { label: "Question Bank", to: "/question-bank" },
      { label: "View Analytics", to: "/analytics" }
    ],
    navItems: [
      { label: "Home", to: "/home", icon: "home" },
      { label: "Subjects", to: "/subjects", icon: "students" },
      { label: "Generate", to: "/generator", icon: "questions" },
      { label: "Bank", to: "/question-bank", icon: "bank" },
      { label: "Analytics", to: "/analytics", icon: "analytics" }
    ]
  }
};

export const SECTION_CONTENT = {
  student: {
    learn: {
      eyebrow: "Learn",
      title: "Learning Path",
      subtitle: "Continue with guided practice and short lessons.",
      stats: [
        { label: "Focus", value: "Daily" },
        { label: "Mode", value: "Guided" },
        { label: "Time", value: "15 min" }
      ],
      panels: {
        primary: ["Math Basics", "Science Practice", "English Reading"],
        secondary: ["Finish one lesson", "Review one topic", "Keep your streak"]
      },
      topics: [
        { title: "Numbers", info: "Place value, comparison, and mental math for daily calculations." },
        { title: "Reading", info: "Short passages with vocabulary, meaning, and sentence flow." },
        { title: "Nature", info: "Plants, animals, water, and environment through simple examples." },
        { title: "Daily Skills", info: "Money, time, and measurements used in real-life activities." }
      ],
      related: ["Counting and place value", "Sentence meaning", "Water and plants", "Time and measurement"]
    },
    courses: {
      eyebrow: "Courses",
      title: "Subject Library",
      subtitle: "Browse available subjects and pick where to continue.",
      stats: [
        { label: "Subjects", value: "4" },
        { label: "Level", value: "Mixed" },
        { label: "Mode", value: "Self-paced" }
      ],
      panels: {
        primary: ["Mathematics", "Science", "English"],
        secondary: ["Choose a subject", "Open a topic", "Continue learning"]
      },
      topics: [
        { title: "Mathematics", info: "Fractions, geometry, tables, and practical problem solving." },
        { title: "Science", info: "Food, health, water, plants, and everyday observations." },
        { title: "English", info: "Nouns, verbs, reading comprehension, and basic grammar." },
        { title: "Social Studies", info: "Community, maps, transport, and local surroundings." }
      ],
      related: ["Fractions and shapes", "Health and hygiene", "Reading and grammar", "People and places"]
    },
    quiz: {
      eyebrow: "Quiz",
      title: "Practice Quiz",
      subtitle: "Short quiz sessions with clear goals and quick scoring.",
      stats: [
        { label: "Type", value: "MCQ" },
        { label: "Round", value: "5 Qs" },
        { label: "Goal", value: "Accuracy" }
      ],
      panels: {
        primary: ["Start practice", "Revision set", "Daily test"],
        secondary: ["Warm up first", "Review answers", "Try again"]
      },
      topics: [
        { title: "Basic Quiz", info: "Simple questions for confidence building and quick recall." },
        { title: "Revision Quiz", info: "Short mixed-topic checks before class tests." },
        { title: "Daily Practice", info: "Regular practice to strengthen subject memory." },
        { title: "Subject Quiz", info: "Focused questions for one selected topic or chapter." }
      ],
      related: ["Instant scoring", "Topic-wise questions", "Daily revision", "Repeat practice"]
    },
    rewards: {
      eyebrow: "Rewards",
      title: "Rewards Center",
      subtitle: "View your unlocked badges, wins, and goals.",
      stats: [
        { label: "Badges", value: "Visible" },
        { label: "XP", value: "Active" },
        { label: "Goal", value: "Next Reward" }
      ],
      panels: {
        primary: ["XP Milestones", "Top Badge", "Next Unlock"],
        secondary: ["Earn more XP", "Complete quizzes", "Keep learning"]
      },
      topics: [
        { title: "XP Points", info: "Earn points for lessons, quiz wins, and consistent use." },
        { title: "Badges", info: "Unlock achievement badges for topics and performance." },
        { title: "Streak", info: "Maintain regular study days to build momentum." },
        { title: "Goals", info: "Set a short target and move toward the next unlock." }
      ],
      related: ["Quiz rewards", "Daily streaks", "Lesson completion", "Achievement levels"]
    },
    leaderboard: {
      eyebrow: "Rank",
      title: "Leaderboard",
      subtitle: "Track your position and compare progress clearly.",
      stats: [
        { label: "Rank", value: "Live" },
        { label: "Class", value: "Visible" },
        { label: "XP", value: "Compared" }
      ],
      panels: {
        primary: ["Top Learners", "Your Rank", "Weekly Movers"],
        secondary: ["Gain XP", "Complete lessons", "Climb higher"]
      },
      topics: [
        { title: "Class Rank", info: "See your learning position within your class group." },
        { title: "Weekly Movers", info: "Track learners who improved fastest this week." },
        { title: "XP Compare", info: "Compare total points with peers in a simple view." },
        { title: "Motivation", info: "Use ranking as encouragement, not pressure." }
      ],
      related: ["XP totals", "Weekly growth", "Class comparison", "Learning goals"]
    },
    progress: {
      eyebrow: "Track",
      title: "Progress Report",
      subtitle: "See how far you have come across your learning areas.",
      stats: [
        { label: "Track", value: "Active" },
        { label: "Topics", value: "Measured" },
        { label: "Trend", value: "Rising" }
      ],
      panels: {
        primary: ["Lesson Progress", "Quiz Accuracy", "Weekly Growth"],
        secondary: ["Check weak areas", "Repeat practice", "Stay consistent"]
      },
      topics: [
        { title: "Lesson Completion", info: "Monitor how many lessons and modules are finished." },
        { title: "Accuracy", info: "View how correctly questions were answered over time." },
        { title: "Growth", info: "Notice improvement week by week in a simple pattern." },
        { title: "Weak Areas", info: "Find topics that need extra learning support." }
      ],
      related: ["Topic completion", "Quiz review", "Weekly trend", "Support areas"]
    }
  },
  teacher: {
    students: {
      eyebrow: "Students",
      title: "Student Overview",
      subtitle: "Monitor activity, pace, and participation in one place.",
      stats: [
        { label: "View", value: "Class" },
        { label: "Status", value: "Live" },
        { label: "Focus", value: "Engagement" }
      ],
      panels: {
        primary: ["Active Learners", "Needs Support", "Top Progress"],
        secondary: ["Check attendance", "Review scores", "Plan action"]
      },
      topics: [
        { title: "Active Learners", info: "Students showing regular login, learning, and quiz activity." },
        { title: "Support Group", info: "Students needing extra help based on slower progress." },
        { title: "Performance View", info: "Track class strength across subjects and quiz outcomes." },
        { title: "Engagement", info: "See which learners are participating consistently." }
      ],
      related: ["Attendance pattern", "Low performers", "High performers", "Participation trend"]
    },
    questions: {
      eyebrow: "Questions",
      title: "Question Studio",
      subtitle: "Create or refine new question sets for your class.",
      stats: [
        { label: "Mode", value: "Draft" },
        { label: "LLM", value: "Ready" },
        { label: "Review", value: "Manual" }
      ],
      panels: {
        primary: ["Generate Drafts", "Edit Questions", "Approve Set"],
        secondary: ["Use topic text", "Check difficulty", "Publish later"]
      },
      topics: [
        { title: "Topic Input", info: "Enter lesson text or topic to generate draft questions." },
        { title: "Difficulty", info: "Choose basic, medium, revision, or daily-practice mode." },
        { title: "Manual Review", info: "Edit wording, options, and correct answers before approval." },
        { title: "Curriculum Fit", info: "Keep questions age-appropriate and aligned with lessons." }
      ],
      related: ["Lesson text", "Difficulty levels", "MCQ review", "Approval workflow"]
    },
    publish: {
      eyebrow: "Publish",
      title: "Publish Queue",
      subtitle: "Review approved material before making it live.",
      stats: [
        { label: "Queue", value: "Ready" },
        { label: "Review", value: "Pending" },
        { label: "Output", value: "Live" }
      ],
      panels: {
        primary: ["Approved Drafts", "Ready Sets", "Latest Publish"],
        secondary: ["Final review", "Push to bank", "Track updates"]
      },
      topics: [
        { title: "Approved Drafts", info: "Keep only reviewed question sets in the publish stage." },
        { title: "Publish Control", info: "Release content only after verifying clarity and correctness." },
        { title: "Subject Bank", info: "Send finished questions to subject-wise storage." },
        { title: "Revision Updates", info: "Republish improved versions when needed." }
      ],
      related: ["Approval stage", "Question bank", "Version review", "Publishing flow"]
    },
    analytics: {
      eyebrow: "Analytics",
      title: "Learning Analytics",
      subtitle: "Understand performance through compact teaching insights.",
      stats: [
        { label: "Scores", value: "Visible" },
        { label: "Trend", value: "Weekly" },
        { label: "Use", value: "Planning" }
      ],
      panels: {
        primary: ["Class Accuracy", "Topic Gaps", "Recent Trends"],
        secondary: ["Find weak areas", "Adjust quizzes", "Support learners"]
      },
      topics: [
        { title: "Accuracy", info: "Measure how well the class answers questions by topic." },
        { title: "Topic Gaps", info: "Identify chapters where many students struggle." },
        { title: "Trend View", info: "Observe whether scores are improving over time." },
        { title: "Teaching Action", info: "Use insights to decide revision or re-teaching needs." }
      ],
      related: ["Class accuracy", "Weak topics", "Weekly trend", "Intervention planning"]
    },
    bank: {
      eyebrow: "Bank",
      title: "Question Bank",
      subtitle: "Manage approved questions by topic and subject.",
      stats: [
        { label: "Status", value: "Published" },
        { label: "Sort", value: "Subject" },
        { label: "Use", value: "Ready" }
      ],
      panels: {
        primary: ["Math Bank", "Science Bank", "English Bank"],
        secondary: ["Reuse sets", "Edit later", "Expand topics"]
      },
      topics: [
        { title: "Math Bank", info: "Store number, fraction, geometry, and arithmetic question sets." },
        { title: "Science Bank", info: "Organize units like plants, health, water, and environment." },
        { title: "English Bank", info: "Keep grammar, vocabulary, and reading questions grouped neatly." },
        { title: "Reuse Ready", info: "Reuse published sets for practice, revision, or tests." }
      ],
      related: ["Subject folders", "Topic filtering", "Reuse questions", "Edit published sets"]
    },
    manage: {
      eyebrow: "Manage",
      title: "Teacher Control",
      subtitle: "Stay on top of tasks and keep the class workflow clear.",
      stats: [
        { label: "Role", value: "Teacher" },
        { label: "Tasks", value: "Open" },
        { label: "Flow", value: "Organized" }
      ],
      panels: {
        primary: ["Open Tasks", "Class Schedule", "Recent Actions"],
        secondary: ["Plan next set", "Review progress", "Keep workflow smooth"]
      },
      topics: [
        { title: "Task Queue", info: "Keep question review, student checks, and publishing in order." },
        { title: "Class Planning", info: "Prepare subject focus and next quiz cycle with less effort." },
        { title: "Recent Actions", info: "Track what was generated, edited, approved, or published." },
        { title: "Workflow", info: "Use one clean system for content and learner management." }
      ],
      related: ["Task planning", "Publishing tasks", "Recent updates", "Class workflow"]
    }
  }
};
