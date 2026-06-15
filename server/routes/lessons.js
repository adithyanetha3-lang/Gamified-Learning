import express from "express";
import { generateEducationalContent } from "../services/enhancedLlmAdapter.js";
import { generateSmartLesson, hasLessonFor } from "../services/smartLessonGenerator.js";
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
      count: 1,
    };
    
    console.log(`\n📚 Lesson Generation Request:`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Topic: ${payload.topic}`);
    console.log(`Difficulty: ${payload.difficulty}`);

    // ALWAYS use smart lesson generator (has fallback for unknown subjects)
    console.log(`✅ Using Smart Lesson Generator for ${payload.subject}`);
    const result = generateSmartLesson(payload);
    
    response.json({
      success: true,
      data: {
        content: result.content,
        metadata: {
          source: result.source,
          ...result.metadata,
        },
      },
      message: hasLessonFor(payload.subject)
        ? "✨ Expert lesson with detailed content and examples"
        : "✨ Structured educational lesson for your topic",
      fallback: false,
    });
    
    console.log(`✅ Generated lesson using Smart Lesson Generator\n`);
  } catch (error) {
    console.error(`❌ Lesson generation error:`, error);
    next(error);
  }
});

function buildLessonPrompt(payload) {
  return `You are an expert ${payload.subject} educator. Create a SPECIFIC, ACCURATE, DETAILED lesson about "${payload.topic}".

CRITICAL: This lesson must contain REAL facts, formulas, definitions, and examples from ${payload.subject}. NO generic placeholder content!

## LESSON DETAILS:
- **Topic**: ${payload.topic}
- **Subject**: ${payload.subject}
- **Description**: ${payload.description}
- **Difficulty**: ${payload.difficulty}
- **Target**: ${payload.classLevel} students

## REQUIRED CONTENT STRUCTURE:

### 1. 🎯 INTRODUCTION (4-5 sentences)
- Start with an engaging hook related to ${payload.topic}
- State SPECIFIC learning objectives (what students will learn)
- Explain why ${payload.topic} is important in ${payload.subject}
- Connect to real-world applications

### 2. 📚 CORE CONCEPTS (3-5 major sections)
For EACH concept, provide:
- ✨ **Clear heading** with the SPECIFIC concept name
- DETAILED explanation with REAL terminology from ${payload.subject}
- ACTUAL formulas, definitions, or processes (not generic descriptions)
- CONCRETE examples with numbers, names, or specific cases
- Visual analogies to aid understanding

Example structure for ${payload.subject}:
✨ **[Specific Concept Name]**
Detailed explanation using real ${payload.subject} terms...
Formula/Definition: [actual formula or definition]
Example: [specific numerical example or case study]

### 3. 💡 STEP-BY-STEP EXPLANATION
- Break down the MOST IMPORTANT process or concept
- Use numbered steps (1, 2, 3...)
- Include REAL calculations, examples, or demonstrations
- Show "before" and "after" if applicable
- Provide common pitfalls and how to avoid them

### 4. 🌍 REAL-WORLD APPLICATIONS (3-4 examples)
List SPECIFIC, REAL applications:
- Industry/field where it's used
- How it's applied (be specific)
- Example of a real product, system, or use case
- Why it matters in that context

### 5. 📝 PRACTICE EXAMPLES (2-3 worked examples)
Provide ACTUAL practice problems or examples:
- State the problem clearly
- Show the solution step-by-step
- Include the final answer
- Explain the reasoning

### 6. ✅ SUMMARY & KEY POINTS
- List 5-7 SPECIFIC takeaways (not generic statements)
- Include actual formulas, definitions, or facts
- Highlight the most important concept
- Prepare students for quiz questions

## STYLE REQUIREMENTS:
- Use emojis for section headers (🎯📚💡🌍📝✅🔬🧪💻🎓⚡🚀🌟)
- Write 1000-1500 words
- Use ${payload.classLevel} appropriate language
- Be conversational but accurate
- Include specific facts, not vague descriptions

## WHAT TO AVOID:
❌ Generic statements like "this is important for many reasons"
❌ Vague terms like "various methods" or "several approaches"
❌ Placeholder text like "concept X" or "method Y"
❌ General descriptions without specific details

## WHAT TO INCLUDE:
✅ Actual formulas (if ${payload.subject} involves math/science)
✅ Specific terminology from ${payload.subject}
✅ Real examples with names, numbers, or cases
✅ Concrete processes with actual steps
✅ Factual information students can learn from

Generate the SPECIFIC, DETAILED lesson for "${payload.topic}" NOW:`;
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
          content: `You are an expert ${payload.subject} educator creating educational content. 

CRITICAL RULES:
1. Use REAL facts, formulas, definitions - NO generic placeholder content
2. Include SPECIFIC terminology from ${payload.subject}
3. Provide ACTUAL examples with numbers, names, or cases
4. Use emojis for visual appeal but content must be factually accurate
5. Be thorough and detailed - students will learn from this
6. Include real-world applications with specific examples

DO NOT use vague terms like "various methods", "several approaches", or "concept X".
DO include actual formulas, processes, definitions, and concrete examples.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000, // Increased for comprehensive, detailed lessons
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

Welcome to this comprehensive lesson on ${payload.topic}! This is an essential concept in ${payload.subject} that will help you build a strong foundation for your learning journey. Understanding this topic will not only help you excel in your studies but also give you valuable insights into how things work in the real world. 🚀

In this lesson, we'll explore the fundamental concepts, dive deep into the key ideas, look at practical applications, and ensure you're fully prepared to master this topic. Let's get started! 🌟

📚 Key Concepts

✨ **Foundation Basics**
Every great topic starts with solid fundamentals. Think of these as the building blocks of a house - without a strong foundation, nothing else can stand firm. The basics of ${payload.topic} form the framework for everything you'll learn next. Take your time to really understand these core ideas before moving forward.

💡 **Core Principles**  
Understanding WHY things work is just as important as knowing WHAT they are. When you grasp the underlying principles, you can apply your knowledge to new situations and solve problems you've never seen before. This is where the real magic of learning happens! The core principles help you see patterns and connections.

🌟 **Practical Context**
Learning becomes so much more meaningful when you see how it connects to real life. ${payload.topic} isn't just something in textbooks - it's all around you! From the technology you use daily to the decisions you make, these concepts play a role in shaping your world.

⚡ **Connections and Relationships**
Nothing in ${payload.subject} exists in isolation. This topic connects to many other concepts you'll learn. Understanding these connections helps you build a web of knowledge where each new piece fits perfectly with what you already know.

🔍 Detailed Explanation

Let's break down the essential ideas step by step:

**Understanding the Fundamentals**
${payload.topic} is deeply connected to many concepts in ${payload.subject}. When you master this topic, you'll find that related topics become much easier to understand. It's like learning to ride a bike - once you get the basics, everything else flows naturally. 🚴‍♂️

**Step-by-Step Approach**
Start by familiarizing yourself with the basic terminology and definitions. Don't worry if things seem confusing at first - that's completely normal! Learning is a process, and your brain needs time to form new connections. As you practice and review, concepts that seemed difficult will start to make perfect sense.

**Important Details to Remember**
Pay special attention to how different elements relate to each other. The relationships between concepts are often more important than the concepts themselves. Try to see the big picture while also understanding the small details that make it all work.

💡 Examples & Applications

Here's how to think about ${payload.topic} in action:

🎯 **Real-Life Example 1: Daily Situations**
You encounter applications of this topic more often than you might think! Look around your environment and try to identify where these concepts show up. Maybe it's in the technology you use, the natural world around you, or the systems that organize our society.

💼 **Professional Applications**  
Professionals in fields like engineering, medicine, business, science, and technology use these concepts constantly in their work. Understanding ${payload.topic} opens doors to exciting career opportunities and helps you think like an expert in your chosen field.

🔗 **Building on What You Know**
Connect this new knowledge to things you've already learned. Your brain loves making connections! When you link new information to existing knowledge, you create a stronger, more reliable memory that will serve you well.

🌈 **Creative Applications**
Don't just think about this topic in traditional ways. Can you apply these concepts to solve problems creatively? Can you use them in unexpected situations? This kind of creative thinking is what turns good students into great innovators!

⚠️ Common Mistakes to Avoid

Be aware of these typical pitfalls:

❌ **Rushing Through the Basics**
Many students want to jump to advanced topics before mastering the fundamentals. This is like trying to run before you can walk! Take your time with the basics - they're called fundamentals for a reason.

❌ **Passive Reading Instead of Active Learning**
Simply reading about ${payload.topic} isn't enough. You need to actively engage with the material - ask questions, solve problems, explain concepts to others, and test yourself regularly.

❌ **Not Practicing Enough**
Understanding a concept once doesn't mean you've mastered it. Regular practice and review are essential for moving knowledge from short-term to long-term memory.

❌ **Ignoring Connections**
Don't study this topic in isolation. Always look for connections to other concepts, real-world applications, and broader themes in ${payload.subject}.

🌍 Real-World Applications & Careers

This knowledge is valuable in many contexts:

🏢 **Career Paths**
Professionals in science, technology, engineering, healthcare, business, and many other fields rely on understanding concepts like ${payload.topic}. This knowledge could be your first step toward an exciting career!

🔬 **Problem-Solving**
The thinking skills you develop while learning this topic transfer to all areas of life. You'll become better at analyzing situations, making decisions, and solving problems creatively.

🌐 **Global Relevance**
These concepts are important worldwide. Whether you travel, work internationally, or simply want to understand global issues, this knowledge gives you valuable perspective.

💪 **Personal Growth**
Beyond career applications, understanding ${payload.topic} enriches your life by helping you understand how the world works, make informed decisions, and appreciate the elegance of ${payload.subject}.

✅ Summary & Key Takeaways

Let's review the most important points:

🎯 **Essential Concepts**
- Master the fundamental building blocks first
- Understand the "why" behind concepts, not just the "what"
- See how everything connects to form a bigger picture
- Practice regularly to build strong, lasting understanding

📝 **Study Tips**
- Review your notes regularly, don't cram
- Teach concepts to others - it's the best way to learn
- Create visual diagrams or mind maps
- Practice with diverse examples and problems

🔍 **Self-Check Questions**
- Can you explain the main concepts in your own words?
- Can you give real-world examples of these ideas?
- Do you understand how this topic connects to others?
- Can you identify when these concepts are being used?

🎓 **Quiz Preparation**
You're now ready to test your knowledge! Review the key concepts above, make sure you understand the examples, and think about how you might apply this knowledge in different scenarios. The quiz will help you assess your understanding and identify any areas where you might need more practice.

Remember: Learning is a journey, not a destination. Every expert was once a beginner, and with dedication and practice, you can master ${payload.topic} too! 🌟

Good luck with your quiz! You've got this! 💪✨`;

  return {
    content,
    source: "mock",
    warning: "Backend not available. Using generated lesson template.",
  };
}

export default router;
