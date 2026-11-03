const DB_NAME = 'campusiq-local'
const DB_VERSION = 1

export const STORES = {
  students: 'students',
  documents: 'documents',
  documentFiles: 'documentFiles',
  notices: 'notices',
  deadlines: 'deadlines',
  activities: 'activities',
  analytics: 'analytics',
}

let databasePromise

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const database = request.result
        Object.values(STORES).forEach((storeName) => {
          if (!database.objectStoreNames.contains(storeName)) {
            const store = database.createObjectStore(storeName, { keyPath: 'id' })
            store.createIndex('createdAt', 'createdAt')
          }
        })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('Unable to open local data storage.'))
    })
  }

  return databasePromise
}

export async function getAll(storeName) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function getById(storeName, id) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(id)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function put(storeName, value) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).put(value)
    request.onsuccess = () => resolve(value)
    request.onerror = () => reject(request.error)
  })
}

export async function putMany(storeName, values) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    values.forEach((value) => store.put(value))
    transaction.oncomplete = () => resolve(values)
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function remove(storeName, id) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearStore(storeName) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function getPreference(key, fallback = null) {
  try {
    const value = localStorage.getItem(`campusiq:${key}`)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export function setPreference(key, value) {
  localStorage.setItem(`campusiq:${key}`, JSON.stringify(value))
}
