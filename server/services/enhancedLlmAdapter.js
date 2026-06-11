/**
 * Enhanced LLM Adapter - Multi-Provider Support
 * Supports: OpenAI, Anthropic Claude, Google Gemini, Groq, OpenRouter
 * 
 * Best LLMs for Educational Content:
 * 1. Claude 3.5 Sonnet - Best reasoning, educational content
 * 2. GPT-4o - Strong general knowledge, curriculum alignment
 * 3. Gemini 1.5 Pro - Great for multilingual, long context
 * 4. Groq (Llama 3.1 70B) - Fast, free tier available
 */

import { getEnhancedPromptTemplate } from "../prompts/enhancedPrompts.js";

// ============================================================================
// LLM Provider Configurations
// ============================================================================

const LLM_PROVIDERS = {
  OPENAI: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    models: {
      "gpt-4o": { cost: 0.005, quality: 5, speed: 4 },
      "gpt-4o-mini": { cost: 0.0002, quality: 4, speed: 5 },
      "gpt-4-turbo": { cost: 0.01, quality: 5, speed: 3 },
    },
    defaultModel: "gpt-4o-mini",
    formatRequest: formatOpenAIRequest,
    parseResponse: parseOpenAIResponse,
  },

  ANTHROPIC: {
    name: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1/messages",
    models: {
      "claude-3-5-sonnet-20241022": { cost: 0.003, quality: 5, speed: 4 },
      "claude-3-5-haiku-20241022": { cost: 0.001, quality: 4, speed: 5 },
      "claude-3-opus-20240229": { cost: 0.015, quality: 5, speed: 3 },
    },
    defaultModel: "claude-3-5-sonnet-20241022",
    formatRequest: formatClaudeRequest,
    parseResponse: parseClaudeResponse,
  },

  GOOGLE: {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    models: {
      "gemini-1.5-pro": { cost: 0.0035, quality: 5, speed: 4 },
      "gemini-1.5-flash": { cost: 0.0001, quality: 4, speed: 5 },
      "gemini-2.0-flash-exp": { cost: 0.0, quality: 4, speed: 5 }, // Free experimental
    },
    defaultModel: "gemini-1.5-flash",
    formatRequest: formatGeminiRequest,
    parseResponse: parseGeminiResponse,
  },

  GROQ: {
    name: "Groq (Fast Inference)",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    models: {
      "llama-3.3-70b-versatile": { cost: 0.0, quality: 5, speed: 5 }, // Free tier - NEWEST
      "llama-3.1-8b-instant": { cost: 0.0, quality: 3, speed: 5 },
      "mixtral-8x7b-32768": { cost: 0.0, quality: 4, speed: 5 },
    },
    defaultModel: "llama-3.3-70b-versatile",
    formatRequest: formatOpenAIRequest, // Compatible with OpenAI format
    parseResponse: parseOpenAIResponse,
  },

  OPENROUTER: {
    name: "OpenRouter (Multiple Models)",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    models: {
      "anthropic/claude-3.5-sonnet": { cost: 0.003, quality: 5, speed: 4 },
      "google/gemini-2.0-flash-exp:free": { cost: 0.0, quality: 4, speed: 5 },
      "meta-llama/llama-3.1-70b-instruct": { cost: 0.0004, quality: 4, speed: 4 },
    },
    defaultModel: "google/gemini-2.0-flash-exp:free",
    formatRequest: formatOpenAIRequest, // Compatible
    parseResponse: parseOpenAIResponse,
  },
};

// ============================================================================
// Main Generation Function
// ============================================================================

export async function generateEducationalContent(payload) {
  const provider = getConfiguredProvider();

  if (!provider) {
    console.warn("No LLM provider configured. Returning mock data.");
    return createMockResponse(payload);
  }

  try {
    console.log(`\n=== LLM Generation Request ===`);
    console.log(`Provider: ${provider.name}`);
    console.log(`Model: ${provider.model}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Topic: ${payload.topic || 'General'}`);
    console.log(`Count: ${payload.count}`);
    console.log(`Difficulty: ${payload.difficulty}`);
    
    const prompt = buildEnhancedPrompt(payload);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    const request = provider.config.formatRequest(prompt, provider.model, payload);
    
    console.log(`Sending request to ${provider.name}...`);
    const response = await fetchWithRetry(
      provider.config.endpoint,
      provider.apiKey,
      request,
      provider.name
    );

    console.log(`Response received from ${provider.name}`);
    const content = provider.config.parseResponse(response);
    console.log(`Content length: ${content.length} characters`);
    
    const questions = parseQuestionsFromContent(content, payload);
    console.log(`Parsed ${questions.length} questions`);
    console.log(`=== Generation Complete ===\n`);

    return {
      questions,
      source: provider.name,
      model: provider.model,
      provider: provider.name,
      success: true,
    };
  } catch (error) {
    console.error(`\n=== LLM Generation Failed ===`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`=== Falling back to mock data ===\n`);
    
    return {
      ...createMockResponse(payload),
      error: error.message,
      fallback: true,
    };
  }
}

// ============================================================================
// Provider Detection & Configuration
// ============================================================================

function getConfiguredProvider() {
  // Priority order: ANTHROPIC > OPENAI > GOOGLE > GROQ > OPENROUTER
  
  // Claude (Best for education)
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your_")) {
    return {
      name: "Anthropic Claude",
      config: LLM_PROVIDERS.ANTHROPIC,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || LLM_PROVIDERS.ANTHROPIC.defaultModel,
    };
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_")) {
    return {
      name: "OpenAI",
      config: LLM_PROVIDERS.OPENAI,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || LLM_PROVIDERS.OPENAI.defaultModel,
    };
  }

  // Google Gemini
  if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes("your_")) {
    return {
      name: "Google Gemini",
      config: LLM_PROVIDERS.GOOGLE,
      apiKey: process.env.GOOGLE_API_KEY,
      model: process.env.GOOGLE_MODEL || LLM_PROVIDERS.GOOGLE.defaultModel,
    };
  }

  // Groq (Free, fast)
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_")) {
    return {
      name: "Groq",
      config: LLM_PROVIDERS.GROQ,
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || LLM_PROVIDERS.GROQ.defaultModel,
    };
  }

  // OpenRouter (Access to many models)
  if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes("your_")) {
    return {
      name: "OpenRouter",
      config: LLM_PROVIDERS.OPENROUTER,
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || LLM_PROVIDERS.OPENROUTER.defaultModel,
    };
  }

  return null;
}

// ============================================================================
// Request Formatters
// ============================================================================

function formatOpenAIRequest(prompt, model, payload) {
  return {
    model: model,
    messages: [
      {
        role: "system",
        content: "You are an expert educational content creator specializing in creating DIVERSE, UNIQUE quiz questions. CRITICAL RULE: Each question MUST test a different aspect of the topic using different question formats and cognitive levels. NEVER generate similar or repetitive questions. Generate curriculum-aligned quiz questions that are clear, accurate, and appropriate for the specified grade level. Respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8, // Increased from 0.7 for more diversity
    max_tokens: 2000,
    response_format: { type: "json_object" },
  };
}

function formatClaudeRequest(prompt, model, payload) {
  return {
    model: model,
    max_tokens: 2000,
    temperature: 0.8, // Increased for more diversity
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    system: "You are an expert educational content creator specializing in creating DIVERSE, UNIQUE quiz questions. CRITICAL RULE: Each question MUST test a different aspect of the topic using different question formats and cognitive levels. NEVER generate similar or repetitive questions. Generate curriculum-aligned quiz questions that are clear, accurate, and appropriate for the specified grade level. Respond with valid JSON only.",
  };
}

function formatGeminiRequest(prompt, model, payload) {
  return {
    contents: [
      {
        parts: [
          {
            text: `You are an expert educational content creator specializing in creating DIVERSE, UNIQUE quiz questions. CRITICAL RULE: Each question MUST test a different aspect of the topic using different question formats and cognitive levels. NEVER generate similar or repetitive questions.\n\n${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8, // Increased for more diversity
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    },
  };
}

// ============================================================================
// Response Parsers
// ============================================================================

function parseOpenAIResponse(response) {
  return response?.choices?.[0]?.message?.content || "";
}

function parseClaudeResponse(response) {
  const content = response?.content?.[0];
  return content?.text || "";
}

function parseGeminiResponse(response) {
  const candidate = response?.candidates?.[0];
  const content = candidate?.content?.parts?.[0];
  return content?.text || "";
}

// ============================================================================
// Network & Retry Logic
// ============================================================================

async function fetchWithRetry(endpoint, apiKey, request, providerName, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const headers = buildHeaders(apiKey, providerName);
      
      // Special handling for Gemini (uses query param for API key)
      const url = providerName === "Google Gemini" 
        ? `${endpoint}/${request.model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`
        : endpoint;

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${providerName} API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function buildHeaders(apiKey, providerName) {
  const baseHeaders = {
    "Content-Type": "application/json",
  };

  switch (providerName) {
    case "Anthropic Claude":
      return {
        ...baseHeaders,
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      };
    case "OpenRouter":
      return {
        ...baseHeaders,
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://skillpark.app",
        "X-Title": "Skill Park Learning Platform",
      };
    case "Google Gemini":
      // Gemini uses query param, not header
      return baseHeaders;
    default:
      return {
        ...baseHeaders,
        "Authorization": `Bearer ${apiKey}`,
      };
  }
}

// ============================================================================
// Prompt Building
// ============================================================================

function buildEnhancedPrompt(payload) {
  const template = getEnhancedPromptTemplate(payload.difficulty, payload.contentType);
  const count = payload.count || 5;
  
  // Generate specific instructions for each question
  const questionInstructions = Array.from({ length: count }, (_, i) => {
    const types = ['definition', 'application', 'comparison', 'problem-solving', 'analysis'];
    const formats = ['What is', 'How does', 'Why is', 'Which of', 'Compare'];
    return `Question ${i + 1}: Use format "${formats[i % formats.length]}..." and test ${types[i % types.length]}`;
  }).join('\n');

  return `
# Educational Content Generation Request

## Context
- **Platform**: Skill Park (Rural Education)
- **Target Audience**: Students in rural areas with limited resources
- **Device Constraints**: Low-end devices, poor connectivity

## Content Requirements
- **Subject**: ${payload.subject}
- **Topic**: ${payload.topic || "General"}
- **Grade Level**: Class ${payload.classLevel}
- **Difficulty**: ${payload.difficulty}
- **Question Count**: ${payload.count}
- **Language**: ${payload.language || "English"}

## Lesson Context
${payload.lessonText || "Generate questions based on standard curriculum for this topic."}

## CRITICAL: Question Diversity Requirements

Generate ${payload.count} UNIQUE questions. EACH QUESTION MUST BE COMPLETELY DIFFERENT.

### Required Variety:
1. Different question formats (What, Why, How, Which, Compare)
2. Different cognitive levels (Remember, Understand, Apply, Analyze, Evaluate)
3. Different aspects of the topic
4. NO repetition or similarity

### Specific Instructions for Each Question:
${questionInstructions}

## Instructions
${template}

## Output Format
Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "questions": [
    {
      "question": "Clear, concise question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "easy|medium|hard",
      "bloomsLevel": "remember|understand|apply|analyze|evaluate|create"
    }
  ]
}
\`\`\`

Generate ${payload.count} COMPLETELY DIFFERENT questions now.
  `.trim();
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseQuestionsFromContent(content, payload) {
  try {
    // Remove markdown code fences if present
    const jsonText = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonText);
    
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions array found in response");
    }

    return questions
      .filter(q => q && q.question && Array.isArray(q.options))
      .map((q, index) => normalizeQuestion(q, payload, index));
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    throw new Error(`Invalid JSON response from LLM: ${error.message}`);
  }
}

function normalizeQuestion(question, payload, index) {
  const options = Array.isArray(question.options) ? question.options.slice(0, 4) : [];
  
  // Ensure 4 options
  while (options.length < 4) {
    options.push(`Option ${String.fromCharCode(65 + options.length)}`);
  }

  const correctAnswer = typeof question.correctAnswer === "number"
    ? Math.max(0, Math.min(3, question.correctAnswer))
    : 0;

  return {
    id: question.id || `llm-${Date.now()}-${index}`,
    subject: question.subject || payload.subject,
    topic: question.topic || payload.topic,
    classLevel: question.classLevel || payload.classLevel,
    difficulty: question.difficulty || payload.difficulty,
    question: question.question.trim(),
    options: options.map(opt => String(opt).trim()),
    correctAnswer,
    explanation: question.explanation || "",
    bloomsLevel: question.bloomsLevel || "understand",
    approved: false,
    status: "draft",
    aiGenerated: true,
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// Mock Response (Fallback)
// ============================================================================

function createMockResponse(payload) {
  const count = Number(payload.count) || 5;
  const subject = payload.subject || "General";
  const topic = payload.topic || subject;
  const difficulty = payload.difficulty || "medium";

  // Create diverse, subject-specific questions
  const questionTemplates = {
    Mathematics: [
      { q: `Solve for x: 2x + 5 = 15`, opts: ["x = 3", "x = 5", "x = 10", "x = 20"], correct: 1, explanation: "Subtract 5 from both sides (2x = 10), then divide by 2 (x = 5)" },
      { q: `What is 15% of 200?`, opts: ["20", "25", "30", "35"], correct: 2, explanation: "15% of 200 = (15/100) × 200 = 30" },
      { q: `Which shape has 4 equal sides?`, opts: ["Rectangle", "Square", "Triangle", "Circle"], correct: 1, explanation: "A square has 4 equal sides and 4 right angles" },
      { q: `What is 7 × 8?`, opts: ["54", "56", "58", "60"], correct: 1, explanation: "7 multiplied by 8 equals 56" },
      { q: `What is the area of a rectangle with length 5 and width 3?`, opts: ["8", "15", "18", "20"], correct: 1, explanation: "Area = length × width = 5 × 3 = 15 square units" },
    ],
    Science: [
      { q: `What is photosynthesis?`, opts: ["Plants eating food", "Plants making food from sunlight", "Plants drinking water", "Plants breathing"], correct: 1, explanation: "Photosynthesis is the process where plants convert sunlight, water, and CO₂ into glucose and oxygen" },
      { q: `What are the three states of matter?`, opts: ["Hot, cold, warm", "Solid, liquid, gas", "Big, medium, small", "Hard, soft, rough"], correct: 1, explanation: "Matter exists in three main states: solid (fixed shape), liquid (flows), and gas (fills container)" },
      { q: `What is the center of an atom called?`, opts: ["Electron", "Proton", "Nucleus", "Neutron"], correct: 2, explanation: "The nucleus is the central core of an atom containing protons and neutrons" },
      { q: `What gas do plants release during photosynthesis?`, opts: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correct: 1, explanation: "Plants release oxygen (O₂) as a byproduct of photosynthesis" },
      { q: `What force pulls objects toward Earth?`, opts: ["Magnetism", "Gravity", "Friction", "Inertia"], correct: 1, explanation: "Gravity is the force that attracts objects with mass toward each other" },
    ],
    English: [
      { q: `What is a noun?`, opts: ["An action word", "A describing word", "A person, place or thing", "A connecting word"], correct: 2, explanation: "A noun names a person, place, thing, or idea" },
      { q: `Which sentence has correct punctuation?`, opts: ["Hello how are you", "Hello, how are you?", "Hello how are you.", "hello, how are you"], correct: 1, explanation: "Questions end with a question mark, and sentences start with capital letters" },
      { q: `What is a verb?`, opts: ["A naming word", "An action or state word", "A describing word", "A connecting word"], correct: 1, explanation: "A verb expresses an action (run, jump) or state of being (is, are)" },
      { q: `What is the plural of 'child'?`, opts: ["Childs", "Children", "Childes", "Childs'"], correct: 1, explanation: "'Children' is the irregular plural form of 'child'" },
      { q: `What is an adjective?`, opts: ["A naming word", "An action word", "A describing word", "A connecting word"], correct: 2, explanation: "An adjective describes or modifies a noun (big, blue, happy)" },
    ],
    History: [
      { q: `Who was the first President of the United States?`, opts: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"], correct: 1, explanation: "George Washington served as the first U.S. President from 1789-1797" },
      { q: `In what year did World War II end?`, opts: ["1943", "1944", "1945", "1946"], correct: 2, explanation: "World War II ended in 1945 with the surrender of Japan" },
      { q: `What ancient civilization built the pyramids?`, opts: ["Romans", "Greeks", "Egyptians", "Babylonians"], correct: 2, explanation: "The ancient Egyptians built the pyramids as tombs for their pharaohs" },
      { q: `Who wrote the Declaration of Independence?`, opts: ["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"], correct: 2, explanation: "Thomas Jefferson was the primary author of the Declaration of Independence in 1776" },
      { q: `What was the Industrial Revolution?`, opts: ["A war", "A period of technological advancement", "A religious movement", "A political revolution"], correct: 1, explanation: "The Industrial Revolution was a period of major industrialization and innovation in the 18th-19th centuries" },
    ],
  };

  // Get questions for the subject, or use generic ones
  const subjectQuestions = questionTemplates[subject] || [
    { q: `What is an important concept in ${topic}?`, opts: ["Concept A", "Concept B (key idea)", "Concept C", "Concept D"], correct: 1, explanation: `This concept is fundamental to understanding ${topic}` },
    { q: `Which statement best describes ${topic}?`, opts: ["First description", "Second description (most accurate)", "Third description", "Fourth description"], correct: 1, explanation: `This accurately captures the essence of ${topic}` },
    { q: `How would you apply ${topic} in practice?`, opts: ["Method A", "Method B (recommended)", "Method C", "Method D"], correct: 1, explanation: `This method effectively applies ${topic} principles` },
    { q: `What is a common misconception about ${topic}?`, opts: ["Belief A", "Belief B (actually correct)", "Belief C", "Belief D"], correct: 1, explanation: `This is the accurate understanding of ${topic}` },
    { q: `Why is ${topic} important to learn?`, opts: ["Reason A", "Reason B (main benefit)", "Reason C", "Reason D"], correct: 1, explanation: `Understanding ${topic} provides essential knowledge` },
  ];

  // Select random questions
  const selectedQuestions = [];
  const usedIndexes = new Set();
  
  for (let i = 0; i < count; i++) {
    let index = i % subjectQuestions.length;
    // Try to avoid duplicates if possible
    while (usedIndexes.has(index) && usedIndexes.size < subjectQuestions.length) {
      index = (index + 1) % subjectQuestions.length;
    }
    usedIndexes.add(index);
    
    const template = subjectQuestions[index];
    selectedQuestions.push({
      id: `mock-${Date.now()}-${i}`,
      subject: subject,
      topic: topic,
      classLevel: payload.classLevel,
      difficulty: difficulty,
      question: template.q,
      options: template.opts,
      correctAnswer: template.correct,
      explanation: template.explanation,
      bloomsLevel: "understand",
      approved: false,
      status: "draft",
      aiGenerated: false,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    questions: selectedQuestions,
    source: "mock",
    warning: "⚠️ Using sample questions - Backend API not responding. Please check if server is running on port 3000",
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getAvailableProviders() {
  const providers = [];
  
  Object.entries(LLM_PROVIDERS).forEach(([key, config]) => {
    const envKey = key === "OPENAI" ? "OPENAI_API_KEY" : `${key}_API_KEY`;
    const isConfigured = process.env[envKey] && !process.env[envKey].includes("your_");
    
    providers.push({
      name: config.name,
      key: key,
      configured: isConfigured,
      models: Object.keys(config.models),
      defaultModel: config.defaultModel,
    });
  });

  return providers;
}

export function getProviderInfo() {
  const provider = getConfiguredProvider();
  
  if (!provider) {
    return {
      configured: false,
      message: "No LLM provider configured",
    };
  }

  return {
    configured: true,
    name: provider.name,
    model: provider.model,
    models: Object.keys(provider.config.models),
  };
}

export default {
  generateEducationalContent,
  getAvailableProviders,
  getProviderInfo,
};
