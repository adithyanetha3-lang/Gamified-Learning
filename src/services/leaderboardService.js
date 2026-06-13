/**
 * Leaderboard Service
 * Handles leaderboard queries and rankings
 */

import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";

const logger = createLogger("LeaderboardService");
const PROGRESS_COLLECTION = "progress";

/**
 * Get global leaderboard (top students by XP)
 */
export async function getGlobalLeaderboard(limitCount = 50) {
  try {
    // Simple query - sort by XP only (no composite index needed)
    return await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [],
      [{ field: "xp", direction: "desc" }],
      limitCount
    );
  } catch (error) {
    logger.error("Error getting global leaderboard:", error);
    console.error("Leaderboard error details:", error);
    throw error;
  }
}

/**
 * Get weekly leaderboard (based on recent activity)
 */
export async function getWeeklyLeaderboard(limitCount = 50) {
  try {
    // Get users active in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];
    
    // Simple query - single sort field
    return await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [{ field: "lastActivityDate", operator: ">=", value: dateStr }],
      [{ field: "xp", direction: "desc" }],
      limitCount
    );
  } catch (error) {
    logger.error("Error getting weekly leaderboard:", error);
    console.error("Weekly leaderboard error:", error);
    throw error;
  }
}

/**
 * Get user's rank in global leaderboard
 */
export async function getUserRank(userId) {
  try {
    const user = await firestore.getDocument(PROGRESS_COLLECTION, userId);
    
    if (!user) {
      return {
        rank: null,
        total: 0,
        xp: 0,
        level: 1,
      };
    }
    
    // Get all users with more XP
    const higherUsers = await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [{ field: "xp", operator: ">", value: user.xp }]
    );
    
    // Get total users
    const allUsers = await firestore.getDocuments(PROGRESS_COLLECTION);
    
    return {
      rank: higherUsers.length + 1,
      total: allUsers.length,
      xp: user.xp,
      level: user.level,
      percentile: Math.round(((allUsers.length - higherUsers.length) / allUsers.length) * 100),
    };
  } catch (error) {
    logger.error(`Error getting rank for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get leaderboard around a specific user (user + neighbors)
 */
export async function getLeaderboardAroundUser(userId, range = 5) {
  try {
    const user = await firestore.getDocument(PROGRESS_COLLECTION, userId);
    
    if (!user) {
      return [];
    }
    
    // Get users above
    const above = await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [{ field: "xp", operator: ">", value: user.xp }],
      [{ field: "xp", direction: "asc" }],
      range
    );
    
    // Get users below
    const below = await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [{ field: "xp", operator: "<", value: user.xp }],
      [{ field: "xp", direction: "desc" }],
      range
    );
    
    // Combine and sort
    const combined = [...above.reverse(), user, ...below];
    
    return combined.sort((a, b) => b.xp - a.xp);
  } catch (error) {
    logger.error(`Error getting leaderboard around user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get subject-specific leaderboard
 */
export async function getSubjectLeaderboard(subjectId, limitCount = 50) {
  try {
    // Get all progress documents
    const allProgress = await firestore.getDocuments(PROGRESS_COLLECTION);
    
    // Filter and sort by subject XP
    const subjectLeaderboard = allProgress
      .map(p => ({
        ...p,
        subjectXP: p.subjectProgress?.[subjectId]?.xp || 0,
      }))
      .filter(p => p.subjectXP > 0)
      .sort((a, b) => b.subjectXP - a.subjectXP)
      .slice(0, limitCount);
    
    return subjectLeaderboard;
  } catch (error) {
    logger.error(`Error getting subject leaderboard for ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Get streak leaders
 */
export async function getStreakLeaderboard(limitCount = 50) {
  try {
    // Simple query - single sort
    return await firestore.getDocuments(
      PROGRESS_COLLECTION,
      [{ field: "streak", operator: ">", value: 0 }],
      [{ field: "streak", direction: "desc" }],
      limitCount
    );
  } catch (error) {
    logger.error("Error getting streak leaderboard:", error);
    console.error("Streak leaderboard error:", error);
    throw error;
  }
}

/**
 * Subscribe to global leaderboard (real-time)
 */
export function subscribeToLeaderboard(callback, limitCount = 50) {
  const filters = [];
  const sorts = [{ field: "xp", direction: "desc" }]; // Single sort only
  
  return firestore.subscribeToCollection(
    PROGRESS_COLLECTION,
    filters,
    sorts,
    (data) => callback(data.slice(0, limitCount)),
    (error) => logger.error("Leaderboard subscription error:", error)
  );
}

export default {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getUserRank,
  getLeaderboardAroundUser,
  getSubjectLeaderboard,
  getStreakLeaderboard,
  subscribeToLeaderboard,
};
