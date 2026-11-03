import { useState } from 'react'
import {
  ArrowRight,
  Building,
  CircleCheck,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  AlertCircle,
} from 'lucide-react'
import { loginUser, registerUser, quickDemoLogin } from '../services/authService'
import { useCampusData } from '../context/CampusDataContext'

const DEPARTMENTS = [
  'Science & Technology',
  'Commerce & Management',
  'Arts & Humanities',
  'Social Sciences',
]

const ADMIN_UNITS = [
  'University Administration',
  'Office of the Registrar',
  'Examination Cell',
  'Dean of Student Affairs',
  'Academic Council',
  'Department of Information Systems',
]

export default function AuthPage({ onLogin, notify }) {
  const { saveStudent } = useCampusData()
  const [role, setRole] = useState('student') // 'student' | 'admin'
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form Fields
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [department, setDepartment] = useState('Science & Technology')
  const [adminUnit, setAdminUnit] = useState('University Administration')
  const [adminKey, setAdminKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRoleSwitch = (newRole) => {
    setRole(newRole)
    setError('')
    if (newRole === 'student') {
      setDepartment('Science & Technology')
    } else {
      setAdminUnit('University Administration')
    }
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        if (!identifier.trim()) {
          throw new Error(role === 'student' ? 'Please enter your student email or ID.' : 'Please enter your administrator email.')
        }
        if (!password) {
          throw new Error('Please enter your password.')
        }

        const user = await loginUser({ identifier, password, role })
        onLogin(user)
      } else {
        // Register Mode
        if (!name.trim()) throw new Error('Please enter your full name.')
        if (!identifier.trim()) throw new Error('Please enter your email address.')
        if (!password) throw new Error('Please create a password.')
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        if (password !== confirmPassword) throw new Error('Passwords do not match.')

        if (role === 'admin' && adminKey.trim().toUpperCase() !== 'ADMIN2024') {
          throw new Error('Invalid Admin Authorization Key. (Use demo key: ADMIN2024)')
        }

        // 1. Sync student profile to the campus database (shows in People tab in Admin dashboard)
        if (role === 'student') {
          const regNo = studentId.trim() || `CIQ-2024-${Math.floor(1000 + Math.random() * 9000)}`
          await saveStudent({
            fullName: name.trim(),
            registrationNumber: regNo,
            email: identifier.trim(),
            phone: '+91 98765 20000',
            department,
            programme:
              department === 'Science & Technology'
                ? 'B.Tech. Computer Science'
                : department === 'Commerce & Management'
                ? 'B.Com. Finance'
                : department === 'Arts & Humanities'
                ? 'B.A. English'
                : 'B.S.W.',
            semester: '1',
            accountStatus: 'Active',
          })
        }

        // 2. Register authentication record
        const user = await registerUser({
          name,
          email: identifier,
          password,
          role,
          department: role === 'student' ? department : adminUnit,
          studentId: role === 'student' ? studentId : undefined,
          adminKey: role === 'admin' ? adminKey : undefined,
        })

        notify(`Account created successfully! Welcome, ${user.name}.`)
        onLogin(user)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = (demoRole) => {
    setError('')
    const user = quickDemoLogin(demoRole)
    notify(`Signed in as ${user.name} (${user.role === 'admin' ? 'Administrator' : 'Student'})`)
    onLogin(user)
  }

  return (
    <div className="auth-viewport">
      {/* Brand Header */}
      <div className="auth-brand-header">
        <div className="brand-outline-pill">
          <span>CampusIQ</span>
        </div>
        <div className="auth-tagline-pill">
          <Sparkles size={13} />
          <span>Bilingual University Portal</span>
        </div>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="auth-card">
        {/* Role Segmented Track (Student vs Admin) */}
        <div className="auth-role-track" role="tablist" aria-label="Select role">
          <button
            type="button"
            className={`auth-role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('student')}
            role="tab"
            aria-selected={role === 'student'}
          >
            <GraduationCap size={16} />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            className={`auth-role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
            role="tab"
            aria-selected={role === 'admin'}
          >
            <ShieldCheck size={16} />
            <span>Administrator</span>
          </button>
        </div>

        {/* Card Title & Intro */}
        <div className="auth-card-heading">
          <h2>
            {mode === 'login'
              ? role === 'admin'
                ? 'Administrator Sign In'
                : 'Student Sign In'
              : role === 'admin'
              ? 'Create Administrator Account'
              : 'Create Student Account'}
          </h2>
          <p>
            {mode === 'login'
              ? role === 'admin'
                ? 'Sign in with your administrative credentials to manage documents, notices and analytics.'
                : 'Sign in to access your course knowledge base, notices, academic deadlines and AI answers.'
              : role === 'admin'
              ? 'Register with your administrative unit and security authorization key.'
              : 'Sign up to connect with your university curriculum, notifications and smart assistant.'}
          </p>
        </div>

        {/* Mode Switch Tabs (Sign In / Register) */}
        <div className="auth-mode-selector">
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('register')}
          >
            Create Account
          </button>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full Name</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder={role === 'admin' ? 'e.g. Dr. Aarav Kumar' : 'e.g. Priya Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Student-specific register fields */}
          {mode === 'register' && role === 'student' && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-student-id">Student Roll No / ID</label>
                <div className="auth-input-wrap">
                  <GraduationCap size={16} className="auth-input-icon" />
                  <input
                    id="auth-student-id"
                    type="text"
                    placeholder="e.g. CS-2024-042"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-department">Academic Department</label>
                <div className="auth-input-wrap">
                  <Building size={16} className="auth-input-icon" />
                  <select
                    id="auth-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Admin-specific register fields */}
          {mode === 'register' && role === 'admin' && (
            <>
              <div className="auth-field">
                <label htmlFor="auth-admin-unit">Administrative Unit</label>
                <div className="auth-input-wrap">
                  <Building size={16} className="auth-input-icon" />
                  <select
                    id="auth-admin-unit"
                    value={adminUnit}
                    onChange={(e) => setAdminUnit(e.target.value)}
                  >
                    {ADMIN_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-admin-key">
                  Security Authorization Key <span className="auth-label-tip">(Demo: ADMIN2024)</span>
                </label>
                <div className="auth-input-wrap">
                  <KeyRound size={16} className="auth-input-icon" />
                  <input
                    id="auth-admin-key"
                    type="text"
                    placeholder="Enter security key (ADMIN2024)"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Email / ID Field */}
          <div className="auth-field">
            <label htmlFor="auth-identifier">
              {mode === 'login'
                ? role === 'student'
                  ? 'University Email or Student ID'
                  : 'Administrator Email'
                : role === 'student'
                ? 'University Student Email'
                : 'Official Work Email'}
            </label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-identifier"
                type={mode === 'login' && role === 'student' ? 'text' : 'email'}
                placeholder={
                  role === 'admin'
                    ? 'admin@campusiq.edu'
                    : mode === 'login'
                    ? 'student@campusiq.edu or Roll ID'
                    : 'student@campusiq.edu'
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="auth-password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => notify('Password recovery link sent to your registered email.')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password in Register mode */}
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? `Sign In as ${role === 'admin' ? 'Administrator' : 'Student'}`
                : `Create ${role === 'admin' ? 'Administrator' : 'Student'} Account`}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Section */}
        <div className="auth-divider">
          <span>or test with instant demo access</span>
        </div>

        <div className="auth-quick-demo-grid">
          <button
            type="button"
            className="auth-quick-demo-btn admin"
            onClick={() => handleQuickDemo('admin')}
          >
            <ShieldCheck size={15} />
            <span>⚡ Demo Admin</span>
            <small>Aarav Kumar</small>
          </button>
          <button
            type="button"
            className="auth-quick-demo-btn student"
            onClick={() => handleQuickDemo('student')}
          >
            <GraduationCap size={15} />
            <span>🎓 Demo Student</span>
            <small>Priya Sharma</small>
          </button>
        </div>

        {/* Security & Architecture Badge */}
        <div className="auth-footer-note">
          <CircleCheck size={13} />
          <span>Firebase Authentication boundary configured for production deployment</span>
        </div>
      </div>
    </div>
  )
}

