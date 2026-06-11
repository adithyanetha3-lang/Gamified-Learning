import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import questionsRouter from "./routes/questions.js";
import lessonsRouter from "./routes/lessons.js";
import { securityMiddleware, rateLimiter } from "./middleware/security.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env values from both server/.env and project-root/.env for easier local setup.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env"), override: false });

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Check for any LLM provider configuration
const hasGroqKey = Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_"));
const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your_"));
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your_"));
const hasGoogleKey = Boolean(process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes("your_"));
const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes("your_"));

const hasLlmKey = hasGroqKey || hasAnthropicKey || hasOpenAIKey || hasGoogleKey || hasOpenRouterKey;
const llmProvider = hasGroqKey ? "Groq (FREE)" 
  : hasAnthropicKey ? "Anthropic Claude"
  : hasOpenAIKey ? "OpenAI"
  : hasGoogleKey ? "Google Gemini"
  : hasOpenRouterKey ? "OpenRouter"
  : null;

// Security middleware
app.use(securityMiddleware);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:4173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logging
app.use(requestLogger);

// Rate limiting for API routes
app.use("/api", rateLimiter);

// Health check endpoint (no rate limiting)
app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "skill-park-api",
    version: "1.0.0",
    environment: NODE_ENV,
    llmConfigured: hasLlmKey,
    llmProvider: llmProvider,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: "skill-park-api",
    message: "Skill Park API is running.",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      generateQuestions: "POST /api/questions/generate",
    },
  });
});

// API routes
app.use("/api/questions", questionsRouter);
app.use("/api/lessons", lessonsRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Skill Park API Server Started      ║
╚═══════════════════════════════════════╝
  Environment: ${NODE_ENV}
  Port: ${PORT}
  LLM Status: ${hasLlmKey ? `✓ ${llmProvider}` : "⚠ Mock Mode"}
  Time: ${new Date().toLocaleString()}
  `);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
