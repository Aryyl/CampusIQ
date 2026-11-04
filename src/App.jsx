import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PeoplePage from './pages/PeoplePage'
import DocumentsPage from './pages/DocumentsPage'
import NoticesPage from './pages/NoticesPage'
import DeadlinesPage from './pages/DeadlinesPage'
import EventsPage from './pages/EventsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import ActivityPage from './pages/ActivityPage'
import IssuesPage from './pages/IssuesPage'
import StudentApp from './StudentApp'
import AuthPage from './pages/AuthPage'
import { useCampusData } from './context/CampusDataContext'
import { formatDate, formatFileSize, formatShortDate } from './utils/formatters'
import { clearCurrentSession } from './services/authService'
import { markAllAsRead, markAsRead, subscribeNotifications } from './services/notificationService'

const navItems = [
  { label: 'Dashboard', page: 'Overview', icon: LayoutDashboard },
  { label: 'People', page: 'Students', icon: Users },
  { label: 'Documents', icon: FileText },
  { label: 'Notices', icon: Bell },
  { label: 'Events', icon: CalendarDays },
  { label: 'Analytics', icon: TrendingUp },
  { label: 'Issues', icon: AlertCircle },
]
const stats = [
  { label: 'Total documents', value: '248', change: '+12.4%', icon: FileText, tone: 'mint' },
  { label: 'Published notices', value: '36', change: '+8.2%', icon: Bell, tone: 'cream' },
  { label: 'Upcoming events', value: '12', change: '3 this week', icon: CalendarDays, tone: 'lavender' },
  { label: 'Student queries', value: '1,284', change: '+18.7%', icon: Sparkles, tone: 'blue' },
]

const activityItems = [
  { title: 'Examination Regulations 2024', meta: 'Document indexed · 4 min ago', type: 'document', color: 'green' },
  { title: 'End Semester Examination Notice', meta: 'Notice published · 28 min ago', type: 'notice', color: 'orange' },
  { title: 'Scholarship application deadline', meta: 'Deadline updated · 1 hour ago', type: 'calendar', color: 'purple' },
  { title: 'Academic Calendar 2024–25', meta: 'Document uploaded · 2 hours ago', type: 'document', color: 'blue' },
]

const queryData = [
  { day: 'Mon', queries: 126 },
  { day: 'Tue', queries: 164 },
  { day: 'Wed', queries: 142 },
  { day: 'Thu', queries: 212 },
  { day: 'Fri', queries: 187 },
  { day: 'Sat', queries: 236 },
  { day: 'Sun', queries: 217 },
]

const pageDetails = {
  Documents: {
    eyebrow: 'Knowledge base',
    title: 'Document management',
    description: 'Upload, organise and monitor the university documents powering CampusIQ answers.',
    action: 'Upload document',
    icon: BookOpen,
    stats: [['248', 'total documents'], ['232', 'indexed'], ['11', 'processing'], ['5', 'failed']],
  },
  Notices: {
    eyebrow: 'Stay informed',
    title: 'Notice management',
    description: 'Publish clear, timely announcements for every student and department.',
    action: 'Create notice',
    icon: Bell,
    stats: [['36', 'published'], ['4', 'drafts'], ['8', 'this month'], ['2', 'expiring soon']],
  },
  Deadlines: {
    eyebrow: 'Plan ahead',
    title: 'Academic deadlines',
    description: 'Keep important university dates visible, organised and connected to their source notices.',
    action: 'Add deadline',
    icon: CalendarDays,
    stats: [['12', 'active deadlines'], ['3', 'this week'], ['6', 'examination'], ['2', 'scholarship']],
  },
  Events: {
    eyebrow: 'Campus life',
    title: 'Events management',
    description: 'Create, publish and manage campus events for targeted student audiences.',
    action: 'Create event',
    icon: CalendarDays,
    stats: [['0', 'total events'], ['0', 'published'], ['0', 'upcoming'], ['0', 'this week']],
  },
  Students: {
    eyebrow: 'Community',
    title: 'Student management',
    description: 'View registered students and understand the university community at a glance.',
    action: 'Export students',
    icon: Users,
    stats: [['4,286', 'registered'], ['4,102', 'active accounts'], ['18', 'departments'], ['96%', 'profile completion']],
  },
  Analytics: {
    eyebrow: 'AI assistant',
    title: 'Query analytics',
    description: 'Understand how students use CampusIQ and identify the questions that need better answers.',
    action: 'Export report',
    icon: Sparkles,
    stats: [['1,284', 'queries this week'], ['82%', 'answered'], ['68%', 'English'], ['32%', 'Assamese']],
  },
  Settings: {
    eyebrow: 'Administration',
    title: 'Workspace settings',
    description: 'Manage your administrator profile, preferences and notification settings.',
    action: 'Save changes',
    icon: Settings,
    stats: [['1', 'administrator'], ['2', 'notifications'], ['EN', 'default language'], ['Active', 'account status']],
  },
  Activity: {
    eyebrow: 'Live feed',
    title: 'Administrative activity',
    description: 'Review the latest document, notice and deadline changes across the CampusIQ workspace.',
    action: 'Export activity',
    icon: Clock3,
    stats: [['28', 'events today'], ['12', 'document events'], ['9', 'notice events'], ['7', 'admin actions']],
  },
}

function App() {
  // Always begin at authentication on a fresh page load. The authenticated
  // user remains in React state until logout or the page is refreshed.
  const [currentUser, setCurrentUser] = useState(null)
  const [activeNav, setActiveNav] = useState('Overview')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
    notify(`Welcome back, ${user.name}!`)
  }

  const handleLogout = () => {
    clearCurrentSession()
    setCurrentUser(null)
    setProfileOpen(false)
    setNotificationsOpen(false)
    notify('Successfully signed out.')
  }

  const handleNav = (label) => {
    setActiveNav(label)
    setProfileOpen(false)
    setNotificationsOpen(false)
  }

  // When no session exists, render login page
  if (!currentUser) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <AuthPage onLogin={handleLogin} notify={notify} />
        {toast && (
          <div className="toast">
            <CircleCheck size={17} /> {toast}
            <button onClick={() => setToast('')} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    )
  }

  // Student accounts go directly to the dedicated chat experience.
  // Administrator accounts continue into the existing Admin Dashboard.
  if (currentUser.role === 'student') {
    return <StudentApp />
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <main className="dashboard-container">
        <Navigation
          currentUser={currentUser}
          onLogout={handleLogout}
          activeNav={activeNav}
          onNavigate={handleNav}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          notify={notify}
        />

        {activeNav === 'Overview' ? (
          <OverviewPage currentUser={currentUser} onNavigate={handleNav} notify={notify} />
        ) : (
          <WorkspacePage page={activeNav} notify={notify} onNavigate={handleNav} currentUser={currentUser} />
        )}

        <footer className="dashboard-footer">
          <span>
            <span className="footer-mark">✦</span> CampusIQ {currentUser?.role === 'admin' ? 'Administration' : 'Student Portal'}
          </span>
          <span>All systems operational <CircleCheck size={14} /></span>
        </footer>
      </main>

      {toast && (
        <div className="toast">
          <CircleCheck size={17} /> {toast}
          <button onClick={() => setToast('')} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

function OverviewPage({ currentUser, onNavigate, notify }) {
  const { students, documents, notices, deadlines, activities, analytics, stats: dashboardStats, loading } = useCampusData()
  const overviewStats = [
    { label: 'Total documents', value: dashboardStats.totalDocuments, change: `${dashboardStats.indexedDocuments} indexed`, icon: FileText, tone: 'mint' },
    { label: 'Published notices', value: dashboardStats.publishedNotices, change: `${notices.filter((notice) => notice.status === 'Draft').length} drafts`, icon: Bell, tone: 'cream' },
    { label: 'Upcoming events', value: dashboardStats.activeDeadlines, change: `${deadlines.filter((deadline) => daysUntil(deadline.dueDate) >= 0 && daysUntil(deadline.dueDate) <= 7).length} this week`, icon: CalendarDays, tone: 'lavender' },
    { label: 'Student queries', value: dashboardStats.totalQueries, change: `${dashboardStats.unansweredQueries} unanswered`, icon: Sparkles, tone: 'blue' },
  ]
  return <>
    <section className="hero-section">
      <div>
        <p className="eyebrow"><span className="live-dot" /> Tuesday, 03 September 2024</p>
        <h1>Welcome back, <span>{currentUser?.role === 'admin' ? 'Administrator.' : `${currentUser?.name || 'Student'}.`}</span></h1>
        <p className="hero-subtitle">
          {currentUser?.role === 'admin'
            ? "Here's what's happening across your university today."
            : `Here is your academic overview for ${currentUser?.department || 'your department'}.`}
        </p>
      </div>
      <button className="hero-search" onClick={() => notify('Search will be connected to your university data.') }>
        <Search size={18} strokeWidth={1.8} />
        <span>Search anything</span>
        <kbd>⌘ K</kbd>
      </button>
    </section>

    <section className="stats-row" aria-label="CampusIQ statistics">
      {overviewStats.map((stat) => <StatCard key={stat.label} {...stat} onClick={() => onNavigate(stat.label === 'Total documents' ? 'Documents' : stat.label === 'Published notices' ? 'Notices' : stat.label === 'Upcoming events' ? 'Events' : 'Analytics')} />)}
    </section>

    <section className="dashboard-grid">
      <DocumentCard documents={documents} stats={dashboardStats} onNavigate={onNavigate} notify={notify} loading={loading} />
      <NoticeCard notices={notices} stats={dashboardStats} onNavigate={onNavigate} notify={notify} loading={loading} />
      <CalendarCard deadlines={deadlines} onNavigate={onNavigate} notify={notify} />
      <AnalyticsCard analytics={analytics} onNavigate={onNavigate} />
      <StudentCard students={students} onNavigate={onNavigate} />
      <ActivityCard activities={activities} onNavigate={onNavigate} />
    </section>
  </>
}

function daysUntil(value) {
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date - today) / 86400000)
}

function WorkspacePage({ page, notify, onNavigate, currentUser }) {
  if (page === 'Students') return <PeoplePage notify={notify} />
  if (page === 'Documents') return <DocumentsPage notify={notify} />
  if (page === 'Notices') return <NoticesPage notify={notify} />
  if (page === 'Events') return <EventsPage notify={notify} currentUser={currentUser} />
  if (page === 'Deadlines') return <DeadlinesPage notify={notify} />
  if (page === 'Analytics') return <AnalyticsPage notify={notify} />
  if (page === 'Settings') return <SettingsPage notify={notify} />
  if (page === 'Activity') return <ActivityPage notify={notify} />
  if (page === 'Issues') return <IssuesPage notify={notify} currentUser={currentUser} />
  const details = pageDetails[page] || pageDetails.Documents
  const Icon = details.icon

  return <section className="workspace-page">
    <div className="workspace-heading">
      <div>
        <button className="back-link" onClick={() => onNavigate('Overview')}><ArrowUpRight size={14} /> Back to overview</button>
        <p className="eyebrow workspace-eyebrow"><span className="live-dot" /> {details.eyebrow}</p>
        <h1>{details.title}</h1>
        <p className="hero-subtitle">{details.description}</p>
      </div>
      <button className="workspace-action" onClick={() => notify(`${details.action} will be connected to the ${page.toLowerCase()} service.`)}><Plus size={16} /> {details.action}</button>
    </div>
    <div className="workspace-stats">
      {details.stats.map(([value, label]) => <div className="workspace-stat" key={`${value}-${label}`}><strong>{value}</strong><span>{label}</span></div>)}
    </div>
    <div className="workspace-content-grid">
      <article className="workspace-panel workspace-panel-wide">
        <div className="workspace-panel-heading"><div><div className="card-eyebrow"><Icon size={15} /> {details.eyebrow}</div><h2>{page === 'Documents' ? 'Document processing queue' : page === 'Analytics' ? 'Query activity overview' : `Recent ${page.toLowerCase()}`}</h2></div><button className="circle-action" onClick={() => notify(`Viewing all ${page.toLowerCase()}.`)}><ArrowUpRight size={17} /></button></div>
        <div className="workspace-empty"><span className="workspace-empty-icon"><Icon size={22} /></span><strong>{page} workspace prepared</strong><span>The reusable layout is ready for the full management module.</span><button className="text-link" onClick={() => notify(`${details.action} flow selected.`)}>{details.action} <ArrowUpRight size={15} /></button></div>
      </article>
      <article className="workspace-panel workspace-panel-side"><div className="card-eyebrow"><CircleCheck size={15} /> Ready for integration</div><h2>Built for CampusIQ</h2><p>This page keeps the approved Overview design language, spacing and interaction patterns.</p><div className="integration-list"><span><CircleCheck size={14} /> Firebase-ready service boundary</span><span><CircleCheck size={14} /> Responsive card layout</span><span><CircleCheck size={14} /> Consistent admin navigation</span></div></article>
    </div>
  </section>
}

function Navigation({ currentUser, onLogout, activeNav, onNavigate, notificationsOpen, setNotificationsOpen, profileOpen, setProfileOpen, notify }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const unsub = subscribeNotifications({ role: 'admin' }, (items) => {
      setNotifications(items)
    })
    return () => unsub()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const navigate = (page) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markAsRead(item.id)
    }
    setNotificationsOpen(false)
    if (item.linkType === 'issue' || item.type === 'new_issue') {
      navigate('Issues')
    } else if (item.linkType === 'event' || item.type === 'new_event') {
      navigate('Events')
    } else if (item.linkType === 'notice') {
      navigate('Notices')
    } else {
      navigate('Overview')
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length) {
      await markAllAsRead(unreadIds)
      notify('All notifications marked as read.')
    }
  }

  return (
    <header className={`top-nav-bar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="nav-brand-section">
        <button className="brand-outline-pill" onClick={() => navigate('Overview')} aria-label="CampusIQ dashboard">
          <span>CampusIQ</span>
        </button>
      </div>

      <div className="nav-main-cluster">
        <nav className="nav-segmented-track" aria-label="Primary navigation">
          {navItems.map(({ label, page = label }) => (
            <button
              className={`nav-segment-item ${activeNav === page ? 'active' : ''}`}
              key={label}
              onClick={() => navigate(page)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="nav-utilities-cluster">
          <button
            className={`nav-action-capsule ${activeNav === 'Settings' ? 'active' : ''}`}
            onClick={() => navigate('Settings')}
            aria-label="Settings"
          >
            <Settings size={14} strokeWidth={1.8} />
            <span>Setting</span>
          </button>

          <div className="popover-wrap">
            <button
              className={`nav-action-circle notification-circle ${notificationsOpen ? 'selected' : ''}`}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
              }}
              aria-label="Notifications"
            >
              <Bell size={15} strokeWidth={1.8} />
              {unreadCount > 0 && <span className="notification-amber-dot" />}
            </button>
            {notificationsOpen && (
              <div className="popover notification-popover">
                <div className="popover-heading">
                  <strong>Notifications</strong>
                  <span>{unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}</span>
                </div>
                <div className="notification-list-scroll">
                  {notifications.length === 0 ? (
                    <p className="notification-empty">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 8).map((item) => {
                      const isUnread = !item.read
                      const isIssue = item.type === 'new_issue' || item.linkType === 'issue'
                      const isEvent = item.type === 'new_event' || item.linkType === 'event'
                      return (
                        <div
                          key={item.id}
                          className={`notification-item ${isUnread ? 'is-unread' : ''}`}
                          onClick={() => handleNotificationClick(item)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className={`mini-icon ${isIssue ? 'orange' : isEvent ? 'purple' : 'green'}`}>
                            {isIssue ? <AlertCircle size={14} /> : isEvent ? <CalendarDays size={14} /> : <Bell size={14} />}
                          </span>
                          <div className="notification-item-text">
                            <strong>{item.title || 'Campus alert'}</strong>
                            <small>{item.message}</small>
                          </div>
                          {isUnread && <span className="unread-dot" />}
                        </div>
                      )
                    })
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="popover-link" onClick={handleMarkAllRead}>
                    Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="popover-wrap profile-wrap">
            <button
              className={`nav-action-circle profile-circle ${profileOpen ? 'selected' : ''}`}
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationsOpen(false)
              }}
              aria-label="Open user profile"
            >
              <User size={15} strokeWidth={1.8} />
            </button>
            {profileOpen && (
              <div className="popover profile-popover">
                <div className="profile-popover-head">
                  <span className="avatar large">{currentUser?.avatar || 'U'}</span>
                  <div>
                    <strong>{currentUser?.name || 'Administrator'}</strong>
                    <small>
                      {currentUser?.role === 'admin'
                        ? currentUser?.department || 'University Administrator'
                        : `Student · ${currentUser?.department || 'Undergraduate'}`}
                    </small>
                  </div>
                </div>
                {currentUser?.role === 'admin' && (
                  <button onClick={() => navigate('Settings')}>
                    Account settings <ArrowUpRight size={14} />
                  </button>
                )}
                <button onClick={onLogout}>
                  Sign out <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-links">
            {navItems.map(({ label, page = label }) => (
              <button
                key={label}
                className={`mobile-nav-item ${activeNav === page ? 'active' : ''}`}
                onClick={() => navigate(page)}
              >
                {label}
              </button>
            ))}
            <button
              className={`mobile-nav-item ${activeNav === 'Settings' ? 'active' : ''}`}
              onClick={() => navigate('Settings')}
            >
              Setting
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

function StatCard({ label, value, change, icon: Icon, tone, onClick }) {
  return <button className={`stat-card ${tone}`} onClick={onClick}><div className="stat-top"><span className="stat-icon"><Icon size={17} /></span><span className="stat-trend"><TrendingUp size={12} /> {change}</span></div><strong>{value}</strong><span>{label}</span></button>
}

function CardHeader({ eyebrow, title, icon: Icon, action, onAction }) {
  return <div className="card-header"><div><div className="card-eyebrow">{Icon && <Icon size={15} />} {eyebrow}</div><h2>{title}</h2></div>{action && <button className="circle-action" onClick={() => onAction?.(action)} aria-label={action}><ArrowUpRight size={17} /></button>}</div>
}

function DocumentCard({ documents = [], stats, onNavigate, notify, loading }) {
  const recentDocument = [...documents].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0]
  return <article className="bento-card document-card">
    <CardHeader eyebrow="Knowledge base" title="Document management" icon={BookOpen} action="Open documents" onAction={() => onNavigate('Documents')} />
    <div className="document-stat"><strong>{loading ? '—' : stats.totalDocuments}</strong><span><TrendingUp size={14} /> {stats.indexedDocuments} indexed</span></div>
    <div className="document-progress"><div><span>Indexing health</span><strong>{stats.totalDocuments ? Math.round((stats.indexedDocuments / stats.totalDocuments) * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${stats.totalDocuments ? (stats.indexedDocuments / stats.totalDocuments) * 100 : 0}%` }} /></div></div>
    <div className="document-statuses"><DocumentStatus label="Indexed" value={stats.indexedDocuments} tone="indexed" /><DocumentStatus label="Processing" value={stats.processingDocuments} tone="processing" /><DocumentStatus label="Failed" value={stats.failedDocuments} tone="failed" /></div>
    <div className="document-preview"><span className="pdf-icon">PDF</span><div><strong>{recentDocument?.title || 'No documents yet'}</strong><small>{recentDocument ? `${recentDocument.processingStatus} · ${formatFileSize(recentDocument.fileSize)} · ${recentDocument.language}` : 'Upload a PDF to get started'}</small></div>{recentDocument && <CircleCheck size={18} />}</div>
    <button className="card-cta" onClick={() => onNavigate('Documents')}><Upload size={16} /> Upload a new document <ArrowUpRight size={15} /></button>
  </article>
}

function DocumentStatus({ label, value, tone }) {
  return <div className="document-status"><span className={`status-dot ${tone}`} /><div><strong>{value}</strong><small>{label}</small></div></div>
}

function NoticeCard({ notices = [], stats, onNavigate, notify, loading }) {
  const recentNotices = notices.filter((notice) => notice.status === 'Published').sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)).slice(0, 2)
  return <article className="bento-card notice-card">
    <CardHeader eyebrow="Stay informed" title="Notice board" icon={Bell} action="Open notices" onAction={() => onNavigate('Notices')} />
    <div className="notice-number"><strong>{loading ? '—' : stats.publishedNotices}</strong><span>published<br />notices</span></div>
    <div className="notice-list">{recentNotices.length ? recentNotices.map((notice) => <NoticePreview key={notice.id} tag={notice.priority} title={notice.title} meta={`Published ${formatShortDate(notice.publicationDate)} · ${notice.category}`} />) : <NoticePreview tag="Empty" title="No published notices" meta="Create a notice to display it here" />}</div>
    <button className="text-link" onClick={() => onNavigate('Notices')}>Publish a notice <ArrowUpRight size={15} /></button>
  </article>
}

function NoticePreview({ tag, title, meta }) {
  return <div className="notice-highlight"><span className="priority-tag">{tag}</span><strong>{title}</strong><small>{meta}</small></div>
}

function CalendarCard({ deadlines = [], onNavigate, notify }) {
  const today = new Date()
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10))
  const upcoming = deadlines.filter((deadline) => daysUntil(deadline.dueDate) >= 0).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 2)
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const mondayOffset = (firstDay + 6) % 7
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - mondayOffset + 1
    const date = new Date(month.getFullYear(), month.getMonth(), day, 12)
    return { date, currentMonth: day > 0 && day <= totalDays }
  })
  const eventDates = new Set(deadlines.map((deadline) => new Date(deadline.dueDate).toISOString().slice(0, 10)))
  return <article className="bento-card calendar-card">
    <CardHeader eyebrow="Campus life" title="Events & calendar" icon={CalendarDays} action="Open events" onAction={() => onNavigate('Events')} />
    <div className="calendar-date"><button onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Previous month"><ChevronDown size={15} className="calendar-prev" /></button><div><strong>{month.toLocaleDateString('en-IN', { month: 'long' })}</strong><span>{month.getFullYear()}</span></div><button onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Next month"><ChevronDown size={15} className="calendar-next" /></button></div>
    <div className="mini-calendar"><div className="weekdays"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div className="calendar-days">{monthDays.map(({ date, currentMonth }) => { const key = date.toISOString().slice(0, 10); return <button className={`dashboard-calendar-day ${currentMonth ? '' : 'muted'} ${key === selectedDate ? 'today' : ''} ${eventDates.has(key) ? 'has-event' : ''}`} key={key} onClick={() => { setSelectedDate(key); notify(`Calendar date selected: ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`) }}>{date.getDate()}</button> })}</div></div>
    <div className="deadline-list">{upcoming.length ? upcoming.map((deadline, index) => <Deadline key={deadline.id} date={formatShortDate(deadline.dueDate)} title={deadline.title} tone={index === 0 ? 'green' : 'orange'} />) : <div className="calendar-empty-copy">No upcoming deadlines</div>}</div>
  </article>
}

function Deadline({ date, title, tone }) {
  return <div className="deadline"><span className={`deadline-date ${tone}`}>{date}</span><span>{title}</span><ArrowUpRight size={14} /></div>
}

function AnalyticsCard({ analytics = [], onNavigate }) {
  const recentQueries = analytics.filter((query) => daysUntil(query.askedAt) >= -7)
  const chartData = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = date.toISOString().slice(0, 10); return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), queries: recentQueries.filter((query) => query.askedAt.slice(0, 10) === key).length } })
  return <article className="bento-card analytics-card">
    <CardHeader eyebrow="AI assistant" title="Query analytics" icon={Sparkles} action="Open analytics" onAction={() => onNavigate('Analytics')} />
    <div className="analytics-stat"><div><strong>{analytics.length}</strong><span><TrendingUp size={13} /> sample</span></div><small>sample student queries</small></div>
    <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 0, left: -26, bottom: 0 }}><defs><linearGradient id="queryFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6d9b78" stopOpacity={0.34} /><stop offset="100%" stopColor="#6d9b78" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#87988b', fontSize: 10 }} /><YAxis hide domain={[0, Math.max(5, ...chartData.map((item) => item.queries))]} /><Tooltip cursor={{ stroke: '#bdd5b7' }} contentStyle={{ border: '0', borderRadius: '12px', boxShadow: '0 8px 25px #20382c1a', fontSize: '12px' }} /><Area type="monotone" dataKey="queries" stroke="#4e8c62" strokeWidth={2.5} fill="url(#queryFill)" /></AreaChart></ResponsiveContainer></div>
    <button className="text-link" onClick={() => onNavigate('Analytics')}>View full report <ArrowUpRight size={15} /></button>
  </article>
}

function StudentCard({ students = [], onNavigate }) {
  const departmentCounts = [...students.reduce((map, student) => { map.set(student.department, (map.get(student.department) || 0) + 1); return map }, new Map())].sort((a, b) => b[1] - a[1]).slice(0, 3)
  const total = students.length || 1
  return <article className="bento-card student-card">
    <CardHeader eyebrow="Community" title="Student overview" icon={Users} action="Open students" onAction={() => onNavigate('Students')} />
    <div className="student-total"><strong>{students.length}</strong><span>registered students</span></div>
    <div className="student-avatars"><span className="avatar student-a">RS</span><span className="avatar student-b">MN</span><span className="avatar student-c">PD</span><span className="avatar student-d">+</span><span className="student-caption">+4.8% this semester</span></div>
    <div className="departments">{departmentCounts.map(([department, count], index) => <div key={department}><span><i className={`dot ${index === 0 ? 'dot-green' : index === 1 ? 'dot-dark' : 'dot-soft'}`} /> {department}</span><strong>{Math.round((count / total) * 100)}%</strong></div>)}</div>
  </article>
}

function ActivityCard({ activities = [], onNavigate }) {
  const recentActivities = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
  return <article className="bento-card activity-card">
    <div className="activity-heading"><div><div className="card-eyebrow"><Clock3 size={15} /> Live feed</div><h2>Recent activity</h2></div><button className="more-button" onClick={() => onNavigate('Activity')} aria-label="More activity options"><MoreHorizontal size={19} /></button></div>
    <div className="activity-list">{recentActivities.map((item) => <div className="activity-item" key={item.id}><span className={`activity-icon ${item.type === 'document' ? 'green' : item.type === 'notice' ? 'orange' : item.type === 'deadline' ? 'purple' : 'blue'}`}>{item.type === 'document' ? <FileText size={15} /> : item.type === 'notice' ? <Bell size={15} /> : item.type === 'deadline' ? <CalendarDays size={15} /> : <Users size={15} />}</span><div><strong>{item.title}</strong><small>{item.description} · {formatShortDate(item.createdAt)}</small></div><ArrowUpRight size={14} /></div>)}</div>
    <button className="activity-footer" onClick={() => onNavigate('Activity')}>View all activity <ArrowUpRight size={15} /></button>
  </article>
}

export default App
