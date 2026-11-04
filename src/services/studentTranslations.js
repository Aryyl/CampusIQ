/**
 * Comprehensive bilingual translations for the CampusIQ Student Interface.
 * Supports:
 * - English ('en')
 * - Assamese / অসমীয়া ('as')
 */

export const studentTranslations = {
  en: {
    // Brand & Navigation
    brandName: 'CampusIQ',
    brandTag: 'Student Assistant',
    newChat: 'New chat',
    shortcutHint: '⌘ K',
    searchConversations: 'Search conversations',
    pinned: 'Pinned',
    recent: 'Recent',
    noMatching: 'No matching conversations',
    emptyConversations: 'Your conversations will appear here',
    settings: 'Settings',
    profilePreferences: 'Profile & preferences',
    signOut: 'Sign out',
    languageSwitcherLabel: 'Language',

    // Conversation Row Menu
    pin: 'Pin',
    unpin: 'Unpin',
    rename: 'Rename',
    delete: 'Delete',
    demoBadge: 'Demo',

    // Welcome Screen
    eyebrow: 'Your university, made easier',
    welcomeHeading: 'What can I help you with today',
    welcomeCopy:
      'Ask CampusIQ about academic regulations, university notices, deadlines, or attach documents and use voice queries in English or Assamese.',
    suggestions: [
      {
        title: 'Academic information',
        prompt: 'What are the important academic regulations I should know?',
      },
      {
        title: 'University documents',
        prompt: 'Where can I find the examination regulations and academic calendar?',
      },
      {
        title: 'Important deadlines',
        prompt: 'What important registration and examination deadlines are coming up?',
      },
      {
        title: 'Scholarships & admissions',
        prompt: 'How can I find scholarship eligibility and admission information?',
      },
    ],
    signedInAs: 'Signed in as',

    // Composer & Toolbar
    placeholder: 'Ask anything about your university or attach documents...',
    placeholderListening: 'Listening... speak now...',
    enterToSend: 'CampusIQ Assistant · Enter to send',
    listeningBadge: 'Listening... Speak now',
    attachDocTooltip: 'Attach document (PDF, Word, TXT, Image)',
    micStartTooltip: 'Click to speak (Voice dictation)',
    micStopTooltip: 'Stop listening',
    sendMessage: 'Send message',
    disclaimer:
      'CampusIQ can make mistakes. Verify important information with official university sources.',
    attachedTag: 'attached. Ready to send.',
    removeAttachment: 'Remove attachment',

    // Message Actions & Labels
    answerLabel: 'CampusIQ Answer',
    prototypeLabel: 'Student Assistant',
    forward: 'Forward',
    copy: 'Copy',
    copied: 'Copied',
    regenerate: 'Regenerate',
    typing: 'Preparing response...',

    // Forward Dialog
    forwardTitle: 'Forward Message',
    messagePreview: 'Message Preview:',
    quoteInComposer: 'Quote in current composer',
    quoteDesc: 'Insert into the active input box to edit or re-ask',
    orForwardTo: 'OR FORWARD TO CONVERSATION',
    forwardNewChat: 'Forward into a New Chat',
    currentBadge: 'Current',
    forwardedToNewNotice: 'Message forwarded to a new conversation.',
    forwardedToConvNotice: 'Message forwarded to',
    quotedSuccessNotice: 'Message quoted into composer.',

    // Rename Dialog
    renameTitle: 'Rename conversation',
    cancel: 'Cancel',
    saveName: 'Save name',

    // Delete Dialog
    deleteTitle: 'Delete conversation?',
    deleteWarning:
      'This will permanently remove this conversation from your local browser history.',
    deleteConfirm: 'Delete conversation',

    // Settings Dialog
    settingsTitle: 'Student preferences',
    languageSection: 'Language / ভাষা',
    languageDesc: 'Choose your preferred language for the interface and queries.',
    appearanceSection: 'Appearance',
    appearanceDesc: 'Choose how CampusIQ looks on this device.',
    light: 'Light',
    dim: 'Dim',
    notificationsSection: 'Notifications',
    notificationsDesc: 'Show updates from your assistant workspace.',
    savePreferences: 'Save preferences',

    // Toast Notices
    micTurnedOff: 'Microphone turned off.',
    micListening: '🎙️ Listening... Speak your query.',
    micDenied: 'Microphone permission was denied. Please allow microphone permissions.',
    preferencesSaved: 'Student preferences saved locally.',
    conversationRenamed: 'Conversation renamed.',
    conversationDeleted: 'Conversation deleted.',

    // ── CampusCare ──
    raiseIssue: 'Raise an Issue',
    myIssues: 'My Issues',
    campusCareSection: 'CampusCare',
    // Raise Issue Form
    issueTitle: 'Issue Title',
    issueTitlePlaceholder: 'e.g. Broken ceiling fan in Room 204',
    issueDescription: 'Description',
    issueDescriptionPlaceholder: 'Describe the problem in detail (min. 20 characters)...',
    issueCategory: 'Category',
    selectCategory: 'Select a category',
    issueBuilding: 'Building / Block',
    issueBuildingPlaceholder: 'e.g. Block A, Science Block',
    issueFloor: 'Floor',
    issueFloorPlaceholder: 'e.g. Ground Floor, 2nd Floor',
    issueRoom: 'Room / Area',
    issueRoomPlaceholder: 'e.g. Room 204, Lab 3',
    additionalInfo: 'Additional Information (Optional)',
    additionalInfoPlaceholder: 'Any other details that may help...',
    attachImages: 'Attach Images',
    attachImagesHint: 'JPG, PNG, WEBP · Max 5 MB each · Multiple allowed',
    addImages: 'Add Images',
    submissionLanguage: 'Submission Language',
    submitIssue: 'Submit Issue',
    submitting: 'Submitting...',
    aiSuggested: 'AI Suggested',
    suggestedCategory: 'Suggested Category',
    suggestedPriority: 'Suggested Priority',
    duplicateWarning: 'A similar open issue may already exist for this location.',
    // Validation
    titleRequired: 'Issue title is required.',
    descriptionTooShort: 'Description must be at least 20 characters.',
    categoryRequired: 'Please select a category.',
    buildingRequired: 'Building name is required.',
    // Success
    issueSubmitted: 'Issue submitted successfully!',
    ticketCreated: 'Your ticket ID is',
    viewMyIssues: 'View My Issues',
    // Categories
    categories: [
      'Electrical Problems',
      'Plumbing and Water Supply',
      'Infrastructure Damage',
      'Laboratory Equipment',
      'Sanitation and Cleanliness',
      'Furniture and Facilities',
      'Internet and Network',
      'Other',
    ],
    // My Issues
    myIssuesTitle: 'My Issues',
    myIssuesSubtitle: 'Track all your submitted complaints and their resolution status.',
    filterAll: 'All',
    filterPending: 'Pending Review',
    filterProgress: 'Under Progress',
    filterResolved: 'Resolved',
    filterRejected: 'Rejected',
    searchIssues: 'Search by ticket ID or title...',
    noIssuesYet: 'No issues submitted yet.',
    noIssuesDesc: 'Submit a campus issue and it will appear here.',
    raiseFirstIssue: 'Raise an Issue',
    noMatchingIssues: 'No issues match your filters.',
    // Ticket Card
    ticketId: 'Ticket',
    submittedOn: 'Submitted',
    lastUpdated: 'Updated',
    // Status labels
    statusPendingReview: 'Pending Review',
    statusUnderProgress: 'Under Progress',
    statusResolved: 'Resolved',
    statusRejected: 'Rejected',
    // Priority labels
    priorityCritical: 'Critical',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    // Ticket Detail
    issueDetails: 'Issue Details',
    originalDescription: 'Original Description',
    submittedIn: 'Submitted in',
    locationDetails: 'Location',
    attachedPhotos: 'Attached Photos',
    noPhotos: 'No photos attached.',
    adminRemarks: 'Administrator Remarks',
    noRemarks: 'No remarks added yet.',
    resolutionDetails: 'Resolution Details',
    statusHistory: 'Status History',
    closeDetails: 'Close',
    // Progress stepper
    stepSubmitted: 'Submitted',
    stepReviewed: 'Reviewed',
    stepInProgress: 'In Progress',
    stepResolved: 'Resolved',
    rejectedExplanation: 'Rejection Reason',

    // ── Events ──
    eventsSection: 'Events',
    campusLife: 'Campus Life',
    eventsSubtitle: 'Discover upcoming events, workshops, and activities on campus.',
    allEvents: 'All Events',
    forYouEvents: 'For You',
    todayEvents: 'Today',
    upcomingEvents: 'Upcoming',
    savedEvents: 'Saved',
    noEvents: 'No events yet.',
    bookmarkEvent: 'Save Event',
    removeBookmark: 'Remove from Saved',
    registerForEvent: 'Register for Event',
    eventCategory: 'Category',
    eventVenue: 'Venue',
    eventDate: 'Date',
    eventTime: 'Time',
    allStudents: 'All Students',
    targetedAudience: 'Targeted Audience',
    notifications: 'Notifications',
    notificationsAllRead: 'All caught up',
    noNotifications: 'No notifications yet.',
    markAllRead: 'Mark all as read',

    // ── Notices ──
    noticesSection: 'Notice Board',
    noticesSubtitle: 'Official Announcements',
    noticesDesc: 'Stay informed with official university announcements and circulars.',
    allNotices: 'All',
    importantNotices: 'Important',
    noNotices: 'No notices published yet.',
    urgentNoticeLabel: 'Important Notice',
    expiresOn: 'Expires',
    publishedOn: 'Published',
    noticeAudience: 'Audience',
  },

  as: {
    // Brand & Navigation
    brandName: 'কেম্পাছআইকিউ',
    brandTag: 'ছাত্ৰ-ছাত্ৰীৰ সহায়ক',
    newChat: 'নতুন কথা-বতৰা',
    shortcutHint: '⌘ K',
    searchConversations: 'কথা-বতৰা সন্ধান কৰক',
    pinned: 'পিন কৰা',
    recent: 'শেহতীয়া',
    noMatching: 'কোনো মিল থকা কথা-বতৰা নাই',
    emptyConversations: 'আপোনাৰ কথা-বতৰা ইয়াত দেখিবলৈ পাব',
    settings: 'ছেটিংছ',
    profilePreferences: 'প্ৰফাইল আৰু পছন্দসমূহ',
    signOut: 'লগ আউট',
    languageSwitcherLabel: 'ভাষা',

    // Conversation Row Menu
    pin: 'পিন কৰক',
    unpin: 'আনপিন কৰক',
    rename: 'নাম সলনি কৰক',
    delete: 'মচি পেলাওক',
    demoBadge: 'ডেমো',

    // Welcome Screen
    eyebrow: 'আপোনাৰ বিশ্ববিদ্যালয়, এতিয়া আৰু সহজ',
    welcomeHeading: 'মই আজি আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ',
    welcomeCopy:
      'শৈক্ষিক নিয়ম, বিশ্ববিদ্যালয়ৰ জাননী, সময়সীমাৰ বিষয়ে কেম্পাছআইকিউক সোধক বা নথি সংলগ্ন কৰি অসমীয়া বা ইংৰাজীত প্ৰশ্ন কৰক।',
    suggestions: [
      {
        title: 'শৈক্ষিক তথ্য',
        prompt: 'মই জানিবলগীয়া গুৰুত্বপূৰ্ণ শৈক্ষিক নিয়মবোৰ কি কি?',
      },
      {
        title: 'বিশ্ববিদ্যালয়ৰ নথিপত্ৰ',
        prompt: 'মই পৰীক্ষাৰ নিয়মাৱলী আৰু শৈক্ষিক কেলেণ্ডাৰ ক\'ত পাম?',
      },
      {
        title: 'গুৰুত্বপূৰ্ণ সময়সীমা',
        prompt: 'কোনবোৰ পঞ্জীয়ন আৰু পৰীক্ষাৰ সময়সীমা ওচৰ চাপিছে?',
      },
      {
        title: 'বৃত্তি আৰু নামভৰ্তি',
        prompt: 'বৃত্তিৰ যোগ্যতা আৰু নামভৰ্তিৰ তথ্য কেনেকৈ পাম?',
      },
    ],
    signedInAs: 'লগ ইন হৈ আছে:',

    // Composer & Toolbar
    placeholder: 'আপোনাৰ বিশ্ববিদ্যালয়ৰ বিষয়ে যিকোনো সোধক বা নথিপত্ৰ সংলগ্ন কৰক...',
    placeholderListening: 'শুনি থকা হৈছে... এতিয়া কওক...',
    enterToSend: 'কেম্পাছআইকিউ সহায়ক · পঠিয়াবলৈ Enter টিপক',
    listeningBadge: 'শুনি থকা হৈছে... এতিয়া কওক',
    attachDocTooltip: 'নথিপত্ৰ সংলগ্ন কৰক (PDF, Word, TXT, ছবি)',
    micStartTooltip: 'ক\'বলৈ টিপক (কণ্ঠস্বৰ ইনপুট)',
    micStopTooltip: 'কণ্ঠস্বৰ বন্ধ কৰক',
    sendMessage: 'বাৰ্তা প্ৰেৰণ কৰক',
    disclaimer:
      'কেম্পাছআইকিউৰ ভুল হ\'ব পাৰে। বিশ্ববিদ্যালয়ৰ চৰকাৰী উৎসৰ সৈতে পৰীক্ষা কৰক।',
    attachedTag: 'সংলগ্ন কৰা হ\'ল। পঠিয়াবলৈ সাজু।',
    removeAttachment: 'সংলগ্ন নথি আঁতৰাওক',

    // Message Actions & Labels
    answerLabel: 'কেম্পাছআইকিউ উত্তৰ',
    prototypeLabel: 'ছাত্ৰ-ছাত্ৰীৰ সহায়ক',
    forward: 'ফৰৱাৰ্ড',
    copy: 'কপি কৰক',
    copied: 'কপি হ\'ল',
    regenerate: 'পুনৰ প্ৰস্তুত কৰক',
    typing: 'উত্তৰ প্ৰস্তুত কৰি থকা হৈছে...',

    // Forward Dialog
    forwardTitle: 'বাৰ্তা ফৰৱাৰ্ড কৰক',
    messagePreview: 'বাৰ্তাৰ প্ৰাকদৰ্শন:',
    quoteInComposer: 'বৰ্তমান ইনপুটত উদ্ধৃত কৰক',
    quoteDesc: 'সংশোধন কৰিবলৈ বা পুনৰ সুধিবলৈ ইনপুট বাকচত বহুৱাওক',
    orForwardTo: 'বা আন কথা-বতৰালৈ ফৰৱাৰ্ড কৰক',
    forwardNewChat: 'এটা নতুন কথা-বতৰালৈ ফৰৱাৰ্ড কৰক',
    currentBadge: 'বৰ্তমান',
    forwardedToNewNotice: 'নতুন কথা-বতৰালৈ বাৰ্তা ফৰৱাৰ্ড কৰা হ\'ল।',
    forwardedToConvNotice: 'বাৰ্তা ফৰৱাৰ্ড কৰা হ\'ল:',
    quotedSuccessNotice: 'বাৰ্তা ইনপুট বাকচত উদ্ধৃত কৰা হ\'ল।',

    // Rename Dialog
    renameTitle: 'কথা-বতৰাৰ নাম সলনি কৰক',
    cancel: 'বাতিল কৰক',
    saveName: 'নাম সংৰক্ষণ কৰক',

    // Delete Dialog
    deleteTitle: 'কথা-বতৰা মচি পেলাব বিচাৰে নেকি?',
    deleteWarning:
      'ইয়াৰ ফলত আপোনাৰ ব্ৰাউজাৰৰ ইতিহাসৰ পৰা এই কথা-বতৰা স্থায়ীভাৱে মচি পেলোৱা হ\'ব।',
    deleteConfirm: 'মচি পেলাওক',

    // Settings Dialog
    settingsTitle: 'ছাত্ৰ-ছাত্ৰীৰ পছন্দসমূহ',
    languageSection: 'ভাষা নিৰ্বাচন (Language)',
    languageDesc: 'ইণ্টাৰফেচ আৰু প্ৰশ্নৰ বাবে আপোনাৰ পছন্দৰ ভাষা বাছনি কৰক।',
    appearanceSection: 'চেহেৰা (Appearance)',
    appearanceDesc: 'এই ডিভাইচত কেম্পাছআইকিউ কেনেকৈ দেখা যাব বাছনি কৰক।',
    light: 'পোহৰ (Light)',
    dim: 'ধোঁৱাবৰণীয়া (Dim)',
    notificationsSection: 'জাননীসমূহ (Notifications)',
    notificationsDesc: 'আপোনাৰ সহায়ক ৱৰ্কস্পেচৰ পৰা আপডেট দেখুৱাওক।',
    savePreferences: 'পছন্দসমূহ সংৰক্ষণ কৰক',

    // Toast Notices
    micTurnedOff: 'মাইক্ৰ\'ফ\'ন বন্ধ কৰা হ\'ল।',
    micListening: '🎙️ শুনি থকা হৈছে... আপোনাৰ প্ৰশ্ন কওক।',
    micDenied: 'মাইক্ৰ\'ফ\'ন অনুমতি অস্বীকাৰ কৰা হ\'ল। অনুগ্ৰহ কৰি অনুমতি দিয়ক।',
    preferencesSaved: 'পছন্দসমূহ স্থানীয়ভাৱে সংৰক্ষণ কৰা হ\'ল।',
    conversationRenamed: 'কথা-বতৰাৰ নাম সলনি কৰা হ\'ল।',
    conversationDeleted: 'কথা-বতৰা মচি পেলোৱা হ\'ল।',

    // ── CampusCare ──
    raiseIssue: 'সমস্যা জনাওক',
    myIssues: 'মোৰ অভিযোগ',
    campusCareSection: 'কেম্পাছকেয়াৰ',
    // Raise Issue Form
    issueTitle: 'সমস্যাৰ শিৰোনাম',
    issueTitlePlaceholder: 'যেনে: কোঠা ২০৪ত চিলিং ফেন নষ্ট',
    issueDescription: 'বিৱৰণ',
    issueDescriptionPlaceholder: 'সমস্যাটো বিস্তাৰিতভাৱে বৰ্ণনা কৰক (কমেও ২০টা আখৰ)...',
    issueCategory: 'শ্ৰেণী',
    selectCategory: 'এটা শ্ৰেণী বাছনি কৰক',
    issueBuilding: 'বিল্ডিং / ব্লক',
    issueBuildingPlaceholder: 'যেনে: ব্লক এ, বিজ্ঞান ব্লক',
    issueFloor: 'মহলা',
    issueFloorPlaceholder: 'যেনে: ভূতল, ২য় মহলা',
    issueRoom: 'কোঠা / এলেকা',
    issueRoomPlaceholder: 'যেনে: কোঠা ২০৪, লেব ৩',
    additionalInfo: 'অতিৰিক্ত তথ্য (ঐচ্ছিক)',
    additionalInfoPlaceholder: 'আন যিকোনো বিৱৰণ যি সহায় কৰিব পাৰে...',
    attachImages: 'ছবি সংলগ্ন কৰক',
    attachImagesHint: 'JPG, PNG, WEBP · সৰ্বাধিক ৫ MB প্ৰতিটো · একাধিক অনুমোদিত',
    addImages: 'ছবি যোগ কৰক',
    submissionLanguage: 'দাখিলৰ ভাষা',
    submitIssue: 'অভিযোগ দাখিল কৰক',
    submitting: 'দাখিল কৰি থকা হৈছে...',
    aiSuggested: 'এআই পৰামৰ্শ',
    suggestedCategory: 'পৰামৰ্শিত শ্ৰেণী',
    suggestedPriority: 'পৰামৰ্শিত অগ্ৰাধিকাৰ',
    duplicateWarning: 'এই স্থানৰ বাবে ইতিমধ্যে এটা একে ধৰণৰ অভিযোগ খোলা আছে।',
    // Validation
    titleRequired: 'সমস্যাৰ শিৰোনাম আৱশ্যক।',
    descriptionTooShort: 'বিৱৰণ কমেও ২০টা আখৰৰ হ\'ব লাগিব।',
    categoryRequired: 'অনুগ্ৰহ কৰি এটা শ্ৰেণী বাছনি কৰক।',
    buildingRequired: 'বিল্ডিঙৰ নাম আৱশ্যক।',
    // Success
    issueSubmitted: 'অভিযোগ সফলভাৱে দাখিল কৰা হ\'ল!',
    ticketCreated: 'আপোনাৰ টিকট আইডি হ\'ল',
    viewMyIssues: 'মোৰ অভিযোগ চাওক',
    // Categories
    categories: [
      'বৈদ্যুতিক সমস্যা',
      'পাইপলাইন আৰু পানী যোগান',
      'অৱকাঠামো ক্ষতি',
      'পৰীক্ষাগাৰৰ সঁজুলি',
      'পৰিষ্কাৰ-পৰিচ্ছন্নতা',
      'আচবাব আৰু সুবিধা',
      'ইণ্টাৰনেট আৰু নেটৱৰ্ক',
      'অন্যান্য',
    ],
    // My Issues
    myIssuesTitle: 'মোৰ অভিযোগসমূহ',
    myIssuesSubtitle: 'আপোনাৰ দাখিল কৰা অভিযোগ আৰু সিহঁতৰ সমাধানৰ স্থিতি অনুসৰণ কৰক।',
    filterAll: 'সকলো',
    filterPending: 'পৰ্যালোচনাৰ অপেক্ষাত',
    filterProgress: 'প্ৰক্ৰিয়াধীন',
    filterResolved: 'সমাধান হৈছে',
    filterRejected: 'প্ৰত্যাখ্যান কৰা হৈছে',
    searchIssues: 'টিকট আইডি বা শিৰোনামেৰে সন্ধান কৰক...',
    noIssuesYet: 'এতিয়ালৈকে কোনো অভিযোগ দাখিল কৰা হোৱা নাই।',
    noIssuesDesc: 'এটা কেম্পাছ সমস্যা দাখিল কৰক আৰু ই ইয়াত দেখা দিব।',
    raiseFirstIssue: 'অভিযোগ জনাওক',
    noMatchingIssues: 'আপোনাৰ ফিল্টাৰৰ সৈতে কোনো অভিযোগ মিলা নাই।',
    // Ticket Card
    ticketId: 'টিকট',
    submittedOn: 'দাখিল কৰা হৈছিল',
    lastUpdated: 'আপডেট কৰা হৈছে',
    // Status labels
    statusPendingReview: 'পৰ্যালোচনাৰ অপেক্ষাত',
    statusUnderProgress: 'প্ৰক্ৰিয়াধীন',
    statusResolved: 'সমাধান হৈছে',
    statusRejected: 'প্ৰত্যাখ্যান কৰা হৈছে',
    // Priority labels
    priorityCritical: 'অতিজৰুৰী',
    priorityHigh: 'উচ্চ',
    priorityMedium: 'মধ্যম',
    priorityLow: 'কম',
    // Ticket Detail
    issueDetails: 'অভিযোগৰ বিৱৰণ',
    originalDescription: 'মূল বিৱৰণ',
    submittedIn: 'দাখিল কৰা ভাষা',
    locationDetails: 'অৱস্থান',
    attachedPhotos: 'সংলগ্ন ছবি',
    noPhotos: 'কোনো ছবি সংলগ্ন কৰা হোৱা নাই।',
    adminRemarks: 'প্ৰশাসকৰ মন্তব্য',
    noRemarks: 'এতিয়ালৈকে কোনো মন্তব্য যোগ কৰা হোৱা নাই।',
    resolutionDetails: 'সমাধানৰ বিৱৰণ',
    statusHistory: 'স্থিতিৰ ইতিহাস',
    closeDetails: 'বন্ধ কৰক',
    // Progress stepper
    stepSubmitted: 'দাখিল হৈছে',
    stepReviewed: 'পৰ্যালোচনা হৈছে',
    stepInProgress: 'প্ৰক্ৰিয়াধীন',
    stepResolved: 'সমাধান হৈছে',
    rejectedExplanation: 'প্ৰত্যাখ্যানৰ কাৰণ',

    // ── Events ──
    eventsSection: 'অনুষ্ঠানসমূহ',
    campusLife: 'কেম্পাছ জীৱন',
    eventsSubtitle: 'কেম্পাছৰ আগন্তুক অনুষ্ঠান, কৰ্মশালা আৰু কাৰ্যসূচীসমূহ চাওক।',
    allEvents: 'সকলো অনুষ্ঠান',
    forYouEvents: 'আপোনাৰ বাবে',
    todayEvents: 'আজি',
    upcomingEvents: 'আগন্তুক',
    savedEvents: 'সংৰক্ষিত',
    noEvents: 'এতিয়ালৈকে কোনো অনুষ্ঠান নাই।',
    bookmarkEvent: 'অনুষ্ঠান সংৰক্ষণ কৰক',
    removeBookmark: 'সংৰক্ষিতৰ পৰা আঁতৰাওক',
    registerForEvent: 'অনুষ্ঠানৰ বাবে পঞ্জীয়ন কৰক',
    eventCategory: 'শ্ৰেণী',
    eventVenue: 'স্থান',
    eventDate: 'তাৰিখ',
    eventTime: 'সময়',
    allStudents: 'সকলো ছাত্ৰ-ছাত্ৰী',
    targetedAudience: 'নিৰ্দিষ্ট শিক্ষাৰ্থী',
    notifications: 'জাননীসমূহ',
    notificationsAllRead: 'সকলো পঢ়া হ\'ল',
    noNotifications: 'এতিয়ালৈকে কোনো জাননী নাই।',
    markAllRead: 'সকলো পঢ়া বুলি চিহ্নিত কৰক',

    // ── Notices ──
    noticesSection: 'জাননী বোৰ্ড',
    noticesSubtitle: 'চৰকাৰী ঘোষণাসমূহ',
    noticesDesc: 'বিশ্ববিদ্যালয়ৰ চৰকাৰী ঘোষণা আৰু চাৰ্কুলাৰ পঢ়ক।',
    allNotices: 'সকলো',
    importantNotices: 'গুৰুত্বপূৰ্ণ',
    noNotices: 'এতিয়ালৈকে কোনো জাননী প্ৰকাশ পোৱা নাই।',
    urgentNoticeLabel: 'জৰুৰী জাননী',
    expiresOn: 'মেয়াদ উকলিব',
    publishedOn: 'প্ৰকাশিত',
    noticeAudience: 'শিক্ষাৰ্থী',
  },
}

export function getStudentTranslation(language = 'en', key) {
  const langTable = studentTranslations[language] || studentTranslations.en
  return langTable[key] !== undefined ? langTable[key] : studentTranslations.en[key] || key
}

