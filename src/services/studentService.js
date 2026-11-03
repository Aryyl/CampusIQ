import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'
import { getAll, put, remove, STORES } from './storage'

const STUDENTS_COLLECTION = 'students'

export const studentService = {
  // Fetch students from Firestore with local IndexedDB fallback and seamless sync
  list: async () => {
    try {
      const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION))
      if (!snapshot.empty) {
        const firestoreStudents = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))

        // Also merge with any local seed students
        const localStudents = await getAll(STORES.students)
        const combinedMap = new Map()
        localStudents.forEach((s) => {
          const key = (s.registrationNumber || s.id || '').toLowerCase()
          if (key) combinedMap.set(key, s)
        })
        firestoreStudents.forEach((s) => {
          const key = (s.registrationNumber || s.id || '').toLowerCase()
          if (key) combinedMap.set(key, s)
        })
        return Array.from(combinedMap.values())
      }
    } catch (err) {
      console.warn('Firestore fetch failed or not yet initialized, falling back to local store:', err)
    }
    return getAll(STORES.students)
  },

  // Save student to local IndexedDB and Firestore
  save: async (student) => {
    const saved = await put(STORES.students, student)
    try {
      const studentId = student.id || student.registrationNumber || `student_${Date.now()}`
      await setDoc(doc(db, STUDENTS_COLLECTION, studentId), student, { merge: true })
    } catch (err) {
      console.warn('Firestore save warning:', err)
    }
    return saved
  },

  // Delete student from local IndexedDB and Firestore
  delete: async (id) => {
    await remove(STORES.students, id)
    try {
      await deleteDoc(doc(db, STUDENTS_COLLECTION, id))
    } catch (err) {
      console.warn('Firestore delete warning:', err)
    }
  },
}
