const CONVERSATIONS_KEY = 'campusiq_student_conversations_v1'
const PREFERENCES_KEY = 'campusiq_student_preferences_v1'

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function demoConversation(id, title, question, answer, pinned = false, daysAgo = 1) {
  const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString()
  return {
    id,
    title,
    pinned,
    createdAt,
    updatedAt: createdAt,
    demo: true,
    messages: [
      { id: `${id}-user`, role: 'user', content: question, createdAt },
      { id: `${id}-assistant`, role: 'assistant', content: answer, createdAt, demo: true },
    ],
  }
}

const seedConversations = [
  demoConversation(
    'demo-attendance',
    'Attendance requirements',
    'What is the minimum attendance required for semester examinations?',
    '## Attendance Regulations\n\nAccording to official university academic policies:\n\n- **Minimum attendance required**: **75%** in each subject to be eligible for semester end examinations.\n- **Medical grounds**: An exception up to 65% may be granted with an approved medical certificate from the university health centre.\n- **Shortfall penalty**: Attendance below 65% requires repeating the course in the subsequent semester.',
    true,
    1,
  ),
  demoConversation(
    'demo-scholarship',
    'Scholarship eligibility',
    'Where can I find scholarship eligibility information?',
    '### Scholarship & Financial Aid Details\n\nScholarship applications for the current academic session are actively open:\n\n- **Post-Matric Merit Scholarship**: Students with 75%+ GPA in the previous semester.\n- **State Minority & Reserved Welfare Schemes**: Detailed eligibility available at the University Welfare Office.\n- **Application Deadline**: Check the Notices and Deadlines section for submission cutoffs.',
    false,
    3,
  ),
]

export function getConversations() {
  const saved = read(CONVERSATIONS_KEY, null)
  if (saved) return saved
  write(CONVERSATIONS_KEY, seedConversations)
  return seedConversations
}

export function saveConversations(conversations) {
  write(CONVERSATIONS_KEY, conversations)
  return conversations
}

export function createConversation(title = 'New chat') {
  const timestamp = new Date().toISOString()
  return {
    id: createId('conversation'),
    title,
    pinned: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
  }
}

export function getPreferences() {
  return read(PREFERENCES_KEY, { theme: 'light', notifications: true, language: 'en' })
}

export function savePreferences(preferences) {
  write(PREFERENCES_KEY, preferences)
  return preferences
}

/**
 * Returns a bilingual localized demo response based on user language ('en' | 'as')
 * and optional image attachment.
 */
export function getDemoAssistantResponse(question, language = 'en', attachment = null) {
  const lower = (question || '').toLowerCase()
  const isAssamese = language === 'as' || /[\u0980-\u09FF]/.test(question || '')

  let content = ''

  if (attachment && attachment.isImage) {
    if (isAssamese) {
      content = `### দৃশ্য বিশ্লেষণ: ${attachment.name}\n\nমই আপুনি সংলগ্ন কৰা ছবিখন **${attachment.name}** (${attachment.size}) পৰীক্ষা কৰিলোঁ।\n\n- **নথিৰ ধৰণ**: বিশ্ববিদ্যালয়ৰ চৰকাৰী জাননী / শৈক্ষিক নথিপত্ৰ\n- **চিনাক্ত কৰা বিষয়**: শৈক্ষিক নিৰ্দেশনাৱলী, পৰীক্ষাৰ নীতি আৰু সময়সীমা\n- **মুখ্য তথ্য**:\n  1. প্ৰ-পত্ৰ জমা দিয়াৰ নিৰ্দিষ্ট নিয়মসমূহ উল্লেখ আছে।\n  2. পৰীক্ষা কেন্দ্ৰ আৰু প্ৰৱেশ পত্ৰ সম্বন্ধীয় নিৰ্দেশনা দিয়া হৈছে।\n\n${question ? `\n\n**আপোনাৰ প্ৰশ্নৰ উত্তৰ ("${question}")**:\nছবিখনৰ তথ্য অনুসৰি, উল্লেখিত নিৰ্দেশনাৱলী কঠোৰভাৱে পালন কৰাটো বাধ্যতামূলক। অতিৰিক্ত প্ৰশ্ন থাকিলে সুধিব পাৰে।` : '\n\nআপুনি এই নথিসম্পৰ্কীয় কোনো নিৰ্দিষ্ট প্ৰশ্ন কৰিব বিচাৰে নেকি?'}`
    } else {
      content = `### Visual Document Analysis: ${attachment.name}\n\nI have inspected your uploaded image **${attachment.name}** (${attachment.size}).\n\n- **Document Type**: Official University Notice / Academic Circular\n- **Key Information Extracted**:\n  - Academic guidelines, semester examination procedures, and eligibility requirements.\n  - Key departmental deadlines and administrative approval requirements.\n- **Recommended Next Steps**:\n  1. Review the schedule against your semester course registrations.\n  2. Ensure your departmental clearance is submitted before the cutoff date.\n\n${question ? `\n\n**Response to your query ("${question}")**:\nBased on this circular, students are advised to confirm the dates with their respective department notice boards and follow official deadlines.` : '\n\nFeel free to ask specific questions about the contents, dates, or eligibility in this notice!'}`
    }
  } else if (isAssamese) {
    if (lower.includes('attendance') || (question && (question.includes('উপস্থিতি') || question.includes('নিয়ম')))) {
      content =
        '### শৈক্ষিক নিয়মাৱলী আৰু উপস্থিতি\n\nবিশ্ববিদ্যালয়ৰ শৈক্ষিক বিধি অনুসৰি:\n\n- **ন্যূনতম উপস্থিতি**: চেমিষ্টাৰ পৰীক্ষাত বহিবলৈ প্ৰতিটো বিষয়ত ন্যূনতম **৭৫% উপস্থিতি** বাধ্যতামূলক।\n- **চিকিৎসাজনিত ৰেহাই**: চিকিৎসালয়ৰ উপযুক্ত প্ৰমাণপত্ৰ দাখিল কৰিলে ৬৫% লৈকে ৰেহাই পোৱা যায়।\n- **উপস্থিতি কম হ\'লে**: ৬৫% তকৈ কম হ\'লে ছাত্ৰ-ছাত্ৰীক পৰীক্ষাত বহিবলৈ অনুমতি দিয়া নহয় আৰু পৰৱৰ্তী বৰ্ষত পুনৰ নামভৰ্তি কৰিব লাগিব।'
    } else if (
      lower.includes('deadline') ||
      lower.includes('date') ||
      lower.includes('exam') ||
      (question && (question.includes('সময়সীমা') || question.includes('পৰীক্ষা') || question.includes('তাৰিখ')))
    ) {
      content =
        '### গুৰুত্বপূৰ্ণ পৰীক্ষা আৰু শৈক্ষিক সময়সীমা\n\nবিশ্ববিদ্যালয়ৰ শেহতীয়া জাননী অনুসৰি:\n\n1. **পৰীক্ষাৰ প্ৰ-পত্ৰ পূৰণ (Form Fill-up)**: ১৫ ছেপ্টেম্বৰৰ পৰা ২৪ ছেপ্টেম্বৰ ২০২৪\n2. **পৰীক্ষাৰ মাচুল জমা**: ২৮ ছেপ্টেম্বৰ ২০২৪\n3. **প্ৰৱেশ পত্ৰ (Admit Card) বিতৰণ**: ৫ অক্টোবৰ ২০২৪\n4. **চেমিষ্টাৰ পৰীক্ষা আৰম্ভ**: ১০ অক্টোবৰ ২০২৪\n\nঅনুগ্ৰহ কৰি পৰীক্ষা শাখাৰ জাননী ফলক অথবা চৰকাৰী পৰ্টেল পৰীক্ষা কৰক।'
    } else if (
      lower.includes('scholarship') ||
      lower.includes('admission') ||
      (question && (question.includes('বৃত্তি') || question.includes('নামভৰ্তি') || question.includes('টকা')))
    ) {
      content =
        '### বৃত্তি আৰু নামভৰ্তি তথ্য\n\nবৰ্তমান শিক্ষাবৰ্ষৰ বাবে উপলব্ধ সুবিধাসমূহ:\n\n- **মেধা বৃত্তি (Merit Scholarship)**: বিগত পৰীক্ষাত ৮০% বা ততোধিক নম্বৰ লাভ কৰা মেধাৱী শিক্ষাৰ্থীসকলৰ বাবে।\n- **ৰাজ্যিক জলপানি আঁচনি**: আৰ্থিকভাৱে পিছপৰা আৰু সংৰক্ষিত শ্ৰেণীৰ বাবে চৰকাৰী জলপানি।\n- **আৱেদনৰ বাবে প্ৰয়োজনীয় নথি**: মাৰ্কশ্বীট, আয়ৰ প্ৰমাণপত্ৰ, বেংক পাছবুক আৰু ছাত্ৰ পৰিচয় পত্ৰ।\n\nঅধিক বিৱৰণ বিশ্ববিদ্যালয়ৰ ছাত্ৰ কল্যাণ শাখাত উপলব্ধ।'
    } else {
      content =
        '### কেম্পাছআইকিউ সহায়ক\n\nআপোনাৰ প্ৰশ্নটো বিশ্ববিদ্যালয়ৰ নথিভাণ্ডাৰত বিশ্লেষণ কৰা হৈছে।\n\n- **বিষয়**: শৈক্ষিক আৰু প্ৰশাসনিক তথ্য\n- **স্থিতি**: সফলতাৰে প্ৰাপ্ত হৈছে\n\nআপুনি বিশ্ববিদ্যালয়ৰ নিয়ম, পৰীক্ষাৰ তাৰিখ, মাচুল বা ছাত্ৰ কল্যাণ আঁচনিৰ বিষয়ে যিকোনো প্ৰশ্ন অসমীয়াত সুধিব পাৰে।'
    }
  } else {
    // English responses
    if (lower.includes('attendance')) {
      content =
        '### Academic Regulations & Attendance Policy\n\nAccording to the University Academic Guidelines:\n\n- **Minimum Required Attendance**: A student must maintain at least **75% attendance** in each course to be eligible for end-semester examinations.\n- **Medical Condonation**: Relaxation up to 65% is permissible with an approved medical certificate submitted within 7 days of recovery.\n- **Consequences**: Falling below 65% results in being debarred from the examination.'
    } else if (lower.includes('deadline') || lower.includes('date') || lower.includes('exam')) {
      content =
        '### Upcoming Academic Calendar & Deadlines\n\nHere are the active deadlines recorded for this semester:\n\n1. **Examination Form Submission**: 15 Sep – 24 Sep 2024\n2. **Fee Payment Last Date**: 28 Sep 2024 (without fine)\n3. **Admit Card Release**: 05 Oct 2024\n4. **Semester End Examinations**: 10 Oct 2024 onwards\n\nPlease check the official university portal notices to verify your department schedule.'
    } else if (lower.includes('scholarship') || lower.includes('admission')) {
      content =
        '### Scholarships & Financial Assistance\n\nApplications are invited for the following campus scholarships:\n\n- **University Merit Scholarship**: For students ranking in the top 5% of their department with CGPA > 8.5.\n- **State Minority & Post-Matric Aid**: Accessible through the National Scholarship Portal (NSP).\n- **Submission Office**: Dean of Student Welfare (Administrative Block, Room 104).'
    } else {
      content =
        '### CampusIQ University Assistant\n\nYour question has been processed against university records.\n\nYou can ask about examination schedules, syllabus details, university circulars, or attach documents to extract guidelines.'
    }
  }

  return {
    id: createId('message'),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
    demo: true,
  }
}
