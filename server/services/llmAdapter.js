import { getPromptTemplateText } from "../prompts/questionPrompts.js";

function createMockResponse(payload) {
  const count = Number(payload.count) || 5;

  return {
    questions: Array.from({ length: count }, (_, index) => ({
      id: `api-${Date.now()}-${index}`,
      subject: payload.subject,
      topic: payload.topic,
      classLevel: payload.classLevel,
      difficulty: payload.difficulty,
      question: `Sample generated question ${index + 1} for ${payload.topic || payload.subject}.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      approved: true,
      status: "draft"
    })),
    source: "mock",
    warning: "LLM configuration is missing, so the server returned sample questions."
  };
}

function normalizeQuestion(question, payload, index) {
  const options = Array.isArray(question.options) ? question.options.slice(0, 4) : [];
  while (options.length < 4) {
    options.push(`Option ${String.fromCharCode(65 + options.length)}`);
  }

  const correctAnswer = Number.isInteger(question.correctAnswer)
    ? Math.min(3, Math.max(0, question.correctAnswer))
    : 0;

  return {
    id: question.id || `llm-${Date.now()}-${index}`,
    subject: question.subject || payload.subject,
    topic: question.topic || payload.topic,
    classLevel: question.classLevel || payload.classLevel,
    difficulty: question.difficulty || payload.difficulty,
    question: question.question,
    options,
    correctAnswer,
    approved: question.approved ?? true,
    status: question.status || "draft"
  };
}

function extractJsonBlock(content) {
  const fencedMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fencedMatch ? fencedMatch[1].trim() : content.trim();
}

function parseLlmQuestions(rawContent, payload) {
  const parsed = JSON.parse(extractJsonBlock(rawContent));
  const items = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(items) || !items.length) {
    throw new Error("LLM response did not contain a valid questions array.");
  }

  return items
    .filter((item) => item && typeof item.question === "string")
    .map((item, index) => normalizeQuestion(item, payload, index));
}

export function buildPromptFromTemplate(payload) {
  const template = getPromptTemplateText(payload.difficulty);
  return `
You are creating multiple-choice quiz questions for Skill Park, a learning platform for rural education.
Use short, clear, age-appropriate language.
Keep the questions curriculum-friendly and easy to read on low-end devices.

Subject: ${payload.subject}
Topic: ${payload.topic || "Not provided"}
Class Level: ${payload.classLevel}
Difficulty: ${payload.difficulty}
Question Count: ${payload.count}

Lesson Text:
${payload.lessonText || "No lesson text provided."}

Instruction Template:
${template}

Return valid JSON only in this shape:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0
    }
  ]
}

Rules:
- Exactly 4 options per question
- Only one correct answer
- correctAnswer must be a 0-based index from 0 to 3
- Avoid advanced vocabulary unless clearly needed
- Do not include explanations outside the JSON
  `.trim();
}

export async function generateQuestionsFromLlm(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  const endpoint = process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions";

  if (!apiKey || apiKey.includes("your_")) {
    return {
      ...createMockResponse(payload),
      warning: "OPENAI_API_KEY is missing or still set to a placeholder value, so the server returned sample questions."
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You generate curriculum-friendly quiz questions and must reply with JSON only."
        },
        {
          role: "user",
          content: payload.prompt
        }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("LLM response did not include message content.");
  }

  return {
    questions: parseLlmQuestions(rawContent, payload),
    source: "llm"
  };
}
