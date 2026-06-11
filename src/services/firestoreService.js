/**
 * Core Firestore service with common operations
 * Provides reusable CRUD operations with error handling and retry logic
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { createLogger } from "../utils/logger";

const logger = createLogger("FirestoreService");

/**
 * Retry logic for network failures
 */
async function withRetry(operation, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      if (error.code === "unavailable" || error.code === "deadline-exceeded") {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const snapshot = await withRetry(() => getDoc(docRef));
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    logger.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get multiple documents with optional filters
 */
export async function getDocuments(collectionName, filters = [], sorts = [], limitCount = null) {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    // Apply sorting
    sorts.forEach(sort => {
      q = query(q, orderBy(sort.field, sort.direction || "asc"));
    });
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await withRetry(() => getDocs(q));
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    logger.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Create or update a document
 */
export async function setDocument(collectionName, docId, data, merge = true) {
  try {
    const docRef = doc(db, collectionName, docId);
    await withRetry(() => setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge }));
    
    return docId;
  } catch (error) {
    logger.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update specific fields in a document
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await withRetry(() => updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }));
    
    return docId;
  } catch (error) {
    logger.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await withRetry(() => deleteDoc(docRef));
  } catch (error) {
    logger.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Real-time listener for a single document
 */
export function subscribeToDocument(collectionName, docId, callback, errorCallback) {
  try {
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        logger.error(`Error in document subscription for ${docId}:`, error);
        if (errorCallback) errorCallback(error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    logger.error(`Error subscribing to document ${docId}:`, error);
    throw error;
  }
}

/**
 * Real-time listener for a collection with filters
 */
export function subscribeToCollection(collectionName, filters = [], sorts = [], callback, errorCallback) {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    // Apply sorting
    sorts.forEach(sort => {
      q = query(q, orderBy(sort.field, sort.direction || "asc"));
    });
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(documents);
      },
      (error) => {
        logger.error(`Error in collection subscription for ${collectionName}:`, error);
        if (errorCallback) errorCallback(error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    logger.error(`Error subscribing to collection ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Batch operations for multiple writes
 */
export async function batchWrite(operations) {
  try {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      const docRef = doc(db, op.collection, op.id);
      
      switch (op.type) {
        case "set":
          batch.set(docRef, {
            ...op.data,
            updatedAt: serverTimestamp(),
          }, { merge: op.merge !== false });
          break;
        case "update":
          batch.update(docRef, {
            ...op.data,
            updatedAt: serverTimestamp(),
          });
          break;
        case "delete":
          batch.delete(docRef);
          break;
        default:
          logger.warn(`Unknown batch operation type: ${op.type}`);
      }
    });
    
    await withRetry(() => batch.commit());
  } catch (error) {
    logger.error("Error in batch write:", error);
    throw error;
  }
}

/**
 * Increment a numeric field
 */
export async function incrementField(collectionName, docId, field, value = 1) {
  try {
    const docRef = doc(db, collectionName, docId);
    await withRetry(() => updateDoc(docRef, {
      [field]: increment(value),
      updatedAt: serverTimestamp(),
    }));
  } catch (error) {
    logger.error(`Error incrementing field ${field} in ${docId}:`, error);
    throw error;
  }
}

export default {
  getDocument,
  getDocuments,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  batchWrite,
  incrementField,
};
