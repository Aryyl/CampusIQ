import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Users,
  X,
} from 'lucide-react'

function formatEventDate(value) {
  if (!value) return null
  const date = value?.toDate ? value.toDate() : new Date(value)
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function buildAudienceSummary(targetAudience) {
  if (!targetAudience || targetAudience.type === 'all') return 'Open to all students'
  const parts = []
  if (targetAudience.departments?.length)
    parts.push(`Departments: ${targetAudience.departments.join(', ')}`)
  if (targetAudience.programmes?.length)
    parts.push(`Programmes: ${targetAudience.programmes.join(', ')}`)
  if (targetAudience.semesters?.length)
    parts.push(`Semesters: ${targetAudience.semesters.join(', ')}`)
  return parts.join(' · ') || 'Open to all students'
}

export default function EventDetailModal({
  event,
  isBookmarked,
  bookmarkLoading,
  onClose,
  onBookmark,
  t,
}) {
  if (!event) return null

  const audienceSummary = buildAudienceSummary(event.targetAudience)

  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="ev-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {event.posterUrl && (
          <div className="ev-modal-poster">
            <img src={event.posterUrl} alt={event.title} />
          </div>
        )}

        <div className="ev-modal-body">
          <div className="ev-modal-meta">
            <span className="ev-modal-category">{event.category}</span>
            {event.status === 'Completed' && (
              <span className="ev-modal-completed-badge">Completed</span>
            )}
          </div>

          <h2 className="ev-modal-title">{event.title}</h2>

          <div className="ev-modal-details">
            {event.eventDate && (
              <div className="ev-modal-detail-row">
                <CalendarDays size={14} />
                <span>{formatEventDate(event.eventDate)}</span>
              </div>
            )}
            {event.startTime && (
              <div className="ev-modal-detail-row">
                <Clock size={14} />
                <span>
                  {event.startTime}
                  {event.endTime ? ` – ${event.endTime}` : ''}
                </span>
              </div>
            )}
            {event.venue && (
              <div className="ev-modal-detail-row">
                <MapPin size={14} />
                <span>{event.venue}</span>
              </div>
            )}
            <div className="ev-modal-detail-row">
              <Users size={14} />
              <span>{audienceSummary}</span>
            </div>
          </div>

          <div className="ev-modal-description">
            <h3>About this event</h3>
            <p>{event.description || 'No description provided.'}</p>
          </div>

          <div className="ev-modal-actions">
            {event.registrationUrl && (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ev-modal-register-btn"
              >
                <ExternalLink size={15} />
                {t('registerForEvent') || 'Register for Event'}
              </a>
            )}

            <button
              className={`ev-modal-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={onBookmark}
              disabled={bookmarkLoading}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck size={15} />
                  {t('removeBookmark') || 'Remove from Saved'}
                </>
              ) : (
                <>
                  <Bookmark size={15} />
                  {t('bookmarkEvent') || 'Save Event'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

