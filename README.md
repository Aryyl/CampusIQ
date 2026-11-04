# CampusIQ — AI-Powered Bilingual University Portal & Admin Dashboard

CampusIQ is an enterprise-grade bilingual university portal, administrative operating system, campus issue resolution system (**CampusCare**), and **Events Management System**. 

The platform connects university administrators and students through a cohesive Crextio-inspired glassmorphism workspace, ChatGPT-style student portal, real-time Firebase Authentication, Cloud Firestore live synchronization, and Firebase Storage integration.

---

## 🚀 Key Modules & Active Capabilities

### 1. CampusCare — Complete Issue Reporting & Resolution System
* **Bilingual Issue Submission (`RaiseIssueView.jsx`)**:
  * Title, category selection (8 categories), detailed description (20+ character validation), campus location hierarchy (Building/Block, Floor, Room/Area), and additional context.
  * Preserves native submission language (English and Assamese / অসমীয়া) without lossy auto-translation.
  * In-browser canvas image compression (~100–150 KB) with 5-second Firebase Storage timeout fallback, ensuring sub-2-second submissions even on weak cellular networks.
  * AI-assisted keyword heuristics that recommend category and urgency rating in real time as the student types.
  * Collision-resistant Ticket IDs (`CAMP-YYYY-XXXXXXXX`) using timestamp base-36 + random salt.
* **Student Complaint Tracker (`MyIssuesView.jsx`)**:
  * Real-time Firestore synchronization (`onSnapshot`) filtered by student credentials with index-free in-memory sorting.
  * Filter tabs: *All, Pending Review, Under Progress, Resolved, Rejected*.
  * 4-stage visual progress timeline (`Submitted` → `Reviewed` → `Under Progress` → `Resolved`).
  * Rejection explanation banners, administrator remarks, resolution summaries, and full chronological status history.
  * Attached photograph gallery with click-to-enlarge lightbox modal.
* **Administrator Issue Workspace (`IssuesPage.jsx`)**:
  * 5 live metric KPI cards: *Total Complaints, Pending Review, Under Progress, Resolved, High/Critical Priority*.
  * Multi-criteria filtering by Status, Category, Priority, Department assignment, and real-time search.
  * Comprehensive management modal: update status, priority, department assignment, public student remarks, resolution details, and internal staff-only notes.

### 2. Events Management System (Replaced Deadlines)
* **Central Administrator Events Workspace (`EventsPage.jsx`)**:
  * Replaces legacy deadlines with a full-lifecycle event management module.
  * 5 overview KPI metric cards: *Total Events, Published, Drafts, Upcoming, Happening This Week*.
  * Interactive monthly calendar with date selection, event dot indicators, and quick-add actions.
  * **Audience Targeting Engine**: Broadcast to **All Students** or specifically target **Departments** (*Arts & Humanities, Science & Technology, Commerce & Management, Social Sciences*), **Semesters** (1–8), and specific academic programmes.
  * Event poster upload with canvas compression and Firebase Storage hosting.
  * Multi-criteria filtering by category, status, and department, with sort by newest, oldest, or upcoming.
  * Event lifecycle states: *Draft, Published, Archived, Completed*.
* **Student Events Portal (`StudentEventsView.jsx` & `EventDetailModal.jsx`)**:
  * Dynamic audience matching: only presents events targeted to the student's department, programme, and semester, plus university-wide events.
  * Category-colored cards displaying event poster, date, start/end times, venue, excerpt, and external registration links.
  * Filter tabs: *All, For You (department/semester targeted), Today, Upcoming, Saved (bookmarked)*.
  * Dual view modes: Clean list view and interactive monthly calendar view.
  * Student bookmarks: 1-click save/bookmark persisted in Firestore (`student_saved_events`), surviving logout/login.
  * Event detail modal with full description, audience breakdown, registration button, and poster view.

### 3. Live In-App Notification Center
* **Central Real-Time Service (`notificationService.js`)**:
  * Listens to the `campus_notifications` Firestore collection in real time.
  * Uses index-free in-memory sorting to prevent composite index bottlenecks.
* **Automated Bidirectional Triggers**:
  * **Student → Admin**: Notifies administrators instantly when a new complaint is submitted in CampusCare with ticket ID, student name, and issue category.
  * **Admin → Student**: Notifies students when an administrator updates their ticket status (e.g. *Under Progress*, *Resolved*, *Rejected*) or adds official remarks.
  * **Admin → Students**: Automatically dispatches broadcast notifications to students when new campus events are published.
* **Interactive Navigation Bell & Popovers**:
  * Unread amber badge counters in the Admin navbar and Student header/sidebar.
  * Dropdown popover with relative timestamps, unread indicator dots, and one-click deep-linking directly to the relevant ticket or event.
  * One-click "Mark all as read" batch update.
  * Full bilingual translation support in English and Assamese.

### 4. Crextio-Inspired Glassmorphism Navigation Bar
* Outlined brand capsule (`CampusIQ`).
* Frosted segmented nav track (`Dashboard`, `People`, `Documents`, `Notices`, `Events`, `Analytics`, `Issues`) with active pill indicator.
* Dedicated `[ ⚙ Setting ]` action capsule.
* Circular notification bell (`🔔`) with unread amber dot and popover.
* Circular avatar profile button (`👤`) with session info and quick logout.
* Glassmorphic dropdown popovers (`backdrop-filter: blur(28px) saturate(180%)`).

### 5. Student AI Assistant & Bilingual Capabilities
* Instant 1-click toggle between **English** and **Assamese (`অসমীয়া`)** across the entire student interface, labels, buttons, and form controls.
* Microphone voice dictation via native Web Speech API with automatic language alignment (`en-US` and `as-IN`).
* Document and image attachments directly in chat conversations.
* Message forwarding and quoting into active composer or new conversations.
* Chat conversation manager: create new chats, rename threads, pin important discussions, and search chat history.

### 6. Role-Based Authentication & Gateway (`AuthPage.jsx`)
* Dual-role entry gate separating **🎓 Student Portal** and **🛡️ Administrator Portal**.
* **Sign In** and **Create Account** modes with email/password authentication.
* Role-specific registration: Student ID and Department for students; Administrative Unit and Master Key (`ADMIN2024`) for admins.
* Instant Demo shortcuts (`⚡ Demo Admin` and `⚡ Demo Student`).
* Profiles synchronized to Firestore (`users/{uid}` and `students/{uid}`) and displayed in the Admin People directory.

---

## 🛠️ Complete Technology Stack

### Frontend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.x` | Modern component architecture, functional hooks, context providers |
| **Vite** | `8.x` | Ultra-fast development server, HMR, and production bundler |
| **@vitejs/plugin-react** | `latest` | Optimized React JSX runtime & client directive handling |
| **JavaScript (ESNext / JSX)** | Modern | Application logic and UI markup |
| **CSS3 (Custom Design System)** | Native | Crextio glassmorphism, CSS variables, Bento Grid, responsive layouts |
| **Lucide React** | `latest` | Clean, accessible vector icons across all modules |
| **Recharts** | `latest` | Responsive bilingual query analytics and distribution charts |

### Cloud & Database Infrastructure
| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **Firebase Authentication** | Google Cloud / Firebase | Role-aware identity, email/password credentials, secure UID tokens |
| **Cloud Firestore** | Google Cloud / Firebase | Real-time NoSQL database for `campus_issues`, `academic_events`, `student_saved_events`, `campus_notifications`, `users`, and `students` |
| **Firebase Storage** | Google Cloud / Firebase | Cloud object storage for complaint photos and event posters |
| **HTML5 Canvas API** | Browser Native | In-browser image resizing and compression before upload |
| **Web Speech API** | Browser Native | Real-time speech recognition / voice dictation in English and Assamese |
| **IndexedDB (Native)** | Browser Storage | Client-side offline persistence for documents, notices, and activity logs |
| **LocalStorage** | Browser Storage | Active user sessions, user preferences, and lightweight metadata |
| **Vercel** | Vercel Platform | Production hosting with SPA route rewrites via `vercel.json` |

---

## 🌟 Module Architecture & File Directory

```text
campusiq-admin-dashboard/
├── index.html                     # Vite HTML entry point
├── package.json                   # Dependencies and npm scripts
├── README.md                      # Complete project documentation
├── vercel.json                    # Vercel SPA routing rewrites
├── vite.config.js                 # Vite bundler configuration
├── public/                        # Static assets
└── src/
    ├── components/
    │   ├── campuscare/
    │   │   ├── MyIssuesView.jsx   # Student My Issues tracker, stepper & lightbox
    │   │   └── RaiseIssueView.jsx # Bilingual issue submission form with image compression
    │   ├── events/
    │   │   ├── EventDetailModal.jsx # Student event details modal & bookmark action
    │   │   └── StudentEventsView.jsx# Student events portal (List & Calendar views)
    │   ├── ManagementUI.jsx       # Reusable modals, tables, badges, form controls
    │   └── StudentChatUI.jsx      # Chatbot interface components
    ├── context/
    │   └── CampusDataContext.jsx  # Unified IndexedDB & Firestore React context provider
    ├── pages/
    │   ├── ActivityPage.jsx       # Full audit trail log
    │   ├── AnalyticsPage.jsx      # Recharts bilingual analytics workspace
    │   ├── AuthPage.jsx           # Role-based Login & Create Account page
    │   ├── DocumentsPage.jsx      # PDF upload & document knowledge base
    │   ├── EventsPage.jsx         # Events Management workspace (Replaced Deadlines)
    │   ├── IssuesPage.jsx         # CampusCare Admin Issue Management workspace
    │   ├── NoticesPage.jsx        # Notice creation & publishing
    │   ├── PeoplePage.jsx         # Student directory synced with Firebase
    │   └── SettingsPage.jsx       # Admin settings & preferences
    ├── services/
    │   ├── activityService.js     # Audit trail service
    │   ├── analyticsService.js    # Analytics query metrics
    │   ├── authService.js         # Firebase Auth + Cloud Firestore dual-write service
    │   ├── campusCareService.js   # CampusCare issues, image upload & real-time sync
    │   ├── dashboardService.js    # Dashboard bento aggregation
    │   ├── documentService.js     # PDF file storage & metadata
    │   ├── eventService.js        # Firestore real-time events, audience targeting & bookmarks
    │   ├── firebase.js            # Live Firebase App, Auth, Firestore & Storage
    │   ├── noticeService.js       # Notice management
    │   ├── notificationService.js # Live in-app notification center & Firestore listener
    │   ├── seedData.js            # Initial realistic campus dataset
    │   ├── storage.js             # Native IndexedDB wrapper
    │   ├── studentChatService.js  # Student assistant persistence & bilingual responses
    │   ├── studentService.js      # Firestore + IndexedDB merged student service
    │   └── studentTranslations.js # English & Assamese bilingual translation dictionary
    ├── utils/
    │   ├── csv.js                 # CSV generator & exporter
    │   ├── formatters.js          # Date, badge & text formatters
    │   └── ids.js                 # Unique ID generator
    ├── App.jsx                    # Main Admin Dashboard, top navbar, & view switcher
    ├── StudentApp.jsx             # Student Assistant, Events & CampusCare portal
    ├── index.css                  # Global design system & Admin styling
    ├── student.css                # Student Interface & CampusCare styling
    └── main.jsx                   # React root mount point
```

---

## 🚦 Getting Started

### 1. Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### 2. Installation
```bash
git clone https://github.com/Aryyl/CampusIQ.git
cd CampusIQ
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

## 🚀 Deployment on Vercel

This repository is pre-configured for **1-click zero-config deployment on Vercel**:

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** → **"Project"**.
2. Select your imported **`CampusIQ`** GitHub repository.
3. Vercel automatically detects the Vite framework settings:
   * **Framework Preset**: `Vite`
   * **Build Command**: `vite build`
   * **Output Directory**: `dist`
4. Click **"Deploy"**.

*The included `vercel.json` file automatically handles Single Page Application (SPA) URL rewrites so that page refreshes and direct URLs never result in 404 errors.*

---

## 🔐 Credentials & Demo Testing

| Role | Email | Password | Admin Key | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@campusiq.edu` | `password123` | `ADMIN2024` | Or click **`⚡ Demo Admin`** |
| **Student** | `student@campusiq.edu` | `password123` | — | Or click **`⚡ Demo Student`** |
| **New Accounts** | Any valid email | 6+ chars | `ADMIN2024` (Admin only) | Syncs directly to Firebase & People directory |
