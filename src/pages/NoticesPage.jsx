import { useMemo, useState } from 'react'
import { Archive, Bell, Edit3, Eye, Megaphone, Plus, Send, Trash2 } from 'lucide-react'
import { useCampusData } from '../context/CampusDataContext'
import { ConfirmDialog, EmptyState, FormField, Modal, PageStatStrip, Pagination, SearchFilters, SortButton, StatusBadge } from '../components/ManagementUI'
import { formatDate } from '../utils/formatters'
import { nowIso } from '../utils/ids'

const PAGE_SIZE = 6
const categories = ['Examinations', 'Admissions', 'Scholarships', 'Academic events', 'Other']
const priorities = ['Low', 'Normal', 'High', 'Important']
const statuses = ['Draft', 'Published', 'Archived']
const departments = ['All departments', 'Arts & Humanities', 'Science & Technology', 'Commerce & Management', 'Social Sciences']
const emptyNotice = { title: '', description: '', category: '', priority: 'Normal', targetAudience: 'All students', department: 'All departments', publicationDate: nowIso(), expiryDate: '', status: 'Draft' }

function dateInputValue(value) { return value ? new Date(value).toISOString().slice(0, 10) : '' }

export default function NoticesPage({ notify }) {
  const { notices, loading, saveNotice, deleteNotice } = useCampusData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [department, setDepartment] = useState('')
  const [sort, setSort] = useState({ key: 'publicationDate', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyNotice)
  const [errors, setErrors] = useState({})
  const [confirmNotice, setConfirmNotice] = useState(null)
  const [previewNotice, setPreviewNotice] = useState(null)

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return notices.filter((notice) => {
      const matchesSearch = !query || [notice.title, notice.description, notice.category, notice.targetAudience].some((value) => String(value || '').toLowerCase().includes(query))
      return matchesSearch && (!status || notice.status === status) && (!priority || notice.priority === priority) && (!department || notice.department === department)
    }).sort((a, b) => {
      const left = sort.key === 'title' ? a.title.toLowerCase() : new Date(a[sort.key]).getTime()
      const right = sort.key === 'title' ? b.title.toLowerCase() : new Date(b[sort.key]).getTime()
      const comparison = left > right ? 1 : left < right ? -1 : 0
      return comparison * (sort.direction === 'asc' ? 1 : -1)
    })
  }, [notices, search, status, priority, department, sort])
  const pageCount = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE))
  const visibleNotices = filteredNotices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = Boolean(search || status || priority || department)
  const updateFilter = (setter, value) => { setter(value); setPage(1) }
  const toggleSort = (key) => setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' })
  const clearFilters = () => { setSearch(''); setStatus(''); setPriority(''); setDepartment(''); setPage(1) }
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const openAdd = () => { setForm({ ...emptyNotice, publicationDate: nowIso() }); setErrors({}); setModal('add') }
  const openEdit = (notice) => { setForm({ ...notice }); setErrors({}); setModal('edit') }
  const validate = () => {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Enter a notice title.'
    if (!form.description.trim()) nextErrors.description = 'Add a short description.'
    if (!form.category) nextErrors.category = 'Select a category.'
    if (!form.department) nextErrors.department = 'Select a target department.'
    if (!form.publicationDate) nextErrors.publicationDate = 'Set a publication date.'
    if (!form.expiryDate) nextErrors.expiryDate = 'Set an expiry date.'
    if (form.publicationDate && form.expiryDate && new Date(form.expiryDate) < new Date(form.publicationDate)) nextErrors.expiryDate = 'Expiry must be after publication.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    const intent = event.nativeEvent.submitter?.name
    const nextStatus = intent === 'publish' ? 'Published' : intent === 'saveDraft' ? 'Draft' : form.status
    try {
      await saveNotice({ ...form, status: nextStatus })
      setModal(null)
      notify(nextStatus === 'Published' ? 'Notice published.' : 'Notice saved as draft.')
    } catch (error) {
      notify(`Could not save notice: ${error.message}`)
    }
  }
  const changeStatus = async (notice, nextStatus) => { try { await saveNotice({ ...notice, status: nextStatus }); notify(`Notice ${nextStatus.toLowerCase()}.`) } catch (error) { notify(`Could not update notice: ${error.message}`) } }
  const confirmDelete = async () => { try { await deleteNotice(confirmNotice); setConfirmNotice(null); notify('Notice deleted.') } catch (error) { notify(`Could not delete notice: ${error.message}`) } }

  return <section className="module-page">
    <div className="module-heading"><div><p className="eyebrow"><span className="live-dot" /> Stay informed</p><h1>Notices</h1><p className="hero-subtitle">Create and publish official announcements for the CampusIQ community.</p></div><button className="primary-button" onClick={openAdd}><Plus size={16} /> Create notice</button></div>
    <PageStatStrip stats={[{ value: notices.filter((notice) => notice.status === 'Published').length, label: 'published notices', tone: 'green' }, { value: notices.filter((notice) => notice.status === 'Draft').length, label: 'drafts' }, { value: notices.filter((notice) => notice.priority === 'Important' || notice.priority === 'High').length, label: 'high priority' }, { value: notices.filter((notice) => notice.status === 'Archived').length, label: 'archived' }]} />
    <article className="module-panel"><SearchFilters search={search} onSearch={(value) => updateFilter(setSearch, value)} hasFilters={hasFilters} onClear={clearFilters}><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select value={priority} onChange={(event) => updateFilter(setPriority, event.target.value)} aria-label="Filter by priority"><option value="">All priorities</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select><select value={department} onChange={(event) => updateFilter(setDepartment, event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item} value={item === 'All departments' ? '' : item}>{item}</option>)}</select></SearchFilters>
      <div className="table-meta"><span>{filteredNotices.length} notice{filteredNotices.length === 1 ? '' : 's'}</span><div className="sort-controls"><span>Sort:</span><SortButton label="Title" active={sort.key === 'title'} direction={sort.direction} onClick={() => toggleSort('title')} /><SortButton label="Published" active={sort.key === 'publicationDate'} direction={sort.direction} onClick={() => toggleSort('publicationDate')} /></div></div>
      {loading ? <div className="table-loading">Loading notices...</div> : filteredNotices.length === 0 ? <EmptyState icon={Bell} title="No notices found" description="Create a notice or adjust the filters to see announcements." action="Create notice" onAction={openAdd} /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Notice</th><th>Category</th><th>Priority</th><th>Audience</th><th>Expiry</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleNotices.map((notice) => <tr key={notice.id}><td><div className="table-person"><span className="table-file-icon notice-file-icon"><Megaphone size={15} /></span><div><strong>{notice.title}</strong><small>{formatDate(notice.publicationDate)} · {notice.department}</small></div></div></td><td>{notice.category}</td><td><StatusBadge tone={notice.priority.toLowerCase()}>{notice.priority}</StatusBadge></td><td>{notice.targetAudience}</td><td>{formatDate(notice.expiryDate)}</td><td><StatusBadge tone={notice.status.toLowerCase()}>{notice.status}</StatusBadge></td><td><div className="row-actions"><button onClick={() => setPreviewNotice(notice)} aria-label={`Preview ${notice.title}`}><Eye size={15} /></button><button onClick={() => openEdit(notice)} aria-label={`Edit ${notice.title}`}><Edit3 size={15} /></button>{notice.status === 'Draft' && <button onClick={() => changeStatus(notice, 'Published')} aria-label={`Publish ${notice.title}`}><Send size={15} /></button>}{notice.status === 'Published' && <button onClick={() => changeStatus(notice, 'Archived')} aria-label={`Archive ${notice.title}`}><Archive size={15} /></button>}<button className="danger-action" onClick={() => setConfirmNotice(notice)} aria-label={`Delete ${notice.title}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
      <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} />
    </article>
    <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit notice' : 'Create notice'} eyebrow="Notice board" wide footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="secondary-button" form="notice-form" name="saveDraft">Save draft</button><button className="primary-button" form="notice-form" name="publish">{form.status === 'Published' ? 'Publish notice' : 'Save notice'}</button></>}>
      <form id="notice-form" className="form-grid" onSubmit={submit} noValidate><FormField label="Title" required error={errors.title}><input value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="End Semester Examination Schedule" /></FormField><FormField label="Category" required error={errors.category}><select value={form.category} onChange={(event) => updateForm('category', event.target.value)}><option value="">Select category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Description" required error={errors.description}><textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Write the official announcement..." /></FormField><FormField label="Priority"><select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Target audience"><input value={form.targetAudience} onChange={(event) => updateForm('targetAudience', event.target.value)} placeholder="All students" /></FormField><FormField label="Department" required error={errors.department}><select value={form.department} onChange={(event) => updateForm('department', event.target.value)}><option value="">Select department</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Publication date" required error={errors.publicationDate}><input type="date" value={dateInputValue(form.publicationDate)} onChange={(event) => updateForm('publicationDate', new Date(`${event.target.value}T12:00:00`).toISOString())} /></FormField><FormField label="Expiry date" required error={errors.expiryDate}><input type="date" value={dateInputValue(form.expiryDate)} onChange={(event) => updateForm('expiryDate', new Date(`${event.target.value}T12:00:00`).toISOString())} /></FormField></form>
    </Modal>
    <Modal open={Boolean(previewNotice)} onClose={() => setPreviewNotice(null)} title={previewNotice?.title || 'Notice preview'} eyebrow="Student-facing preview"><div className="notice-preview-card"><div className="notice-preview-top"><StatusBadge tone={previewNotice?.priority?.toLowerCase()}>{previewNotice?.priority}</StatusBadge><span>{previewNotice && formatDate(previewNotice.publicationDate)}</span></div><h3>{previewNotice?.title}</h3><p>{previewNotice?.description}</p><div className="notice-preview-meta"><span>{previewNotice?.category}</span><span>{previewNotice?.department}</span><span>Expires {previewNotice && formatDate(previewNotice.expiryDate)}</span></div></div><div className="modal-actions"><button className="secondary-button" onClick={() => setPreviewNotice(null)}>Close preview</button></div></Modal>
    <ConfirmDialog open={Boolean(confirmNotice)} title="Delete notice?" description={`This will remove ${confirmNotice?.title || 'this notice'} from the local notice board.`} onCancel={() => setConfirmNotice(null)} onConfirm={confirmDelete} />
  </section>
}
