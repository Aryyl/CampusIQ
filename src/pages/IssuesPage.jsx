import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileImage,
  Loader2,
  MapPin,
  Save,
  X,
} from 'lucide-react'
import {
  EmptyState,
  PageStatStrip,
  Pagination,
  SearchFilters,
} from '../components/ManagementUI'
import { subscribeAllIssues, updateIssue } from '../services/campusCareService'

const PAGE_SIZE = 8

const STATUS_OPTIONS = ['Pending Review', 'Under Progress', 'Resolved', 'Rejected']
const PRIORITY_OPTIONS = ['Critical', 'High', 'Medium', 'Low']
const CATEGORY_OPTIONS = [
  'Electrical Problems',
  'Plumbing and Water Supply',
  'Infrastructure Damage',
  'Laboratory Equipment',
  'Sanitation and Cleanliness',
  'Furniture and Facilities',
  'Internet and Network',
  'Other',
]
const DEPT_OPTIONS = [
  'Electrical Maintenance',
  'Plumbing & Civil',
  'IT & Network',
  'Sanitation',
  'Facilities',
  'Other',
]

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
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function IssuesPage({ notify, currentUser }) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const unsub = subscribeAllIssues((data) => {
      setIssues(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Stats
  const total = issues.length
  const pending = issues.filter((i) => i.status === 'Pending Review').length
  const inProgress = issues.filter((i) => i.status === 'Under Progress').length
  const resolved = issues.filter((i) => i.status === 'Resolved').length
  const highCritical = issues.filter((i) => i.priority === 'Critical' || i.priority === 'High').length

  const stats = [
    { value: total, label: 'Total Complaints' },
    { value: pending, label: 'Pending Review', tone: 'amber' },
    { value: inProgress, label: 'Under Progress', tone: 'blue' },
    { value: resolved, label: 'Resolved', tone: 'green' },
    { value: highCritical, label: 'High / Critical', tone: 'red' },
  ]

  // Filter & search
  const filtered = issues.filter((issue) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      issue.ticketId?.toLowerCase().includes(q) ||
      issue.studentName?.toLowerCase().includes(q) ||
      issue.title?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || issue.status === filterStatus
    const matchCat = !filterCategory || issue.category === filterCategory
    const matchPri = !filterPriority || issue.priority === filterPriority
    return matchSearch && matchStatus && matchCat && matchPri
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortField]
    let bv = b[sortField]
    if (sortField === 'createdAt') {
      av = av?.toDate ? av.toDate() : new Date(av || 0)
      bv = bv?.toDate ? bv.toDate() : new Date(bv || 0)
    }
    if (sortField === 'priority') {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      av = order[av] ?? 4
      bv = order[bv] ?? 4
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const hasFilters = !!(filterStatus || filterCategory || filterPriority)

  return (
    <section className="workspace-page">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow workspace-eyebrow">
            <span className="live-dot" /> CampusCare
          </p>
          <h1>Issue Management</h1>
          <p className="hero-subtitle">
            Review, prioritise and resolve campus complaints submitted by students.
          </p>
        </div>
      </div>

      <PageStatStrip stats={stats} />

      <div className="module-content">
        <SearchFilters
          search={search}
          onSearch={(v) => {
            setSearch(v)
            setPage(1)
          }}
          hasFilters={hasFilters}
          onClear={() => {
            setFilterStatus('')
            setFilterCategory('')
            setFilterPriority('')
          }}
        >
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(1)
            }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value)
              setPage(1)
            }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value)
              setPage(1)
            }}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </SearchFilters>

        {loading ? (
          <div className="data-loading">
            <Loader2 size={20} className="cc-spin" /> Loading issues...
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No issues found"
            description={
              hasFilters || search
                ? 'Try adjusting your filters or search.'
                : 'No campus issues have been submitted yet.'
            }
          />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th
                    className="sortable-th"
                    onClick={() => toggleSort('priority')}
                  >
                    Priority{' '}
                    {sortField === 'priority' ? (
                      sortDir === 'asc' ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )
                    ) : null}
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Submitted{' '}
                    {sortField === 'createdAt' ? (
                      sortDir === 'asc' ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )
                    ) : null}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <code className="ticket-code">{issue.ticketId}</code>
                    </td>
                    <td>
                      <div className="cell-name">
                        <strong>{issue.studentName}</strong>
                        <small>{issue.registrationNumber || issue.studentEmail}</small>
                      </div>
                    </td>
                    <td className="cell-title">{issue.title}</td>
                    <td>
                      <small>{issue.category}</small>
                    </td>
                    <td>
                      <small>
                        <MapPin size={11} /> {issue.location?.building}
                        {issue.location?.room ? `, ${issue.location.room}` : ''}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`admin-priority-badge priority-${PRIORITY_TONE[issue.priority] || 'medium'}`}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td>
                      <small>{formatDate(issue.createdAt)}</small>
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge status-${STATUS_TONE[issue.status] || 'pending'}`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-action-btn"
                        onClick={() => setSelected(issue)}
                      >
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      </div>

      {selected && (
        <AdminIssueModal
          issue={selected}
          currentUser={currentUser}
          onClose={() => setSelected(null)}
          onSaved={(ticketId) => {
            notify(`Issue ${ticketId} updated successfully.`)
            setSelected(null)
          }}
        />
      )}
    </section>
  )
}

// ─── Admin Issue Modal ──────────────────────────────────────

function AdminIssueModal({ issue, currentUser, onClose, onSaved }) {
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [dept, setDept] = useState(issue.assignedDepartment || '')
  const [adminRemarks, setAdminRemarks] = useState(issue.adminRemarks || '')
  const [resolution, setResolution] = useState(issue.resolutionDescription || '')
  const [internalNotes, setInternalNotes] = useState(issue.internalNotes || '')
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateIssue(
        issue.id,
        issue,
        {
          status,
          priority,
          assignedDepartment: dept || null,
          adminRemarks,
          resolutionDescription: resolution,
          internalNotes,
        },
        { name: currentUser?.name || 'Administrator', email: currentUser?.email }
      )
      onSaved(issue.ticketId)
    } catch (err) {
      console.error('Failed to update issue:', err)
      alert('Update failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal-card modal-wide admin-issue-modal" role="dialog" aria-modal="true">
        <div className="modal-heading">
          <div>
            <span className="card-eyebrow">CampusCare</span>
            <h2>{issue.ticketId} — {issue.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="modal-body admin-issue-body">
          {/* ── Left: Issue Info ── */}
          <div className="admin-issue-left">
            {/* Student Info */}
            <div className="admin-info-card">
              <h3 className="admin-section-title">Student Information</h3>
              <div className="admin-info-row">
                <span>Name</span>
                <strong>{issue.studentName}</strong>
              </div>
              <div className="admin-info-row">
                <span>Registration</span>
                <strong>{issue.registrationNumber || '—'}</strong>
              </div>
              <div className="admin-info-row">
                <span>Email</span>
                <strong>{issue.studentEmail || '—'}</strong>
              </div>
              <div className="admin-info-row">
                <span>Department</span>
                <strong>{issue.department || '—'}</strong>
              </div>
            </div>

            {/* Issue Info */}
            <div className="admin-info-card">
              <h3 className="admin-section-title">Complaint Information</h3>
              <div className="admin-info-row">
                <span>Category</span>
                <strong>{issue.category}</strong>
              </div>
              <div className="admin-info-row">
                <span>Location</span>
                <strong>
                  {issue.location?.building}
                  {issue.location?.floor ? `, ${issue.location.floor}` : ''}
                  {issue.location?.room ? `, ${issue.location.room}` : ''}
                </strong>
              </div>
              <div className="admin-info-row">
                <span>Language</span>
                <strong>{issue.language || 'English'}</strong>
              </div>
              <div className="admin-info-row">
                <span>Submitted</span>
                <strong>{formatDateTime(issue.createdAt)}</strong>
              </div>
            </div>

            {/* Description */}
            <div className="admin-info-card">
              <h3 className="admin-section-title">Original Description</h3>
              <p className="admin-description">{issue.description}</p>
              {issue.additionalInfo && (
                <p className="admin-description admin-additional">
                  <em>Additional: </em>{issue.additionalInfo}
                </p>
              )}
            </div>

            {/* Photos */}
            {issue.imageUrls?.length > 0 && (
              <div className="admin-info-card">
                <h3 className="admin-section-title">
                  <FileImage size={14} /> Attached Photos ({issue.imageUrls.length})
                </h3>
                <div className="admin-photo-gallery">
                  {issue.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      className="admin-photo-thumb"
                      onClick={() => setLightbox(url)}
                    >
                      <img src={url} alt={`Photo ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status History */}
            {issue.statusHistory?.length > 0 && (
              <div className="admin-info-card">
                <h3 className="admin-section-title">Status History</h3>
                <div className="admin-history">
                  {[...issue.statusHistory].reverse().map((entry, idx) => (
                    <div key={idx} className="admin-history-entry">
                      <div className="admin-history-dot" />
                      <div>
                        <strong>{entry.status || `${entry.previousStatus} → ${entry.status}`}</strong>
                        {entry.remarks && <p>{entry.remarks}</p>}
                        <small>{entry.changedBy} · {formatDateTime(entry.changedAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Admin Controls ── */}
          <div className="admin-issue-right">
            <div className="admin-controls-card">
              <h3 className="admin-section-title">Administrative Controls</h3>

              <div className="admin-control-field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-control-field">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-control-field">
                <label>Assign Department</label>
                <select value={dept} onChange={(e) => setDept(e.target.value)}>
                  <option value="">Not assigned</option>
                  {DEPT_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-control-field">
                <label>
                  Admin Remarks{' '}
                  <small className="field-hint">(Visible to student)</small>
                </label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  rows={3}
                  placeholder="Add remarks for the student..."
                />
              </div>

              {status === 'Resolved' && (
                <div className="admin-control-field">
                  <label>
                    Resolution Description{' '}
                    <small className="field-hint">(Visible to student)</small>
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>
              )}

              <div className="admin-control-field">
                <label>
                  Internal Notes{' '}
                  <small className="field-hint field-hint-private">(Admin only — not visible to student)</small>
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes for the admin team..."
                />
              </div>

              <button
                className="primary-button save-issue-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="cc-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="cc-lightbox" onClick={() => setLightbox(null)}>
          <button className="cc-lightbox-close" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <img src={lightbox} alt="Enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

