const now = new Date()
const isoDate = (date) => new Date(date).toISOString()
const daysFromNow = (days) => new Date(now.getTime() + days * 86400000)
const daysAgo = (days) => new Date(now.getTime() - days * 86400000)

const departments = ['Arts & Humanities', 'Science & Technology', 'Commerce & Management', 'Social Sciences']
const categories = ['Examinations', 'Admissions', 'Scholarships', 'Academic events', 'Other']

export function createSeedData() {
  const students = [
    ['Aarav Sharma', 'CIQ-2024-0001', 'aarav.sharma@example.edu', '+91 98765 10001', departments[1], 'B.Sc. Computer Science', '6', 'Active'],
    ['Mira Nath', 'CIQ-2024-0002', 'mira.nath@example.edu', '+91 98765 10002', departments[0], 'B.A. English', '4', 'Active'],
    ['Pranav Das', 'CIQ-2024-0003', 'pranav.das@example.edu', '+91 98765 10003', departments[2], 'B.Com. Finance', '2', 'Active'],
    ['Jahnavi Bora', 'CIQ-2024-0004', 'jahnavi.bora@example.edu', '+91 98765 10004', departments[3], 'M.A. Sociology', '2', 'Inactive'],
    ['Rohan Deka', 'CIQ-2024-0005', 'rohan.deka@example.edu', '+91 98765 10005', departments[1], 'B.Tech. Information Systems', '8', 'Active'],
    ['Nandita Saikia', 'CIQ-2024-0006', 'nandita.saikia@example.edu', '+91 98765 10006', departments[0], 'B.A. History', '6', 'Suspended'],
    ['Kabir Ahmed', 'CIQ-2024-0007', 'kabir.ahmed@example.edu', '+91 98765 10007', departments[2], 'BBA', '4', 'Active'],
    ['Riya Hazarika', 'CIQ-2024-0008', 'riya.hazarika@example.edu', '+91 98765 10008', departments[3], 'B.S.W.', '2', 'Active'],
  ].map(([fullName, registrationNumber, email, phone, department, programme, semester, accountStatus], index) => ({
    id: `student-${index + 1}`,
    fullName,
    registrationNumber,
    email,
    phone,
    department,
    programme,
    semester,
    accountStatus,
    createdAt: isoDate(daysAgo(index + 2)),
    updatedAt: isoDate(daysAgo(index)),
  }))

  const documentTitles = [
    'Examination Regulations 2024',
    'Academic Calendar 2024–25',
    'Admission Guidelines 2024',
    'Scholarship Policy and Eligibility',
    'University Rules and Regulations',
    'B.Sc. Computer Science Programme Guide',
    'Semester Registration Handbook',
    'Campus Facilities Guide',
  ]
  const documents = documentTitles.map((title, index) => ({
    id: `document-${index + 1}`,
    title,
    description: `Official university resource for ${title.toLowerCase()}.`,
    fileName: `${title.replaceAll(' ', '-')}.pdf`,
    category: categories[index % categories.length],
    language: index % 3 === 0 ? 'Assamese' : 'English',
    department: departments[index % departments.length],
    academicYear: index % 2 === 0 ? '2024–25' : '2023–24',
    uploadDate: isoDate(daysAgo(index + 1)),
    fileSize: 1024 * (420 + index * 115),
    processingStatus: index === 6 ? 'Processing' : index === 7 ? 'Failed' : 'Indexed',
    localDemo: true,
    fileId: null,
    createdAt: isoDate(daysAgo(index + 1)),
    updatedAt: isoDate(daysAgo(index)),
  }))

  const notices = [
    ['End Semester Examination Schedule', 'The end semester examinations will begin from 12 September. Please review the attached schedule.', 'Examinations', 'Important', 'All students', departments[1], 'Published', 0, 35],
    ['Scholarship application window', 'Applications for the university scholarship programme are now open.', 'Scholarships', 'High', 'All students', 'All departments', 'Published', -1, 21],
    ['Semester registration reminder', 'Complete semester registration before the deadline to avoid late fees.', 'Admissions', 'Normal', 'Continuing students', 'All departments', 'Published', -3, 9],
    ['Faculty development workshop', 'Registration is open for the annual faculty development workshop.', 'Academic events', 'Normal', 'Faculty', departments[0], 'Draft', 0, 30],
    ['Library maintenance notice', 'The central library will close for scheduled maintenance this weekend.', 'Other', 'Low', 'All students', 'All departments', 'Archived', -30, -2],
  ].map(([title, description, category, priority, targetAudience, department, status, publishedOffset, expiryOffset], index) => ({
    id: `notice-${index + 1}`,
    title,
    description,
    category,
    priority,
    targetAudience,
    department,
    publicationDate: isoDate(daysAgo(publishedOffset < 0 ? Math.abs(publishedOffset) : 0)),
    expiryDate: isoDate(daysFromNow(expiryOffset)),
    status,
    createdAt: isoDate(daysAgo(index + 1)),
    updatedAt: isoDate(daysAgo(index)),
  }))

  const deadlineData = [
    ['Examination form submission', 'Submit the semester examination form online.', 'Examinations', 'High', -1, 9],
    ['Scholarship applications close', 'Final date to submit scholarship documents.', 'Scholarships', 'High', 2, 18],
    ['Semester registration', 'Complete registration for the upcoming semester.', 'Admissions', 'Normal', 5, 26],
    ['Department orientation', 'New student orientation and campus welcome event.', 'Academic events', 'Low', 12, 12],
    ['Admission document verification', 'Bring original documents for verification.', 'Admissions', 'Normal', -20, -15],
  ]
  const deadlines = deadlineData.map(([title, description, category, priority, startOffset, dueOffset], index) => ({
    id: `deadline-${index + 1}`,
    title,
    description,
    category,
    priority,
    startDate: isoDate(daysFromNow(startOffset)),
    dueDate: isoDate(daysFromNow(dueOffset)),
    relatedId: index < 2 ? `notice-${index + 1}` : '',
    createdAt: isoDate(daysAgo(index + 1)),
    updatedAt: isoDate(daysAgo(index)),
  }))

  const activityTemplates = [
    ['document', 'Examination Regulations 2024', 'Document saved to the local library.'],
    ['notice', 'End Semester Examination Schedule', 'Notice is visible in the published list.'],
    ['deadline', 'Scholarship applications close', 'Academic deadline was updated.'],
    ['student', 'Aarav Sharma', 'Student record is active.'],
  ]
  const activities = activityTemplates.map(([type, title, description], index) => ({
    id: `activity-${index + 1}`,
    type,
    title,
    description,
    createdAt: isoDate(daysAgo(index)),
  }))

  const analytics = Array.from({ length: 42 }, (_, index) => ({
    id: `query-${index + 1}`,
    question: ['What is the attendance requirement?', 'When does registration close?', 'How do I apply for a scholarship?', 'Where can I find the examination schedule?'][index % 4],
    language: index % 3 === 0 ? 'Assamese' : 'English',
    category: categories[index % categories.length],
    answered: index % 7 !== 0,
    askedAt: isoDate(daysAgo(index % 31)),
    feedback: index % 5 === 0 ? 'Helpful' : index % 7 === 0 ? 'Needs review' : 'None',
  }))

  return { students, documents, notices, deadlines, activities, analytics }
}
