import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Eye, Plus, Trash2 } from 'lucide-react'
import { useCampusData } from '../context/CampusDataContext'
import { ConfirmDialog, EmptyState, FormField, Modal, PageStatStrip, SearchFilters, StatusBadge } from '../components/ManagementUI'
import { daysRemaining, formatDate } from '../utils/formatters'
import { nowIso } from '../utils/ids'

const categories = ['Examinations', 'Admissions', 'Scholarships', 'Academic events', 'Other']
const priorities = ['Low', 'Normal', 'High']
const emptyDeadline = { title: '', description: '', category: '', priority: 'Normal', startDate: nowIso(), dueDate: '', relatedId: '' }
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dateInputValue(value) { return value ? new Date(value).toISOString().slice(0, 10) : '' }
function dateKey(value) { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function localDate(year, month, day) { return new Date(year, month, day, 12, 0, 0) }

export default function DeadlinesPage({ notify }) {
  const { deadlines, notices, loading, saveDeadline, deleteDeadline } = useCampusData()
  const today = new Date()
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(dateKey(today))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyDeadline)
  const [errors, setErrors] = useState({})
  const [confirmDeadline, setConfirmDeadline] = useState(null)
  const [detailDeadline, setDetailDeadline] = useState(null)

  const filteredDeadlines = useMemo(() => {
    const query = search.trim().toLowerCase()
    return deadlines.filter((deadline) => (!query || [deadline.title, deadline.description, deadline.category].some((value) => String(value || '').toLowerCase().includes(query))) && (!category || deadline.category === category)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [deadlines, search, category])
  const upcoming = filteredDeadlines.filter((deadline) => daysRemaining(deadline.dueDate) >= 0)
  const expired = filteredDeadlines.filter((deadline) => daysRemaining(deadline.dueDate) < 0)
  const monthDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const mondayOffset = (firstDay + 6) % 7
    const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - mondayOffset + 1
      const date = localDate(month.getFullYear(), month.getMonth(), dayNumber)
      return { date, currentMonth: dayNumber > 0 && dayNumber <= totalDays }
    })
  }, [month])
  const eventsByDate = useMemo(() => deadlines.reduce((map, deadline) => { const key = dateKey(deadline.dueDate); map[key] = [...(map[key] || []), deadline]; return map }, {}), [deadlines])
  const selectedEvents = eventsByDate[selectedDate] || []

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const openAdd = (date = selectedDate) => { setForm({ ...emptyDeadline, startDate: `${date}T12:00:00.000Z`, dueDate: `${date}T12:00:00.000Z` }); setErrors({}); setModal('add') }
  const openEdit = (deadline) => { setForm({ ...deadline }); setErrors({}); setModal('edit') }
  const validate = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Enter a deadline title.'
    if (!form.category) nextErrors.category = 'Select a category.'
    if (!form.startDate) nextErrors.startDate = 'Set a start date.'
    if (!form.dueDate) nextErrors.dueDate = 'Set a due date.'
    if (form.startDate && form.dueDate && new Date(form.dueDate) < new Date(form.startDate)) nextErrors.dueDate = 'Due date must be on or after the start date.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }
  const submit = async (event) => { event.preventDefault(); if (!validate()) return; try { await saveDeadline(form); setModal(null); notify(form.id ? 'Deadline updated.' : 'Deadline added.') } catch (error) { notify(`Could not save deadline: ${error.message}`) } }
  const confirmDelete = async () => { try { await deleteDeadline(confirmDeadline); setConfirmDeadline(null); notify('Deadline deleted.') } catch (error) { notify(`Could not delete deadline: ${error.message}`) } }
  const moveMonth = (offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const clearFilters = () => { setSearch(''); setCategory('') }

  return <section className="module-page">
    <div className="module-heading"><div><p className="eyebrow"><span className="live-dot" /> Plan ahead</p><h1>Deadlines</h1><p className="hero-subtitle">Manage examination, admissions, scholarship and academic dates in one place.</p></div><button className="primary-button" onClick={() => openAdd()}><Plus size={16} /> Add deadline</button></div>
    <PageStatStrip stats={[{ value: upcoming.length, label: 'active deadlines', tone: 'green' }, { value: upcoming.filter((deadline) => daysRemaining(deadline.dueDate) <= 7).length, label: 'due this week' }, { value: expired.length, label: 'expired' }, { value: new Set(deadlines.map((deadline) => deadline.category)).size, label: 'categories' }]} />
    <article className="module-panel deadlines-panel"><SearchFilters search={search} onSearch={setSearch} hasFilters={Boolean(search || category)} onClear={clearFilters}><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by deadline category"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></SearchFilters>
      <div className="deadline-workspace"><div className="calendar-panel"><div className="calendar-panel-header"><div><span className="card-eyebrow"><CalendarDays size={14} /> Calendar view</span><h2>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2></div><div className="calendar-nav"><button onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button><button onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)) }}>Today</button><button onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={16} /></button></div></div><div className="calendar-grid calendar-weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid calendar-month-days">{monthDays.map(({ date, currentMonth }) => { const key = dateKey(date); const events = eventsByDate[key] || []; return <button key={key} className={`${currentMonth ? '' : 'outside-month'} ${selectedDate === key ? 'selected-day' : ''} ${key === dateKey(today) ? 'today-day' : ''}`} onClick={() => { setSelectedDate(key); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)) } }><span>{date.getDate()}</span>{events.length > 0 && <i className="calendar-event-dot" />}</button> })}</div><div className="calendar-legend"><span><i className="legend-dot active" /> Active deadline</span><span><i className="legend-dot today" /> Today</span></div></div><div className="selected-day-panel"><div className="selected-day-heading"><div><span className="card-eyebrow">Selected date</span><h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</h2></div><button className="circle-action" onClick={() => openAdd()} aria-label="Add deadline on selected date"><Plus size={16} /></button></div>{selectedEvents.length === 0 ? <EmptyState icon={CalendarDays} title="No deadlines" description="There are no events due on this date." action="Add deadline" onAction={() => openAdd()} /> : <div className="selected-events">{selectedEvents.map((deadline) => <DeadlineListItem key={deadline.id} deadline={deadline} onView={() => setDetailDeadline(deadline)} onEdit={() => openEdit(deadline)} onDelete={() => setConfirmDeadline(deadline)} />)}</div>}</div></div>
      <div className="deadline-lists"><DeadlineList title="Upcoming deadlines" items={upcoming} onView={setDetailDeadline} onEdit={openEdit} onDelete={setConfirmDeadline} /><DeadlineList title="Expired deadlines" items={expired} onView={setDetailDeadline} onEdit={openEdit} onDelete={setConfirmDeadline} expired /></div>
    </article>
    <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit deadline' : 'Add deadline'} eyebrow="Academic calendar" wide footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" form="deadline-form">{modal === 'edit' ? 'Save changes' : 'Add deadline'}</button></>}><form id="deadline-form" className="form-grid" onSubmit={submit} noValidate><FormField label="Title" required error={errors.title}><input value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Examination form submission" /></FormField><FormField label="Category" required error={errors.category}><select value={form.category} onChange={(event) => updateForm('category', event.target.value)}><option value="">Select category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Description"><textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Describe this academic deadline..." /></FormField><FormField label="Priority"><select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Start date" required error={errors.startDate}><input type="date" value={dateInputValue(form.startDate)} onChange={(event) => updateForm('startDate', new Date(`${event.target.value}T12:00:00`).toISOString())} /></FormField><FormField label="Due date" required error={errors.dueDate}><input type="date" value={dateInputValue(form.dueDate)} onChange={(event) => updateForm('dueDate', new Date(`${event.target.value}T12:00:00`).toISOString())} /></FormField><FormField label="Related notice"><select value={form.relatedId} onChange={(event) => updateForm('relatedId', event.target.value)}><option value="">No related notice</option>{notices.map((notice) => <option key={notice.id} value={notice.id}>{notice.title}</option>)}</select></FormField></form></Modal>
    <Modal open={Boolean(detailDeadline)} onClose={() => setDetailDeadline(null)} title={detailDeadline?.title || 'Deadline details'} eyebrow="Academic deadline"><div className="deadline-detail-card"><StatusBadge tone={detailDeadline?.priority?.toLowerCase()}>{detailDeadline?.priority} priority</StatusBadge><p>{detailDeadline?.description || 'No description added.'}</p><div className="detail-grid"><div><span>Category</span><strong>{detailDeadline?.category}</strong></div><div><span>Days remaining</span><strong>{detailDeadline && daysRemaining(detailDeadline.dueDate) >= 0 ? `${daysRemaining(detailDeadline.dueDate)} days` : 'Expired'}</strong></div><div><span>Starts</span><strong>{detailDeadline && formatDate(detailDeadline.startDate)}</strong></div><div><span>Due</span><strong>{detailDeadline && formatDate(detailDeadline.dueDate)}</strong></div></div></div><div className="modal-actions"><button className="secondary-button" onClick={() => setDetailDeadline(null)}>Close</button></div></Modal>
    <ConfirmDialog open={Boolean(confirmDeadline)} title="Delete deadline?" description={`This will remove ${confirmDeadline?.title || 'this deadline'} from the academic calendar.`} onCancel={() => setConfirmDeadline(null)} onConfirm={confirmDelete} />
  </section>
}

function DeadlineList({ title, items, onView, onEdit, onDelete, expired = false }) {
  return <div className="deadline-list-panel"><div className="deadline-list-heading"><h2>{title}</h2><span>{items.length}</span></div>{items.length === 0 ? <p className="list-empty">No {expired ? 'expired' : 'upcoming'} deadlines.</p> : <div className="deadline-items">{items.slice(0, 5).map((deadline) => <DeadlineListItem key={deadline.id} deadline={deadline} onView={() => onView(deadline)} onEdit={() => onEdit(deadline)} onDelete={() => onDelete(deadline)} />)}</div>}</div>
}

function DeadlineListItem({ deadline, onView, onEdit, onDelete }) {
  const remaining = daysRemaining(deadline.dueDate)
  return <div className="deadline-list-item"><span className={`deadline-date-large ${remaining < 0 ? 'expired' : ''}`}>{new Date(deadline.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span><div className="deadline-item-content"><strong>{deadline.title}</strong><small>{deadline.category} · {remaining < 0 ? `${Math.abs(remaining)} days overdue` : remaining === 0 ? 'Due today' : `${remaining} days remaining`}</small></div><div className="row-actions"><button onClick={onView} aria-label={`View ${deadline.title}`}><Eye size={14} /></button><button onClick={onEdit} aria-label={`Edit ${deadline.title}`}><Edit3 size={14} /></button><button className="danger-action" onClick={onDelete} aria-label={`Delete ${deadline.title}`}><Trash2 size={14} /></button></div></div>
}
