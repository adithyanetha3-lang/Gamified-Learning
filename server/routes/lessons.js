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
  return `You are an expert educational content writer. Create an engaging, visual lesson for students.

TOPIC: ${payload.topic}
SUBJECT: ${payload.subject}
DESCRIPTION: ${payload.description}
DIFFICULTY: ${payload.difficulty}
TARGET AUDIENCE: ${payload.classLevel} students

Create a modern, engaging lesson with emojis and visual elements:

1. 🎯 INTRODUCTION (Brief - 2-3 sentences)
   - Quick hook to grab attention
   - What they'll master

2. 📚 KEY CONCEPTS (3-4 main points)
   - Use emojis for each point
   - Clear, simple explanations
   - Real-world examples

3. 💡 CORE IDEAS
   - Step-by-step breakdown
   - Practical examples
   - Visual descriptions with emojis

4. 🌍 REAL-WORLD USE
   - How this applies in life
   - Interesting connections
   - Career relevance

5. ✅ KEY TAKEAWAYS (Bullet points)
   - 3-5 main points to remember
   - Quiz preparation tips

STYLE:
- Conversational and engaging
- Use emojis generously (🎓📊🔬💻🎨🌟✨🚀🎯💡📈🔍⚡)
- Short paragraphs (2-3 sentences max)
- Age-appropriate for ${payload.classLevel}
- Break into clear sections with emoji headings

LENGTH: 400-600 words - concise but complete

FORMAT:
- Use emoji headings for each section
- Short, punchy paragraphs
- Bullet points where helpful
- Line breaks between sections

Generate the lesson NOW:`;
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
          content: "You are an expert educational content writer. Create concise, engaging lessons with emojis and visual elements. Keep it brief but comprehensive.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500, // Reduced for faster generation
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
  const content = `🎯 ${payload.topic}

📖 Introduction

${payload.description}

This is a key part of ${payload.subject} that you'll use throughout your learning journey! 🚀

📚 Key Concepts

✨ **Foundation Basics**
Every topic starts with fundamentals. These are your building blocks. Master these first!

💡 **Core Principles**  
Understanding WHY things work helps you remember better than just memorizing facts.

🌟 **Practical Applications**
See how this connects to real life - that's when learning really sticks!

🔍 Deep Dive

Let's break it down:

${payload.topic} connects to many concepts in ${payload.subject}. When you understand this well, other topics become much easier! 

Think of it like learning to ride a bike - once you get the basics, everything else flows naturally. 🚴‍♂️

💡 Examples & Tips

Here's how to think about this:

• 🎯 **Example 1:** Look for this concept in your daily life
• 💼 **Example 2:** Professionals use this knowledge constantly  
• 🔗 **Example 3:** Connect it to what you already know

⚠️ Common Mistakes

Watch out for these:

• ❌ Rushing without understanding basics
• ❌ Memorizing instead of comprehending
• ❌ Not practicing with examples

Take your time and think actively! 🤔

🌍 Real-World Uses

You'll encounter this when:

• Making everyday decisions 🏠
• Understanding how things work 🔬
• Building your career skills 💼
• Solving practical problems 🛠️

✅ Key Takeaways

Remember these important points:

🎯 Master the foundations first
📝 Practice makes perfect  
🔗 Connect new ideas to what you know
❓ Ask questions when unclear
🎓 You're ready for the quiz!

Great job learning ${payload.topic}! Now test your knowledge with the quiz. Good luck! 🌟`;

  return {
    content,
    source: "mock",
    warning: "Backend not available. Using generated lesson template.",
  };
}

export default router;
