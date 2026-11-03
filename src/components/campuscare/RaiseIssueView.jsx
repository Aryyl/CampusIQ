import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle, ImagePlus, Loader2, Sparkles, X } from 'lucide-react'
import { submitIssue, suggestCategory, suggestPriority } from '../../services/campusCareService'

const CATEGORIES_EN = [
  'Electrical Problems',
  'Plumbing and Water Supply',
  'Infrastructure Damage',
  'Laboratory Equipment',
  'Sanitation and Cleanliness',
  'Furniture and Facilities',
  'Internet and Network',
  'Other',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function RaiseIssueView({ student, t, onSuccess, currentLang }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    language: currentLang === 'as' ? 'Assamese' : 'English',
    building: '',
    floor: '',
    room: '',
    additionalInfo: '',
  })
  const [errors, setErrors] = useState({})
  const [images, setImages] = useState([]) // { file, preview, name }
  const [imageProgress, setImageProgress] = useState({}) // { index: pct }
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null) // ticketId after success
  const [aiCategory, setAiCategory] = useState(null)
  const [aiPriority, setAiPriority] = useState(null)

  const fileInputRef = useRef(null)
  const categories = t('categories') || CATEGORIES_EN

  // AI suggestions update as description changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.description.length > 15) {
        const cat = suggestCategory(form.description)
        const pri = suggestPriority(form.description, cat || form.category)
        setAiCategory(cat)
        setAiPriority(pri)
      } else {
        setAiCategory(null)
        setAiPriority(null)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [form.description, form.category])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files || [])
    const valid = []
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not a supported image type.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds the 5 MB size limit.`)
        continue
      }
      valid.push({ file, preview: URL.createObjectURL(file), name: file.name })
    }
    setImages((prev) => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = t('titleRequired')
    if (form.description.trim().length < 20) e.description = t('descriptionTooShort')
    if (!form.category) e.category = t('categoryRequired')
    if (!form.building.trim()) e.building = t('buildingRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const ticketId = await submitIssue(
        { ...form, suggestedPriority: aiPriority || 'Medium' },
        images.map((img) => img.file),
        student,
        (fileIdx, pct) => setImageProgress((prev) => ({ ...prev, [fileIdx]: pct }))
      )
      setSubmitted(ticketId)
    } catch (err) {
      console.error('Issue submission failed:', err)
      alert('Submission failed. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success Screen ───────────────────────────────
  if (submitted) {
    return (
      <div className="cc-success-screen">
        <div className="cc-success-icon">
          <CheckCircle size={40} />
        </div>
        <h2>{t('issueSubmitted')}</h2>
        <p>
          {t('ticketCreated')} <strong className="cc-ticket-id">{submitted}</strong>
        </p>
        <p className="cc-success-hint">
          You can track the status of your complaint in <strong>My Issues</strong>. The administration will review it shortly.
        </p>
        <div className="cc-success-actions">
          <button className="cc-btn-primary" onClick={() => onSuccess(submitted)}>
            {t('viewMyIssues')}
          </button>
          <button
            className="cc-btn-secondary"
            onClick={() => {
              setSubmitted(null)
              setForm({ title: '', description: '', category: '', language: currentLang === 'as' ? 'Assamese' : 'English', building: '', floor: '', room: '', additionalInfo: '' })
              setImages([])
              setImageProgress({})
              setErrors({})
            }}
          >
            {t('raiseIssue')}
          </button>
        </div>
      </div>
    )
  }

  // ─── Form ─────────────────────────────────────────
  return (
    <div className="cc-raise-container">
      <div className="cc-raise-header">
        <div className="cc-raise-header-text">
          <h2>{t('raiseIssue')}</h2>
          <p>Report a campus problem and we'll get it fixed.</p>
        </div>
      </div>

      <form className="cc-form" onSubmit={handleSubmit} noValidate>
        {/* ── Issue Title ── */}
        <div className={`cc-field ${errors.title ? 'cc-field-error' : ''}`}>
          <label>
            {t('issueTitle')} <em>*</em>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder={t('issueTitlePlaceholder')}
            maxLength={120}
          />
          {errors.title && <small className="cc-error">{errors.title}</small>}
        </div>

        {/* ── Description ── */}
        <div className={`cc-field ${errors.description ? 'cc-field-error' : ''}`}>
          <label>
            {t('issueDescription')} <em>*</em>
          </label>
          <textarea
            value={form.description}
            onChange={set('description')}
            placeholder={t('issueDescriptionPlaceholder')}
            rows={4}
          />
          <div className="cc-field-meta">
            <small className="cc-char-count">{form.description.length} chars</small>
            {errors.description && <small className="cc-error">{errors.description}</small>}
          </div>
        </div>

        {/* ── AI Suggestions ── */}
        {(aiCategory || aiPriority) && (
          <div className="cc-ai-suggestions">
            <span className="cc-ai-badge">
              <Sparkles size={12} /> {t('aiSuggested')}
            </span>
            {aiCategory && (
              <span className="cc-ai-chip">
                {t('suggestedCategory')}: <strong>{aiCategory}</strong>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: aiCategory }))}
                >
                  Apply
                </button>
              </span>
            )}
            {aiPriority && (
              <span className={`cc-ai-chip priority-${aiPriority.toLowerCase()}`}>
                {t('suggestedPriority')}: <strong>{aiPriority}</strong>
              </span>
            )}
          </div>
        )}

        {/* ── Category & Language Row ── */}
        <div className="cc-row-two">
          <div className={`cc-field ${errors.category ? 'cc-field-error' : ''}`}>
            <label>
              {t('issueCategory')} <em>*</em>
            </label>
            <select value={form.category} onChange={set('category')}>
              <option value="">{t('selectCategory')}</option>
              {CATEGORIES_EN.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <small className="cc-error">{errors.category}</small>}
          </div>

          <div className="cc-field">
            <label>{t('submissionLanguage')}</label>
            <div className="cc-lang-toggle">
              {['English', 'Assamese'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={form.language === lang ? 'active' : ''}
                  onClick={() => setForm((f) => ({ ...f, language: lang }))}
                >
                  {lang === 'English' ? '🇬🇧 English' : '🇮🇳 অসমীয়া'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Location ── */}
        <div className="cc-section-label">Location</div>
        <div className="cc-row-three">
          <div className={`cc-field ${errors.building ? 'cc-field-error' : ''}`}>
            <label>
              {t('issueBuilding')} <em>*</em>
            </label>
            <input
              type="text"
              value={form.building}
              onChange={set('building')}
              placeholder={t('issueBuildingPlaceholder')}
            />
            {errors.building && <small className="cc-error">{errors.building}</small>}
          </div>
          <div className="cc-field">
            <label>{t('issueFloor')}</label>
            <input
              type="text"
              value={form.floor}
              onChange={set('floor')}
              placeholder={t('issueFloorPlaceholder')}
            />
          </div>
          <div className="cc-field">
            <label>{t('issueRoom')}</label>
            <input
              type="text"
              value={form.room}
              onChange={set('room')}
              placeholder={t('issueRoomPlaceholder')}
            />
          </div>
        </div>

        {/* ── Additional Info ── */}
        <div className="cc-field">
          <label>{t('additionalInfo')}</label>
          <textarea
            value={form.additionalInfo}
            onChange={set('additionalInfo')}
            placeholder={t('additionalInfoPlaceholder')}
            rows={2}
          />
        </div>

        {/* ── Image Upload ── */}
        <div className="cc-field">
          <label>{t('attachImages')}</label>
          <small className="cc-hint">{t('attachImagesHint')}</small>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            hidden
            onChange={handleImages}
          />
          {images.length > 0 && (
            <div className="cc-image-previews">
              {images.map((img, idx) => (
                <div className="cc-image-thumb" key={idx}>
                  <img src={img.preview} alt={img.name} />
                  {imageProgress[idx] !== undefined && imageProgress[idx] < 100 && (
                    <div className="cc-upload-progress">
                      <div style={{ width: `${imageProgress[idx]}%` }} />
                    </div>
                  )}
                  <button type="button" className="cc-remove-image" onClick={() => removeImage(idx)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="cc-add-images-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={16} /> {t('addImages')}
          </button>
        </div>

        {/* ── Submit ── */}
        <div className="cc-form-actions">
          <button type="submit" className="cc-btn-primary cc-submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="cc-spin" /> {t('submitting')}
              </>
            ) : (
              t('submitIssue')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

