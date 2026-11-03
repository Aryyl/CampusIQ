import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { activityService, analyticsService, deadlineService, documentService, noticeService, studentService } from '../services'
import { createSeedData } from '../services/seedData'
import { getDashboardStats } from '../services/dashboardService'
import { putMany, setPreference, getPreference, STORES } from '../services/storage'
import { createId, nowIso } from '../utils/ids'

const CampusDataContext = createContext(null)
const DATA_VERSION = 1

async function loadSnapshot() {
  const [students, documents, notices, deadlines, activities, analytics] = await Promise.all([
    studentService.list(),
    documentService.list(),
    noticeService.list(),
    deadlineService.list(),
    activityService.list(),
    analyticsService.list(),
  ])
  return { students, documents, notices, deadlines, activities, analytics }
}

async function ensureSeedData() {
  if (getPreference('dataVersion') === DATA_VERSION) return
  const seed = createSeedData()
  await Promise.all([
    putMany(STORES.students, seed.students),
    putMany(STORES.documents, seed.documents),
    putMany(STORES.notices, seed.notices),
    putMany(STORES.deadlines, seed.deadlines),
    putMany(STORES.activities, seed.activities),
    putMany(STORES.analytics, seed.analytics),
  ])
  setPreference('dataVersion', DATA_VERSION)
}

export function CampusDataProvider({ children }) {
  const [data, setData] = useState({ students: [], documents: [], notices: [], deadlines: [], activities: [], analytics: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const snapshot = await loadSnapshot()
      setData(snapshot)
      setError('')
      return snapshot
    } catch (loadError) {
      setError(loadError.message || 'Unable to load local campus data.')
      throw loadError
    }
  }

  useEffect(() => {
    let mounted = true
    const initialize = async () => {
      try {
        await ensureSeedData()
        const snapshot = await loadSnapshot()
        if (mounted) setData(snapshot)
      } catch (loadError) {
        if (mounted) setError(loadError.message || 'Unable to initialize local campus data.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    initialize()
    return () => { mounted = false }
  }, [])

  const addActivity = async (type, title, description) => {
    await activityService.add({ id: createId('activity'), type, title, description, createdAt: nowIso() })
  }

  const saveStudent = async (draft) => {
    const duplicate = data.students.find((item) => item.registrationNumber.toLowerCase() === draft.registrationNumber.trim().toLowerCase() && item.id !== draft.id)
    if (duplicate) throw new Error('That registration number is already in use.')
    const record = { ...draft, id: draft.id || createId('student'), registrationNumber: draft.registrationNumber.trim(), updatedAt: nowIso(), createdAt: draft.createdAt || nowIso() }
    await studentService.save(record)
    await addActivity('student', record.fullName, draft.id ? 'Student record updated.' : 'Student record added.')
    return refresh()
  }

  const deleteStudent = async (student) => {
    await studentService.delete(student.id)
    await addActivity('student', student.fullName, 'Student record deleted.')
    return refresh()
  }

  const saveDocument = async (draft, file = null) => {
    const record = { ...draft, id: draft.id || createId('document'), updatedAt: nowIso(), createdAt: draft.createdAt || nowIso(), fileId: draft.fileId || draft.id || null, localDemo: true }
    if (file) record.fileId = record.id
    await documentService.save(record)
    if (file) await documentService.saveFile(record.id, file)
    await addActivity('document', record.title, draft.id ? 'Document metadata updated.' : 'Document saved to the local library.')
    return refresh()
  }

  const deleteDocument = async (document) => {
    await documentService.delete(document.id)
    await addActivity('document', document.title, 'Document deleted from the local library.')
    return refresh()
  }

  const saveNotice = async (draft) => {
    const record = { ...draft, id: draft.id || createId('notice'), updatedAt: nowIso(), createdAt: draft.createdAt || nowIso() }
    await noticeService.save(record)
    await addActivity('notice', record.title, record.status === 'Published' ? 'Notice published.' : 'Notice saved as draft.')
    return refresh()
  }

  const deleteNotice = async (notice) => {
    await noticeService.delete(notice.id)
    await addActivity('notice', notice.title, 'Notice deleted.')
    return refresh()
  }

  const saveDeadline = async (draft) => {
    const record = { ...draft, id: draft.id || createId('deadline'), updatedAt: nowIso(), createdAt: draft.createdAt || nowIso() }
    await deadlineService.save(record)
    await addActivity('deadline', record.title, draft.id ? 'Deadline updated.' : 'Deadline added.')
    return refresh()
  }

  const deleteDeadline = async (deadline) => {
    await deadlineService.delete(deadline.id)
    await addActivity('deadline', deadline.title, 'Deadline deleted.')
    return refresh()
  }

  const stats = useMemo(() => getDashboardStats(data), [data])
  const value = useMemo(() => ({
    ...data,
    stats,
    loading,
    error,
    refresh,
    saveStudent,
    deleteStudent,
    saveDocument,
    deleteDocument,
    getDocumentFile: documentService.getFile,
    saveNotice,
    deleteNotice,
    saveDeadline,
    deleteDeadline,
    preferences: {
      language: getPreference('language', 'English'),
      setLanguage: (language) => setPreference('language', language),
      notifications: getPreference('notifications', true),
      setNotifications: (enabled) => setPreference('notifications', enabled),
      adminProfile: getPreference('adminProfile', { name: 'Aarav Kumar', email: 'admin@campusiq.edu' }),
      setAdminProfile: (profile) => setPreference('adminProfile', profile),
    },
  }), [data, stats, loading, error])

  return <CampusDataContext.Provider value={value}>{children}</CampusDataContext.Provider>
}

export function useCampusData() {
  const context = useContext(CampusDataContext)
  if (!context) throw new Error('useCampusData must be used inside CampusDataProvider')
  return context
}
