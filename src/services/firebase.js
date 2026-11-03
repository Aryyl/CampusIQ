import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// CampusIQ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4vgLhc_mTA6q-3F20dAXgAeddLoxFIyw",
  authDomain: "campusiq-portal.firebaseapp.com",
  projectId: "campusiq-portal",
  storageBucket: "campusiq-portal.firebasestorage.app",
  messagingSenderId: "354506078402",
  appId: "1:354506078402:web:7308dacce09707b4c5a35b"
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Cloud Firestore
export const db = getFirestore(app)

// Initialize Firebase Storage
export const storage = getStorage(app)

export default app

