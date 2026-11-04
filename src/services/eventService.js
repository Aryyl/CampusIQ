/**
 * Event Service
 * Handles all Firestore and Firebase Storage operations for CampusIQ Events Management.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { db, storage } from './firebase'

// ──────────────────────────────────────────────
// Image Compression
// ──────────────────────────────────────────────

async function compressImage(file, maxDimension = 1200, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => resolve(blob || file),
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

async function uploadEventPoster(file, eventId) {
  const compressed = await compressImage(file)
  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `event_posters/${eventId}/poster.${ext}`)
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, compressed)
    const timeout = setTimeout(() => {
      task.cancel()
      reject(new Error('Upload timed out'))
    }, 10000)
    task.on(
      'state_changed',
      null,
      (error) => {
        clearTimeout(timeout)
        reject(error)
      },
      async () => {
        clearTimeout(timeout)
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

// ──────────────────────────────────────────────
// Audience Matching
// ──────────────────────────────────────────────

/**
 * Determines if a published event should be visible to a specific student.
 * Compares the event's targetAudience against the student's profile fields.
 */
export function isEventVisibleToStudent(event, student) {
  if (event.status !== 'Published' && event.status !== 'Completed') return false
  const { targetAudience } = event
  if (!targetAudience || targetAudience.type === 'all') return true
  const { departments = [], programmes = [], semesters = [] } = targetAudience
  if (
    departments.length > 0 &&
    !departments.some(
      (d) => d.trim().toLowerCase() === (student.department || '').trim().toLowerCase()
    )
  )
    return false
  if (
    programmes.length > 0 &&
    !programmes.some(
      (p) => p.trim().toLowerCase() === (student.programme || '').trim().toLowerCase()
    )
  )
    return false
  if (
    semesters.length > 0 &&
    !semesters.some((s) => String(s).trim() === String(student.semester || '').trim())
  )
    return false
  return true
}

// ──────────────────────────────────────────────
// Admin CRUD
// ──────────────────────────────────────────────

/**
 * Creates a new event document in Firestore.
 * Optionally uploads an event poster to Firebase Storage.
 */
export async function createEvent(eventData, posterFile = null, adminInfo = {}) {
  // Generate a placeholder doc ref to get the ID for poster upload
  const eventsRef = collection(db, 'academic_events')
  const docRef = doc(eventsRef)
  const eventId = docRef.id

  let posterUrl = null
  if (posterFile) {
    try {
      posterUrl = await uploadEventPoster(posterFile, eventId)
    } catch (err) {
      console.warn('Poster upload failed, continuing without poster:', err)
    }
  }

  const record = {
    ...eventData,
    posterUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: adminInfo.uid || 'admin',
    createdByName: adminInfo.name || 'Administrator',
  }

  await setDoc(docRef, record)

  // Notify students if published
  if (record.status === 'Published') {
    try {
      await addDoc(collection(db, 'campus_notifications'), {
        type: 'new_event',
        title: 'New Campus Event',
        message: `New event: "${record.title}" (${record.category || 'General'})`,
        recipientRole: 'student',
        recipientUid: null,
        linkType: 'event',
        linkId: eventId,
        read: false,
        createdAt: serverTimestamp(),
      })
    } catch (_) {}
  }

  return { id: eventId, ...record }
}

/**
 * Updates an existing event document.
 */
export async function updateEvent(eventDocId, updates, posterFile = null, adminInfo = {}) {
  const docRef = doc(db, 'academic_events', eventDocId)

  let posterUrl = updates.posterUrl || null
  if (posterFile) {
    try {
      posterUrl = await uploadEventPoster(posterFile, eventDocId)
    } catch (err) {
      console.warn('Poster upload failed:', err)
    }
  }

  const record = {
    ...updates,
    posterUrl,
    updatedAt: serverTimestamp(),
    updatedBy: adminInfo.uid || 'admin',
    updatedByName: adminInfo.name || 'Administrator',
  }

  await updateDoc(docRef, record)

  if (updates.status === 'Published') {
    try {
      await addDoc(collection(db, 'campus_notifications'), {
        type: 'new_event',
        title: 'Event Published',
        message: `Event: "${record.title}" is now published.`,
        recipientRole: 'student',
        recipientUid: null,
        linkType: 'event',
        linkId: eventDocId,
        read: false,
        createdAt: serverTimestamp(),
      })
    } catch (_) {}
  }

  return { id: eventDocId, ...record }
}

/**
 * Deletes an event document from Firestore.
 */
export async function deleteEvent(eventDocId) {
  await deleteDoc(doc(db, 'academic_events', eventDocId))
}

/**
 * Subscribes to all events (admin view) using onSnapshot for real-time updates.
 * Returns an unsubscribe function.
 */
export function subscribeAllEvents(onUpdate) {
  const q = query(collection(db, 'academic_events'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      onUpdate(events)
    },
    (error) => {
      console.error('subscribeAllEvents error:', error)
      onUpdate([])
    }
  )
}

/**
 * Subscribes to published and completed events (student view).
 * Returns an unsubscribe function.
 */
export function subscribePublishedEvents(onUpdate) {
  // Query without orderBy to prevent requiring a composite index in Firestore
  const q = query(
    collection(db, 'academic_events'),
    where('status', 'in', ['Published', 'Completed'])
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return timeB - timeA
        })
      onUpdate(events)
    },
    (error) => {
      console.warn('subscribePublishedEvents fallback error:', error)
      onUpdate([])
    }
  )
}

// ──────────────────────────────────────────────
// Student Bookmarks
// ──────────────────────────────────────────────

/**
 * Toggles a bookmark for a student on a specific event.
 * Returns true if bookmarked, false if removed.
 */
export async function toggleBookmark(studentUid, eventId) {
  const bookmarkId = `${studentUid}_${eventId}`
  const docRef = doc(db, 'student_saved_events', bookmarkId)
  const existing = await getDoc(docRef)
  if (existing.exists()) {
    await deleteDoc(docRef)
    return false
  } else {
    await setDoc(docRef, {
      studentUid,
      eventId,
      savedAt: serverTimestamp(),
    })
    return true
  }
}

/**
 * Subscribes to saved events for a specific student.
 * Returns an unsubscribe function.
 */
export function subscribeSavedEvents(studentUid, onUpdate) {
  if (!studentUid) {
    onUpdate([])
    return () => {}
  }
  // Query without orderBy to eliminate composite index requirement
  const q = query(
    collection(db, 'student_saved_events'),
    where('studentUid', '==', studentUid)
  )
  return onSnapshot(
    q,
    (snapshot) => {
      const savedEventIds = snapshot.docs.map((d) => d.data().eventId)
      onUpdate(savedEventIds)
    },
    (error) => {
      console.warn('subscribeSavedEvents error:', error)
      onUpdate([])
    }
  )
}

// ──────────────────────────────────────────────
// Student Notifications
// ──────────────────────────────────────────────

/**
 * Writes in-app notifications to campus_notifications for all matching students.
 * Only used when publishing an event. Accepts a list of matching student UIDs.
 */
export async function notifyStudentsOfEvent(event, studentUids = []) {
  if (!studentUids.length) return
  const notificationsRef = collection(db, 'campus_notifications')
  const batch = studentUids.slice(0, 100) // Cap to prevent excessive writes
  await Promise.allSettled(
    batch.map((uid) =>
      addDoc(notificationsRef, {
        type: 'new_event',
        eventId: event.id || '',
        message: `New event: ${event.title}`,
        recipientRole: 'student',
        recipientUid: uid,
        read: false,
        createdAt: serverTimestamp(),
      })
    )
  )
}
