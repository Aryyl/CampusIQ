import { useState } from 'react'
import { Check, Volume2, VolumeX } from 'lucide-react'

export default function RoadmapTimeline({ roadmap, language }) {
  const isAs = language === 'as'
  const [checked, setChecked] = useState({})
  const [speaking, setSpeaking] = useState(false)

  const toggleCheck = (phaseIdx, stepIdx) => {
    const key = `${phaseIdx}-${stepIdx}`
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const readAloud = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    if (!window.speechSynthesis) return
    const role = isAs ? roadmap.role.titleAs : roadmap.role.titleEn
    const intro = isAs
      ? `আপোনাৰ ${role}-ৰ বাবে কেৰিয়াৰ ৰোডমেপ।`
      : `Your career roadmap to become a ${role}.`

    const allText = intro + ' ' + roadmap.phases.map((phase) => {
      const title = isAs ? phase.titleAs : phase.titleEn
      return `${title}: ${phase.steps.join('. ')}`
    }).join('. ')

    const utterance = new SpeechSynthesisUtterance(allText)
    utterance.lang = isAs ? 'as-IN' : 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const targetRole = isAs ? roadmap.role.titleAs : roadmap.role.titleEn

  return (
    <div className="cc-roadmap-section">
      <div className="cc-roadmap-header">
        <div>
          <h3 className="cc-section-title">
            {isAs ? `কেৰিয়াৰ ৰোডমেপ: ${targetRole}` : `Career Roadmap: ${targetRole}`}
          </h3>
          <p className="cc-section-sub">
            {isAs
              ? `আপোনাৰ বৰ্তমান মিলৰ হাৰ ${roadmap.matchPercentage}%। তলৰ পৰ্যায়সমূহ সম্পূৰ্ণ কৰক।`
              : `Your current fit is ${roadmap.matchPercentage}%. Complete the phases below to reach 90%+.`}
          </p>
        </div>
        <button className={`cc-read-btn ${speaking ? 'active' : ''}`} onClick={readAloud} title={isAs ? 'ৰোডমেপ শুনক' : 'Listen to Roadmap'}>
          {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isAs ? (speaking ? 'বন্ধ কৰক' : 'শুনক') : (speaking ? 'Stop' : 'Listen')}</span>
        </button>
      </div>

      {roadmap.missingCoreSkills.length > 0 && (
        <div className="cc-skill-gap">
          <span className="cc-gap-label">{isAs ? 'জৰুৰী দক্ষতাৰ ফাঁক:' : 'Critical Skill Gaps:'}</span>
          {roadmap.missingCoreSkills.map((s) => (
            <span key={s} className="cc-gap-chip">{s}</span>
          ))}
        </div>
      )}

      <div className="cc-timeline">
        {roadmap.phases.map((phase, phaseIdx) => {
          const title = isAs ? phase.titleAs : phase.titleEn
          const doneCount = phase.steps.filter((_, si) => checked[`${phaseIdx}-${si}`]).length
          return (
            <div key={phaseIdx} className="cc-phase">
              <div className="cc-phase-header">
                <span className="cc-phase-num">{phase.number}</span>
                <div>
                  <div className="cc-phase-title">{title}</div>
                  <div className="cc-phase-progress">
                    {doneCount}/{phase.steps.length} {isAs ? 'সম্পূৰ্ণ' : 'completed'}
                    <div className="cc-progress-bar">
                      <div className="cc-progress-fill" style={{ width: `${(doneCount / phase.steps.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              <ul className="cc-steps">
                {phase.steps.map((step, stepIdx) => {
                  const key = `${phaseIdx}-${stepIdx}`
                  const done = checked[key]
                  return (
                    <li key={stepIdx} className={`cc-step ${done ? 'done' : ''}`} onClick={() => toggleCheck(phaseIdx, stepIdx)}>
                      <span className="cc-step-check">{done ? <Check size={12} /> : null}</span>
                      <span className="cc-step-text">{step}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
