/**
 * Topic Management Service
 * Handles all topic-related Firestore operations
 */

import { serverTimestamp } from "firebase/firestore";
import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";
import { incrementTopicCount } from "./subjectService";

const logger = createLogger("TopicService");
const COLLECTION_NAME = "topics";

/**
 * Get all topics for a subject (optimized - no index required)
 */
export async function getTopicsBySubject(subjectId) {
  try {
    // Get all topics without sorting to avoid index requirement
    const allTopics = await firestore.getDocuments(
      COLLECTION_NAME,
      [{ field: "subjectId", operator: "==", value: subjectId }],
      []
    );
    
    // Sort in memory by order
    return allTopics.sort((a, b) => {
      const orderA = a.order || 999;
      const orderB = b.order || 999;
      return orderA - orderB;
    });
  } catch (error) {
    logger.error(`Error getting topics for subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Get published topics for a subject
 */
export async function getPublishedTopicsBySubject(subjectId) {
  try {
    // Get topics without sorting to avoid index requirement
    const topics = await firestore.getDocuments(
      COLLECTION_NAME,
      [
        { field: "subjectId", operator: "==", value: subjectId },
        { field: "published", operator: "==", value: true },
      ],
      []
    );
    
    // Sort in memory
    return topics.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    logger.error(`Error getting published topics for subject ${subjectId}:`, error);
    throw error;
  }
}

/**
 * Get a single topic by ID
 */
export async function getTopic(topicId) {
  try {
    return await firestore.getDocument(COLLECTION_NAME, topicId);
  } catch (error) {
    logger.error(`Error getting topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Create a new topic
 */
export async function createTopic(data) {
  try {
    const topicId = `topic_${Date.now()}`;
    
    const topicData = {
      subjectId: data.subjectId,
      name: data.name,
      description: data.description || "",
      lessonText: data.lessonText || "",
      difficulty: data.difficulty || "medium",
      published: false,
      order: data.order || 999,
      questionCount: 0,
      completionCount: 0,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
    };
    
    await firestore.setDocument(COLLECTION_NAME, topicId, topicData, false);
    
    // Increment subject topic count
    await incrementTopicCount(data.subjectId, 1);
    
    logger.info(`Topic created: ${topicId}`);
    return topicId;
  } catch (error) {
    logger.error("Error creating topic:", error);
    throw error;
  }
}

/**
 * Update a topic
 */
export async function updateTopic(topicId, data) {
  try {
    await firestore.updateDocument(COLLECTION_NAME, topicId, data);
    logger.info(`Topic updated: ${topicId}`);
  } catch (error) {
    logger.error(`Error updating topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Delete a topic
 */
export async function deleteTopic(topicId) {
  try {
    const topic = await getTopic(topicId);
    
    if (topic) {
      await firestore.deleteDocument(COLLECTION_NAME, topicId);
      
      // Decrement subject topic count
      await incrementTopicCount(topic.subjectId, -1);
      
      logger.info(`Topic deleted: ${topicId}`);
    }
  } catch (error) {
    logger.error(`Error deleting topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Publish/unpublish a topic
 */
export async function toggleTopicPublish(topicId, published) {
  try {
    await updateTopic(topicId, { published });
    logger.info(`Topic ${topicId} ${published ? "published" : "unpublished"}`);
  } catch (error) {
    logger.error(`Error toggling publish for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Increment question count
 */
export async function incrementQuestionCount(topicId, value = 1) {
  try {
    await firestore.incrementField(COLLECTION_NAME, topicId, "questionCount", value);
  } catch (error) {
    logger.error(`Error incrementing question count for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Increment completion count
 */
export async function incrementCompletionCount(topicId, value = 1) {
  try {
    await firestore.incrementField(COLLECTION_NAME, topicId, "completionCount", value);
  } catch (error) {
    logger.error(`Error incrementing completion count for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Subscribe to topics for a subject (real-time)
 */
export function subscribeToTopics(subjectId, callback, onlyPublished = false) {
  const filters = [{ field: "subjectId", operator: "==", value: subjectId }];
  
  if (onlyPublished) {
    filters.push({ field: "published", operator: "==", value: true });
  }
  
  // No sorting to avoid index requirement - sort in memory
  const sorts = [];
  
  return firestore.subscribeToCollection(
    COLLECTION_NAME,
    filters,
    sorts,
    (topics) => {
      // Sort in memory before calling callback
      const sortedTopics = topics.sort((a, b) => (a.order || 999) - (b.order || 999));
      callback(sortedTopics);
    },
    (error) => logger.error("Topic subscription error:", error)
  );
}

/**
 * Subscribe to a single topic (real-time)
 */
export function subscribeToTopic(topicId, callback) {
  return firestore.subscribeToDocument(
    COLLECTION_NAME,
    topicId,
    callback,
    (error) => logger.error(`Topic ${topicId} subscription error:`, error)
  );
}

export default {
  getTopicsBySubject,
  getPublishedTopicsBySubject,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  toggleTopicPublish,
  incrementQuestionCount,
  incrementCompletionCount,
  subscribeToTopics,
  subscribeToTopic,
};
