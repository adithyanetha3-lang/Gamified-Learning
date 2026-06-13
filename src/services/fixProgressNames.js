/**
 * Fix Progress Names
 * Updates progress documents with actual user names from user profiles
 */

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { createLogger } from "../utils/logger";

const logger = createLogger("FixProgressNames");

/**
 * Fix all progress documents to use real user names
 */
export async function fixAllProgressNames() {
  try {
    logger.info("Starting to fix progress names...");
    
    // Get all users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    // Get all progress documents
    const progressRef = collection(db, "progress");
    const progressSnapshot = await getDocs(progressRef);
    
    const updates = [];
    
    // For each progress document
    progressSnapshot.forEach((progressDoc) => {
      const progressData = progressDoc.data();
      const userId = progressDoc.id;
      
      // Find the corresponding user
      const userDoc = usersSnapshot.docs.find(u => u.id === userId);
      
      if (userDoc) {
        const userData = userDoc.data();
        const actualName = userData.name || userData.displayName || "Student";
        
        // If the current name is "Student" and we have a real name, update it
        if (progressData.userName === "Student" && actualName !== "Student") {
          updates.push({
            userId,
            oldName: progressData.userName,
            newName: actualName,
            docRef: doc(db, "progress", userId)
          });
        }
      }
    });
    
    logger.info(`Found ${updates.length} progress documents to update`);
    
    // Update all documents
    for (const update of updates) {
      await updateDoc(update.docRef, {
        userName: update.newName
      });
      logger.info(`Updated ${update.userId}: "${update.oldName}" → "${update.newName}"`);
      console.log(`✅ Updated progress for ${update.newName}`);
    }
    
    logger.info(`✅ Successfully updated ${updates.length} progress names`);
    return { success: true, updated: updates.length };
    
  } catch (error) {
    logger.error("Error fixing progress names:", error);
    console.error("Fix progress names error:", error);
    throw error;
  }
}

/**
 * Fix a single user's progress name
 */
export async function fixUserProgressName(userId, userName) {
  try {
    const progressRef = doc(db, "progress", userId);
    await updateDoc(progressRef, {
      userName: userName
    });
    logger.info(`Updated progress name for user ${userId} to ${userName}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error updating progress name for user ${userId}:`, error);
    throw error;
  }
}

export default {
  fixAllProgressNames,
  fixUserProgressName
};
