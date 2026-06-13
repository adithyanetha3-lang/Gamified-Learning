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
  return `You are an expert educational content writer. Create an engaging, comprehensive lesson for students.

TOPIC: ${payload.topic}
SUBJECT: ${payload.subject}
DESCRIPTION: ${payload.description}
DIFFICULTY: ${payload.difficulty}
TARGET AUDIENCE: ${payload.classLevel} students

Create a detailed, visually engaging lesson with emojis:

1. 🎯 INTRODUCTION (3-4 paragraphs)
   - Engaging hook to grab attention
   - Overview of what they'll learn
   - Why this topic is important and relevant

2. 📚 KEY CONCEPTS (5-7 main sections)
   - Use emojis for each concept heading
   - Clear, detailed explanations
   - Real-world examples and analogies
   - Visual descriptions with emojis
   - Break complex ideas into digestible parts

3. 💡 DETAILED EXPLANATION (Multiple subsections)
   - Step-by-step breakdown of core ideas
   - Practical examples with explanations
   - Common misconceptions to avoid
   - Tips and tricks for understanding
   - Memory aids or mnemonics

4. 🔍 DEEP DIVE
   - Advanced concepts for curious learners
   - Connections to other topics
   - Interesting facts and trivia
   - Historical context if relevant

5. 🌍 REAL-WORLD APPLICATIONS
   - How professionals use this knowledge
   - Everyday situations where this applies
   - Career paths that use these concepts
   - Future relevance and importance

6. ✅ SUMMARY & KEY TAKEAWAYS
   - Main points to remember (bullet points with emojis)
   - Quick review questions to self-check
   - Quiz preparation guidance
   - Encouragement and motivation

STYLE:
- Conversational yet informative
- Use emojis throughout (🎓📊🔬💻🎨🌟✨🚀🎯💡📈🔍⚡🏆💪🌈🎉)
- Mix of paragraphs and bullet points
- Age-appropriate for ${payload.classLevel}
- Engaging and memorable
- Clear section headings with emojis

LENGTH: 1000-1500 words - comprehensive and thorough

FORMAT:
- Use emoji headings for main sections (🎯, 📚, 💡, etc.)
- Use sub-emojis for bullet points (✨, 🌟, ⚡, etc.)
- Keep paragraphs readable (3-5 sentences)
- Add line breaks between sections
- Make it visually scannable

Generate the comprehensive lesson NOW:`;
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
          content: "You are an expert educational content writer. Create comprehensive, engaging lessons with emojis and visual elements. Be thorough and detailed while keeping it interesting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500, // Increased for comprehensive lessons
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
