export default function JobMatchCards({ scoredRoles, selectedRoleId, onSelectRole, language }) {
  const isAs = language === 'as'

  const getScoreColor = (pct) => {
    if (pct >= 75) return 'cc-score-high'
    if (pct >= 45) return 'cc-score-mid'
    return 'cc-score-low'
  }

  const getDemandBadge = (role) => isAs ? role.demandAs : role.demand

  return (
    <div className="cc-roles-section">
      <h3 className="cc-section-title">
        {isAs ? 'পৰামৰ্শিত চাকৰিৰ ভূমিকাসমূহ' : 'Recommended Job Roles'}
      </h3>
      <p className="cc-section-sub">
        {isAs ? 'আপোনাৰ দক্ষতাৰ ভিত্তিত নিৰ্বাচন কৰক আৰু ব্যক্তিগত ৰোডমেপ পাওক।' : 'Select a role to generate your personalized career roadmap.'}
      </p>
      <div className="cc-roles-grid">
        {scoredRoles.map((role) => (
          <button
            key={role.id}
            className={`cc-role-card ${selectedRoleId === role.id ? 'selected' : ''}`}
            onClick={() => onSelectRole(role.id)}
          >
            <div className="cc-role-top">
              <div className="cc-role-title">{isAs ? role.titleAs : role.titleEn}</div>
              <div className={`cc-score-ring ${getScoreColor(role.matchPercentage)}`}>
                <span className="cc-score-number">{role.matchPercentage}%</span>
                <span className="cc-score-label">{isAs ? 'মিল' : 'Fit'}</span>
              </div>
            </div>
            <p className="cc-role-desc">{isAs ? role.descAs : role.descEn}</p>
            <div className="cc-role-meta">
              <span className="cc-salary">{isAs ? role.salaryAs : role.salaryEn}</span>
              <span className={`cc-demand-badge cc-demand-${role.demand.toLowerCase().replace(' ', '-')}`}>
                {getDemandBadge(role)} {isAs ? 'চাহিদা' : 'Demand'}
              </span>
            </div>
            {role.missingCoreSkills.length > 0 && (
              <div className="cc-missing">
                <span className="cc-missing-label">{isAs ? 'অনুপস্থিত:' : 'Missing:'}</span>
                {role.missingCoreSkills.slice(0, 3).map((s) => (
                  <span key={s} className="cc-missing-chip">{s}</span>
                ))}
                {role.missingCoreSkills.length > 3 && <span className="cc-missing-more">+{role.missingCoreSkills.length - 3}</span>}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
