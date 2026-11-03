import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, Edit3, Eye, FileText, Filter, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { useCampusData } from '../context/CampusDataContext'
import { ConfirmDialog, EmptyState, FormField, Modal, PageStatStrip, Pagination, SearchFilters, SortButton, StatusBadge } from '../components/ManagementUI'
import { formatDate, formatFileSize } from '../utils/formatters'
import { createId, nowIso } from '../utils/ids'

const PAGE_SIZE = 6
const MAX_FILE_SIZE = 10 * 1024 * 1024
const categories = ['Examinations', 'Admissions', 'Scholarships', 'Academic events', 'Other']
const languages = ['English', 'Assamese', 'Bilingual']
const departments = ['All departments', 'Arts & Humanities', 'Science & Technology', 'Commerce & Management', 'Social Sciences']
const statuses = ['Uploaded', 'Processing', 'Indexed', 'Failed']
const emptyDocument = { title: '', description: '', fileName: '', category: '', language: 'English', department: '', academicYear: '2024–25', uploadDate: nowIso(), fileSize: 0, processingStatus: 'Processing', fileId: null, localDemo: true }

function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function statusTone(status) {
  return status.toLowerCase()
}

export default function DocumentsPage({ notify }) {
  const { documents, loading, saveDocument, deleteDocument, getDocumentFile, stats } = useCampusData()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sort, setSort] = useState({ key: 'uploadDate', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyDocument)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState({})
  const [confirmDocument, setConfirmDocument] = useState(null)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = documents.filter((document) => {
      const matchesSearch = !query || [document.title, document.fileName, document.description, document.category].some((value) => String(value || '').toLowerCase().includes(query))
      const uploadDate = dateInputValue(document.uploadDate)
      return matchesSearch && (!category || document.category === category) && (!language || document.language === language) && (!department || document.department === department) && (!status || document.processingStatus === status) && (!dateFilter || uploadDate === dateFilter)
    })
    return [...rows].sort((a, b) => {
      const left = sort.key === 'fileSize' ? a.fileSize : new Date(a[sort.key]).getTime()
      const right = sort.key === 'fileSize' ? b.fileSize : new Date(b[sort.key]).getTime()
      return (left - right) * (sort.direction === 'asc' ? 1 : -1)
    })
  }, [documents, search, category, language, department, status, dateFilter, sort])
  const pageCount = Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE))
  const visibleDocuments = filteredDocuments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = Boolean(search || category || language || department || status || dateFilter)
  const updateFilter = (setter, value) => { setter(value); setPage(1) }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const openAdd = () => { setForm({ ...emptyDocument, uploadDate: nowIso() }); setFile(null); setErrors({}); setModal('add') }
  const openEdit = (document) => { setForm({ ...document }); setFile(null); setErrors({}); setModal('edit') }
  const validateFile = (candidate) => {
    if (!candidate) return true
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) { setErrors({ file: 'Only PDF files can be uploaded.' }); return false }
    if (candidate.size > MAX_FILE_SIZE) { setErrors({ file: 'PDF files must be 10 MB or smaller.' }); return false }
    setErrors((current) => ({ ...current, file: '' }))
    return true
  }
  const acceptFile = (candidate) => { if (validateFile(candidate)) { setFile(candidate); updateForm('fileName', candidate.name); updateForm('fileSize', candidate.size) } }
  const onFileInput = (event) => acceptFile(event.target.files?.[0])
  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Enter a document title.'
    if (!form.category) nextErrors.category = 'Select a category.'
    if (!form.language) nextErrors.language = 'Select a language.'
    if (!form.department) nextErrors.department = 'Select a department.'
    if (!form.fileName && !form.id) nextErrors.file = 'Choose a PDF file to upload.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      await saveDocument({ ...form, uploadDate: form.uploadDate || nowIso(), processingStatus: form.processingStatus || 'Processing' }, file)
      setModal(null)
      notify(form.id ? 'Document metadata updated.' : 'PDF saved to the local document library.')
    } catch (error) {
      setErrors({ file: error.message })
    }
  }
  const confirmDelete = async () => { try { await deleteDocument(confirmDocument); setConfirmDocument(null); notify('Document deleted.') } catch (error) { notify(`Could not delete document: ${error.message}`) } }
  const toggleSort = (key) => setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' })
  const clearFilters = () => { setSearch(''); setCategory(''); setLanguage(''); setDepartment(''); setStatus(''); setDateFilter(''); setPage(1) }

  const openPreview = async (document) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    let storedFile
    try { storedFile = await getDocumentFile(document.id) } catch (error) { notify(`Could not preview document: ${error.message}`); return }
    if (!storedFile) { notify('This seeded demo record has no local PDF bytes attached. Upload a replacement to preview it.'); return }
    setPreviewUrl(URL.createObjectURL(storedFile))
    setPreviewDocument(document)
  }
  const closePreview = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(''); setPreviewDocument(null) }
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  const downloadDocument = async (document) => {
    let storedFile
    try { storedFile = await getDocumentFile(document.id) } catch (error) { notify(`Could not download document: ${error.message}`); return }
    if (!storedFile) { notify('No local PDF is attached to this demo record.'); return }
    const url = URL.createObjectURL(storedFile)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = document.fileName
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Document download started.')
  }

  return <section className="module-page">
    <div className="module-heading"><div><p className="eyebrow"><span className="live-dot" /> Knowledge base</p><h1>Documents</h1><p className="hero-subtitle">Manage the local document library used for CampusIQ content workflows.</p></div><button className="primary-button" onClick={openAdd}><Plus size={16} /> Upload document</button></div>
    <PageStatStrip stats={[{ value: stats.totalDocuments, label: 'total documents' }, { value: stats.indexedDocuments, label: 'indexed · local demo', tone: 'green' }, { value: stats.processingDocuments, label: 'processing · local demo' }, { value: stats.failedDocuments, label: 'failed · local demo' }]} />
    <article className="module-panel"><SearchFilters search={search} onSearch={(value) => updateFilter(setSearch, value)} hasFilters={hasFilters} onClear={clearFilters}><select value={category} onChange={(event) => updateFilter(setCategory, event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={language} onChange={(event) => updateFilter(setLanguage, event.target.value)} aria-label="Filter by language"><option value="">All languages</option>{languages.map((item) => <option key={item}>{item}</option>)}</select><select value={department} onChange={(event) => updateFilter(setDepartment, event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item} value={item === 'All departments' ? '' : item}>{item}</option>)}</select><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><input className="date-filter" type="date" value={dateFilter} onChange={(event) => updateFilter(setDateFilter, event.target.value)} aria-label="Filter by upload date" /></SearchFilters>
      <div className="table-meta"><span>{filteredDocuments.length} document{filteredDocuments.length === 1 ? '' : 's'} <small className="demo-label">Local demo data</small></span><div className="sort-controls"><span>Sort:</span><SortButton label="Upload date" active={sort.key === 'uploadDate'} direction={sort.direction} onClick={() => toggleSort('uploadDate')} /><SortButton label="Size" active={sort.key === 'fileSize'} direction={sort.direction} onClick={() => toggleSort('fileSize')} /></div></div>
      {loading ? <div className="table-loading">Loading documents...</div> : filteredDocuments.length === 0 ? <EmptyState icon={FileText} title="No documents found" description="Upload a PDF or adjust the filters to see local document records." action="Upload document" onAction={openAdd} /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Document</th><th>Category</th><th>Language</th><th>Uploaded</th><th>Size</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleDocuments.map((document) => <tr key={document.id}><td><div className="table-person"><span className="table-file-icon"><FileText size={15} /></span><div><strong>{document.title}</strong><small>{document.fileName || 'No file name'}</small></div></div></td><td>{document.category}</td><td>{document.language}</td><td>{formatDate(document.uploadDate)}</td><td>{formatFileSize(document.fileSize)}</td><td><StatusBadge tone={statusTone(document.processingStatus)}>{document.processingStatus} <small>demo</small></StatusBadge></td><td><div className="row-actions"><button onClick={() => openPreview(document)} aria-label={`Preview ${document.title}`}><Eye size={15} /></button><button onClick={() => downloadDocument(document)} aria-label={`Download ${document.title}`}><Download size={15} /></button><button onClick={() => openEdit(document)} aria-label={`Edit ${document.title}`}><Edit3 size={15} /></button><button className="danger-action" onClick={() => setConfirmDocument(document)} aria-label={`Delete ${document.title}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
      <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} />
    </article>

    <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit document' : 'Upload document'} eyebrow="Local document library" wide footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" form="document-form">{modal === 'edit' ? 'Save changes' : 'Save document'}</button></>}>
      <form id="document-form" onSubmit={submit} noValidate><div onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]) }} className={`document-upload-zone ${dragging ? 'dragging' : ''}`}><input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={onFileInput} hidden /><span className="upload-zone-icon"><Upload size={22} /></span><strong>{file?.name || form.fileName || 'Drop a PDF here'}</strong><small>{file ? formatFileSize(file.size) : 'PDF only · Maximum 10 MB · local/demo storage'}</small><button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>{form.fileName ? 'Replace PDF' : 'Choose PDF'}</button>{errors.file && <span className="field-error">{errors.file}</span>}</div><div className="form-grid document-form-fields"><FormField label="Title" required error={errors.title}><input value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Examination Regulations 2024" /></FormField><FormField label="Description"><input value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Short description" /></FormField><FormField label="Category" required error={errors.category}><select value={form.category} onChange={(event) => updateForm('category', event.target.value)}><option value="">Select category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Language" required error={errors.language}><select value={form.language} onChange={(event) => updateForm('language', event.target.value)}>{languages.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Department" required error={errors.department}><select value={form.department} onChange={(event) => updateForm('department', event.target.value)}><option value="">Select department</option>{departments.slice(1).map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Academic year"><input value={form.academicYear} onChange={(event) => updateForm('academicYear', event.target.value)} placeholder="2024–25" /></FormField><FormField label="Processing status" hint="Local/demo status only"><select value={form.processingStatus} onChange={(event) => updateForm('processingStatus', event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Upload date"><input type="date" value={dateInputValue(form.uploadDate)} onChange={(event) => updateForm('uploadDate', new Date(`${event.target.value}T12:00:00`).toISOString())} /></FormField></div></form>
    </Modal>
    <Modal open={Boolean(previewDocument)} onClose={closePreview} title={previewDocument?.title || 'PDF preview'} eyebrow="Local PDF preview" wide><div className="pdf-preview-meta"><span className="pdf-icon">PDF</span><div><strong>{previewDocument?.fileName}</strong><small>{previewDocument && formatFileSize(previewDocument.fileSize)} · Local browser storage</small></div></div>{previewUrl && <iframe className="pdf-frame" src={previewUrl} title={`Preview of ${previewDocument?.title}`} />}</Modal>
    <ConfirmDialog open={Boolean(confirmDocument)} title="Delete document?" description={`This removes ${confirmDocument?.title || 'this document'} and its locally stored PDF from this browser.`} onCancel={() => setConfirmDocument(null)} onConfirm={confirmDelete} />
  </section>
}
