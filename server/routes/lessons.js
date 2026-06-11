import express from "express";
import { generateEducationalContent } from "../services/enhancedLlmAdapter.js";
import { ValidationError } from "../middleware/errorHandler.js";
import { sanitizeInput } from "../middleware/security.js";

const router = express.Router();

// Generate lesson content endpoint
router.post("/generate", async (request, response, next) => {
  try {
    // Validate request
    const { subject, topic, description, difficulty } = request.body;
    
    if (!topic || typeof topic !== "string") {
      throw new ValidationError("Topic is required", ["topic is required"]);
    }
    
    if (!description || typeof description !== "string") {
      throw new ValidationError("Description is required", ["description is required"]);
    }
    
    // Sanitize inputs
    const payload = {
      subject: sanitizeInput(subject || "General"),
      topic: sanitizeInput(topic),
      description: sanitizeInput(description),
      difficulty: sanitizeInput(difficulty || "medium"),
      contentType: "lesson",
      classLevel: "Grade 8-10",
      count: 1, // Not used for lessons but required by adapter
    };
    
    // Build lesson generation prompt
    const lessonPrompt = buildLessonPrompt(payload);
    
    // Generate lesson content using LLM
    const result = await generateLessonContent(payload, lessonPrompt);

    response.json({
      success: true,
      data: {
        content: result.content,
        metadata: {
          source: result.source || result.provider,
          model: result.model,
          subject: payload.subject,
          topic: payload.topic,
          difficulty: payload.difficulty,
        },
      },
      warning: result.warning || null,
      fallback: result.fallback || false,
    });
  } catch (error) {
    next(error);
  }
});

function buildLessonPrompt(payload) {
  return `You are an expert educational content writer. Create a comprehensive, engaging lesson for students.

TOPIC: ${payload.topic}
SUBJECT: ${payload.subject}
DESCRIPTION: ${payload.description}
DIFFICULTY: ${payload.difficulty}
TARGET AUDIENCE: ${payload.classLevel} students

Create a detailed lesson that includes:

1. INTRODUCTION (2-3 paragraphs)
   - Hook to engage students
   - Overview of what they'll learn
   - Why this topic matters

2. KEY CONCEPTS (4-6 sections)
   - Clear explanations of main ideas
   - Real-world examples
   - Visual descriptions where helpful
   - Break complex ideas into simpler parts

3. DETAILED EXPLANATION
   - Step-by-step breakdown
   - Examples with explanations
   - Common misconceptions to avoid
   - Tips for understanding

4. PRACTICAL APPLICATIONS
   - How this applies in real life
   - Interesting facts or connections
   - Career relevance if applicable

5. SUMMARY
   - Key takeaways
   - What students should remember
   - Preparation for quiz

WRITING STYLE:
- Clear and conversational
- Age-appropriate for ${payload.classLevel}
- Engaging and interesting
- Use analogies and examples
- Break into clear sections with headings

LENGTH: Aim for 800-1200 words - comprehensive but not overwhelming

FORMATTING:
- Use clear headings for sections
- Write in proper paragraphs
- No markdown formatting (plain text with spacing)
- Use line breaks between sections

Generate the lesson content now:`;
}

async function generateLessonContent(payload, prompt) {
  try {
    // Try to use the LLM adapter
    const config = await import("../services/enhancedLlmAdapter.js");
    const provider = getConfiguredProvider();
    
    if (!provider) {
      console.warn("No LLM configured, generating mock lesson");
      return createMockLesson(payload);
    }
    
    // Call LLM with lesson prompt
    const response = await callLLMForLesson(provider, prompt);
    
    return {
      content: response.content,
      source: provider.name,
      model: provider.model,
      provider: provider.name,
      success: true,
    };
  } catch (error) {
    console.error("Error generating lesson:", error);
    return {
      ...createMockLesson(payload),
      error: error.message,
      fallback: true,
    };
  }
}

function getConfiguredProvider() {
  // Check for Groq first (free and fast)
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_")) {
    return {
      name: "Groq",
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
    };
  }
  
  // Check other providers
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_")) {
    return {
      name: "OpenAI",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      endpoint: "https://api.openai.com/v1/chat/completions",
    };
  }
  
  return null;
}

async function callLLMForLesson(provider, prompt) {
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        {
          role: "system",
          content: "You are an expert educational content writer specializing in creating comprehensive, engaging lessons for students. Write clear, well-structured content that helps students understand and remember key concepts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  return { content };
}

function createMockLesson(payload) {
  const content = `${payload.topic}

Introduction

${payload.description}

This topic is an important part of ${payload.subject} and helps build a strong foundation for further learning. Understanding these concepts will help you in many real-world situations and prepare you for more advanced topics.

Key Concepts

The main ideas you need to understand in this topic include:

1. Basic Foundations
Every topic starts with fundamental concepts. These are the building blocks that everything else is built upon. Take time to understand these thoroughly before moving to more complex ideas.

2. Core Principles
The core principles help you understand why things work the way they do. These are not just facts to memorize, but ideas to truly comprehend and apply.

3. Practical Applications
Learning becomes more meaningful when you see how it applies to real life. This topic has many practical uses that you encounter regularly.

Detailed Explanation

Let's break down the key points:

First, understand that ${payload.topic} is connected to many other concepts in ${payload.subject}. When you learn this well, it makes other topics easier to understand.

The main idea is to grasp the fundamental concepts and then build upon them. Don't rush - take time to understand each part before moving to the next.

Examples and Practice

Here are some ways to think about this topic:

- Example 1: Consider everyday situations where you might encounter these concepts
- Example 2: Think about how professionals use this knowledge in their work
- Example 3: Connect it to other things you've already learned

Common Misconceptions

Many students make similar mistakes when learning ${payload.topic}:

- Misconception 1: Rushing through without understanding the basics
- Misconception 2: Trying to memorize instead of understanding
- Misconception 3: Not practicing enough with examples

Avoid these by taking your time and actively thinking about what you're learning.

Real-World Applications

This topic is useful in many situations:

- In daily life, you might use these concepts when...
- Professionals in various fields apply this knowledge to...
- Understanding this helps you make better decisions about...

Summary and Key Takeaways

The most important things to remember about ${payload.topic}:

1. Understand the basic foundations before moving to complex ideas
2. Practice applying what you learn
3. Connect new concepts to things you already know
4. Ask questions when something isn't clear

Now that you've learned about ${payload.topic}, you're ready to test your understanding with a quiz. Review the key concepts above and make sure you feel confident before starting the quiz.

Good luck!`;

  return {
    content,
    source: "mock",
    warning: "Backend not available. Using generated lesson template.",
  };
}

export default router;
