/**
 * Progress Tracking Service
 * Handles student XP, levels, badges, streaks
 */

import { serverTimestamp } from "firebase/firestore";
import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";

const logger = createLogger("ProgressService");
const COLLECTION_NAME = "progress";

/**
 * Get user progress
 */
export async function getUserProgress(userId) {
  try {
    let progress = await firestore.getDocument(COLLECTION_NAME, userId);
    
    // Initialize if doesn't exist
    if (!progress) {
      progress = await initializeProgress(userId);
    }
    
    return progress;
  } catch (error) {
    logger.error(`Error getting progress for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Initialize progress for new user
 */
export async function initializeProgress(userId, userName = "Student") {
  try {
    const initialProgress = {
      userId,
      userName,
      xp: 0,
      level: 1,
      streak: 0,
      lastActivityDate: null,
      totalQuizzes: 0,
      totalCorrectAnswers: 0,
      badges: [],
      topicProgress: {}, // { topicId: { completed: bool, score: number, attempts: number } }
      subjectProgress: {}, // { subjectId: { xp: number, completedTopics: number } }
      createdAt: serverTimestamp(),
    };
    
    await firestore.setDocument(COLLECTION_NAME, userId, initialProgress, false);
    
    logger.info(`Progress initialized for user ${userId}`);
    return { id: userId, ...initialProgress };
  } catch (error) {
    logger.error(`Error initializing progress for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Add XP and update level
 */
export async function addXP(userId, xpAmount, source = "quiz") {
  try {
    const progress = await getUserProgress(userId);
    
    const newXP = progress.xp + xpAmount;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
    const leveledUp = newLevel > progress.level;
    
    await firestore.updateDocument(COLLECTION_NAME, userId, {
      xp: newXP,
      level: newLevel,
      lastActivityDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });
    
    // Check for new badges
    if (leveledUp) {
      await checkAndAwardBadges(userId, progress);
    }
    
    // Update streak
    await updateStreak(userId);
    
    logger.info(`Added ${xpAmount} XP to user ${userId}, new total: ${newXP}, level: ${newLevel}`);
    
    return {
      xpEarned: xpAmount,
      totalXP: newXP,
      level: newLevel,
      leveledUp,
    };
  } catch (error) {
    logger.error(`Error adding XP for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update topic progress after quiz completion
 */
export async function updateTopicProgress(userId, topicId, topicName, score, correctAnswers, totalQuestions) {
  try {
    const progress = await getUserProgress(userId);
    
    const currentTopicProgress = progress.topicProgress[topicId] || {
      topicName,
      attempts: 0,
      bestScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      completed: false,
    };
    
    const newBestScore = Math.max(currentTopicProgress.bestScore, score);
    const newCompleted = score >= 70; // 70% pass threshold
    
    await firestore.updateDocument(COLLECTION_NAME, userId, {
      [`topicProgress.${topicId}`]: {
        ...currentTopicProgress,
        topicName,
        attempts: currentTopicProgress.attempts + 1,
        bestScore: newBestScore,
        lastScore: score,
        totalCorrect: currentTopicProgress.totalCorrect + correctAnswers,
        totalQuestions: currentTopicProgress.totalQuestions + totalQuestions,
        completed: newCompleted,
        lastAttemptDate: new Date().toISOString(),
      },
      totalQuizzes: progress.totalQuizzes + 1,
      totalCorrectAnswers: progress.totalCorrectAnswers + correctAnswers,
    });
    
    logger.info(`Updated topic progress for user ${userId}, topic ${topicId}`);
  } catch (error) {
    logger.error(`Error updating topic progress for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update subject progress
 */
export async function updateSubjectProgress(userId, subjectId, subjectName, xpEarned) {
  try {
    const progress = await getUserProgress(userId);
    
    const currentSubjectProgress = progress.subjectProgress[subjectId] || {
      subjectName,
      xp: 0,
      completedTopics: 0,
    };
    
    await firestore.updateDocument(COLLECTION_NAME, userId, {
      [`subjectProgress.${subjectId}`]: {
        ...currentSubjectProgress,
        subjectName,
        xp: currentSubjectProgress.xp + xpEarned,
      },
    });
    
    logger.info(`Updated subject progress for user ${userId}, subject ${subjectId}`);
  } catch (error) {
    logger.error(`Error updating subject progress for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update streak
 */
export async function updateStreak(userId) {
  try {
    const progress = await getUserProgress(userId);
    const today = new Date().toISOString().split('T')[0];
    const lastActivityDate = progress.lastActivityDate;
    
    if (lastActivityDate === today) {
      // Already active today
      return progress.streak;
    }
    
    let newStreak = progress.streak;
    
    if (!lastActivityDate) {
      // First activity
      newStreak = 1;
    } else {
      const lastDate = new Date(lastActivityDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = progress.streak + 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
    }
    
    await firestore.updateDocument(COLLECTION_NAME, userId, {
      streak: newStreak,
      lastActivityDate: today,
    });
    
    logger.info(`Updated streak for user ${userId}: ${newStreak}`);
    return newStreak;
  } catch (error) {
    logger.error(`Error updating streak for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Award a badge
 */
export async function awardBadge(userId, badgeData) {
  try {
    const progress = await getUserProgress(userId);
    
    // Check if badge already awarded
    const alreadyHas = progress.badges.some(b => b.id === badgeData.id);
    
    if (alreadyHas) {
      return false;
    }
    
    const newBadge = {
      ...badgeData,
      awardedAt: new Date().toISOString(),
    };
    
    await firestore.updateDocument(COLLECTION_NAME, userId, {
      badges: [...progress.badges, newBadge],
    });
    
    logger.info(`Awarded badge ${badgeData.id} to user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error awarding badge to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Check and award badges based on achievements
 */
export async function checkAndAwardBadges(userId, progress) {
  try {
    const badges = [];
    
    // Level badges
    if (progress.level >= 5 && !progress.badges.some(b => b.id === "level_5")) {
      badges.push({ id: "level_5", name: "Level 5 Master", icon: "🌟", description: "Reached Level 5" });
    }
    if (progress.level >= 10 && !progress.badges.some(b => b.id === "level_10")) {
      badges.push({ id: "level_10", name: "Level 10 Champion", icon: "🏆", description: "Reached Level 10" });
    }
    
    // Streak badges
    if (progress.streak >= 7 && !progress.badges.some(b => b.id === "streak_7")) {
      badges.push({ id: "streak_7", name: "Week Warrior", icon: "🔥", description: "7-day streak" });
    }
    if (progress.streak >= 30 && !progress.badges.some(b => b.id === "streak_30")) {
      badges.push({ id: "streak_30", name: "Month Master", icon: "💪", description: "30-day streak" });
    }
    
    // Quiz badges
    if (progress.totalQuizzes >= 10 && !progress.badges.some(b => b.id === "quiz_10")) {
      badges.push({ id: "quiz_10", name: "Quiz Starter", icon: "📝", description: "Completed 10 quizzes" });
    }
    if (progress.totalQuizzes >= 50 && !progress.badges.some(b => b.id === "quiz_50")) {
      badges.push({ id: "quiz_50", name: "Quiz Expert", icon: "🎯", description: "Completed 50 quizzes" });
    }
    
    // Award each badge
    for (const badge of badges) {
      await awardBadge(userId, badge);
    }
    
    return badges;
  } catch (error) {
    logger.error(`Error checking badges for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Subscribe to user progress (real-time)
 */
export function subscribeToProgress(userId, callback) {
  return firestore.subscribeToDocument(
    COLLECTION_NAME,
    userId,
    callback,
    (error) => logger.error(`Progress subscription error for user ${userId}:`, error)
  );
}

export default {
  getUserProgress,
  initializeProgress,
  addXP,
  updateTopicProgress,
  updateSubjectProgress,
  updateStreak,
  awardBadge,
  checkAndAwardBadges,
  subscribeToProgress,
};
