import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Globe,
  Image,
  Link,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import {
  ConfirmDialog,
  EmptyState,
  FormField,
  Modal,
  PageStatStrip,
  SearchFilters,
  StatusBadge,
} from '../components/ManagementUI'
import {
  createEvent,
  deleteEvent,
  subscribeAllEvents,
  updateEvent,
} from '../services/eventService'

const EVENT_CATEGORIES = [
  'Academic',
  'Workshop',
  'Seminar',
  'Hackathon',
  'Competition',
  'Cultural',
  'Sports',
  'Examination',
  'Admission',
  'Other',
]

const DEPARTMENTS = [
  'Arts & Humanities',
  'Science & Technology',
  'Commerce & Management',
  'Social Sciences',
]

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

const EVENT_STATUSES = ['Draft', 'Published', 'Archived', 'Completed']

const STATUS_TONES = {
  Draft: 'amber',
  Published: 'green',
  Archived: 'neutral',
  Completed: 'blue',
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dateKey(value) {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function localDate(year, month, day) {
  return new Date(year, month, day, 12, 0, 0)
}

function formatEventDate(value) {
  if (!value) return '—'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildAudienceSummary(targetAudience) {
  if (!targetAudience || targetAudience.type === 'all') return 'All Students'
  const parts = []
  if (targetAudience.departments?.length) parts.push(targetAudience.departments.join(', '))
  if (targetAudience.programmes?.length) parts.push(targetAudience.programmes.join(', '))
  if (targetAudience.semesters?.length)
    parts.push(`Sem ${targetAudience.semesters.join(', ')}`)
  return parts.join(' · ') || 'All Students'
}

const emptyForm = {
  title: '',
  description: '',
  category: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  venue: '',
  registrationUrl: '',
  status: 'Draft',
  targetAudience: { type: 'all', departments: [], programmes: [], semesters: [] },
}

export default function EventsPage({ notify, currentUser }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [detailEvent, setDetailEvent] = useState(null)
  const [confirmEvent, setConfirmEvent] = useState(null)
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const posterInputRef = useRef(null)

  // Subscribe to Firestore
  useEffect(() => {
    setLoading(true)
    const unsub = subscribeAllEvents((data) => {
      setEvents(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const today = new Date()

  // KPI stats
  const totalEvents = events.length
  const publishedEvents = events.filter((e) => e.status === 'Published').length
  const draftEvents = events.filter((e) => e.status === 'Draft').length
  const upcomingEvents = events.filter((e) => {
    if (e.status !== 'Published') return false
    const d = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate || '')
    return d >= today
  }).length
  const thisWeekEvents = events.filter((e) => {
    if (e.status !== 'Published') return false
    const d = e.eventDate?.toDate ? e.eventDate.toDate() : new Date(e.eventDate || '')
    const diff = (d - today) / 86400000
    return diff >= 0 && diff <= 7
  }).length

  // Filtered + sorted
  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = events.filter((e) => {
      if (q && !e.title?.toLowerCase().includes(q) && !e.category?.toLowerCase().includes(q))
        return false
      if (filterCategory && e.category !== filterCategory) return false
      if (filterStatus && e.status !== filterStatus) return false
      if (filterDept) {
        const depts = e.targetAudience?.departments || []
        if (e.targetAudience?.type !== 'all' && !depts.includes(filterDept)) return false
      }
      return true
    })
    if (sortOrder === 'newest') result = result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    else if (sortOrder === 'oldest') result = result.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
    else if (sortOrder === 'upcoming') {
      result = result.sort((a, b) => {
        const da = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate || 0)
        const db2 = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate || 0)
        return da - db2
      })
    }
    return result
  }, [events, search, filterCategory, filterStatus, filterDept, sortOrder])

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
    events.reduce((map, event) => {
      const key = dateKey(event.eventDate)
      if (key) map[key] = [...(map[key] || []), event]
      return map
    }, {}), [events])

  const selectedDateEvents = eventsByDate[selectedDate] || []

  // Form helpers
  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const updateAudience = (key, value) =>
    setForm((f) => ({ ...f, targetAudience: { ...f.targetAudience, [key]: value } }))

  const toggleAudienceDept = (dept) => {
    const current = form.targetAudience.departments || []
    const next = current.includes(dept) ? current.filter((d) => d !== dept) : [...current, dept]
    updateAudience('departments', next)
  }

  const toggleAudienceSem = (sem) => {
    const current = form.targetAudience.semesters || []
    const next = current.includes(sem) ? current.filter((s) => s !== sem) : [...current, sem]
    updateAudience('semesters', next)
  }

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPosterFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPosterPreview(ev.target.result)
    reader.readAsDataURL(file)
    if (posterInputRef.current) posterInputRef.current.value = ''
  }

  const openAdd = () => {
    setForm({ ...emptyForm })
    setPosterFile(null)
    setPosterPreview(null)
    setErrors({})
    setModal('add')
  }

  const openEdit = (event) => {
    setForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      eventDate: event.eventDate
        ? (event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate))
            .toISOString()
            .slice(0, 10)
        : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      venue: event.venue || '',
      registrationUrl: event.registrationUrl || '',
      status: event.status || 'Draft',
      posterUrl: event.posterUrl || '',
      targetAudience: event.targetAudience || { type: 'all', departments: [], programmes: [], semesters: [] },
      _id: event.id,
    })
    setPosterFile(null)
    setPosterPreview(event.posterUrl || null)
    setErrors({})
    setModal('edit')
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Enter an event title.'
    if (!form.category) next.category = 'Select a category.'
    if (!form.description.trim()) next.description = 'Enter a description.'
    if (!form.eventDate) next.eventDate = 'Set an event date.'
    if (form.endTime && form.startTime && form.endTime <= form.startTime)
      next.endTime = 'End time must be after start time.'
    if (form.registrationUrl && !/^https?:\/\//i.test(form.registrationUrl))
      next.registrationUrl = 'Enter a valid URL starting with http:// or https://'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (targetStatus) => {
    if (!validate()) return
    setSaving(true)
    try {
      const adminInfo = { uid: currentUser?.uid, name: currentUser?.name }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        eventDate: form.eventDate ? new Date(`${form.eventDate}T12:00:00`) : null,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        registrationUrl: form.registrationUrl.trim(),
        targetAudience: form.targetAudience,
        status: targetStatus,
        posterUrl: form.posterUrl || null,
      }

      if (modal === 'edit' && form._id) {
        await updateEvent(form._id, payload, posterFile || null, adminInfo)
        notify(`Event "${form.title}" updated.`)
      } else {
        await createEvent(payload, posterFile || null, adminInfo)
        notify(`Event "${form.title}" ${targetStatus === 'Published' ? 'published' : 'saved as draft'}.`)
      }
      setModal(null)
    } catch (err) {
      notify(`Could not save event: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteEvent(confirmEvent.id)
      setConfirmEvent(null)
      notify('Event deleted.')
    } catch (err) {
      notify(`Could not delete event: ${err.message}`)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilterCategory('')
    setFilterStatus('')
    setFilterDept('')
  }

  const moveMonth = (offset) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1))

  return (
    <section className="module-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> Campus life
          </p>
          <h1>Events management</h1>
          <p className="hero-subtitle">
            Create, publish and manage campus events for targeted student audiences.
          </p>
        </div>
        <button className="primary-button" onClick={openAdd}>
          <Plus size={16} /> Create event
        </button>
      </div>

      <PageStatStrip
        stats={[
          { value: totalEvents, label: 'total events', tone: 'green' },
          { value: publishedEvents, label: 'published' },
          { value: draftEvents, label: 'drafts' },
          { value: upcomingEvents, label: 'upcoming' },
          { value: thisWeekEvents, label: 'this week' },
        ]}
      />

      <article className="module-panel deadlines-panel">
        <SearchFilters
          search={search}
          onSearch={setSearch}
          hasFilters={Boolean(search || filterCategory || filterStatus || filterDept)}
          onClear={clearFilters}
        >
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {EVENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort events">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="upcoming">Upcoming first</option>
          </select>
        </SearchFilters>

        {/* Calendar + Selected Day Panel */}
        <div className="deadline-workspace">
          <div className="calendar-panel">
            <div className="calendar-panel-header">
              <div>
                <span className="card-eyebrow">
                  <CalendarDays size={14} /> Calendar view
                </span>
                <h2>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
              </div>
              <div className="calendar-nav">
                <button onClick={() => moveMonth(-1)} aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
                    setSelectedDate(dateKey(today))
                  }}
                >
                  Today
                </button>
                <button onClick={() => moveMonth(1)} aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="calendar-grid calendar-weekdays">
              {weekDays.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="calendar-grid calendar-month-days">
              {monthDays.map(({ date, currentMonth }) => {
                const key = dateKey(date)
                const hasEvents = (eventsByDate[key] || []).length > 0
                return (
                  <button
                    key={key}
                    className={`${currentMonth ? '' : 'outside-month'} ${selectedDate === key ? 'selected-day' : ''} ${key === dateKey(today) ? 'today-day' : ''}`}
                    onClick={() => { setSelectedDate(key); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)) }}
                  >
                    <span>{date.getDate()}</span>
                    {hasEvents && <i className="calendar-event-dot" />}
                  </button>
                )
              })}
            </div>
            <div className="calendar-legend">
              <span><i className="legend-dot active" /> Event scheduled</span>
              <span><i className="legend-dot today" /> Today</span>
            </div>
          </div>

          <div className="selected-day-panel">
            <div className="selected-day-heading">
              <div>
                <span className="card-eyebrow">Selected date</span>
                <h2>
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </h2>
              </div>
              <button className="circle-action" onClick={openAdd} aria-label="Create event">
                <Plus size={16} />
              </button>
            </div>
            {selectedDateEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No events"
                description="No events scheduled on this date."
                action="Create event"
                onAction={openAdd}
              />
            ) : (
              <div className="selected-events">
                {selectedDateEvents.map((event) => (
                  <EventCalendarItem
                    key={event.id}
                    event={event}
                    onView={() => setDetailEvent(event)}
                    onEdit={() => openEdit(event)}
                    onDelete={() => setConfirmEvent(event)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Table */}
        <div className="deadline-lists" style={{ marginTop: '1.5rem' }}>
          {loading ? (
            <p className="list-empty">Loading events…</p>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No events found"
              description="Create your first campus event."
              action="Create event"
              onAction={openAdd}
            />
          ) : (
            <div className="event-table-panel">
              <div className="deadline-list-heading">
                <h2>All events</h2>
                <span>{filteredEvents.length}</span>
              </div>
              <div className="event-table">
                <div className="event-table-header">
                  <span>Title</span>
                  <span>Category</span>
                  <span>Date</span>
                  <span>Audience</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filteredEvents.map((event) => (
                  <EventTableRow
                    key={event.id}
                    event={event}
                    onView={() => setDetailEvent(event)}
                    onEdit={() => openEdit(event)}
                    onDelete={() => setConfirmEvent(event)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Create / Edit Modal */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Edit event' : 'Create event'}
        eyebrow="Events management"
        wide
        footer={
          <>
            <button className="secondary-button" onClick={() => setModal(null)} disabled={saving}>
              Cancel
            </button>
            <button
              className="secondary-button"
              onClick={() => submit('Draft')}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              className="primary-button"
              onClick={() => submit('Published')}
              disabled={saving}
            >
              {saving ? 'Publishing…' : 'Publish event'}
            </button>
          </>
        }
      >
        <form id="event-form" className="form-grid" onSubmit={(e) => e.preventDefault()} noValidate>
          <FormField label="Event title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Annual Tech Symposium 2026"
            />
          </FormField>

          <FormField label="Category" required error={errors.category}>
            <select value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
              <option value="">Select category</option>
              {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Description" required error={errors.description} style={{ gridColumn: '1 / -1' }}>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Describe the event, what to expect, who should attend…"
              rows={4}
            />
          </FormField>

          <FormField label="Event date" required error={errors.eventDate}>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => updateForm('eventDate', e.target.value)}
            />
          </FormField>

          <FormField label="Venue / Location">
            <input
              value={form.venue}
              onChange={(e) => updateForm('venue', e.target.value)}
              placeholder="Main Auditorium, Block A"
            />
          </FormField>

          <FormField label="Start time">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => updateForm('startTime', e.target.value)}
            />
          </FormField>

          <FormField label="End time" error={errors.endTime}>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => updateForm('endTime', e.target.value)}
            />
          </FormField>

          <FormField label="Registration URL" error={errors.registrationUrl}>
            <input
              type="url"
              value={form.registrationUrl}
              onChange={(e) => updateForm('registrationUrl', e.target.value)}
              placeholder="https://forms.gle/..."
            />
          </FormField>

          {/* Audience Targeting */}
          <div className="event-audience-section" style={{ gridColumn: '1 / -1' }}>
            <h3 className="event-section-title">
              <Users size={15} /> Target audience
            </h3>
            <div className="event-audience-radios">
              <label>
                <input
                  type="radio"
                  name="audienceType"
                  value="all"
                  checked={form.targetAudience.type === 'all'}
                  onChange={() => updateAudience('type', 'all')}
                />
                All students
              </label>
              <label>
                <input
                  type="radio"
                  name="audienceType"
                  value="targeted"
                  checked={form.targetAudience.type === 'targeted'}
                  onChange={() => updateAudience('type', 'targeted')}
                />
                Targeted students
              </label>
            </div>

            {form.targetAudience.type === 'targeted' && (
              <div className="event-audience-selectors">
                <div className="audience-group">
                  <span className="audience-group-label">Departments</span>
                  <div className="audience-chips">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        className={`audience-chip ${form.targetAudience.departments?.includes(dept) ? 'selected' : ''}`}
                        onClick={() => toggleAudienceDept(dept)}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="audience-group">
                  <span className="audience-group-label">Semesters</span>
                  <div className="audience-chips">
                    {SEMESTERS.map((sem) => (
                      <button
                        key={sem}
                        type="button"
                        className={`audience-chip ${form.targetAudience.semesters?.includes(sem) ? 'selected' : ''}`}
                        onClick={() => toggleAudienceSem(sem)}
                      >
                        Sem {sem}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField label="Programmes (comma-separated)">
                  <input
                    value={form.targetAudience.programmes?.join(', ') || ''}
                    onChange={(e) =>
                      updateAudience(
                        'programmes',
                        e.target.value
                          .split(',')
                          .map((p) => p.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="B.Tech, B.Sc. Computer Science"
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* Poster Upload */}
          <div className="event-poster-section" style={{ gridColumn: '1 / -1' }}>
            <h3 className="event-section-title">
              <Image size={15} /> Event poster (optional)
            </h3>
            {posterPreview ? (
              <div className="event-poster-preview">
                <img src={posterPreview} alt="Event poster preview" />
                <button
                  type="button"
                  className="remove-poster-btn"
                  onClick={() => { setPosterFile(null); setPosterPreview(null); updateForm('posterUrl', '') }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="poster-upload-btn"
                onClick={() => posterInputRef.current?.click()}
              >
                <Image size={17} /> Upload poster image
              </button>
            )}
            <input
              ref={posterInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePosterSelect}
            />
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={Boolean(detailEvent)}
        onClose={() => setDetailEvent(null)}
        title={detailEvent?.title || 'Event details'}
        eyebrow="Campus event"
      >
        {detailEvent && (
          <div className="event-detail-card">
            {detailEvent.posterUrl && (
              <img src={detailEvent.posterUrl} alt={detailEvent.title} className="event-detail-poster" />
            )}
            <div className="event-detail-badges">
              <StatusBadge tone={STATUS_TONES[detailEvent.status] || 'neutral'}>
                {detailEvent.status}
              </StatusBadge>
              <StatusBadge tone="neutral">{detailEvent.category}</StatusBadge>
            </div>
            <p className="event-detail-description">{detailEvent.description || 'No description.'}</p>
            <div className="detail-grid">
              <div><span>Date</span><strong>{formatEventDate(detailEvent.eventDate)}</strong></div>
              {detailEvent.startTime && <div><span>Time</span><strong>{detailEvent.startTime}{detailEvent.endTime ? ` – ${detailEvent.endTime}` : ''}</strong></div>}
              {detailEvent.venue && <div><span>Venue</span><strong>{detailEvent.venue}</strong></div>}
              <div><span>Audience</span><strong>{buildAudienceSummary(detailEvent.targetAudience)}</strong></div>
              {detailEvent.registrationUrl && (
                <div><span>Registration</span><a href={detailEvent.registrationUrl} target="_blank" rel="noopener noreferrer" className="event-reg-link"><Link size={12} /> Open link</a></div>
              )}
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary-button" onClick={() => setDetailEvent(null)}>Close</button>
          {detailEvent && (
            <button className="primary-button" onClick={() => { openEdit(detailEvent); setDetailEvent(null) }}>
              <Edit3 size={14} /> Edit event
            </button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmEvent)}
        title="Delete event?"
        description={`This will permanently remove "${confirmEvent?.title || 'this event'}".`}
        onCancel={() => setConfirmEvent(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function EventCalendarItem({ event, onView, onEdit, onDelete }) {
  return (
    <div className="deadline-list-item">
      <span className={`deadline-date-large ${event.status === 'Draft' ? 'expired' : ''}`}>
        {event.eventDate
          ? (event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
          : '—'}
      </span>
      <div className="deadline-item-content">
        <strong>{event.title}</strong>
        <small>{event.category} · {event.status}</small>
      </div>
      <div className="row-actions">
        <button onClick={onView} aria-label={`View ${event.title}`}><Eye size={14} /></button>
        <button onClick={onEdit} aria-label={`Edit ${event.title}`}><Edit3 size={14} /></button>
        <button className="danger-action" onClick={onDelete} aria-label={`Delete ${event.title}`}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}

function EventTableRow({ event, onView, onEdit, onDelete }) {
  const tone = STATUS_TONES[event.status] || 'neutral'
  return (
    <div className="event-table-row">
      <span className="event-table-title">{event.title}</span>
      <span>
        <span className="event-category-badge">{event.category}</span>
      </span>
      <span>{formatEventDate(event.eventDate)}</span>
      <span className="event-audience-cell">
        {event.targetAudience?.type === 'all' ? (
          <span className="audience-all-badge"><Globe size={11} /> All students</span>
        ) : (
          <span className="audience-targeted-badge"><Users size={11} /> Targeted</span>
        )}
      </span>
      <span>
        <StatusBadge tone={tone}>{event.status}</StatusBadge>
      </span>
      <span className="row-actions">
        <button onClick={onView} aria-label={`View ${event.title}`}><Eye size={14} /></button>
        <button onClick={onEdit} aria-label={`Edit ${event.title}`}><Edit3 size={14} /></button>
        <button className="danger-action" onClick={onDelete} aria-label={`Delete ${event.title}`}><Trash2 size={14} /></button>
      </span>
    </div>
  )
}

