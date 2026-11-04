import { useState } from 'react'
import { analyzeResume, generateRoadmap } from '../../services/careerService'
import ResumeUploader from './ResumeUploader'
import JobMatchCards from './JobMatchCards'
import RoadmapTimeline from './RoadmapTimeline'

const CATEGORY_LABELS_EN = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  cloud_devops: 'Cloud & DevOps',
  ai_ml: 'AI & ML',
  cybersecurity: 'Cybersecurity',
  core_cs: 'Core CS',
  soft_skills: 'Soft Skills',
  assamese_keywords: 'Academic',
}

const CATEGORY_LABELS_AS = {
  frontend: 'ফ্ৰণ্ট-এণ্ড',
  backend: 'বেক-এণ্ড',
  database: 'ডাটাবেছ',
  cloud_devops: 'ক্লাউড আৰু DevOps',
  ai_ml: 'AI আৰু ML',
  cybersecurity: 'চাইবাৰ সুৰক্ষা',
  core_cs: 'মূল CS',
  soft_skills: 'ছফট দক্ষতা',
  assamese_keywords: 'শৈক্ষিক',
}

export default function CareerCompassView({ student, t, currentLang }) {
  const [analysis, setAnalysis] = useState(null)
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const isAs = currentLang === 'as'

  const handleAnalyze = (text) => {
    const result = analyzeResume(text, currentLang)
    setAnalysis(result)
    // Auto-select top matched role
    if (result?.scoredRoles?.length > 0) {
      const topRole = result.scoredRoles[0]
      setSelectedRoleId(topRole.id)
      setRoadmap(generateRoadmap(result, topRole.id, currentLang))
    }
  }

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId)
    if (analysis) {
      setRoadmap(generateRoadmap(analysis, roleId, currentLang))
    }
  }

  const handleReset = () => { setAnalysis(null); setSelectedRoleId(null); setRoadmap(null) }

  const getScoreGrade = (score) => {
    if (score >= 80) return { label: isAs ? 'উৎকৃষ্ট' : 'Excellent', color: 'cc-grade-green' }
    if (score >= 60) return { label: isAs ? 'ভাল' : 'Good', color: 'cc-grade-blue' }
    if (score >= 40) return { label: isAs ? 'বিকাশশীল' : 'Developing', color: 'cc-grade-yellow' }
    return { label: isAs ? 'প্ৰাৰম্ভিক' : 'Beginner', color: 'cc-grade-gray' }
  }

  return (
    <div className="cc-view">
      {/* Header */}
      <div className="cc-hero">
        <div>
          <p className="cc-eyebrow"><span className="live-dot" /> {isAs ? 'AI-চালিত বিশ্লেষণ' : 'AI-Powered Analysis'}</p>
          <h2 className="cc-title">{isAs ? 'কেৰিয়াৰ কম্পাছ' : 'Career Compass'}</h2>
          <p className="cc-subtitle">
            {isAs
              ? 'আপোনাৰ ৰিজ্যুম আপলোড কৰক আৰু ব্যক্তিগত কেৰিয়াৰ ৰোডমেপ আৰু চাকৰিৰ পৰামৰ্শ পাওক।'
              : 'Upload your resume and get a personalized career roadmap with job recommendations and skill gap analysis.'}
          </p>
        </div>
        {analysis && (
          <button className="cc-reset-btn" onClick={handleReset}>
            {isAs ? 'নতুন বিশ্লেষণ' : 'New Analysis'}
          </button>
        )}
      </div>

      {!analysis ? (
        <ResumeUploader onAnalyze={handleAnalyze} t={t} currentLang={currentLang} />
      ) : (
        <div className="cc-results">
          {/* Resume Score Strip */}
          <div className="cc-score-strip">
            <div className="cc-score-main">
              <span className="cc-score-big">{analysis.resumeScore}</span>
              <span className="cc-score-denom">/95</span>
              <div>
                <div className={`cc-grade ${getScoreGrade(analysis.resumeScore).color}`}>
                  {getScoreGrade(analysis.resumeScore).label}
                </div>
                <div className="cc-score-label-text">{isAs ? 'ৰিজ্যুম স্কোৰ' : 'Resume Score'}</div>
              </div>
            </div>
            <div className="cc-score-stats">
              <div className="cc-stat">
                <span className="cc-stat-val">{analysis.totalSkills}</span>
                <span className="cc-stat-label">{isAs ? 'দক্ষতা চিনাক্ত' : 'Skills Detected'}</span>
              </div>
              <div className="cc-stat">
                <span className="cc-stat-val">{analysis.scoredRoles.filter(r => r.matchPercentage >= 50).length}</span>
                <span className="cc-stat-label">{isAs ? 'উপযুক্ত ভূমিকা' : 'Matching Roles'}</span>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="cc-skills-section">
            <h3 className="cc-section-title">{isAs ? 'চিনাক্ত কৰা দক্ষতাসমূহ' : 'Detected Skills'}</h3>
            <div className="cc-skill-categories">
              {Object.entries(analysis.byCategory)
                .filter(([, skills]) => skills.length > 0)
                .map(([cat, skills]) => (
                  <div key={cat} className="cc-skill-cat">
                    <div className="cc-skill-cat-label">
                      {isAs ? CATEGORY_LABELS_AS[cat] : CATEGORY_LABELS_EN[cat]}
                    </div>
                    <div className="cc-skill-chips">
                      {skills.map((s) => (
                        <span key={s} className="cc-skill-chip">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Job Match Cards */}
          <JobMatchCards
            scoredRoles={analysis.scoredRoles}
            selectedRoleId={selectedRoleId}
            onSelectRole={handleSelectRole}
            language={currentLang}
          />

          {/* Roadmap Timeline */}
          {roadmap && (
            <RoadmapTimeline
              roadmap={roadmap}
              language={currentLang}
            />
          )}
        </div>
      )}
    </div>
  )
}
