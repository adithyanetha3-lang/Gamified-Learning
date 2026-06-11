import express from "express";
import { 
  generateEducationalContent, 
  getAvailableProviders, 
  getProviderInfo 
} from "../services/enhancedLlmAdapter.js";
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

// Main generation endpoint (enhanced multi-LLM support)
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
    
    // Use enhanced multi-LLM adapter
    const result = await generateEducationalContent(payload);

    response.json({
      success: true,
      data: {
        questions: result.questions,
        metadata: {
          source: result.source || result.provider,
          model: result.model,
          count: result.questions.length,
          subject: payload.subject,
          topic: payload.topic,
          difficulty: payload.difficulty,
          language: payload.language,
        },
      },
      warning: result.warning || null,
      fallback: result.fallback || false,
    });
  } catch (error) {
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
