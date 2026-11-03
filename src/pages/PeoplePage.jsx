import { useMemo, useState } from 'react'
import { Download, Edit3, Eye, GraduationCap, Plus, Trash2, Users } from 'lucide-react'
import { useCampusData } from '../context/CampusDataContext'
import { downloadCsv } from '../utils/csv'
import { formatDate } from '../utils/formatters'
import { createId } from '../utils/ids'
import { ConfirmDialog, EmptyState, FormField, Modal, PageStatStrip, Pagination, SearchFilters, SortButton, StatusBadge } from '../components/ManagementUI'

const PAGE_SIZE = 6
const emptyStudent = { fullName: '', registrationNumber: '', email: '', phone: '', department: '', programme: '', semester: '', accountStatus: 'Active' }
const departments = ['Arts & Humanities', 'Science & Technology', 'Commerce & Management', 'Social Sciences']
const statuses = ['Active', 'Inactive', 'Suspended']

function sortRows(rows, sort) {
  return [...rows].sort((a, b) => {
    const left = String(a[sort.key] || '').toLowerCase()
    const right = String(b[sort.key] || '').toLowerCase()
    return (left > right ? 1 : left < right ? -1 : 0) * (sort.direction === 'asc' ? 1 : -1)
  })
}

export default function PeoplePage({ notify }) {
  const { students, loading, saveStudent, deleteStudent, stats } = useCampusData()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState({ key: 'fullName', direction: 'asc' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyStudent)
  const [errors, setErrors] = useState({})
  const [confirmStudent, setConfirmStudent] = useState(null)
  const [detailStudent, setDetailStudent] = useState(null)

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = students.filter((student) => {
      const matchesSearch = !query || [student.fullName, student.registrationNumber, student.email, student.programme].some((value) => String(value).toLowerCase().includes(query))
      return matchesSearch && (!department || student.department === department) && (!semester || student.semester === semester) && (!status || student.accountStatus === status)
    })
    return sortRows(filtered, sort)
  }, [students, search, department, semester, status, sort])
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const visibleStudents = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasFilters = Boolean(search || department || semester || status)

  const updateFilter = (setter, value) => { setter(value); setPage(1) }
  const toggleSort = (key) => setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' })
  const openAdd = () => { setForm(emptyStudent); setErrors({}); setModal('add') }
  const openEdit = (student) => { setForm({ ...student }); setErrors({}); setModal('edit') }
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const validate = () => {
    const nextErrors = {}
    if (!form.fullName.trim()) nextErrors.fullName = 'Enter the student name.'
    if (!form.registrationNumber.trim()) nextErrors.registrationNumber = 'Enter a registration number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.phone.trim()) nextErrors.phone = 'Enter a phone number.'
    if (!form.department) nextErrors.department = 'Select a department.'
    if (!form.programme.trim()) nextErrors.programme = 'Enter a programme.'
    if (!form.semester) nextErrors.semester = 'Select a semester.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try {
      await saveStudent(form)
      setModal(null)
      notify(form.id ? 'Student record updated.' : 'Student added successfully.')
    } catch (error) {
      setErrors({ registrationNumber: error.message })
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteStudent(confirmStudent)
      setConfirmStudent(null)
      notify('Student record deleted.')
    } catch (error) {
      notify(`Could not delete student: ${error.message}`)
    }
  }

  const exportStudents = () => {
    downloadCsv('campusiq-students.csv', filteredStudents, [
      { label: 'Full name', value: (row) => row.fullName },
      { label: 'Registration number', value: (row) => row.registrationNumber },
      { label: 'Email', value: (row) => row.email },
      { label: 'Phone', value: (row) => row.phone },
      { label: 'Department', value: (row) => row.department },
      { label: 'Programme', value: (row) => row.programme },
      { label: 'Semester', value: (row) => row.semester },
      { label: 'Account status', value: (row) => row.accountStatus },
    ])
    notify('Student CSV exported.')
  }

  return <section className="module-page">
    <div className="module-heading"><div><p className="eyebrow"><span className="live-dot" /> Community</p><h1>People</h1><p className="hero-subtitle">Manage registered students and keep account information up to date.</p></div><div className="module-heading-actions"><button className="secondary-button" onClick={exportStudents} disabled={!filteredStudents.length}><Download size={15} /> Export CSV</button><button className="primary-button" onClick={openAdd}><Plus size={16} /> Add student</button></div></div>
    <PageStatStrip stats={[{ value: stats.registeredStudents, label: 'registered students' }, { value: students.filter((student) => student.accountStatus === 'Active').length, label: 'active accounts', tone: 'green' }, { value: new Set(students.map((student) => student.department)).size, label: 'departments' }, { value: `${students.length ? Math.round((students.filter((student) => student.email && student.phone).length / students.length) * 100) : 0}%`, label: 'profile completion' }]} />
    <article className="module-panel">
      <SearchFilters search={search} onSearch={(value) => updateFilter(setSearch, value)} hasFilters={hasFilters} onClear={() => { setSearch(''); setDepartment(''); setSemester(''); setStatus(''); setPage(1) }}>
        <select value={department} onChange={(event) => updateFilter(setDepartment, event.target.value)} aria-label="Filter by department"><option value="">All departments</option>{departments.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={semester} onChange={(event) => updateFilter(setSemester, event.target.value)} aria-label="Filter by semester"><option value="">All semesters</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}</select>
        <select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} aria-label="Filter by account status"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
      </SearchFilters>
      <div className="table-meta"><span>{filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}</span><div className="sort-controls"><span>Sort:</span><SortButton label="Name" active={sort.key === 'fullName'} direction={sort.direction} onClick={() => toggleSort('fullName')} /><SortButton label="Registered" active={sort.key === 'createdAt'} direction={sort.direction} onClick={() => toggleSort('createdAt')} /></div></div>
      {loading ? <div className="table-loading">Loading student records...</div> : filteredStudents.length === 0 ? <EmptyState icon={Users} title="No students found" description="Try changing the search or filters, or add a new student record." action="Add student" onAction={openAdd} /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Registration</th><th>Department</th><th>Programme</th><th>Semester</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id}><td><div className="table-person"><span className="table-avatar">{student.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{student.fullName}</strong><small>{student.email}</small></div></div></td><td>{student.registrationNumber}</td><td>{student.department}</td><td>{student.programme}</td><td>Sem {student.semester}</td><td><StatusBadge tone={student.accountStatus.toLowerCase()}>{student.accountStatus}</StatusBadge></td><td><div className="row-actions"><button onClick={() => setDetailStudent(student)} aria-label={`View ${student.fullName}`}><Eye size={15} /></button><button onClick={() => openEdit(student)} aria-label={`Edit ${student.fullName}`}><Edit3 size={15} /></button><button className="danger-action" onClick={() => setConfirmStudent(student)} aria-label={`Delete ${student.fullName}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
      <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onPageChange={setPage} />
    </article>

    <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit student' : 'Add student'} eyebrow="Student record" wide footer={<><button className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" form="student-form">{modal === 'edit' ? 'Save changes' : 'Add student'}</button></>}>
      <form id="student-form" className="form-grid" onSubmit={submit} noValidate><FormField label="Full name" required error={errors.fullName}><input value={form.fullName} onChange={(event) => updateForm('fullName', event.target.value)} placeholder="e.g. Aarav Sharma" /></FormField><FormField label="Registration number" required error={errors.registrationNumber}><input value={form.registrationNumber} onChange={(event) => updateForm('registrationNumber', event.target.value)} placeholder="CIQ-2024-0009" /></FormField><FormField label="Email" required error={errors.email}><input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="student@example.edu" /></FormField><FormField label="Phone number" required error={errors.phone}><input value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} placeholder="+91 98765 00000" /></FormField><FormField label="Department" required error={errors.department}><select value={form.department} onChange={(event) => updateForm('department', event.target.value)}><option value="">Select department</option>{departments.map((item) => <option key={item}>{item}</option>)}</select></FormField><FormField label="Programme" required error={errors.programme}><input value={form.programme} onChange={(event) => updateForm('programme', event.target.value)} placeholder="B.Sc. Computer Science" /></FormField><FormField label="Semester" required error={errors.semester}><select value={form.semester} onChange={(event) => updateForm('semester', event.target.value)}><option value="">Select semester</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Semester {index + 1}</option>)}</select></FormField><FormField label="Account status"><select value={form.accountStatus} onChange={(event) => updateForm('accountStatus', event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></FormField></form>
    </Modal>
    <Modal open={Boolean(detailStudent)} onClose={() => setDetailStudent(null)} title={detailStudent?.fullName || 'Student details'} eyebrow="Student profile"><div className="detail-profile"><span className="detail-avatar">{detailStudent?.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{detailStudent?.registrationNumber}</strong><small>{detailStudent?.email}</small></div></div><div className="detail-grid">{[['Phone', detailStudent?.phone], ['Department', detailStudent?.department], ['Programme', detailStudent?.programme], ['Semester', `Semester ${detailStudent?.semester}`], ['Status', detailStudent?.accountStatus], ['Registered', formatDate(detailStudent?.createdAt)]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="modal-actions"><button className="secondary-button" onClick={() => setDetailStudent(null)}>Close</button><button className="primary-button" onClick={() => { setDetailStudent(null); openEdit(detailStudent) }}>Edit student</button></div></Modal>
    <ConfirmDialog open={Boolean(confirmStudent)} title="Delete student record?" description={`This will remove ${confirmStudent?.fullName || 'this student'} from the local CampusIQ directory.`} onCancel={() => setConfirmStudent(null)} onConfirm={confirmDelete} />
  </section>
}
