import { AlertTriangle, Check, ChevronLeft, ChevronRight, CircleCheck, X } from 'lucide-react'

export function Modal({ open, onClose, title, eyebrow, children, footer, wide = false }) {
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={`modal-card ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div>{eyebrow && <span className="card-eyebrow">{eyebrow}</span>}<h2 id="modal-title">{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={17} /></button></div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </section>
  </div>
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onCancel, onConfirm, danger = true }) {
  return <Modal open={open} onClose={onCancel} title={title} eyebrow="Please confirm">
    <div className="confirm-content"><span className={`confirm-icon ${danger ? 'danger' : ''}`}><AlertTriangle size={22} /></span><p>{description}</p></div>
    <div className="modal-actions"><button className="secondary-button" onClick={onCancel}>Cancel</button><button className={`primary-button ${danger ? 'danger-button' : ''}`} onClick={onConfirm}>{confirmLabel}</button></div>
  </Modal>
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

export function EmptyState({ icon: Icon = CircleCheck, title, description, action, onAction }) {
  return <div className="data-empty"><span className="data-empty-icon"><Icon size={23} /></span><strong>{title}</strong><span>{description}</span>{action && <button className="primary-button" onClick={onAction}>{action}</button>}</div>
}

export function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null
  return <div className="pagination"><span>Page {page} of {pageCount}</span><div><button className="pagination-button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button><button className="pagination-button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page"><ChevronRight size={15} /></button></div></div>
}

export function FormField({ label, error, hint, children, required = false }) {
  return <label className="form-field"><span>{label}{required && <em>*</em>}</span>{children}{hint && !error && <small className="field-hint">{hint}</small>}{error && <small className="field-error">{error}</small>}</label>
}

export function PageStatStrip({ stats }) {
  return <div className="module-stat-strip">{stats.map(({ value, label, tone = '' }) => <div className={`module-stat ${tone}`} key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
}

export function SearchFilters({ search, onSearch, children, onClear, hasFilters = false }) {
  return <div className="search-filters"><div className="module-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search records..." aria-label="Search records" />{search && <button onClick={() => onSearch('')} aria-label="Clear search"><X size={14} /></button>}</div><div className="filter-controls">{children}{hasFilters && <button className="clear-filters" onClick={onClear}>Clear filters</button>}</div></div>
}

export function SortButton({ label, active, direction, onClick }) {
  return <button className={`sort-button ${active ? 'active' : ''}`} onClick={onClick}>{label}{active && <span>{direction === 'asc' ? '↑' : '↓'}</span>}</button>
}

export function SuccessIcon() {
  return <span className="success-icon"><Check size={14} /></span>
}
