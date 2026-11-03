import { useMemo, useState } from 'react'
import { Bell, CalendarDays, Download, FileText, Users } from 'lucide-react'
import { useCampusData } from '../context/CampusDataContext'
import { EmptyState, SearchFilters, StatusBadge } from '../components/ManagementUI'
import { downloadCsv } from '../utils/csv'
import { formatDate } from '../utils/formatters'

const iconMap = { document: FileText, notice: Bell, deadline: CalendarDays, student: Users }

export default function ActivityPage({ notify }) {
  const { activities, loading } = useCampusData()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const rows = useMemo(() => [...activities].filter((activity) => (!type || activity.type === type) && (!search || `${activity.title} ${activity.description}`.toLowerCase().includes(search.toLowerCase()))).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [activities, type, search])
  const exportActivity = () => { downloadCsv('campusiq-activity.csv', rows, [{ label: 'Type', value: (row) => row.type }, { label: 'Title', value: (row) => row.title }, { label: 'Description', value: (row) => row.description }, { label: 'Created at', value: (row) => row.createdAt }]); notify('Activity CSV exported.') }
  return <section className="module-page"><div className="module-heading"><div><p className="eyebrow"><span className="live-dot" /> Live feed</p><h1>Activity</h1><p className="hero-subtitle">Review changes made across the local CampusIQ workspace.</p></div><button className="secondary-button" onClick={exportActivity} disabled={!rows.length}><Download size={15} /> Export activity</button></div><article className="module-panel activity-module-panel"><SearchFilters search={search} onSearch={setSearch} hasFilters={Boolean(search || type)} onClear={() => { setSearch(''); setType('') }}><select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter activity type"><option value="">All activity</option><option value="document">Documents</option><option value="notice">Notices</option><option value="deadline">Deadlines</option><option value="student">Students</option></select></SearchFilters>{loading ? <div className="table-loading">Loading activity...</div> : rows.length === 0 ? <EmptyState icon={Bell} title="No activity found" description="Activity will appear here after you make local changes." /> : <div className="activity-history-list">{rows.map((activity) => { const Icon = iconMap[activity.type] || Bell; return <div className="activity-history-row" key={activity.id}><span className={`activity-icon ${activity.type === 'document' ? 'green' : activity.type === 'notice' ? 'orange' : activity.type === 'deadline' ? 'purple' : 'blue'}`}><Icon size={15} /></span><div><strong>{activity.title}</strong><small>{activity.description}</small></div><StatusBadge tone="neutral">{formatDate(activity.createdAt)}</StatusBadge></div> })}</div>}</article></section>
}
