export function getDashboardStats({ documents, notices, deadlines, students, analytics }) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  return {
    totalDocuments: documents.length,
    indexedDocuments: documents.filter((document) => document.processingStatus === 'Indexed').length,
    processingDocuments: documents.filter((document) => document.processingStatus === 'Processing').length,
    failedDocuments: documents.filter((document) => document.processingStatus === 'Failed').length,
    publishedNotices: notices.filter((notice) => notice.status === 'Published').length,
    activeDeadlines: deadlines.filter((deadline) => new Date(deadline.dueDate) >= startOfToday).length,
    registeredStudents: students.length,
    totalQueries: analytics.length,
    unansweredQueries: analytics.filter((query) => !query.answered).length,
  }
}
