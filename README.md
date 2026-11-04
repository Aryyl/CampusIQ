# CampusIQ - AI-Powered Bilingual University Portal and Admin Dashboard

CampusIQ is an enterprise-grade bilingual university portal, administrative operating system, campus issue resolution system (CampusCare), official notice board, career roadmap analyzer (Career Compass), and events management platform.

The platform connects university administrators and students through a cohesive desktop and mobile workspace, ChatGPT-style student portal, real-time Firebase Authentication, Cloud Firestore live synchronization, Firebase Storage integration, and live AI integration with the Campus-Bondhu Grounded RAG microservice.

---

## Key Modules and Capabilities

### 1. Progressive Web App (PWA) for Students
* **Home Screen Installation**: Students can install CampusIQ directly to their mobile home screen on Android, iOS, Chrome, and Edge without app store downloads.
* **Standalone Execution**: Runs in full-screen standalone mode (`display: standalone`) without browser address bars or navigation chrome.
* **Dedicated Student Entrypoint**: Launching the installed app automatically routes to the Student Portal (`start_url: /?pwa=student`), keeping administrative workflows separate.
* **Offline Caching and Resilience**: A dedicated Service Worker (`sw.js`) pre-caches core application assets and icons, allowing instant launches and offline viewing of previously loaded notices and events.
* **1-Tap In-App Install Prompt**: Displays an in-app banner for supported browsers and a share-to-home-screen guide on iOS Safari.
* **Device Safe Areas**: Automatically adapts padding for device notches, dynamic islands, and bottom gesture indicators.

### 2. Campus-Bondhu Live AI Backend Integration
* **Grounded RAG Architecture**: Integrated with the deployed FastAPI backend (`https://campus-bondhu.onrender.com`) for factual, citation-backed answers.
* **Multimodal Image and Document Queries**: Students can attach images (such as circular photos, exam schedules, and grade sheets) and receive visual document analysis.
* **In-Chat Image Previews and Lightbox**: Attached images render directly inside chat bubbles with file metadata, with a full-screen interactive lightbox on click.
* **Intelligent Failover Engine**: If the backend is cold-booting or unreachable, the frontend automatically switches to a localized client assistant without interrupting the user experience.
* **Source Attribution**: Verified backend answers display a live source badge along with cited document references.

### 3. Career Compass - AI Resume Analyzer and Career Roadmap
* **In-Browser Skill Extraction**: Analyzes uploaded or pasted resume text against a semantic database of more than 180 technical and professional skills.
* **Role Match Engine**: Evaluates candidate compatibility across 8 tech and industry tracks (including Full Stack, AI/ML, DevOps, UI/UX, and Data Analysis) with percentage fit scoring and missing keyword analysis.
* **Three-Phase Actionable Roadmap**: Generates a structured career development plan (Foundations, Projects and Certifications, Placement Preparation).
* **Bilingual Audio Narration**: Reads roadmaps aloud in English or Assamese using the browser Web Speech Synthesis API.

### 4. CampusCare - Campus Issue Resolution System
* **Bilingual Issue Submission (`RaiseIssueView.jsx`)**:
  * Fields for title, category (8 categories), detailed description (20+ character validation), and campus location hierarchy (Building, Floor, Room).
  * Preserves native submission language (English and Assamese) without lossy automated translation.
  * In-browser canvas image compression (~100-150 KB) with 5-second Firebase Storage fallback for reliable uploads on mobile data.
  * Real-time category and urgency suggestions based on title and description keywords.
  * Ticket IDs follow a collision-resistant format (`CAMP-YYYY-XXXXXXXX`).
* **Student Complaint Tracker (`MyIssuesView.jsx`)**:
  * Real-time Firestore synchronization (`onSnapshot`) filtered to the authenticated student.
  * Filter tabs: All, Pending Review, Under Progress, Resolved, Rejected.
  * Four-stage visual progress timeline: Submitted -> Reviewed -> Under Progress -> Resolved.
  * Displays administrator remarks, resolution summaries, and full chronological status logs.
  * Attachment gallery with click-to-enlarge modal.
* **Administrator Issue Workspace (`IssuesPage.jsx`)**:
  * Five live metric KPI cards: Total Complaints, Pending Review, Under Progress, Resolved, High/Critical Priority.
  * Multi-criteria filtering by Status, Category, Priority, Department assignment, and text search.
  * Management modal to update ticket status, priority, department routing, public remarks, and internal notes.

### 5. Official Notices Management System
* **Administrative Notice Workspace (`NoticesPage.jsx`)**:
  * Publish circulars with categories, priority flags, and urgent expiry deadlines.
  * Target specific audiences: All Students, specific departments, or faculty.
  * Real-time synchronization to Firestore collection `campus_notices`.
* **Student Notice Board (`StudentNoticesView.jsx`)**:
  * Categorized tabs: All, Urgent, Academic, Administrative, Examination.
  * High-priority notices feature glowing alert badges and expiration dates.
  * Detailed modal view with circular text, issuing authority, and publication date.

### 6. Events Management System
* **Administrative Event Workspace (`EventsPage.jsx`)**:
  * Full lifecycle event management: Draft, Published, Archived, Completed.
  * Overview KPI cards: Total Events, Published, Drafts, Upcoming, Happening This Week.
  * Interactive monthly calendar with date indicators and quick creation tools.
  * Audience targeting: Broadcast university-wide or target specific departments and semesters.
  * Poster upload with canvas compression and Firebase Storage hosting.
* **Student Events Portal (`StudentEventsView.jsx` and `EventDetailModal.jsx`)**:
  * Dynamic audience filtering matching the student's department, programme, and semester.
  * Filter tabs: All, For You, Today, Upcoming, Saved (bookmarked).
  * Dual view modes: List view and monthly calendar view.
  * Persistent bookmarks saved to Firestore (`student_saved_events`).

### 7. Real-Time In-App Notification Center
* **Central Real-Time Service (`notificationService.js`)**:
  * Listens to the `campus_notifications` Firestore collection.
  * Index-free in-memory sorting to prevent composite index bottlenecks.
* **Automated Bidirectional Triggers**:
  * Student to Admin: Notifies administrators when a new issue ticket is submitted.
  * Admin to Student: Notifies students when an administrator updates ticket status or leaves remarks.
  * Admin to Students: Broadcasts alerts when new official notices or campus events are published.
* **Interactive Navigation Center**:
  * Unread counter badges in the Admin top navigation bar and Student header.
  * Popover dropdown with relative timestamps and one-click deep-linking to tickets, notices, or events.
  * Batch mark-as-read functionality.

### 8. Role-Based Authentication and Gateway (`AuthPage.jsx`)
* Dual-role gateway separating the Student Portal and Administrator Dashboard.
* Sign In and Create Account modes with Firebase Authentication.
* Role-specific registration fields: Student ID and Department for students; Administrative Unit and Master Key for administrators.
* Instant Demo login shortcuts for both roles.
* Profiles synchronized to Firestore collection `users`.

---

## Technology Stack

### Frontend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| React | 19.x | Component-based UI, custom hooks, and context providers |
| Vite | 8.x | Build tool, development server, and API proxy |
| JavaScript (ESM) | Modern | Application logic and client modules |
| Custom CSS Design System | Native | Responsive layouts, CSS variables, desktop glassmorphism, mobile-optimized surfaces |
| Lucide React | Latest | Consistent vector iconography |
| Recharts | Latest | SVG analytics charts for administrators |

### Progressive Web App (PWA)
| Asset / Standard | Purpose |
| :--- | :--- |
| Web App Manifest (`manifest.json`) | Defines app name, standalone display, icons, and student start URL |
| Service Worker (`sw.js`) | Offline asset caching, fast boot, and cache lifecycle management |
| PWA Icons | Adaptive and maskable icons (192px, 512px, apple-touch-icon, SVG) |
| Standalone API | Automatically detects home screen launches and sets student mode |

### Cloud, Backend, and AI Infrastructure
| Service | Provider | Purpose |
| :--- | :--- | :--- |
| Firebase Authentication | Google Cloud | User identity, email/password credentials, role verification |
| Cloud Firestore | Google Cloud | Real-time NoSQL database for issues, notices, events, and notifications |
| Firebase Storage | Google Cloud | Cloud file storage for issue photos and event posters |
| Campus-Bondhu API | Render / FastAPI | Grounded RAG question answering with university document grounding |
| HTML5 Canvas API | Browser Native | Client-side image compression before cloud upload |
| Web Speech API | Browser Native | Voice dictation in chat and audio read-aloud for career roadmaps |
| LocalStorage | Browser Native | Local session caching, user preferences, and offline fallback |

---

## File and Directory Structure

```text
campusiq-admin-dashboard/
├── index.html                     # HTML entry point with PWA meta tags
├── package.json                   # Dependencies and build scripts
├── README.md                      # Project documentation
├── vercel.json                    # Single-page application route rewrites
├── vite.config.js                 # Vite bundler and dev proxy configuration
├── public/
│   ├── manifest.json              # PWA Web App Manifest
│   ├── sw.js                      # PWA Service Worker
│   └── icons/                     # PWA home screen and touch icons
└── src/
    ├── components/
    │   ├── campuscare/
    │   │   ├── MyIssuesView.jsx   # Student issue tracker, timeline, and photo gallery
    │   │   └── RaiseIssueView.jsx # Issue submission form with image compression
    │   ├── career/
    │   │   ├── CareerCompassView.jsx # Career Compass dashboard and controls
    │   │   ├── JobMatchCards.jsx  # Role fit matching cards and scores
    │   │   ├── ResumeUploader.jsx # Resume text and file input
    │   │   └── RoadmapTimeline.jsx# Three-phase career roadmap display
    │   ├── common/
    │   │   └── PwaInstallPrompt.jsx # In-app mobile PWA install banner
    │   ├── events/
    │   │   ├── EventDetailModal.jsx # Event detail modal and bookmark action
    │   │   └── StudentEventsView.jsx# Student events view (List and Calendar)
    │   ├── notices/
    │   │   ├── NoticeDetailModal.jsx# Official notice detail modal
    │   │   └── StudentNoticesView.jsx# Student notice board
    │   └── ManagementUI.jsx       # Shared admin tables, modals, and badges
    ├── context/
    │   └── CampusDataContext.jsx  # Unified application state context
    ├── pages/
    │   ├── ActivityPage.jsx       # Administrative audit log
    │   ├── AnalyticsPage.jsx      # Recharts analytics dashboard
    │   ├── AuthPage.jsx           # Role-based login and registration
    │   ├── DeadlinesPage.jsx      # Academic calendar view
    │   ├── DocumentsPage.jsx      # Document repository management
    │   ├── EventsPage.jsx         # Administrative events workspace
    │   ├── IssuesPage.jsx         # CampusCare administrator workspace
    │   ├── NoticesPage.jsx        # Administrative notice publisher
    │   ├── PeoplePage.jsx         # User and student directory
    │   └── SettingsPage.jsx       # System settings and preferences
    ├── services/
    │   ├── activityService.js     # Audit trail service
    │   ├── analyticsService.js    # Query and ticket analytics data
    │   ├── authService.js         # Firebase Auth and session management
    │   ├── campusBondhuService.js  # Live Campus-Bondhu AI API client
    │   ├── campusCareService.js   # CampusCare ticket operations
    │   ├── careerService.js       # Career Compass skill extractor and match engine
    │   ├── dashboardService.js    # Dashboard summary metrics
    │   ├── documentService.js     # Document file operations
    │   ├── eventService.js        # Event operations and bookmarks
    │   ├── firebase.js            # Firebase App, Auth, Firestore, Storage
    │   ├── noticeService.js       # Notice board operations
    │   ├── notificationService.js # Real-time notification center
    │   ├── pwaService.js          # Service worker registration and install events
    │   ├── seedData.js            # Initial demonstration dataset
    │   ├── storage.js             # Local storage persistence
    │   ├── studentChatService.js  # Student conversation storage and local fallback
    │   ├── studentService.js      # Student profile queries
    │   └── studentTranslations.js # English and Assamese translation dictionary
    ├── utils/
    │   ├── csv.js                 # CSV export utility
    │   ├── formatters.js          # Date, file size, and status formatters
    │   └── ids.js                 # Unique ID generator
    ├── App.jsx                    # Root application router and admin shell
    ├── StudentApp.jsx             # Student Portal, Chatbot, and mobile navigation
    ├── index.css                  # Global design tokens and Admin styles
    ├── student.css                # Student Portal and PWA mobile styles
    └── main.jsx                   # React root entry point
```

---

## Getting Started

### 1. Prerequisites
* Node.js: v18.0.0 or higher
* npm: v9.0.0 or higher

### 2. Installation
```bash
git clone https://github.com/Aryyl/CampusIQ.git
cd CampusIQ
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_CAMPUS_BONDHU_API_URL=https://campus-bondhu.onrender.com
```

### 4. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```
Build artifacts are generated in the `dist` directory.

---

## Demonstration Credentials

| Role | Email | Password | Admin Key | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Administrator | admin@campusiq.edu | password123 | ADMIN2024 | Or use Demo Admin shortcut |
| Student | student@campusiq.edu | password123 | Not required | Or use Demo Student shortcut |
| New Registrations | Any valid email | 6+ characters | ADMIN2024 (Admin only) | Syncs to Firestore users collection |
