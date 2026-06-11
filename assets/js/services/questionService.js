import { PROMPT_TEMPLATES } from "../data/mockData.js";

const DEFAULT_ENDPOINT = "http://localhost:3000/api/questions/generate";

function createOptionSet(subject, questionIndex) {
  if (subject === "Mathematics") return [`${questionIndex + 2}`, `${questionIndex + 3}`, `${questionIndex + 4}`, `${questionIndex + 5}`];
  if (subject === "Science") return ["Sunlight", "Plastic", "Dust", "Stone"];
  if (subject === "English") return ["Correct option", "Wrong option A", "Wrong option B", "Wrong option C"];
  return ["Village", "School", "River", "Market"];
}

function buildMockQuestion(subject, topic, classLevel, difficulty, lessonText, index) {
  const stems = {
    Mathematics: `A classroom activity based on ${topic || "numbers"} asks students to solve a practical problem. What is the best answer?`,
    Science: `During a lesson about ${topic || "science"}, which idea is most correct?`,
    English: `Which sentence best fits the topic ${topic || "English lesson"}?`,
    "Social Studies": `Which option best explains the topic ${topic || "community life"}?`
  };

  return {
    id: `generated-${Date.now()}-${index}`,
    subject,
    topic,
    classLevel,
    difficulty,
    promptType: difficulty,
    lessonText,
    question: stems[subject] || `Which statement is correct about ${topic || subject}?`,
    options: createOptionSet(subject, index),
    correctAnswer: 0,
    approved: true,
    status: "draft"
  };
}

function createMockResponse(payload) {
  const count = Number(payload.count) || 5;

  return {
    questions: Array.from({ length: count }, (_, index) => buildMockQuestion(payload.subject, payload.topic, payload.classLevel, payload.difficulty, payload.lessonText, index)),
    source: "mock"
  };
}

export function getPromptTemplate(templateKey) {
  return PROMPT_TEMPLATES[templateKey] || PROMPT_TEMPLATES.basic;
}

export async function generateQuestions(payload, options = {}) {
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const mockOnError = options.mockOnError !== false;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || "Question generation failed.");
    }

    return response.json();
  } catch (error) {
    if (!mockOnError) {
      throw error;
    }

    return {
      ...createMockResponse(payload),
      warning: "Live LLM service was unavailable, so sample questions were generated instead."
    };
  }
}
