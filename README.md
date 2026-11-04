# CampusIQ — AI-Powered Bilingual University Portal & Admin Dashboard

CampusIQ is an AI-powered bilingual university assistant, administrative portal, and campus issue resolution system (**CampusCare**). This repository contains the complete frontend application, including the Crextio-inspired executive admin dashboard, student chatbot interface, role-based authentication portal, live Firebase Authentication, Cloud Firestore real-time synchronization, and Firebase Storage integration.

---

## 🚀 What's New & Active Highlights.

1. **CampusCare — Complete Campus Issue Reporting & Resolution System**:
   - **Student "Raise an Issue"**: Dedicated bilingual complaint submission page with title, description, category (8 categories), campus location (building, floor, room), additional details, and multi-image photo attachments.
   - **Client-Side Image Compression & Fallback**: Images are automatically scaled and compressed via an HTML5 canvas down to lightweight web images (~100–150 KB) with a 5-second Firebase Storage timeout safeguard, ensuring lightning-fast (1–2s) submissions even on slow networks.
   - **AI-Assisted Suggestions**: Real-time keyword heuristics that automatically suggest appropriate issue categories and urgency priority ratings (Critical, High, Medium, Low) as the student types.
   - **Collision-Resistant Ticket IDs**: Formatted as `CAMP-YYYY-XXXXXXXX` using timestamp base-36 and random salt.
   - **Student "My Issues" Tracker**: Live real-time Firestore synchronization (`onSnapshot`) with status filter pills, ticket search, and interactive cards.
   - **Interactive Visual Stepper & Lightbox**: 4-stage visual timeline (`Submitted` → `Reviewed` → `Under Progress` → `Resolved`), rejection reason banners, full photo gallery with click-to-enlarge lightbox, administrator remarks, and complete status history.
   - **Admin "Issues" Management Workspace (`IssuesPage.jsx`)**: 5 live overview KPI metric cards, structured table with multi-criteria filtering, multi-field search, column sorting, pagination, and a comprehensive management modal for department assignment, status/priority updates, public remarks, resolution descriptions, and private internal notes.

2. **Events Management System (Replaced Deadlines)**:
   - **Administrator Central Events Workspace (`EventsPage.jsx`)**:
     - 5 live metric KPI cards: *Total Events, Published, Drafts, Upcoming, Happening This Week*.
     - Interactive monthly calendar with date selection, event dot indicators, and quick-add actions.
     - Audience targeting engine: broadcast to **All Students** or specifically target **Departments** (*Arts & Humanities, Science & Technology, Commerce & Management, Social Sciences*), **Semesters** (1–8), and specific academic programmes.
     - Event poster upload with canvas compression and Firebase Storage integration.
     - Multi-criteria filtering (category, status, department) and sorting (newest, oldest, upcoming).
     - Event lifecycle management: Draft, Published, Archived, Completed, and deletion.
   - **Student Events Portal (`StudentEventsView.jsx` & `EventDetailModal.jsx`)**:
     - Dynamic audience matching: only shows events targeted to the student's department, programme, and semester, plus all-campus events.
     - Category-colored event cards with date, time, venue chips, and registration links.
     - Filter tabs: *All, For You (department/semester targeted), Today, Upcoming, Saved (bookmarked)*.
     - Dual view modes: Clean list view and interactive monthly calendar view.
     - Student bookmarks: 1-click save/bookmark persisted in Firestore (`student_saved_events`), surviving logout/login.
     - Event detail modal with full description, audience breakdown, registration button, and poster view.

3. **Crextio-Inspired Glassmorphism Navigation Bar**:
   - Outlined brand capsule (`CampusIQ`).
   - Frosted segmented nav track (`Dashboard`, `People`, `Documents`, `Notices`, `Events`, `Analytics`, `Issues`) with an active dark pill.
   - Distinct `[ ⚙ Setting ]` action capsule.
   - Circular notification bell (`🔔`) with unread amber dot and real-time popover.
   - Circular avatar profile button (`👤`).
   - Glassmorphism dropdown popovers with `backdrop-filter: blur(28px) saturate(180%)`, luminous white borders, and frosted action items.
   - Clean, natural side padding geometry (`min(1680px, calc(100% - 40px))`).

3. **Student AI Assistant & Full Bilingual Support**:
   - Instant 1-click toggle between **English** and **Assamese (`অসমীয়া`)** that translates the entire student interface and form controls.
   - Microphone voice dictation via Web Speech API with language alignment (`en-US` and `as-IN`).
   - Document and image attachments directly in chat conversations.
   - Message forwarding and quoting into active composer or new conversations.

4. **Role-Based Authentication & Gateway (`AuthPage.jsx`)**:
   - Entry gate separating **🎓 Student Portal** and **🛡️ Administrator Portal**.
   - **Sign In** and **Create Account** modes with email/password authentication.
   - Role-specific inputs: Student ID and Department for students; Administrative Unit and Master Key (`ADMIN2024`) for admins.
   - Instant Demo shortcuts (`⚡ Demo Admin` and `⚡ Demo Student`).

5. **Live Firebase Authentication & Cloud Firestore Integration**:
   - Initialized with `campusiq-portal` configuration (`src/services/firebase.js`).
   - **Dual-write on registration**: Profiles are synchronized to `students/{uid}` and `users/{uid}`.
   - **Student Directory Sync**: The **People** tab in the Administrator Dashboard automatically queries and displays all newly registered students from Firestore alongside local records.
   - Graceful offline/test fallback to native IndexedDB.

---

## 🛠️ Complete Technology Stack

### Core Framework & Build Tooling
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.x` | Modern component architecture, functional hooks, context providers |
| **Vite** | `8.x` | Ultra-fast HMR development server and production bundler |
| **JavaScript (ESNext / JSX)** | Modern | Application logic and UI markup |
| **CSS3 (Custom Design System)** | Native | Custom CSS variables, glassmorphic filters, Bento Grid, responsive layout |

### Cloud & Backend Services
| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **Firebase Authentication** | Google Firebase | Role-aware user identity, email/password credentials, secure UID tokens |
| **Cloud Firestore** | Google Cloud / Firebase | Real-time NoSQL database for `campus_issues`, `campus_notifications`, `users`, and `students` |
| **Firebase Storage** | Google Cloud / Firebase | Cloud object storage for complaint image attachments |
| **HTML5 Canvas API** | Browser Native | In-browser image resizing and compression before upload |
| **Web Speech API** | Browser Native | Real-time speech recognition / voice dictation in English and Assamese |
| **IndexedDB (Native)** | Browser Storage | Client-side offline persistence for documents, notices, deadlines, and activities |
| **LocalStorage** | Browser Storage | Active user sessions, user preferences, and lightweight metadata |

### UI Components & Libraries
| Library | Purpose |
| :--- | :--- |
| **Lucide React** | Clean, accessible vector icons across all dashboard and student interfaces |
| **Recharts** | Interactive weekly query trends and category distribution charts |

---

## 🌟 Feature Breakdown by Module

### 1. CampusCare — Issue Reporting & Resolution System
- **Raise an Issue (`RaiseIssueView.jsx`)**:
  - Title, description (minimum 20 characters validation), and additional information.
  - 8 standard categories: *Electrical Problems, Plumbing and Water Supply, Infrastructure Damage, Laboratory Equipment, Sanitation and Cleanliness, Furniture and Facilities, Internet and Network, Other*.
  - Language preservation: Allows submission in English or Assamese and preserves original text.
  - Campus location breakdown: Building/Block, Floor, and Room/Area.
  - Multi-image attachments with preview thumbnails, deletion, and size limits (5 MB).
  - Canvas-based image compression for fast upload.
  - Heuristic AI assistance that auto-suggests categories and initial priority ratings.
  - Success confirmation screen displaying the generated unique ticket ID.
- **Student Tracker (`MyIssuesView.jsx`)**:
  - Real-time Firestore subscription (`onSnapshot`) filtered by student UID.
  - Status filter tabs: *All, Pending Review, Under Progress, Resolved, Rejected*.
  - Ticket search by ID or title.
  - Detailed view with 4-step visual progress stepper (`Submitted` → `Reviewed` → `Under Progress` → `Resolved`).
  - Full administrator remarks and resolution description displays.
  - Full audit timeline of status and priority changes.
  - Attached photograph gallery with click-to-enlarge lightbox modal.
- **Administrator Issues Workspace (`IssuesPage.jsx`)**:
  - 5 live metric KPI cards: *Total Complaints, Pending Review, Under Progress, Resolved, High/Critical Priority*.
  - Search by Ticket ID, Student Name, or Title.
  - Filter by Status, Category, and Priority.
  - Column sorting by Submission Date and Priority.
  - Pagination (8 items per page).
  - Detailed management modal:
    - Complete student info (Name, Registration, Email, Department).
    - Complaint details, location, and submission language tag.
    - Status control (`Pending Review`, `Under Progress`, `Resolved`, `Rejected`).
    - Priority control (`Critical`, `High`, `Medium`, `Low`).
    - Department assignment (`Electrical Maintenance`, `Plumbing & Civil`, `IT & Network`, `Sanitation`, `Facilities`, `Other`).
    - Student-visible administrative remarks and resolution notes.
    - Private internal notes visible only to staff.
    - Complete status history log tracking modifier name, timestamp, and notes.

### 2. Authentication & Security (`AuthPage.jsx`)
- **Portal Separation**: One-click toggle between **Student Portal** and **Administrator Portal**.
- **Dual Flow**: Switch between **Sign In** and **Create Account**.
- **Student Profile Creation**: Collects Full Name, University Registration ID, Department selection, Email, and Password.
- **Admin Verification**: Requires a secure Admin Master Key (`ADMIN2024`) to register an administrator account.
- **Credential Validation**: Enforces email formatting, password length (minimum 6 characters), and password confirmation.
- **Instant Demo Access**: 1-click test buttons for testing Aarav Kumar (Admin) and Priya Sharma (Student).
- **Persistent Session**: Cached user session in `localStorage['campusiq_current_user']` with instant sign-out.

### 3. Administrator Overview Dashboard (`App.jsx`)
- **Asymmetric Bento Grid Layout**: Modern dashboard organization designed for high visual density and clarity.
- **Key Metric Stat Cards**: Real-time counts for Total Documents, Published Notices, Active Deadlines, and Student Queries.
- **Document Management Card**: Indexing health percentage bar, breakdown of Indexed vs Processing vs Failed files.
- **Notice Board Card**: Highlights urgent campus notices with priority badges (Important, High, Normal).
- **Academic Calendar Card**: Interactive month calendar with deadline indicators and upcoming events.
- **Query Analytics Card**: Visualizes weekly bilingual queries (English vs Assamese) using smooth area charts.
- **Student Demographics Overview**: Distribution badges and progress across academic departments.
- **Recent Activity Feed**: Real-time event log tracking all document, notice, student, and deadline mutations.

### 4. People (Student Directory) Workspace (`PeoplePage.jsx`)
- **Live Sync with Firebase**: Automatically renders students registered via Firebase Authentication and Firestore.
- **CRUD Operations**: Add, edit, inspect, and delete student records.
- **Search & Filtering**: Live search by name, registration ID, email, or degree programme; filter by department, semester, and active/inactive status.
- **Sorting & Pagination**: Sort by full name or admission date with configurable items per page.
- **Detailed Profile Modal**: Inspect student contact info, degree programme, semester progress, and registration metadata.
- **CSV Export**: One-click download of the filtered student list as a spreadsheet.

### 5. Document Knowledge Base Workspace (`DocumentsPage.jsx`)
- **File Upload**: Drag-and-drop or click-to-upload PDF documents up to 10 MB.
- **Metadata Tagging**: Categorize by Department, Category (Regulation, Syllabus, Circular, Form), Academic Year, and Language (Bilingual / English / Assamese).
- **PDF Viewer & Download**: In-browser preview using object URLs and direct download from IndexedDB.
- **Indexing Health Indicators**: Visual status tags for `Indexed`, `Processing`, and `Failed`.
- **Search & Facets**: Instant filtering by status, category, language, and upload date.

### 6. Notice Board Workspace (`NoticesPage.jsx`)
- **Draft & Publish Workflow**: Create notices as drafts, publish immediately, or archive expired circulars.
- **Priority Tagging**: Mark notices as Urgent, Important, or General.
- **Rich Preview Modal**: Modal preview showing the formatted circular before publication.
- **Date Validation**: Guards ensuring publication dates precede expiry dates.

### 7. Events Management Workspace (`EventsPage.jsx` — Replaced Deadlines)
- **Interactive Calendar View**: Full month grid with event dots, previous/next month navigation, and selected day event agenda.
- **Audience Targeting Engine**: Target events to **All Students** or filter by **Departments**, **Semesters**, and degree programmes.
- **Event Posters & Attachments**: Upload event graphics with in-browser canvas compression and Firebase Storage hosting.
- **Event Lifecycle Controls**: Save as Draft, Publish, Archive, or mark as Completed.
- **Categorization & Filters**: 10 event categories (*Academic, Workshop, Seminar, Hackathon, Competition, Cultural, Sports, Examination, Admission, Other*), status filters, and sorting.
- **Student Synchronization**: Real-time Firestore sync via `academic_events` collection with in-app notification dispatch.

### 8. Bilingual Query Analytics Workspace (`AnalyticsPage.jsx`)
- **Bilingual Tracking**: Language breakdown between English and Assamese queries.
- **Volume & Trend Analysis**: Recharts area visualization tracking query volumes over time.
- **Category Distribution**: Breakdown across Academics, Examinations, Admissions, and Facilities.
- **FAQ Leaderboard**: High-frequency campus questions and unanswered question triage list.
- **Data Export**: Export analytics reports to CSV.

### 9. Student AI Assistant & Campus Portal (`StudentApp.jsx`)
- **ChatGPT-Inspired Two-Panel Layout**: Collapsible navigation sidebar and main conversation thread.
- **Events & Campus Life Portal**: View campus events filtered specifically for the student's department, semester, and programme, toggle between List and interactive Calendar views, and save/bookmark events with real-time Firestore persistence.
- **CampusCare Quick Navigation**: Dedicated sidebar section to easily switch between AI Chat, **Raise an Issue**, and **My Issues**.
- **Bilingual Interface (English & Assamese)**: Complete UI localization in Assamese (`অসমীয়া`) and English, with an instant 1-click `[ 🌐 English | অসমীয়া ]` toggle pill in the header and sidebar.
- **Microphone Voice Dictation (`Mic`)**: Live Speech-to-Text integration via Web Speech API with language alignment (`en-US` and `as-IN`), audio listening indicator, and transcript streaming.
- **Document Attachment (`Paperclip`)**: Attach and send university documents, circulars, PDFs, Word documents, text files, and images with automatic file-size formatting.
- **Message Forwarding & Quoting (`Forward`)**: Forward any message to a new chat, another existing conversation, or quote directly into the active composer.
- **Conversation Management**: Create new chats, rename threads, pin important conversations, and search chat history.
- **Bilingual Prompt Starters**: One-click prompts for examination regulations, syllabus downloads, scholarship deadlines, and campus directions in both English and Assamese.
- **Rich Markdown Formatting**: Supports headings, ordered/unordered lists, code snippets, blockquotes, and tables.

---

## 📂 Source Code Structure

```text
campusiq-admin-dashboard/
├── index.html                   # Vite HTML entry point
├── package.json                 # Project dependencies and npm scripts
├── README.md                    # Project documentation
├── public/                      # Static assets
└── src/
    ├── components/
    │   ├── campuscare/
    │   │   ├── MyIssuesView.jsx   # Student My Issues tracker, stepper & lightbox
    │   │   └── RaiseIssueView.jsx # Student issue submission form with image compression
    │   ├── events/
    │   │   ├── EventDetailModal.jsx # Student event details modal & bookmark action
    │   │   └── StudentEventsView.jsx# Student events portal (List & Calendar views)
    │   ├── ManagementUI.jsx     # Shared modals, tables, badges, form controls
    │   └── StudentChatUI.jsx    # Chatbot interface components
    ├── context/
    │   └── CampusDataContext.jsx# Unified IndexedDB & Firestore React context provider
    ├── pages/
    │   ├── ActivityPage.jsx     # Full audit trail log
    │   ├── AnalyticsPage.jsx    # Recharts analytics workspace
    │   ├── AuthPage.jsx         # Role-based Login & Create Account page
    │   ├── DocumentsPage.jsx    # PDF upload & document knowledge base
    │   ├── EventsPage.jsx       # Events Management workspace (Replaced Deadlines)
    │   ├── IssuesPage.jsx       # CampusCare Admin Issue Management workspace
    │   ├── NoticesPage.jsx      # Notice creation & publishing
    │   ├── PeoplePage.jsx       # Student directory synced with Firebase
    │   └── SettingsPage.jsx     # Admin settings & preferences
    ├── services/
    │   ├── activityService.js   # Audit trail service
    │   ├── analyticsService.js  # Analytics query metrics
    │   ├── authService.js       # Firebase Auth + Cloud Firestore dual-write service
    │   ├── campusCareService.js # CampusCare issues, image upload & real-time sync
    │   ├── dashboardService.js  # Dashboard bento aggregation
    │   ├── documentService.js   # PDF file storage & metadata
    │   ├── eventService.js      # Firestore real-time events, audience targeting & bookmarks
    │   ├── firebase.js          # Live Firebase App, Auth, Firestore & Storage
    │   ├── noticeService.js     # Notice management
    │   ├── seedData.js          # Initial realistic campus dataset
    │   ├── storage.js           # Native IndexedDB wrapper
    │   ├── studentChatService.js# Student assistant persistence & bilingual responses
    │   ├── studentService.js    # Firestore + IndexedDB merged student service
    │   └── studentTranslations.js# Complete English & Assamese bilingual translations
    ├── utils/
    │   ├── csv.js               # CSV generator & exporter
    │   ├── formatters.js        # Date, badge & text formatters
    │   └── ids.js               # Unique ID generator
    ├── App.jsx                  # Main Admin Dashboard, top navbar, & view switcher
    ├── StudentApp.jsx           # Student Assistant & CampusCare portal
    ├── index.css                # Global design system, Admin & CampusCare styling
    ├── student.css              # Student Interface & CampusCare styling
    └── main.jsx                 # React root mount point
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Credentials & Demo Testing

| Role | Email | Password | Admin Key | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusiq.edu` | `password123` | `ADMIN2024` | Or click **`⚡ Demo Admin`** |
| **Student** | `student@campusiq.edu` | `password123` | — | Or click **`⚡ Demo Student`** |
| **New Accounts** | Any valid email | 6+ chars | `ADMIN2024` (Admin only) | Syncs directly to Firebase & People tab |
