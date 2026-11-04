import { X } from 'lucide-react'

function formatFullDate(value) {
  if (!value) return '—'
  const d = value?.toDate ? value.toDate() : new Date(value)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const PRIORITY_TONE = {
  Important: 'sn-priority-important',
  High: 'sn-priority-high',
  Normal: 'sn-priority-normal',
  Low: 'sn-priority-low',
}

export default function NoticeDetailModal({ notice, t, onClose }) {
  if (!notice) return null

  return (
    <div className="sn-modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sn-modal">
        <div className="sn-modal-header">
          <div className="sn-modal-badges">
            <span className={`sn-priority-badge ${PRIORITY_TONE[notice.priority] || 'sn-priority-normal'}`}>
              {notice.priority}
            </span>
            <span className="sn-modal-category">{notice.category}</span>
          </div>
          <button className="sn-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="sn-modal-body">
          <h2 className="sn-modal-title">{notice.title}</h2>

          <div className="sn-modal-meta">
            <div className="sn-meta-row">
              <span className="sn-meta-label">{t('publishedOn') || 'Published'}</span>
              <span className="sn-meta-value">{formatFullDate(notice.createdAt)}</span>
            </div>
            {notice.expiryDate && (
              <div className="sn-meta-row">
                <span className="sn-meta-label">{t('expiresOn') || 'Expires'}</span>
                <span className="sn-meta-value">{formatFullDate(notice.expiryDate)}</span>
              </div>
            )}
            <div className="sn-meta-row">
              <span className="sn-meta-label">{t('noticeAudience') || 'Audience'}</span>
              <span className="sn-meta-value">{notice.targetAudience || 'All students'}</span>
            </div>
            <div className="sn-meta-row">
              <span className="sn-meta-label">Department</span>
              <span className="sn-meta-value">{notice.department || 'All departments'}</span>
            </div>
          </div>

          <hr className="sn-modal-divider" />

          <div className="sn-modal-description">
            {notice.description?.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {notice.attachmentUrl && (
            <a
              href={notice.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sn-attachment-btn"
            >
              📎 View Attachment
            </a>
          )}
        </div>

        <div className="sn-modal-footer">
          <button className="sn-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
