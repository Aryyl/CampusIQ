/**
 * Notice Service
 * Manages notices in Cloud Firestore 'campus_notices' collection.
 * Admin writes; students read published notices in real time.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { createNotification } from './notificationService'

const COL = 'campus_notices'

/** Dispatch a broadcast student notification when a notice is published */
async function notifyStudentsOfNotice(notice, noticeId) {
  const isImportant = notice.priority === 'Important' || notice.priority === 'High'
  await createNotification({
    type: 'new_notice',
    title: isImportant ? `⚠️ Important Notice` : `📢 New Notice`,
    message: notice.title,
    recipientRole: 'student',
    recipientUid: null, // broadcast
    linkType: 'notice',
    linkId: noticeId,
  })
}

/**
 * Creates a new notice. If status is Published, dispatches a student notification.
 * @param {object} data - notice fields
 * @param {object} adminInfo - { uid, name }
 * @returns {string} new notice ID
 */
export async function createNotice(data, adminInfo = {}) {
  const record = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: adminInfo.uid || null,
    createdByName: adminInfo.name || 'Admin',
  }
  const docRef = await addDoc(collection(db, COL), record)
  if (data.status === 'Published') {
    await notifyStudentsOfNotice(data, docRef.id)
  }
  return docRef.id
}

/**
 * Updates an existing notice. If transitioning to Published, dispatches notification.
 * @param {string} id - Firestore document ID
 * @param {object} updates - fields to update
 * @param {object} adminInfo - { uid, name }
 * @param {string|null} previousStatus - previous status to detect publish transition
 */
export async function updateNotice(id, updates, adminInfo = {}, previousStatus = null) {
  const ref = doc(db, COL, id)
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() })
  if (updates.status === 'Published' && previousStatus !== 'Published') {
    await notifyStudentsOfNotice(updates, id)
  }
}

/**
 * Deletes a notice permanently.
 * @param {string} id - Firestore document ID
 */
export async function deleteNotice(id) {
  await deleteDoc(doc(db, COL, id))
}

/**
 * Subscribes to ALL notices (admin view). Sorts by createdAt desc in-memory.
 * @param {function} onUpdate - callback receiving notice array
 * @returns {function} unsubscribe
 */
export function subscribeAllNotices(onUpdate) {
  const q = query(collection(db, COL))
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const tB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return tB - tA
        })
      onUpdate(items)
    },
    (error) => {
      console.warn('subscribeAllNotices error:', error)
      onUpdate([])
    }
  )
}

/**
 * Subscribes to PUBLISHED, non-expired notices (student view).
 * Filters and sorts in-memory to avoid composite index requirements.
 * @param {function} onUpdate - callback receiving notice array
 * @returns {function} unsubscribe
 */
export function subscribePublishedNotices(onUpdate) {
  const q = query(collection(db, COL), where('status', '==', 'Published'))
  return onSnapshot(
    q,
    (snapshot) => {
      const now = new Date()
      const items = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((n) => !n.expiryDate || new Date(n.expiryDate) > now)
        .sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const tB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return tB - tA
        })
      onUpdate(items)
    },
    (error) => {
      console.warn('subscribePublishedNotices error:', error)
      onUpdate([])
    }
  )
}

// ── Legacy compatibility shim for CampusDataContext (IndexedDB path) ──
// CampusDataContext still imports noticeService.list / .save / .delete
// We keep them as no-ops so the admin dashboard's seed data flow doesn't crash.
export const noticeService = {
  list: async () => [],
  save: async () => {},
  delete: async () => {},
}
