export const SUBJECTS = [
  { id: "math", name: "Mathematics", description: "Basic arithmetic, measurements, and practical number problems.", color: "blue" },
  { id: "science", name: "Science", description: "Nature, health, farming, and environmental understanding.", color: "green" },
  { id: "english", name: "English", description: "Simple language, vocabulary, and comprehension practice.", color: "teal" },
  { id: "social", name: "Social Studies", description: "Community, maps, civics, and local awareness.", color: "amber" }
];

export const PROMPT_TEMPLATES = {
  basic: `Generate simple multiple-choice questions for rural school students.
Use short sentences, age-appropriate language, and practical examples.
Return 4 options and exactly 1 correct answer for each question.`,
  medium: `Generate medium-difficulty multiple-choice questions.
Questions should test understanding, not memorization only.
Use curriculum-friendly examples that are relevant to school lessons.`,
  revision: `Generate revision quiz questions for end-of-week review.
Cover key concepts in short, clear, exam-friendly MCQ format.
Keep questions concise and suitable for classroom recap.`,
  "daily-practice": `Generate daily practice MCQs for regular student revision.
Use familiar real-life examples and avoid difficult vocabulary.
Keep the question style simple, direct, and confidence-building.`
};

export const MOCK_USERS = [
  { id: "student-1", name: "Asha Kumari", role: "student", school: "Rural Public School", xp: 180, streak: 6, badges: ["Math Starter", "Attendance Hero"], completedQuizzes: 7, accuracy: 78, progressBySubject: { math: 72, science: 66, english: 58, social: 49 }, activity: ["Completed Mathematics quiz on fractions.", "Earned Attendance Hero badge.", "Improved science score by 8%."] },
  { id: "student-2", name: "Ravi Verma", role: "student", school: "Rural Public School", xp: 240, streak: 9, badges: ["Science Explorer", "Weekly Finisher"], completedQuizzes: 9, accuracy: 84, progressBySubject: { math: 68, science: 80, english: 61, social: 55 }, activity: ["Completed Science practice set.", "Reached 9 day streak.", "Scored 4 out of 5 in environment quiz."] },
  { id: "student-3", name: "Meena Devi", role: "student", school: "Village Learning Center", xp: 150, streak: 4, badges: ["English Reader"], completedQuizzes: 5, accuracy: 71, progressBySubject: { math: 51, science: 59, english: 70, social: 44 }, activity: ["Read one English passage quiz.", "Completed 5 total quizzes.", "Unlocked English Reader badge."] },
  { id: "teacher-1", name: "Suman Teacher", role: "teacher", school: "Rural Public School" }
];

export const MOCK_TOPICS = [
  { id: "topic-1", subject: "Science", topic: "Safe Drinking Water", languageSupport: "English / future local language" },
  { id: "topic-2", subject: "Mathematics", topic: "Fractions in Daily Life", languageSupport: "English / future local language" }
];

export const MOCK_PUBLISHED_QUESTIONS = [
  { id: "q-1", subject: "Mathematics", topic: "Fractions in Daily Life", classLevel: "Class 6", difficulty: "basic", question: "If one roti is cut into 4 equal parts, what fraction is one part?", options: ["1/2", "1/3", "1/4", "1/5"], correctAnswer: 2, status: "published" },
  { id: "q-2", subject: "Science", topic: "Safe Drinking Water", classLevel: "Class 5", difficulty: "revision", question: "Which is the safest habit before drinking stored water?", options: ["Leave it open", "Filter or boil it", "Shake the pot", "Add sugar"], correctAnswer: 1, status: "published" }
];

export const QUIZ_BANK = {
  Mathematics: [
    { question: "A farmer has 12 mangoes and gives 3 to a friend. How many are left?", options: ["9", "10", "11", "8"], correctAnswer: 0 },
    { question: "What is half of 20?", options: ["8", "10", "12", "14"], correctAnswer: 1 },
    { question: "If one notebook costs 10 rupees, how much do 3 notebooks cost?", options: ["20", "25", "30", "35"], correctAnswer: 2 }
  ],
  Science: [
    { question: "Which of these is needed by plants to grow?", options: ["Stone", "Sunlight", "Plastic", "Dust"], correctAnswer: 1 },
    { question: "What should we do before drinking water if it is not clean?", options: ["Ignore it", "Boil or filter it", "Throw it", "Mix soil"], correctAnswer: 1 },
    { question: "Which season usually brings heavy rain in many parts of India?", options: ["Winter", "Summer", "Monsoon", "Spring"], correctAnswer: 2 }
  ],
  English: [
    { question: "Choose the correct opposite of 'big'.", options: ["Tall", "Small", "Wide", "Long"], correctAnswer: 1 },
    { question: "Which sentence is correct?", options: ["He go to school.", "He goes to school.", "He going school.", "He gone school."], correctAnswer: 1 },
    { question: "Which word is a fruit?", options: ["Apple", "Chair", "River", "Pencil"], correctAnswer: 0 }
  ],
  "Social Studies": [
    { question: "Who helps maintain order and safety in a village or town?", options: ["Teacher", "Police", "Tailor", "Carpenter"], correctAnswer: 1 },
    { question: "A map helps us understand:", options: ["Songs", "Directions", "Cooking", "Games"], correctAnswer: 1 },
    { question: "Which place is used for learning in a village?", options: ["Market", "School", "Bus stand", "Post office"], correctAnswer: 1 }
  ]
};
