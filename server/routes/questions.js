import express from "express";
import { 
  generateEducationalContent, 
  getAvailableProviders, 
  getProviderInfo 
} from "../services/enhancedLlmAdapter.js";
import { 
  generateSmartQuestions,
  hasTemplatesFor 
} from "../services/smartQuestionGenerator.js";
import { 
  buildPromptFromTemplate, 
  generateQuestionsFromLlm 
} from "../services/llmAdapter.js";
import { ValidationError } from "../middleware/errorHandler.js";
import { sanitizeInput } from "../middleware/security.js";

const router = express.Router();

// Validation helper
function validateGenerateRequest(payload) {
  const errors = [];
  
  if (!payload.subject || typeof payload.subject !== "string") {
    errors.push("subject is required and must be a string");
  }
  
  if (!payload.classLevel || typeof payload.classLevel !== "string") {
    errors.push("classLevel is required and must be a string");
  }
  
  if (!payload.difficulty || typeof payload.difficulty !== "string") {
    errors.push("difficulty is required and must be a string");
  }
  
  const count = Number(payload.count);
  if (!count || count < 1 || count > 50) {
    errors.push("count must be a number between 1 and 50");
  }
  
  if (errors.length > 0) {
    throw new ValidationError("Invalid request payload", errors);
  }
  
  return true;
}

// Main generation endpoint (SMART GENERATOR FIRST, AI FALLBACK)
router.post("/generate", async (request, response, next) => {
  try {
    // Validate request
    validateGenerateRequest(request.body);
    
    // Sanitize inputs
    const payload = {
      subject: sanitizeInput(request.body.subject),
      topic: sanitizeInput(request.body.topic || ""),
      classLevel: sanitizeInput(request.body.classLevel),
      difficulty: sanitizeInput(request.body.difficulty),
      count: Number(request.body.count),
      lessonText: sanitizeInput(request.body.lessonText || ""),
      language: sanitizeInput(request.body.language || "English"),
      contentType: sanitizeInput(request.body.contentType || "quiz"),
    };
    
    console.log(`\n🎯 Question Generation Request:`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Topic: ${payload.topic}`);
    console.log(`Difficulty: ${payload.difficulty}`);
    console.log(`Count: ${payload.count}`);

    // TRY AI-POWERED GENERATION FIRST
    let result;
    let usedAI = false;
    
    try {
      console.log(`🤖 Attempting AI generation with Groq...`);
      result = await generateEducationalContent(payload);
      
      if (result.success && result.questions && result.questions.length > 0) {
        console.log(`✅ AI generation successful: ${result.questions.length} questions`);
        usedAI = true;
      } else {
        throw new Error("AI returned no questions");
      }
    } catch (aiError) {
      console.warn(`⚠️ AI generation failed: ${aiError.message}`);
      console.log(`📚 Falling back to Smart Generator`);
      
      // Fallback to smart generator
      const questions = generateSmartQuestions(payload);
      result = {
        questions: questions,
        source: hasTemplatesFor(payload.subject) 
          ? "Smart Generator (Expert Templates)"
          : "Smart Generator (Generic Educational)",
        model: "Curriculum-Aligned Content",
        success: true,
      };
      usedAI = false;
    }
    
    response.json({
      success: true,
      data: {
        questions: result.questions,
        metadata: {
          source: result.source,
          model: result.model || "Curriculum-Aligned Content",
          count: result.questions.length,
          subject: payload.subject,
          topic: payload.topic,
          difficulty: payload.difficulty,
          language: payload.language,
          aiGenerated: usedAI,
        },
      },
      message: usedAI
        ? `✨ AI-generated questions specific to "${payload.topic || payload.subject}"`
        : hasTemplatesFor(payload.subject)
        ? "✨ High-quality questions from expert templates"
        : "✨ Educational questions generated for your topic",
      fallback: !usedAI,
    });
    
    console.log(`✅ Generated ${result.questions.length} questions using ${usedAI ? 'AI' : 'Smart Generator'}\n`);
  } catch (error) {
    console.error(`❌ Generation error:`, error);
    next(error);
  }
});

// Legacy endpoint for backward compatibility
router.post("/generate-legacy", async (request, response, next) => {
  try {
    validateGenerateRequest(request.body);
    
    const payload = {
      subject: sanitizeInput(request.body.subject),
      topic: sanitizeInput(request.body.topic || ""),
      classLevel: sanitizeInput(request.body.classLevel),
      difficulty: sanitizeInput(request.body.difficulty),
      count: Number(request.body.count),
      lessonText: sanitizeInput(request.body.lessonText || ""),
    };
    
    const prompt = buildPromptFromTemplate(payload);
    const result = await generateQuestionsFromLlm({ ...payload, prompt });

    response.json({
      success: true,
      data: {
        questions: result.questions,
        metadata: {
          source: result.source,
          count: result.questions.length,
          subject: payload.subject,
          topic: payload.topic,
          difficulty: payload.difficulty,
        },
      },
      warning: result.warning || null,
    });
  } catch (error) {
    next(error);
  }
});

// Get available LLM providers
router.get("/providers", (request, response) => {
  const providers = getAvailableProviders();
  const currentProvider = getProviderInfo();
  
  response.json({
    success: true,
    data: {
      current: currentProvider,
      available: providers,
    },
  });
});

// Get current provider info
router.get("/provider", (request, response) => {
  const info = getProviderInfo();
  
  response.json({
    success: true,
    data: info,
  });
});

export default router;
