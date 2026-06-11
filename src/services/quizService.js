/**
 * Quiz Attempt Service
 * Handles quiz taking, submission, scoring
 */

import { serverTimestamp } from "firebase/firestore";
import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";
import { incrementCompletionCount } from "./topicService";

const logger = createLogger("QuizService");
const COLLECTION_NAME = "quizAttempts";

/**
 * Get quiz attempts for a user
 */
export async function getUserQuizAttempts(userId, limitCount = 10) {
  try {
    return await firestore.getDocuments(
      COLLECTION_NAME,
      [{ field: "userId", operator: "==", value: userId }],
      [{ field: "completedAt", direction: "desc" }],
      limitCount
    );
  } catch (error) {
    logger.error(`Error getting quiz attempts for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get quiz attempts for a topic
 */
export async function getTopicQuizAttempts(topicId, limitCount = null) {
  try {
    return await firestore.getDocuments(
      COLLECTION_NAME,
      [{ field: "topicId", operator: "==", value: topicId }],
      [{ field: "completedAt", direction: "desc" }],
      limitCount
    );
  } catch (error) {
    logger.error(`Error getting quiz attempts for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Get a single quiz attempt
 */
export async function getQuizAttempt(attemptId) {
  try {
    return await firestore.getDocument(COLLECTION_NAME, attemptId);
  } catch (error) {
    logger.error(`Error getting quiz attempt ${attemptId}:`, error);
    throw error;
  }
}

/**
 * Start a quiz attempt
 */
export async function startQuizAttempt(data) {
  try {
    const attemptId = `attempt_${Date.now()}_${data.userId}`;
    
    const attemptData = {
      userId: data.userId,
      userName: data.userName,
      topicId: data.topicId,
      topicName: data.topicName,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      questions: data.questions, // Array of question IDs
      answers: {}, // Will be filled as user answers
      score: 0,
      totalQuestions: data.questions.length,
      correctAnswers: 0,
      completed: false,
      startedAt: serverTimestamp(),
    };
    
    await firestore.setDocument(COLLECTION_NAME, attemptId, attemptData, false);
    
    logger.info(`Quiz attempt started: ${attemptId}`);
    return attemptId;
  } catch (error) {
    logger.error("Error starting quiz attempt:", error);
    throw error;
  }
}

/**
 * Submit an answer
 */
export async function submitAnswer(attemptId, questionId, answer, isCorrect) {
  try {
    const attempt = await getQuizAttempt(attemptId);
    
    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }
    
    if (attempt.completed) {
      throw new Error("Quiz already completed");
    }
    
    // Update answers
    const updatedAnswers = {
      ...attempt.answers,
      [questionId]: {
        answer,
        isCorrect,
        answeredAt: new Date().toISOString(),
      },
    };
    
    await firestore.updateDocument(COLLECTION_NAME, attemptId, {
      answers: updatedAnswers,
    });
    
    logger.info(`Answer submitted for attempt ${attemptId}, question ${questionId}`);
  } catch (error) {
    logger.error(`Error submitting answer for attempt ${attemptId}:`, error);
    throw error;
  }
}

/**
 * Complete quiz and calculate score
 */
export async function completeQuiz(attemptId, userId) {
  try {
    const attempt = await getQuizAttempt(attemptId);
    
    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }
    
    if (attempt.completed) {
      throw new Error("Quiz already completed");
    }
    
    // Calculate score
    const answers = Object.values(attempt.answers);
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalCount = attempt.totalQuestions;
    const scorePercent = Math.round((correctCount / totalCount) * 100);
    
    // Calculate XP (base 10 per question + bonus for high scores)
    let xpEarned = correctCount * 10;
    if (scorePercent >= 90) xpEarned += 50; // Bonus for excellence
    else if (scorePercent >= 75) xpEarned += 25; // Bonus for good performance
    
    await firestore.updateDocument(COLLECTION_NAME, attemptId, {
      completed: true,
      completedAt: serverTimestamp(),
      score: scorePercent,
      correctAnswers: correctCount,
      xpEarned,
    });
    
    // Increment topic completion count
    await incrementCompletionCount(attempt.topicId, 1);
    
    // Update user progress (handled separately)
    logger.info(`Quiz completed: ${attemptId}, Score: ${scorePercent}%, XP: ${xpEarned}`);
    
    return {
      score: scorePercent,
      correctAnswers: correctCount,
      totalQuestions: totalCount,
      xpEarned,
    };
  } catch (error) {
    logger.error(`Error completing quiz ${attemptId}:`, error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserQuizStats(userId) {
  try {
    const attempts = await getUserQuizAttempts(userId, 100);
    
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.completed);
    const averageScore = completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length)
      : 0;
    const totalXP = completedAttempts.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
    
    // Get unique topics attempted
    const uniqueTopics = new Set(attempts.map(a => a.topicId)).size;
    
    return {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore,
      totalXP,
      topicsAttempted: uniqueTopics,
      recentAttempts: attempts.slice(0, 5),
    };
  } catch (error) {
    logger.error(`Error getting quiz stats for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Subscribe to user quiz attempts (real-time)
 */
export function subscribeToUserAttempts(userId, callback, limitCount = 10) {
  const filters = [{ field: "userId", operator: "==", value: userId }];
  const sorts = [{ field: "completedAt", direction: "desc" }];
  
  return firestore.subscribeToCollection(
    COLLECTION_NAME,
    filters,
    sorts,
    callback,
    (error) => logger.error("Quiz attempts subscription error:", error)
  );
}

export default {
  getUserQuizAttempts,
  getTopicQuizAttempts,
  getQuizAttempt,
  startQuizAttempt,
  submitAnswer,
  completeQuiz,
  getUserQuizStats,
  subscribeToUserAttempts,
};
