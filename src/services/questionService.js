/**
 * Question Management Service
 * Handles question CRUD, generation, approval workflow
 */

import { serverTimestamp } from "firebase/firestore";
import { createLogger } from "../utils/logger";
import * as firestore from "./firestoreService";
import { incrementQuestionCount as incrementTopicQuestions } from "./topicService";
import { incrementQuestionCount as incrementSubjectQuestions } from "./subjectService";

const logger = createLogger("QuestionService");
const COLLECTION_NAME = "questions";

/**
 * Get questions by topic
 */
export async function getQuestionsByTopic(topicId, statusFilter = null) {
  try {
    const filters = [{ field: "topicId", operator: "==", value: topicId }];
    
    if (statusFilter) {
      filters.push({ field: "status", operator: "==", value: statusFilter });
    }
    
    // Get without sorting to avoid index requirement
    const questions = await firestore.getDocuments(
      COLLECTION_NAME,
      filters,
      []
    );
    
    // Sort in memory by creation date (newest first)
    return questions.sort((a, b) => {
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    logger.error(`Error getting questions for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Get published questions for quiz
 */
export async function getPublishedQuestions(topicId, limitCount = null) {
  try {
    // Get published questions without sorting to avoid index requirement
    const questions = await firestore.getDocuments(
      COLLECTION_NAME,
      [
        { field: "topicId", operator: "==", value: topicId },
        { field: "status", operator: "==", value: "published" },
      ],
      [],
      limitCount
    );
    
    // Sort in memory by order
    return questions.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    logger.error(`Error getting published questions for topic ${topicId}:`, error);
    throw error;
  }
}

/**
 * Get a single question
 */
export async function getQuestion(questionId) {
  try {
    return await firestore.getDocument(COLLECTION_NAME, questionId);
  } catch (error) {
    logger.error(`Error getting question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Create a new question
 */
export async function createQuestion(data) {
  try {
    const questionId = `question_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const questionData = {
      topicId: data.topicId,
      subjectId: data.subjectId,
      question: data.question,
      options: data.options || [],
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || "",
      difficulty: data.difficulty || "medium",
      status: data.status || "draft", // draft, approved, published
      order: data.order || 999,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
      source: data.source || "manual", // manual, ai-generated
    };
    
    await firestore.setDocument(COLLECTION_NAME, questionId, questionData, false);
    
    logger.info(`Question created: ${questionId}`);
    return questionId;
  } catch (error) {
    logger.error("Error creating question:", error);
    throw error;
  }
}

/**
 * Bulk create questions (for AI generation)
 */
export async function bulkCreateQuestions(questions) {
  try {
    const operations = questions.map(q => {
      const questionId = `question_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return {
        type: "set",
        collection: COLLECTION_NAME,
        id: questionId,
        data: {
          ...q,
          status: q.status || "draft",
          createdAt: serverTimestamp(),
        },
        merge: false,
      };
    });
    
    await firestore.batchWrite(operations);
    
    logger.info(`Bulk created ${questions.length} questions`);
    return operations.map(op => op.id);
  } catch (error) {
    logger.error("Error bulk creating questions:", error);
    throw error;
  }
}

/**
 * Update a question
 */
export async function updateQuestion(questionId, data) {
  try {
    await firestore.updateDocument(COLLECTION_NAME, questionId, data);
    logger.info(`Question updated: ${questionId}`);
  } catch (error) {
    logger.error(`Error updating question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId) {
  try {
    const question = await getQuestion(questionId);
    
    if (question) {
      await firestore.deleteDocument(COLLECTION_NAME, questionId);
      
      // Decrement counts if published
      if (question.status === "published") {
        await incrementTopicQuestions(question.topicId, -1);
        await incrementSubjectQuestions(question.subjectId, -1);
      }
      
      logger.info(`Question deleted: ${questionId}`);
    }
  } catch (error) {
    logger.error(`Error deleting question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Approve a question
 */
export async function approveQuestion(questionId, reviewedBy) {
  try {
    await updateQuestion(questionId, {
      status: "approved",
      reviewedBy,
      reviewedAt: serverTimestamp(),
    });
    logger.info(`Question approved: ${questionId}`);
  } catch (error) {
    logger.error(`Error approving question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Publish a question
 */
export async function publishQuestion(questionId, publishedBy) {
  try {
    const question = await getQuestion(questionId);
    
    if (!question) {
      throw new Error("Question not found");
    }
    
    const wasPublished = question.status === "published";
    
    await updateQuestion(questionId, {
      status: "published",
      publishedBy,
      publishedAt: serverTimestamp(),
    });
    
    // Increment counts only if not already published
    if (!wasPublished) {
      await incrementTopicQuestions(question.topicId, 1);
      await incrementSubjectQuestions(question.subjectId, 1);
    }
    
    logger.info(`Question published: ${questionId}`);
  } catch (error) {
    logger.error(`Error publishing question ${questionId}:`, error);
    throw error;
  }
}

/**
 * Bulk approve questions
 */
export async function bulkApproveQuestions(questionIds, reviewedBy) {
  try {
    const operations = questionIds.map(id => ({
      type: "update",
      collection: COLLECTION_NAME,
      id,
      data: {
        status: "approved",
        reviewedBy,
        reviewedAt: serverTimestamp(),
      },
    }));
    
    await firestore.batchWrite(operations);
    logger.info(`Bulk approved ${questionIds.length} questions`);
  } catch (error) {
    logger.error("Error bulk approving questions:", error);
    throw error;
  }
}

/**
 * Bulk publish questions
 */
export async function bulkPublishQuestions(questionIds, publishedBy) {
  try {
    const operations = questionIds.map(id => ({
      type: "update",
      collection: COLLECTION_NAME,
      id,
      data: {
        status: "published",
        publishedBy,
        publishedAt: serverTimestamp(),
      },
    }));
    
    await firestore.batchWrite(operations);
    logger.info(`Bulk published ${questionIds.length} questions`);
    
    // Note: Counts should be incremented manually for each question
    // to handle topic/subject tracking properly
  } catch (error) {
    logger.error("Error bulk publishing questions:", error);
    throw error;
  }
}

/**
 * Subscribe to questions for a topic (real-time)
 */
export function subscribeToQuestions(topicId, callback, statusFilter = null) {
  const filters = [{ field: "topicId", operator: "==", value: topicId }];
  
  if (statusFilter) {
    filters.push({ field: "status", operator: "==", value: statusFilter });
  }
  
  // No sorting to avoid index requirement - sort in memory
  const sorts = [];
  
  return firestore.subscribeToCollection(
    COLLECTION_NAME,
    filters,
    sorts,
    (questions) => {
      // Sort in memory before calling callback
      const sortedQuestions = questions.sort((a, b) => {
        const orderDiff = (a.order || 999) - (b.order || 999);
        if (orderDiff !== 0) return orderDiff;
        
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });
      callback(sortedQuestions);
    },
    (error) => logger.error("Questions subscription error:", error)
  );
}

export default {
  getQuestionsByTopic,
  getPublishedQuestions,
  getQuestion,
  createQuestion,
  bulkCreateQuestions,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  publishQuestion,
  bulkApproveQuestions,
  bulkPublishQuestions,
  subscribeToQuestions,
};
