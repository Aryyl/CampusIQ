import { useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'

const SAMPLE_RESUMES = {
  webdev: {
    labelEn: 'Web Dev Sample',
    labelAs: 'ৱেব ডেভ নমুনা',
    text: `Priya Sharma - Frontend Developer
Skills: React, TypeScript, JavaScript, HTML, CSS, Tailwind, Git, Node.js, REST API, PostgreSQL, Figma
Experience: Built 3 web applications using React and Firebase. Contributed to open-source projects on GitHub.
Education: B.Tech Computer Science, 2024. CGPA: 8.2
Projects: E-commerce platform (React + Node.js + MongoDB), Portfolio website, Task management app.
Soft Skills: Problem Solving, Teamwork, Communication, Agile`,
  },
  datascience: {
    labelEn: 'Data Science Sample',
    labelAs: 'ডাটা বিজ্ঞান নমুনা',
    text: `Rahul Das - Data Science Student
Skills: Python, Pandas, NumPy, Matplotlib, SQL, Machine Learning, Scikit-learn, Data Analysis, Statistics, Jupyter
Experience: Completed 2 Kaggle competitions. Analyzed sales datasets for a local business.
Education: B.Sc Statistics, 2024. CGPA: 7.8
Projects: Sales Prediction Model, Customer Segmentation (K-Means), COVID-19 Data Dashboard.
Soft Skills: Research, Critical Thinking, Communication`,
  },
  general: {
    labelEn: 'General CS Sample',
    labelAs: 'সাধাৰণ CS নমুনা',
    text: `Ankita Borah - CS Graduate
Skills: Java, Python, C++, Data Structures, Algorithms, OOP, Git, Linux, SQL, Problem Solving
Experience: Participated in college hackathon (2nd place). Built a library management system in Java.
Education: B.Tech Computer Science, 2024. CGPA: 7.5
Projects: Library Management System (Java + MySQL), Snake Game (Python), Simple Chatbot.
Soft Skills: Leadership, Communication, Agile, Teamwork`,
  },
}

export default function ResumeUploader({ onAnalyze, t, currentLang }) {
  const [tab, setTab] = useState('upload') // 'upload' | 'paste'
  const [pasteText, setPasteText] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileText, setFileText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const isAs = currentLang === 'as'

  const readFile = (file) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError(isAs ? 'ফাইলৰ আকাৰ ২MB-তকৈ বেছি হ\'ব নোৱাৰে।' : 'File must be under 2MB.'); return }
    const reader = new FileReader()
    reader.onload = (e) => { setFileText(e.target.result); setFileName(file.name); setError('') }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  const handleAnalyzeClick = () => {
    const text = tab === 'paste' ? pasteText : fileText
    if (!text.trim()) { setError(isAs ? 'অনুগ্ৰহ কৰি আপোনাৰ ৰিজ্যুম যোগ দিয়ক।' : 'Please add your resume text first.'); return }
    setError('')
    onAnalyze(text)
  }

  const useSample = (key) => {
    const sample = SAMPLE_RESUMES[key]
    setPasteText(sample.text)
    setTab('paste')
    setError('')
  }

  const clear = () => { setFileText(''); setFileName(''); setPasteText(''); setError('') }

  return (
    <div className="cc-uploader">
      <div className="cc-tabs">
        <button className={`cc-tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
          <Upload size={14} /> {isAs ? 'ফাইল আপলোড' : 'Upload File'}
        </button>
        <button className={`cc-tab ${tab === 'paste' ? 'active' : ''}`} onClick={() => setTab('paste')}>
          <FileText size={14} /> {isAs ? 'টেক্সট পেষ্ট কৰক' : 'Paste Text'}
        </button>
      </div>

      {tab === 'upload' ? (
        <div
          className={`cc-dropzone ${dragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".txt,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => readFile(e.target.files[0])} />
          {fileName ? (
            <div className="cc-file-selected">
              <FileText size={28} />
              <span className="cc-file-name">{fileName}</span>
              <button className="cc-file-clear" onClick={(e) => { e.stopPropagation(); clear() }}><X size={14} /></button>
            </div>
          ) : (
            <>
              <Upload size={36} className="cc-drop-icon" />
              <p className="cc-drop-label">{isAs ? 'ৰিজ্যুম ইয়াত ড্ৰপ কৰক বা ক্লিক কৰক' : 'Drop your resume here or click to browse'}</p>
              <p className="cc-drop-hint">{isAs ? 'TXT, PDF, DOCX • সৰ্বোচ্চ ২MB' : 'TXT, PDF, DOCX • Max 2MB'}</p>
            </>
          )}
        </div>
      ) : (
        <div className="cc-paste-area">
          <textarea
            className="cc-paste-input"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={isAs ? 'ইয়াত আপোনাৰ ৰিজ্যুম পেষ্ট কৰক (দক্ষতা, অভিজ্ঞতা, প্ৰকল্পসমূহ)...' : 'Paste your resume text here (skills, experience, projects, education)...'}
            rows={9}
          />
          {pasteText && <button className="cc-paste-clear" onClick={clear}><X size={13} /> {isAs ? 'মচি পেলাওক' : 'Clear'}</button>}
        </div>
      )}

      {error && <p className="cc-error">{error}</p>}

      <div className="cc-samples">
        <span className="cc-samples-label">{isAs ? 'নমুনা চেষ্টা কৰক:' : 'Try a sample:'}</span>
        {Object.entries(SAMPLE_RESUMES).map(([key, s]) => (
          <button key={key} className="cc-sample-btn" onClick={() => useSample(key)}>
            {isAs ? s.labelAs : s.labelEn}
          </button>
        ))}
      </div>

      <button className="cc-analyze-btn" onClick={handleAnalyzeClick}>
        {isAs ? 'কেৰিয়াৰ বিশ্লেষণ কৰক' : 'Analyze My Career'}
      </button>
    </div>
  )
}
