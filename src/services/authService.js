import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const USERS_STORAGE_KEY = 'campusiq_registered_users'
const SESSION_STORAGE_KEY = 'campusiq_current_user'

const INITIAL_MOCK_USERS = [
  {
    id: 'user_admin_01',
    email: 'admin@campusiq.edu',
    password: 'password123',
    name: 'Aarav Kumar',
    role: 'admin',
    department: 'University Administration',
    avatar: 'AK',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_student_01',
    email: 'student@campusiq.edu',
    password: 'password123',
    name: 'Priya Sharma',
    role: 'student',
    studentId: 'CS-2024-042',
    department: 'Computer Science',
    avatar: 'PS',
    createdAt: new Date().toISOString(),
  },
]

// -------------------------------------------------------------
// Local Storage Session Helpers (Cache for fast UI initialization)
// -------------------------------------------------------------
function getStoredUsers() {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_MOCK_USERS
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_USERS))
      return INITIAL_MOCK_USERS
    }
    return JSON.parse(raw)
  } catch (error) {
    console.error('Failed to read registered users from storage:', error)
    return INITIAL_MOCK_USERS
  }
}

function saveStoredUsers(users) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Failed to save registered users to storage:', error)
  }
}

export function getCurrentSession() {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to retrieve active auth session:', error)
    return null
  }
}

export function saveCurrentSession(user) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to persist auth session:', error)
  }
}

export function clearCurrentSession() {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear auth session:', error)
  }
}

// -------------------------------------------------------------
// Friendly Firebase Error Formatter
// -------------------------------------------------------------
function formatFirebaseError(error) {
  const code = error?.code || ''
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console. Go to Build > Authentication > Sign-in method and enable Email/Password.'
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.'
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid email.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials or create an account.'
    case 'auth/network-request-failed':
      return 'Network connection issue. Please verify your internet connection.'
    case 'permission-denied':
      return 'Firestore permission denied. Please enable Cloud Firestore in "Test Mode" in Firebase Console.'
    default:
      return error.message || 'Authentication failed. Please try again.'
  }
}

// -------------------------------------------------------------
// Live Firebase Registration with Dual-Write to Firestore
// -------------------------------------------------------------
export async function registerUser({ name, email, password, role, department, studentId, adminKey }) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanName = (name || 'User').trim()

  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'U'

  let firebaseUid = null

  // 1. Attempt Firebase Authentication
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password)
    firebaseUid = userCredential.user.uid
  } catch (fbError) {
    // If Firebase operation is not allowed or failed, check if we should fall back or report
    if (fbError.code === 'auth/operation-not-allowed') {
      throw new Error(formatFirebaseError(fbError))
    }
    if (fbError.code === 'auth/email-already-in-use') {
      throw new Error(formatFirebaseError(fbError))
    }
    // If other network / configuration issue, log and fall back to local store
    console.warn('Firebase registration failed, using local mock auth fallback:', fbError)
  }

  const userId = firebaseUid || `user_${role}_${Date.now()}`

  const userProfile = {
    id: userId,
    uid: userId,
    email: cleanEmail,
    name: cleanName,
    role,
    department: department || (role === 'admin' ? 'University Administration' : 'Computer Science'),
    studentId: role === 'student' ? (studentId || `CIQ-2024-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
    adminKey: role === 'admin' ? (adminKey || 'ADMIN2024') : undefined,
    avatar: initials,
    createdAt: new Date().toISOString(),
  }

  // 2. Dual-Write to Cloud Firestore if Firebase is active
  if (firebaseUid) {
    try {
      // Write profile to 'users' collection
      await setDoc(doc(db, 'users', firebaseUid), userProfile)

      // If Student: Also write directly to 'students' collection (Shows in Admin People tab)
      if (role === 'student') {
        const studentRecord = {
          id: firebaseUid,
          fullName: cleanName,
          registrationNumber: userProfile.studentId,
          email: cleanEmail,
          phone: '+91 98765 00000',
          department: userProfile.department,
          programme: `B.Tech in ${userProfile.department}`,
          semester: '1',
          accountStatus: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'students', firebaseUid), studentRecord)
      }
    } catch (fsError) {
      console.warn('Firestore write warning:', fsError)
    }
  }

  // 3. Keep local fallback store synchronized
  const users = getStoredUsers()
  users.push({ ...userProfile, password })
  saveStoredUsers(users)

  saveCurrentSession(userProfile)
  return userProfile
}

// -------------------------------------------------------------
// Live Firebase Sign-In with Role Verification
// -------------------------------------------------------------
export async function loginUser({ identifier, password, role }) {
  const cleanId = (identifier || '').trim().toLowerCase()

  // A. Quick check for initial demo accounts
  const localUsers = getStoredUsers()
  const demoMatch = localUsers.find(
    (u) =>
      u.role === role &&
      ((u.email || '').toLowerCase() === cleanId || (u.studentId && u.studentId.toLowerCase() === cleanId)) &&
      u.password === password
  )

  if (demoMatch && !cleanId.includes('@campusiq.portal')) {
    const { password: _, ...sessionUser } = demoMatch
    saveCurrentSession(sessionUser)
    return sessionUser
  }

  // B. Attempt Firebase Authentication
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanId, password)
    const uid = userCredential.user.uid

    // Fetch user details from Firestore
    let userData = null
    try {
      const userSnap = await getDoc(doc(db, 'users', uid))
      if (userSnap.exists()) {
        userData = userSnap.data()
      }
    } catch (fsErr) {
      console.warn('Could not read user profile from Firestore:', fsErr)
    }

    if (!userData) {
      userData = {
        id: uid,
        uid,
        email: cleanId,
        name: userCredential.user.displayName || cleanId.split('@')[0],
        role,
        department: role === 'admin' ? 'University Administration' : 'Computer Science',
        avatar: (userCredential.user.displayName || cleanId)[0].toUpperCase(),
        createdAt: new Date().toISOString(),
      }
    }

    if (userData.role && userData.role !== role) {
      await firebaseSignOut(auth)
      throw new Error(`This account is registered as a ${userData.role}, not an ${role}. Please switch roles.`)
    }

    saveCurrentSession(userData)
    return userData
  } catch (fbError) {
    if (fbError.code) {
      throw new Error(formatFirebaseError(fbError))
    }
    // If local demo user matched partially with wrong password:
    if (demoMatch && demoMatch.password !== password) {
      throw new Error('Incorrect password. Please verify and try again.')
    }
    throw fbError
  }
}

// -------------------------------------------------------------
// Live Firebase Sign-Out
// -------------------------------------------------------------
export async function logoutUser() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.warn('Firebase signout warning:', error)
  }
  clearCurrentSession()
}

// -------------------------------------------------------------
// Demo instant bypass
// -------------------------------------------------------------
export function quickDemoLogin(role = 'admin') {
  const users = getStoredUsers()
  const match = users.find((u) => u.role === role) || INITIAL_MOCK_USERS.find((u) => u.role === role)
  const { password: _, ...sessionUser } = match
  saveCurrentSession(sessionUser)
  return sessionUser
}
