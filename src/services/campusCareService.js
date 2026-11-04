/**
 * CampusCare Service
 * Handles all Firestore and Firebase Storage operations for campus issue reporting.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { db, storage } from './firebase'

// ──────────────────────────────────────────
// Ticket ID generation
// ──────────────────────────────────────────

/**
 * Generates a collision-resistant ticket ID in the format CAMP-YYYY-XXXXXXXX.
 * Uses timestamp base-36 + random suffix.
 */
export function generateTicketId() {
  const year = new Date().getFullYear()
  const ts = Date.now().toString(36).toUpperCase().slice(-5)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `CAMP-${year}-${ts}${rand}`
}

// ──────────────────────────────────────────
// Image Compression & Upload
// ──────────────────────────────────────────

/**
 * Compresses an image file in-browser using an HTML5 Canvas.
 * Converts multi-megabyte camera photos into ~100-200 KB images.
 */
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

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = () => resolve(e.target.result)
      img.src = e.target.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads a single image file to Firebase Storage.
 * If Firebase Storage is unconfigured, slow, or blocked by rules,
 * automatically falls back to compressed Base64 within 5 seconds so
 * submission is never blocked or stalled.
 *
 * @param {File} file - The image file to upload.
 * @param {string} ticketId - The ticket ID (used as folder name).
 * @param {function} onProgress - Called with (0–100) during upload.
 * @returns {Promise<string>} - Download URL or Base64 Data URL.
 */
export async function uploadIssueImage(file, ticketId, onProgress) {
  // Compress first to guarantee an instant lightweight fallback
  const compressedDataUrl = await compressImage(file)

  const uploadPromise = new Promise((resolve, reject) => {
    try {
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const storageRef = ref(storage, `campus_issues/${ticketId}/images/${safeName}`)
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            onProgress?.(pct)
          }
        },
        (error) => reject(error),
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref)
            resolve(url)
          } catch (err) {
            reject(err)
          }
        }
      )
    } catch (err) {
      reject(err)
    }
  })

  // 5-second timeout safeguard for Firebase Storage
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Firebase Storage timeout')), 5000)
  )

  try {
    return await Promise.race([uploadPromise, timeoutPromise])
  } catch (err) {
    console.warn(
      'Firebase Storage bypassed/unavailable. Using high-efficiency compressed image fallback.',
      err?.message || err
    )
    onProgress?.(100)
    return compressedDataUrl
  }
}

// ──────────────────────────────────────────
// Submit Issue
// ──────────────────────────────────────────

/**
 * Submits a new campus issue to Firestore.
 * Uploads attached images in parallel with timeout protection.
 *
 * @param {object} formData - Validated form fields.
 * @param {File[]} imageFiles - Array of image File objects.
 * @param {object} studentSession - The authenticated student session object.
 * @param {function} onImageProgress - Called with (fileIndex, 0–100) during image upload.
 * @returns {Promise<string>} - The generated ticket ID.
 */
export async function submitIssue(formData, imageFiles = [], studentSession = {}, onImageProgress) {
  const ticketId = generateTicketId()

  // Upload images in parallel with fallback protection
  const imageUrls = await Promise.all(
    imageFiles.map(async (file, idx) => {
      const url = await uploadIssueImage(file, ticketId, (pct) => onImageProgress?.(idx, pct))
      return url
    })
  )

  const now = serverTimestamp()

  const issueDoc = {
    ticketId,
    createdBy: studentSession?.uid || studentSession?.id || '',
    studentName: studentSession?.name || 'Unknown Student',
    studentEmail: studentSession?.email || '',
    registrationNumber: studentSession?.studentId || studentSession?.registrationNumber || '',
    department: studentSession?.department || '',
    title: formData.title,
    description: formData.description,
    language: formData.language || 'English',
    category: formData.category,
    location: {
      building: formData.building,
      floor: formData.floor || '',
      room: formData.room || '',
    },
    additionalInfo: formData.additionalInfo || '',
    imageUrls: imageUrls.filter(Boolean),
    priority: formData.suggestedPriority || 'Medium',
    status: 'Pending Review',
    assignedDepartment: null,
    adminRemarks: '',
    resolutionDescription: '',
    internalNotes: '',
    statusHistory: [
      {
        status: 'Pending Review',
        changedAt: new Date().toISOString(),
        changedBy: studentSession?.name || 'Student',
        remarks: 'Issue submitted.',
      },
    ],
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  }

  await addDoc(collection(db, 'campus_issues'), issueDoc)

  // Write admin notification (non-blocking)
  try {
    await addDoc(collection(db, 'campus_notifications'), {
      type: 'new_issue',
      title: 'New Issue Reported',
      ticketId,
      message: `${ticketId}: "${formData.title}" (${formData.category || 'General'}) by ${studentSession?.name || 'Student'}`,
      recipientRole: 'admin',
      recipientUid: null,
      linkType: 'issue',
      linkId: ticketId,
      read: false,
      createdAt: now,
    })
  } catch (_) {
    // Non-critical; do not block submission
  }

  return ticketId
}

// ──────────────────────────────────────────
// Student Issues Listener
// ──────────────────────────────────────────

/**
 * Listens for real-time updates on issues created by the given student UID.
 * Sorts in memory to avoid requiring a custom composite index in Firestore.
 *
 * @param {string} studentUid
 * @param {function} onUpdate - Called with array of issue documents.
 * @param {string} [studentEmail] - Optional fallback email to match legacy or demo tickets.
 * @returns {function} - Unsubscribe function.
 */
export function subscribeStudentIssues(studentUid, onUpdate, studentEmail = null) {
  const safeUid = String(studentUid || '').trim()
  const safeEmail = String(studentEmail || '').trim().toLowerCase()

  // Query Firestore by createdBy without orderBy to eliminate the need for a composite index
  let q
  try {
    if (safeUid) {
      q = query(collection(db, 'campus_issues'), where('createdBy', '==', safeUid))
    } else if (safeEmail) {
      q = query(collection(db, 'campus_issues'), where('studentEmail', '==', safeEmail))
    } else {
      q = collection(db, 'campus_issues')
    }
  } catch (err) {
    console.warn('Could not construct filtered issue query, using root collection:', err)
    q = collection(db, 'campus_issues')
  }

  const handleSnapshot = (snapshot) => {
    const issues = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((issue) => {
        if (!safeUid && !safeEmail) return true
        const matchesUid = safeUid && (issue.createdBy === safeUid || issue.registrationNumber === safeUid)
        const matchesEmail = safeEmail && issue.studentEmail?.toLowerCase() === safeEmail
        return matchesUid || matchesEmail
      })
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return timeB - timeA
      })

    onUpdate(issues)
  }

  return onSnapshot(
    q,
    handleSnapshot,
    (error) => {
      console.warn('subscribeStudentIssues primary listener error:', error)
      // Fallback: try querying without where if permission allows, or return empty array
      try {
        onSnapshot(
          collection(db, 'campus_issues'),
          handleSnapshot,
          (fallbackErr) => {
            console.error('Fallback issue query failed:', fallbackErr)
            onUpdate([])
          }
        )
      } catch (_) {
        onUpdate([])
      }
    }
  )
}

// ──────────────────────────────────────────
// Admin: All Issues Listener
// ──────────────────────────────────────────

/**
 * Listens for all campus issues (admin view).
 * @param {function} onUpdate - Called with array of issue documents.
 * @returns {function} - Unsubscribe function.
 */
export function subscribeAllIssues(onUpdate) {
  const q = query(collection(db, 'campus_issues'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      onUpdate(issues)
    },
    (error) => {
      console.warn('subscribeAllIssues primary orderBy failed, falling back to root collection:', error)
      try {
        onSnapshot(
          collection(db, 'campus_issues'),
          (snap) => {
            const issues = snap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .sort((a, b) => {
                const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
                const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
                return timeB - timeA
              })
            onUpdate(issues)
          },
          () => onUpdate([])
        )
      } catch (_) {
        onUpdate([])
      }
    }
  )
}

// ──────────────────────────────────────────
// Admin: Update Issue
// ──────────────────────────────────────────

/**
 * Allows an admin to update the status, priority, remarks, etc. of an issue.
 * Appends a status history entry if the status or priority changed.
 *
 * @param {string} docId - Firestore document ID.
 * @param {object} issue - Current issue data (for detecting changes).
 * @param {object} updates - Fields to update.
 * @param {object} adminInfo - { name, email }
 */
export async function updateIssue(docId, issue, updates, adminInfo) {
  const now = new Date().toISOString()
  const historyEntry = {
    changedAt: now,
    changedBy: adminInfo?.name || 'Administrator',
    remarks: updates.adminRemarks || '',
  }

  const statusChanged = updates.status && updates.status !== issue.status
  const priorityChanged = updates.priority && updates.priority !== issue.priority

  if (statusChanged) {
    historyEntry.previousStatus = issue.status
    historyEntry.status = updates.status
  }
  if (priorityChanged) {
    historyEntry.previousPriority = issue.priority
    historyEntry.priority = updates.priority
  }

  const newHistory = [...(issue.statusHistory || []), historyEntry]

  const docRef = doc(db, 'campus_issues', docId)
  await updateDoc(docRef, {
    ...updates,
    statusHistory: newHistory,
    updatedAt: serverTimestamp(),
    ...(updates.status === 'Resolved' ? { resolvedAt: serverTimestamp() } : {}),
  })

  // Notify student if status or admin remarks changed
  if (statusChanged || updates.adminRemarks) {
    try {
      await addDoc(collection(db, 'campus_notifications'), {
        type: 'issue_update',
        title: statusChanged ? `Issue ${updates.status}` : 'Issue Remark Added',
        ticketId: issue.ticketId,
        message: statusChanged
          ? `Your complaint ${issue.ticketId} is now "${updates.status}".`
          : `Remark added on ${issue.ticketId}: "${String(updates.adminRemarks).slice(0, 55)}..."`,
        recipientRole: 'student',
        recipientUid: issue.createdBy,
        linkType: 'issue',
        linkId: issue.ticketId,
        read: false,
        createdAt: serverTimestamp(),
      })
    } catch (_) {}
  }
}

// ──────────────────────────────────────────
// Admin Notifications Listener
// ──────────────────────────────────────────

/**
 * Listens for unread admin notifications.
 * @param {function} onUpdate
 * @returns {function} Unsubscribe
 */
export function subscribeAdminNotifications(onUpdate) {
  const q = query(
    collection(db, 'campus_notifications'),
    where('recipientRole', '==', 'admin'),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

/**
 * Marks a notification as read.
 */
export async function markNotificationRead(notifId) {
  await updateDoc(doc(db, 'campus_notifications', notifId), { read: true })
}

// ──────────────────────────────────────────
// Student Notifications Listener
// ──────────────────────────────────────────

export function subscribeStudentNotifications(studentUid, onUpdate) {
  const q = query(
    collection(db, 'campus_notifications'),
    where('recipientUid', '==', studentUid),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// ──────────────────────────────────────────
// AI Helpers (keyword-based)
// ──────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  'Electrical Problems': ['electric', 'wiring', 'switch', 'power', 'light', 'fan', 'socket', 'voltage', 'short circuit'],
  'Plumbing and Water Supply': ['water', 'pipe', 'leak', 'tap', 'drain', 'flood', 'toilet', 'bathroom', 'plumb'],
  'Infrastructure Damage': ['wall', 'roof', 'ceiling', 'floor', 'crack', 'broken', 'damage', 'collapse', 'structure'],
  'Laboratory Equipment': ['lab', 'equipment', 'instrument', 'microscope', 'computer', 'projector', 'machine'],
  'Sanitation and Cleanliness': ['clean', 'dirt', 'garbage', 'waste', 'smell', 'hygiene', 'sanit', 'toilet', 'dustbin'],
  'Furniture and Facilities': ['chair', 'desk', 'table', 'bench', 'door', 'window', 'furniture', 'locker'],
  'Internet and Network': ['wifi', 'internet', 'network', 'connection', 'slow', 'bandwidth', 'router', 'signal'],
}

const PRIORITY_RULES = {
  Critical: ['exposed wiring', 'fire', 'collapse', 'gas leak', 'flood', 'short circuit', 'electric shock'],
  High: ['major water', 'no power', 'broken equipment', 'no internet', 'sewage', 'roof damage'],
  Medium: ['fan', 'slow internet', 'broken chair', 'paint', 'minor leak', 'dirty'],
  Low: ['bulb', 'minor', 'suggestion', 'small', 'cosmetic'],
}

export function suggestCategory(description) {
  if (!description) return null
  const lower = description.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat
  }
  return null
}

export function suggestPriority(description, category) {
  if (!description) return 'Medium'
  const lower = description.toLowerCase()
  for (const [priority, phrases] of Object.entries(PRIORITY_RULES)) {
    if (phrases.some((p) => lower.includes(p))) return priority
  }
  if (category === 'Electrical Problems') return 'High'
  if (category === 'Infrastructure Damage') return 'High'
  return 'Medium'
}

