import { useEffect, useState } from 'react'
import { Bell, Megaphone, X } from 'lucide-react'
import { subscribePublishedNotices } from '../../services/noticeService'
import NoticeDetailModal from './NoticeDetailModal'

const TABS = [
  { key: 'all', label: 'allNotices', fallback: 'All' },
  { key: 'Important', label: 'importantNotices', fallback: 'Important' },
  { key: 'Examinations', label: 'Examinations', fallback: 'Examinations' },
  { key: 'Admissions', label: 'Admissions', fallback: 'Admissions' },
  { key: 'Scholarships', label: 'Scholarships', fallback: 'Scholarships' },
  { key: 'Academic events', label: 'Academic Events', fallback: 'Academic Events' },
]

const PRIORITY_TONE = {
  Important: 'sn-priority-important',
  High: 'sn-priority-high',
  Normal: 'sn-priority-normal',
  Low: 'sn-priority-low',
}

function formatRelativeDate(value) {
  if (!value) return ''
  const d = value?.toDate ? value.toDate() : new Date(value)
  if (isNaN(d)) return ''
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatExpiryDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function StudentNoticesView({ student, t }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [dismissedBanners, setDismissedBanners] = useState([])

  useEffect(() => {
    const unsub = subscribePublishedNotices((items) => {
      setNotices(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Filter by student department — show 'All departments' notices + matching dept
  const studentDept = student?.department || ''
  const deptFiltered = notices.filter((n) =>
    !n.department || n.department === 'All departments' || n.department === studentDept
  )

  // Important notices for urgent banner (not dismissed)
  const urgentNotices = deptFiltered.filter(
    (n) => n.priority === 'Important' && !dismissedBanners.includes(n.id)
  )

  // Tab filter
  const tabFiltered = deptFiltered.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'Important') return n.priority === 'Important' || n.priority === 'High'
    return n.category === activeTab
  })

  // Search filter
  const searchQuery = search.trim().toLowerCase()
  const visible = tabFiltered.filter((n) => {
    if (!searchQuery) return true
    return [n.title, n.description, n.category].some((v) =>
      String(v || '').toLowerCase().includes(searchQuery)
    )
  })

  return (
    <div className="student-notices-view">
      {/* Urgent banners */}
      {urgentNotices.map((n) => (
        <div key={n.id} className="sn-urgent-banner" onClick={() => setSelectedNotice(n)}>
          <div className="sn-urgent-inner">
            <Megaphone size={16} className="sn-urgent-icon" />
            <span className="sn-urgent-label">{t('urgentNoticeLabel') || 'Important Notice'}</span>
            <span className="sn-urgent-title">{n.title}</span>
          </div>
          <button
            className="sn-urgent-dismiss"
            aria-label="Dismiss"
            onClick={(e) => { e.stopPropagation(); setDismissedBanners((prev) => [...prev, n.id]) }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <div className="sn-header">
        <div>
          <p className="sn-eyebrow"><span className="live-dot" /> {t('noticesSubtitle') || 'Official Announcements'}</p>
          <h2 className="sn-title">{t('noticesSection') || 'Notice Board'}</h2>
          <p className="sn-subtitle">{t('noticesDesc') || 'Stay informed with official university announcements and circulars.'}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="sn-search-row">
        <input
          className="sn-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notices..."
          aria-label="Search notices"
        />
      </div>

      {/* Tabs */}
      <div className="sn-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`sn-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.label) || tab.fallback}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="sn-loading">Loading notices...</div>
      ) : visible.length === 0 ? (
        <div className="sn-empty">
          <Bell size={36} className="sn-empty-icon" />
          <p>{t('noNotices') || 'No notices published yet.'}</p>
        </div>
      ) : (
        <div className="sn-cards">
          {visible.map((n) => (
            <button
              key={n.id}
              className="sn-card"
              onClick={() => setSelectedNotice(n)}
              aria-label={`Read notice: ${n.title}`}
            >
              <div className="sn-card-top">
                <span className={`sn-priority-badge ${PRIORITY_TONE[n.priority] || 'sn-priority-normal'}`}>
                  {n.priority}
                </span>
                <span className="sn-card-category">{n.category}</span>
              </div>
              <h3 className="sn-card-title">{n.title}</h3>
              <p className="sn-card-excerpt">{n.description?.slice(0, 140)}{n.description?.length > 140 ? '…' : ''}</p>
              <div className="sn-card-meta">
                <span>{t('publishedOn') || 'Published'}: {formatRelativeDate(n.createdAt)}</span>
                {n.expiryDate && <span>{t('expiresOn') || 'Expires'}: {formatExpiryDate(n.expiryDate)}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedNotice && (
        <NoticeDetailModal notice={selectedNotice} t={t} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  )
}
