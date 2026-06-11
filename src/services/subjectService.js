/**
 * Subject Management Service
 * Handles all subject-related Firestore operations
 */

import { serverTimestamp } from "firebase/firestore";
import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";

const logger = createLogger("SubjectService");
const COLLECTION_NAME = "subjects";

/**
 * Get all subjects
 */
export async function getAllSubjects() {
  try {
    // Simplified query without compound sorting to avoid index requirement
    const subjects = await firestore.getDocuments(
      COLLECTION_NAME,
      [],
      [{ field: "order", direction: "asc" }]
    );
    
    // Sort by name in memory if needed
    return subjects.sort((a, b) => {
      if (a.order === b.order) {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });
  } catch (error) {
    logger.error("Error getting all subjects:", error);
    throw error;
  }
}

/**
 * Get published subjects (student view)
 */
export async function getPublishedSubjects() {
  try {
    // Get published subjects without sorting to avoid index requirement
    const subjects = await firestore.getDocuments(
      COLLECTION_NAME,
      [{ field: "published", operator: "==", value: true }],
      []
    );
    
    // Sort in memory by order, then by name
    return subjects.sort((a, b) => {
      const orderA = a.order || 999;
      const orderB = b.order || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  } catch (error) {
    logger.error("Error getting published subjects:", error);
    throw error;
  }
}

/**
 * Get a single subject by ID
 */
export async function getSubject(subjectId) {
  try {
    return await firestore.getDocument(COLLECTION_NAME, subjectId);
  } catch (error) {
    logger.error(`Error getting subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Create a new subject
 */
export async function createSubject(data) {
  try {
    const subjectId = `subject_${Date.now()}`;
    
    const subjectData = {
      name: data.name,
      description: data.description || "",
      icon: data.icon || "📚",
      color: data.color || "#3182ce",
      published: false,
      order: data.order || 999,
      topicCount: 0,
      questionCount: 0,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
    };
    
    await firestore.setDocument(COLLECTION_NAME, subjectId, subjectData, false);
    
    logger.info(`Subject created: ${subjectId}`);
    return subjectId;
  } catch (error) {
    logger.error("Error creating subject:", error);
    throw error;
  }
}

/**
 * Update a subject
 */
export async function updateSubject(subjectId, data) {
  try {
    await firestore.updateDocument(COLLECTION_NAME, subjectId, data);
    logger.info(`Subject updated: ${subjectId}`);
  } catch (error) {
    logger.error(`Error updating subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Delete a subject
 */
export async function deleteSubject(subjectId) {
  try {
    await firestore.deleteDocument(COLLECTION_NAME, subjectId);
    logger.info(`Subject deleted: ${subjectId}`);
  } catch (error) {
    logger.error(`Error deleting subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Publish/unpublish a subject
 */
export async function toggleSubjectPublish(subjectId, published) {
  try {
    await updateSubject(subjectId, { published });
    logger.info(`Subject ${subjectId} ${published ? "published" : "unpublished"}`);
  } catch (error) {
    logger.error(`Error toggling publish for subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Increment topic count
 */
export async function incrementTopicCount(subjectId, value = 1) {
  try {
    await firestore.incrementField(COLLECTION_NAME, subjectId, "topicCount", value);
  } catch (error) {
    logger.error(`Error incrementing topic count for subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Increment question count
 */
export async function incrementQuestionCount(subjectId, value = 1) {
  try {
    await firestore.incrementField(COLLECTION_NAME, subjectId, "questionCount", value);
  } catch (error) {
    logger.error(`Error incrementing question count for subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Subscribe to subject changes (real-time)
 */
export function subscribeToSubjects(callback, onlyPublished = false) {
  const filters = onlyPublished ? [{ field: "published", operator: "==", value: true }] : [];
  // Single field sort only to avoid index requirement
  const sorts = [{ field: "order", direction: "asc" }];
  
  return firestore.subscribeToCollection(
    COLLECTION_NAME,
    filters,
    sorts,
    callback,
    (error) => logger.error("Subject subscription error:", error)
  );
}

/**
 * Subscribe to a single subject (real-time)
 */
export function subscribeToSubject(subjectId, callback) {
  return firestore.subscribeToDocument(
    COLLECTION_NAME,
    subjectId,
    callback,
    (error) => logger.error(`Subject ${subjectId} subscription error:`, error)
  );
}

export default {
  getAllSubjects,
  getPublishedSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectPublish,
  incrementTopicCount,
  incrementQuestionCount,
  subscribeToSubjects,
  subscribeToSubject,
};
