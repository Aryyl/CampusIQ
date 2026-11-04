/**
 * Notification Service
 * Manages real-time in-app notifications for both Administrators and Students.
 * Backed by Cloud Firestore 'campus_notifications' collection.
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
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Creates a new notification record in Firestore.
 */
export async function createNotification({
  type = 'general',
  title,
  message,
  recipientRole = 'all', // 'admin' | 'student' | 'all'
  recipientUid = null,   // null = all users of that role
  linkType = null,       // 'issue' | 'event' | 'notice'
  linkId = null,         // ticketId or eventId
}) {
  try {
    const docRef = await addDoc(collection(db, 'campus_notifications'), {
      type,
      title: title || 'Notification',
      message: message || '',
      recipientRole,
      recipientUid: recipientUid || null,
      linkType: linkType || null,
      linkId: linkId || null,
      read: false,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.warn('Could not create notification:', error)
    return null
  }
}

/**
 * Subscribes in real-time to notifications relevant to the active user.
 * Sorts in-memory by createdAt to eliminate any Firestore composite index requirement.
 *
 * @param {object} params - { role: 'admin' | 'student', uid: string }
 * @param {function} onUpdate - callback receiving array of notifications
 * @returns {function} unsubscribe
 */
export function subscribeNotifications({ role, uid = null }, onUpdate) {
  let q
  try {
    if (role === 'admin') {
      q = query(collection(db, 'campus_notifications'), where('recipientRole', '==', 'admin'))
    } else {
      q = query(collection(db, 'campus_notifications'), where('recipientRole', '==', 'student'))
    }
  } catch (err) {
    console.warn('Notification query error, using collection root:', err)
    q = collection(db, 'campus_notifications')
  }

  const handleSnapshot = (snapshot) => {
    const items = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => {
        if (role === 'admin') return n.recipientRole === 'admin'
        // For students: broadcast (null recipientUid) or specific to this student
        if (!uid) return !n.recipientUid
        return !n.recipientUid || n.recipientUid === uid
      })
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return timeB - timeA
      })

    onUpdate(items)
  }

  return onSnapshot(
    q,
    handleSnapshot,
    (error) => {
      console.warn('subscribeNotifications error, fallback to empty:', error)
      onUpdate([])
    }
  )
}

/**
 * Marks a single notification as read.
 */
export async function markAsRead(notificationId) {
  if (!notificationId) return
  try {
    const ref = doc(db, 'campus_notifications', notificationId)
    await updateDoc(ref, { read: true, readAt: serverTimestamp() })
  } catch (err) {
    console.warn('Could not mark notification as read:', err)
  }
}

/**
 * Marks a batch of notifications as read.
 */
export async function markAllAsRead(notificationIds = []) {
  if (!notificationIds.length) return
  try {
    const batch = writeBatch(db)
    notificationIds.slice(0, 50).forEach((id) => {
      const ref = doc(db, 'campus_notifications', id)
      batch.update(ref, { read: true, readAt: serverTimestamp() })
    })
    await batch.commit()
  } catch (err) {
    console.warn('Could not mark all notifications as read:', err)
  }
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(notificationId) {
  if (!notificationId) return
  try {
    await deleteDoc(doc(db, 'campus_notifications', notificationId))
  } catch (err) {
    console.warn('Could not delete notification:', err)
  }
}
