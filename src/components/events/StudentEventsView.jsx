import { useEffect, useMemo, useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Star,
} from 'lucide-react'
import {
  isEventVisibleToStudent,
  subscribePublishedEvents,
  subscribeSavedEvents,
  toggleBookmark,
} from '../../services/eventService'
import EventDetailModal from './EventDetailModal'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateKey(value) {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function localDate(year, month, day) {
  return new Date(year, month, day, 12, 0, 0)
}

const CATEGORY_COLORS = {
  Academic: 'ev-cat-academic',
  Workshop: 'ev-cat-workshop',
  Seminar: 'ev-cat-seminar',
  Hackathon: 'ev-cat-hackathon',
  Competition: 'ev-cat-competition',
  Cultural: 'ev-cat-cultural',
  Sports: 'ev-cat-sports',
  Examination: 'ev-cat-examination',
  Admission: 'ev-cat-admission',
  Other: 'ev-cat-other',
}

const TABS = ['All', 'For You', 'Today', 'Upcoming', 'Saved']

export default function StudentEventsView({ student, t }) {
  const [allEvents, setAllEvents] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bookmarkLoading, setBookmarkLoading] = useState(null)
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedCalDate, setSelectedCalDate] = useState(todayKey)

  const today = todayKey()

  // Subscribe to published events
  useEffect(() => {
    setLoading(true)
    const unsub = subscribePublishedEvents((events) => {
      setAllEvents(events)
      setLoading(false)
    })
    return unsub
  }, [])

  // Subscribe to saved event IDs
  useEffect(() => {
    if (!student?.uid) return
    const unsub = subscribeSavedEvents(student.uid, setSavedIds)
    return unsub
  }, [student?.uid])

  // Visible events = published and audience-matched
  const visibleEvents = useMemo(
    () => allEvents.filter((e) => isEventVisibleToStudent(e, student)),
    [allEvents, student]
  )

  // Tab filtering
  const tabEvents = useMemo(() => {
    switch (activeTab) {
      case 'For You':
        return visibleEvents.filter((e) => e.targetAudience?.type !== 'all')
      case 'Today':
        return visibleEvents.filter((e) => dateKey(e.eventDate) === today)
      case 'Upcoming':
        return visibleEvents.filter((e) => dateKey(e.eventDate) >= today)
      case 'Saved':
        return visibleEvents.filter((e) => savedIds.includes(e.id))
      default:
        return visibleEvents
    }
  }, [visibleEvents, activeTab, savedIds, today])

  // Calendar
  const monthDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const mondayOffset = (firstDay + 6) % 7
    const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return Array.from({ length: 42 }, (_, i) => {
      const dayNumber = i - mondayOffset + 1
      const date = localDate(month.getFullYear(), month.getMonth(), dayNumber)
      return { date, currentMonth: dayNumber > 0 && dayNumber <= totalDays }
    })
  }, [month])

  const eventsByDate = useMemo(() =>
    visibleEvents.reduce((map, event) => {
      const key = dateKey(event.eventDate)
      if (key) map[key] = [...(map[key] || []), event]
      return map
    }, {}), [visibleEvents])

  const selectedDateEvents = eventsByDate[selectedCalDate] || []

  const handleBookmark = async (event, e) => {
    e.stopPropagation()
    if (!student?.uid || bookmarkLoading) return
    setBookmarkLoading(event.id)
    try {
      await toggleBookmark(student.uid, event.id)
    } catch (err) {
      console.error('Bookmark error:', err)
    } finally {
      setBookmarkLoading(null)
    }
  }

  return (
    <div className="student-events-view">
      {/* Header */}
      <div className="ev-header">
        <div>
          <span className="ev-eyebrow">
            <CalendarCheck size={14} /> Campus events
          </span>
          <h2 className="ev-title">{t('eventsSection') || 'Events'}</h2>
          <p className="ev-subtitle">
            {t('eventsSubtitle') || 'Discover upcoming events, workshops, and activities on campus.'}
          </p>
        </div>
        <div className="ev-view-toggle">
          <button
            className={`ev-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`ev-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title="Calendar view"
          >
            <CalendarDays size={15} />
          </button>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="ev-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`ev-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'Saved' && savedIds.length > 0 && (
              <span className="ev-tab-badge">{savedIds.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ev-loading">
          <span className="ev-loading-spinner" />
          Loading events…
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="ev-calendar-view">
          <div className="ev-cal-header">
            <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <strong>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong>
            <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="ev-cal-weekdays">
            {weekDays.map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="ev-cal-days">
            {monthDays.map(({ date, currentMonth }) => {
              const key = dateKey(date)
              const hasEvents = (eventsByDate[key] || []).length > 0
              return (
                <button
                  key={key}
                  className={`ev-cal-day ${!currentMonth ? 'muted' : ''} ${key === today ? 'is-today' : ''} ${key === selectedCalDate ? 'selected' : ''} ${hasEvents ? 'has-event' : ''}`}
                  onClick={() => setSelectedCalDate(key)}
                >
                  <span>{date.getDate()}</span>
                  {hasEvents && <i className="ev-cal-dot" />}
                </button>
              )
            })}
          </div>
          {/* Selected Day Events */}
          <div className="ev-cal-selected-day">
            <h3 className="ev-cal-selected-label">
              {new Date(`${selectedCalDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
            </h3>
            {selectedDateEvents.length === 0 ? (
              <p className="ev-empty-day">No events on this day.</p>
            ) : (
              <div className="ev-cal-events">
                {selectedDateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isBookmarked={savedIds.includes(event.id)}
                    bookmarkLoading={bookmarkLoading === event.id}
                    onOpen={() => setSelectedEvent(event)}
                    onBookmark={(e) => handleBookmark(event, e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="ev-list">
          {tabEvents.length === 0 ? (
            <div className="ev-empty">
              <CalendarCheck size={32} />
              <strong>{t('noEvents') || 'No events yet.'}</strong>
              <span>
                {activeTab === 'Saved'
                  ? 'Save events by clicking the bookmark icon.'
                  : 'Events published by administrators will appear here.'}
              </span>
            </div>
          ) : (
            tabEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isBookmarked={savedIds.includes(event.id)}
                bookmarkLoading={bookmarkLoading === event.id}
                onOpen={() => setSelectedEvent(event)}
                onBookmark={(e) => handleBookmark(event, e)}
              />
            ))
          )}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isBookmarked={savedIds.includes(selectedEvent.id)}
          bookmarkLoading={bookmarkLoading === selectedEvent.id}
          onClose={() => setSelectedEvent(null)}
          onBookmark={(e) => handleBookmark(selectedEvent, e)}
          t={t}
        />
      )}
    </div>
  )
}

function EventCard({ event, isBookmarked, bookmarkLoading, onOpen, onBookmark }) {
  const eventDate = event.eventDate?.toDate
    ? event.eventDate.toDate()
    : event.eventDate
      ? new Date(event.eventDate)
      : null

  const formattedDate = eventDate
    ? eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const catClass = CATEGORY_COLORS[event.category] || 'ev-cat-other'

  return (
    <div className="ev-card" onClick={onOpen} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      {event.posterUrl && (
        <div className="ev-card-poster">
          <img src={event.posterUrl} alt={event.title} />
        </div>
      )}
      <div className="ev-card-body">
        <div className="ev-card-meta">
          <span className={`ev-cat-badge ${catClass}`}>{event.category}</span>
          {event.targetAudience?.type !== 'all' && (
            <span className="ev-targeted-badge">For you</span>
          )}
        </div>
        <h3 className="ev-card-title">{event.title}</h3>
        <p className="ev-card-desc">
          {event.description?.slice(0, 120)}{event.description?.length > 120 ? '…' : ''}
        </p>
        <div className="ev-card-info">
          {formattedDate && (
            <span className="ev-info-chip">
              <CalendarDays size={12} /> {formattedDate}
            </span>
          )}
          {event.startTime && (
            <span className="ev-info-chip">
              <Clock size={12} /> {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
            </span>
          )}
          {event.venue && (
            <span className="ev-info-chip">
              <MapPin size={12} /> {event.venue}
            </span>
          )}
          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ev-reg-chip"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} /> Register
            </a>
          )}
        </div>
      </div>
      <button
        className={`ev-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
        onClick={onBookmark}
        disabled={bookmarkLoading}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Save event'}
        title={isBookmarked ? 'Remove from saved' : 'Save event'}
      >
        {isBookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
      </button>
    </div>
  )
}

