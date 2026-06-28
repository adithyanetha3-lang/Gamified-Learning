import express from "express";
import { generateEducationalContent } from "../services/enhancedLlmAdapter.js";
import { generateSmartLesson, hasLessonFor } from "../services/smartLessonGenerator.js";
import { ValidationError } from "../middleware/errorHandler.js";
import { sanitizeInput } from "../middleware/security.js";

const router = express.Router();

// ========================================
// HELPER FUNCTIONS (defined before use)
// ========================================

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

async function callLLMForLesson(provider, prompt, payload) {
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
          content: `You are a highly knowledgeable ${payload.subject} educator with expertise in "${payload.topic}".

YOUR MISSION: Create a focused, accurate lesson SPECIFICALLY about "${payload.topic}" - NOT a general overview of ${payload.subject}.

CRITICAL RULES:
1. FOCUS EXCLUSIVELY on "${payload.topic}" - every paragraph must relate directly to this specific topic
2. Use REAL facts, formulas, definitions that are specific to "${payload.topic}"
3. Include SPECIFIC terminology from "${payload.topic}" (not general ${payload.subject} terms)
4. Provide ACTUAL examples that demonstrate "${payload.topic}" principles
5. Be technically accurate - students will learn and be tested on this content
6. Include real-world applications where "${payload.topic}" is actually used
7. NO generic filler content - every sentence must teach something specific

TOPIC FOCUS: "${payload.topic}"
DESCRIPTION: ${payload.description}

You are writing for ${payload.classLevel} students who need to learn "${payload.topic}" specifically, not ${payload.subject} in general.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6, // Lower for more focused, accurate content
      max_tokens: 4000,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  if (!content || content.length < 500) {
    throw new Error("AI generated insufficient content");
  }
  
  return { content };
}

function buildLessonPrompt(payload) {
  return `You are an expert ${payload.subject} educator. Create a HIGHLY SPECIFIC, TOPIC-FOCUSED lesson about "${payload.topic}".

🎯 CRITICAL REQUIREMENTS:
- Focus EXCLUSIVELY on "${payload.topic}" - NOT general ${payload.subject} overview
- Include REAL facts, formulas, definitions specific to "${payload.topic}"
- Use ACTUAL terminology and concepts from "${payload.topic}"
- Provide CONCRETE examples that demonstrate "${payload.topic}"
- NO generic filler - every sentence must teach something about "${payload.topic}"

## TOPIC DETAILS:
**Main Topic**: ${payload.topic}
**Subject Area**: ${payload.subject}
**Focus Description**: ${payload.description}
**Difficulty Level**: ${payload.difficulty}
**Student Level**: ${payload.classLevel}

## CONTENT STRUCTURE (1200-1500 words):

### 1. 🎯 INTRODUCTION (100-150 words)
- Define "${payload.topic}" specifically and clearly
- State 3-4 SPECIFIC learning objectives for "${payload.topic}"
- Explain why "${payload.topic}" is important (not general ${payload.subject})
- Give a real-world example where "${payload.topic}" is used

### 2. 📚 CORE CONCEPTS OF "${payload.topic}" (600-800 words, 3-5 sections)
Each section must focus on a SPECIFIC aspect of "${payload.topic}":

✨ **[Specific Concept 1 Name]**
- Clear definition with precise terminology
- Detailed explanation (how it works, why it matters)
- Include formula/process/method if applicable
- Example with actual values/names/cases
- Connection to "${payload.topic}" overall

✨ **[Specific Concept 2 Name]**
- Technical details and specifics
- Step-by-step process if applicable
- Real calculation or demonstration
- Common applications within "${payload.topic}"

(Continue for 3-5 key concepts...)

### 3. 💡 HOW "${payload.topic}" WORKS (250-300 words)
- Step-by-step breakdown of the main process/principle
- Use numbered steps (1, 2, 3...)
- Include specific examples with numbers or cases
- Show a worked example from start to finish
- Highlight common mistakes related to "${payload.topic}"

### 4. 🌍 APPLICATIONS OF "${payload.topic}" (150-200 words)
List 3-4 SPECIFIC, REAL applications:
- **[Specific Industry/Field]**: How "${payload.topic}" is used here
- **[Real Technology/System]**: Actual example with name
- **[Practical Use Case]**: Concrete scenario demonstrating "${payload.topic}"
- Why "${payload.topic}" is essential in each context

### 5. 📝 PRACTICE PROBLEM (100-150 words)
Provide ONE worked example:
- State clear problem related to "${payload.topic}"
- Show solution steps
- Explain reasoning at each step
- Give final answer
- Note what concept from "${payload.topic}" was applied

### 6. ✅ SUMMARY (100-150 words)
- List 5-7 KEY FACTS specifically about "${payload.topic}"
- Include most important formula/definition/principle
- Highlight what makes "${payload.topic}" unique
- Preparation tips for quiz on "${payload.topic}"

## QUALITY STANDARDS:

✅ MUST INCLUDE:
- Specific terminology from "${payload.topic}"
- Actual formulas, definitions, or processes (if applicable)
- Real examples with names, numbers, or specific cases
- Technical accuracy - verify all facts about "${payload.topic}"
- Clear focus on "${payload.topic}" throughout (not wandering to general ${payload.subject})

❌ MUST AVOID:
- Generic statements applicable to any topic
- Vague terms like "various methods", "several types", "different approaches"
- Talking about ${payload.subject} in general instead of "${payload.topic}"
- Filler content that doesn't teach about "${payload.topic}"
- Placeholder text like "concept X", "method Y", "formula Z"

## STYLE:
- Use emojis for headers (🎯📚💡🌍📝✅🔬💻⚡🚀)
- Write for ${payload.classLevel} students
- Be conversational but academically accurate
- Include analogies to aid understanding
- Make it engaging but information-dense

Generate the lesson for "${payload.topic}" NOW (focus ONLY on this topic, not general ${payload.subject}):`;
}

// ========================================
// ROUTE HANDLERS
// ========================================

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

    // TRY AI-POWERED GENERATION FIRST
    let result;
    let usedAI = false;
    
    try {
      const provider = getConfiguredProvider();
      if (provider) {
        console.log(`🤖 Using AI (${provider.name}) for topic-specific lesson`);
        const prompt = buildLessonPrompt(payload);
        const aiResult = await callLLMForLesson(provider, prompt, payload);
        
        result = {
          content: aiResult.content,
          source: `${provider.name} AI (${provider.model})`,
          metadata: {
            subject: payload.subject,
            topic: payload.topic,
            difficulty: payload.difficulty,
            words: aiResult.content.split(/\s+/).length,
            type: "ai-generated-specific",
            provider: provider.name,
            model: provider.model
          }
        };
        usedAI = true;
      } else {
        throw new Error("No AI provider configured");
      }
    } catch (aiError) {
      console.warn(`⚠️ AI generation failed: ${aiError.message}`);
      console.log(`📚 Falling back to Smart Lesson Generator`);
      
      // Fallback to smart lesson generator
      result = generateSmartLesson(payload);
      usedAI = false;
    }
    
    response.json({
      success: true,
      data: {
        content: result.content,
        metadata: {
          source: result.source,
          ...result.metadata,
        },
      },
      message: usedAI 
        ? `✨ AI-generated lesson specific to "${payload.topic}"`
        : hasLessonFor(payload.subject)
        ? "✨ Expert lesson with detailed content and examples"
        : "✨ Structured educational lesson for your topic",
      fallback: !usedAI,
    });
    
    console.log(`✅ Generated lesson using ${usedAI ? 'AI' : 'Smart Lesson Generator'}\n`);
  } catch (error) {
    console.error(`❌ Lesson generation error:`, error);
    next(error);
  }
});

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
