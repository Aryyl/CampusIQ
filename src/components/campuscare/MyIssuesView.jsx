import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  FileImage,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import { subscribeStudentIssues } from '../../services/campusCareService'

const STATUS_ORDER = ['Pending Review', 'Under Progress', 'Resolved', 'Rejected']

const STATUS_TONE = {
  'Pending Review': 'pending',
  'Under Progress': 'progress',
  Resolved: 'resolved',
  Rejected: 'rejected',
}

const PRIORITY_TONE = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
}

function formatDate(val) {
  if (!val) return '—'
  const d = val?.toDate ? val.toDate() : new Date(val)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(val) {
  if (!val) return '—'
  const d = val?.toDate ? val.toDate() : new Date(val)
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function MyIssuesView({ student, t, onRaiseIssue }) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // currently viewed ticket

  const uid = student?.uid || student?.id || ''
  const email = student?.email || ''

  useEffect(() => {
    if (!uid && !email) {
      setLoading(false)
      return
    }

    // Safeguard timeout: release loading state after 2.5s even if network is high-latency
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)

    const unsub = subscribeStudentIssues(
      uid,
      (data) => {
        clearTimeout(timer)
        setIssues(data)
        setLoading(false)
      },
      email
    )

    return () => {
      clearTimeout(timer)
      if (typeof unsub === 'function') unsub()
    }
  }, [uid, email])

  const filters = ['All', 'Pending Review', 'Under Progress', 'Resolved', 'Rejected']

  const filtered = issues.filter((issue) => {
    const matchFilter = filter === 'All' || issue.status === filter
    const matchSearch =
      !search ||
      issue.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
      issue.title?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (selected) {
    return (
      <TicketDetailView
        issue={selected}
        t={t}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="cc-my-issues-container">
      <div className="cc-my-issues-header">
        <div>
          <h2>{t('myIssuesTitle')}</h2>
          <p>{t('myIssuesSubtitle')}</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="cc-filter-pills">
        {filters.map((f) => (
          <button
            key={f}
            className={`cc-filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'All' ? t('filterAll')
              : f === 'Pending Review' ? t('filterPending')
              : f === 'Under Progress' ? t('filterProgress')
              : f === 'Resolved' ? t('filterResolved')
              : t('filterRejected')}
            {f !== 'All' && (
              <span className="cc-pill-count">
                {issues.filter((i) => i.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="cc-issues-search">
        <Search size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchIssues')}
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="cc-loading">
          <Loader2 size={22} className="cc-spin" /> Loading your issues...
        </div>
      ) : filtered.length === 0 ? (
        <div className="cc-empty-state">
          <AlertCircle size={32} />
          {issues.length === 0 ? (
            <>
              <strong>{t('noIssuesYet')}</strong>
              <p>{t('noIssuesDesc')}</p>
              <button className="cc-btn-primary" onClick={onRaiseIssue}>
                {t('raiseFirstIssue')}
              </button>
            </>
          ) : (
            <strong>{t('noMatchingIssues')}</strong>
          )}
        </div>
      ) : (
        <div className="cc-issue-cards">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} t={t} onClick={() => setSelected(issue)} />
          ))}
        </div>
      )}
    </div>
  )
}

function IssueCard({ issue, t, onClick }) {
  return (
    <button className="cc-issue-card" onClick={onClick}>
      <div className="cc-issue-card-top">
        <span className="cc-ticket-id-small">{issue.ticketId}</span>
        <div className="cc-badges">
          <span className={`cc-priority-badge ${PRIORITY_TONE[issue.priority] || 'medium'}`}>
            {issue.priority}
          </span>
          <span className={`cc-status-badge ${STATUS_TONE[issue.status] || 'pending'}`}>
            {issue.status}
          </span>
        </div>
      </div>
      <div className="cc-issue-card-body">
        <strong className="cc-issue-title">{issue.title}</strong>
        <div className="cc-issue-meta">
          <span>
            <MapPin size={12} /> {issue.location?.building || '—'}
            {issue.location?.room ? `, ${issue.location.room}` : ''}
          </span>
          <span>{issue.category}</span>
        </div>
      </div>
      <div className="cc-issue-card-footer">
        <span>
          <Clock size={12} /> {t('submittedOn')}: {formatDate(issue.createdAt)}
        </span>
        {issue.imageUrls?.length > 0 && (
          <span>
            <FileImage size={12} /> {issue.imageUrls.length} photo{issue.imageUrls.length !== 1 ? 's' : ''}
          </span>
        )}
        <ChevronRight size={14} className="cc-card-arrow" />
      </div>
    </button>
  )
}

// ─── Ticket Detail View ───────────────────────────────

const STEPPER_STEPS = ['Pending Review', 'Under Progress', 'Resolved']

function TicketDetailView({ issue, t, onBack }) {
  const [lightbox, setLightbox] = useState(null)

  const statusIndex = STEPPER_STEPS.indexOf(issue.status)
  const isRejected = issue.status === 'Rejected'

  return (
    <div className="cc-ticket-detail">
      <button className="cc-back-btn" onClick={onBack}>
        ← {t('myIssuesTitle')}
      </button>

      <div className="cc-detail-header">
        <div>
          <span className="cc-ticket-id-label">{issue.ticketId}</span>
          <h2>{issue.title}</h2>
          <div className="cc-detail-meta">
            <span>{issue.category}</span>
            <span>
              <MapPin size={13} /> {issue.location?.building}
              {issue.location?.floor ? `, ${issue.location.floor}` : ''}
              {issue.location?.room ? `, ${issue.location.room}` : ''}
            </span>
          </div>
        </div>
        <div className="cc-detail-badges">
          <span className={`cc-priority-badge ${PRIORITY_TONE[issue.priority] || 'medium'}`}>
            {issue.priority}
          </span>
          <span className={`cc-status-badge ${STATUS_TONE[issue.status] || 'pending'}`}>
            {issue.status}
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      {!isRejected && (
        <div className="cc-stepper">
          {STEPPER_STEPS.map((step, idx) => (
            <div key={step} className={`cc-step ${idx <= statusIndex ? 'done' : ''} ${idx === statusIndex ? 'current' : ''}`}>
              <div className="cc-step-dot">
                {idx < statusIndex ? <CheckCircle size={16} /> : <span>{idx + 1}</span>}
              </div>
              <span className="cc-step-label">
                {step === 'Pending Review' ? t('stepSubmitted')
                  : step === 'Under Progress' ? t('stepInProgress')
                  : t('stepResolved')}
              </span>
              {idx < STEPPER_STEPS.length - 1 && <div className="cc-step-line" />}
            </div>
          ))}
        </div>
      )}

      {isRejected && (
        <div className="cc-rejected-banner">
          <X size={16} /> {t('rejectedExplanation')}: {issue.adminRemarks || 'No explanation provided.'}
        </div>
      )}

      <div className="cc-detail-sections">
        {/* Description */}
        <div className="cc-detail-section">
          <h3>{t('originalDescription')}</h3>
          <div className="cc-description-box">
            <p>{issue.description}</p>
            <small>{t('submittedIn')}: {issue.language || 'English'}</small>
          </div>
        </div>

        {/* Photos */}
        {issue.imageUrls?.length > 0 && (
          <div className="cc-detail-section">
            <h3>{t('attachedPhotos')}</h3>
            <div className="cc-photo-gallery">
              {issue.imageUrls.map((url, i) => (
                <button key={i} className="cc-photo-thumb" onClick={() => setLightbox(url)}>
                  <img src={url} alt={`Photo ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Admin Remarks */}
        <div className="cc-detail-section">
          <h3>{t('adminRemarks')}</h3>
          <div className="cc-remarks-box">
            {issue.adminRemarks ? (
              <p>{issue.adminRemarks}</p>
            ) : (
              <p className="cc-empty-text">{t('noRemarks')}</p>
            )}
          </div>
        </div>

        {/* Resolution */}
        {issue.status === 'Resolved' && issue.resolutionDescription && (
          <div className="cc-detail-section">
            <h3>{t('resolutionDetails')}</h3>
            <div className="cc-remarks-box resolved">
              <p>{issue.resolutionDescription}</p>
            </div>
          </div>
        )}

        {/* Status History */}
        {issue.statusHistory?.length > 0 && (
          <div className="cc-detail-section">
            <h3>{t('statusHistory')}</h3>
            <div className="cc-history-timeline">
              {[...issue.statusHistory].reverse().map((entry, idx) => (
                <div key={idx} className="cc-history-entry">
                  <div className="cc-history-dot" />
                  <div className="cc-history-content">
                    <strong>{entry.status || entry.previousStatus + ' → ' + entry.newStatus}</strong>
                    {entry.remarks && <p>{entry.remarks}</p>}
                    <small>{entry.changedBy} · {formatDateTime(entry.changedAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Info */}
        <div className="cc-detail-section cc-detail-meta-info">
          <div>
            <small>{t('submittedOn')}</small>
            <span>{formatDateTime(issue.createdAt)}</span>
          </div>
          <div>
            <small>{t('lastUpdated')}</small>
            <span>{formatDateTime(issue.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="cc-lightbox" onClick={() => setLightbox(null)}>
          <button className="cc-lightbox-close" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <img src={lightbox} alt="Enlarged view" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

