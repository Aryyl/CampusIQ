import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Archive,
  ArrowDown,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Clipboard,
  Edit3,
  FileText,
  Forward,
  Globe,
  Hash,
  LogOut,
  Menu,
  MessageCircle,
  Megaphone,
  Mic,
  MicOff,
  MoreHorizontal,
  Paperclip,
  Pin,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import {
  createConversation,
  getConversations,
  getDemoAssistantResponse,
  getPreferences,
  saveConversations,
  savePreferences,
} from './services/studentChatService'
import { clearCurrentSession, getCurrentSession } from './services/authService'
import { getStudentTranslation, studentTranslations } from './services/studentTranslations'
import RaiseIssueView from './components/campuscare/RaiseIssueView'
import MyIssuesView from './components/campuscare/MyIssuesView'
import StudentEventsView from './components/events/StudentEventsView'
import StudentNoticesView from './components/notices/StudentNoticesView'
import { markAllAsRead, markAsRead, subscribeNotifications } from './services/notificationService'
import './student.css'

const fallbackStudent = {
  name: 'Priya Sharma',
  email: 'student@campusiq.edu',
  studentId: 'CS-2024-042',
  department: 'Computer Science',
  avatar: 'PS',
}

const suggestionIcons = [Hash, FileText, Archive, Sparkles]

export default function StudentApp() {
  const session = getCurrentSession()
  const student = session?.role === 'student' ? session : fallbackStudent
  const [conversations, setConversations] = useState(() => getConversations())
  const [activeId, setActiveId] = useState(null)
  const [preferences, setPreferences] = useState(() => getPreferences())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [composer, setComposer] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [sending, setSending] = useState(false)
  const [conversationMenu, setConversationMenu] = useState(null)
  const [renameId, setRenameId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [forwardingMessage, setForwardingMessage] = useState(null)
  const [notice, setNotice] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeView, setActiveView] = useState('chat') // 'chat' | 'raise-issue' | 'my-issues' | 'events' | 'notices'
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const studentUid = student?.uid || student?.id || ''

  useEffect(() => {
    const unsub = subscribeNotifications({ role: 'student', uid: studentUid }, (items) => {
      setNotifications(items)
    })
    return () => unsub()
  }, [studentUid])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markAsRead(item.id)
    }
    setNotificationsOpen(false)
    setSidebarOpen(false)
    if (item.linkType === 'issue' || item.type?.includes('issue')) {
      setActiveView('my-issues')
    } else if (item.linkType === 'event' || item.type?.includes('event')) {
      setActiveView('events')
    } else if (item.linkType === 'notice' || item.type?.includes('notice')) {
      setActiveView('notices')
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length) {
      await markAllAsRead(unreadIds)
      flash(t('notificationsAllRead') || 'All caught up!')
    }
  }

  const currentLang = preferences.language || 'en'
  const t = (key) => getStudentTranslation(currentLang, key)

  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || null
  const filteredConversations = useMemo(
    () => conversations.filter((conversation) => conversation.title.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  )
  const pinned = filteredConversations.filter((conversation) => conversation.pinned)
  const recent = filteredConversations
    .filter((conversation) => !conversation.pinned)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  useEffect(() => {
    document.title = activeConversation
      ? `${activeConversation.title} — ${t('brandName')}`
      : `${t('brandName')} ${t('brandTag')}`
  }, [activeConversation, currentLang])

  // Stop speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (_) {}
      }
    }
  }, [])

  const flash = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const setLanguage = (lang) => {
    const next = { ...preferences, language: lang }
    setPreferences(next)
    savePreferences(next)
    flash(lang === 'as' ? 'ভাষা অসমীয়ালৈ সলনি কৰা হ\'ল।' : 'Language switched to English.')
  }

  const selectConversation = (id) => {
    setActiveId(id)
    setSidebarOpen(false)
    setConversationMenu(null)
    setActiveView('chat')
  }

  const startNewChat = () => {
    setActiveId(null)
    setComposer('')
    setAttachment(null)
    setSidebarOpen(false)
    setProfileOpen(false)
    setActiveView('chat')
  }

  const updateConversation = (id, updater) =>
    setConversations((current) => current.map((conversation) => (conversation.id === id ? updater(conversation) : conversation)))

  // -------------------------------------------------------------
  // Voice Speech Recognition (aligned to current language)
  // -------------------------------------------------------------
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      flash('Voice input is not supported in this browser. Try Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (_) {}
      }
      setIsListening(false)
      flash(t('micTurnedOff'))
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      // Language code: 'as-IN' for Assamese, 'en-US' for English
      recognition.lang = currentLang === 'as' ? 'as-IN' : 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        flash(t('micListening'))
      }

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          if (item.isFinal) {
            transcript += item[0].transcript + ' '
          }
        }
        if (transcript) {
          setComposer((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()))
        }
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          flash(t('micDenied'))
        } else if (event.error !== 'no-speech') {
          flash(`Voice recognition error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setIsListening(false)
      flash('Could not access microphone.')
    }
  }

  // -------------------------------------------------------------
  // Document Attachment Handler
  // -------------------------------------------------------------
  const handleAttachment = (event) => {
    const selected = event.target.files?.[0]
    if (selected) {
      let formattedSize = `${(selected.size / 1024).toFixed(0)} KB`
      if (selected.size > 1024 * 1024) {
        formattedSize = `${(selected.size / (1024 * 1024)).toFixed(1)} MB`
      }
      setAttachment({
        name: selected.name,
        size: formattedSize,
        type: selected.type,
      })
      flash(`"${selected.name}" ${t('attachedTag')}`)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // -------------------------------------------------------------
  // Send / Forward Message to Active Chat
  // -------------------------------------------------------------
  const sendMessage = (value = composer) => {
    const text = value.trim()
    if ((!text && !attachment) || sending) return

    const timestamp = new Date().toISOString()
    const content = text || (currentLang === 'as' ? `সংলগ্ন নথি: ${attachment?.name}` : `Shared document: ${attachment?.name}`)

    const userMessage = {
      id: `message-${Date.now()}`,
      role: 'user',
      content,
      createdAt: timestamp,
      attachment: attachment ? { name: attachment.name, size: attachment.size, type: attachment.type } : null,
    }

    let conversation = activeConversation
    const nextTitle =
      conversation?.title === 'New chat' || !conversation
        ? content.split(/\s+/).slice(0, 6).join(' ')
        : conversation.title

    if (!conversation) {
      conversation = { ...createConversation(nextTitle), messages: [userMessage] }
      setConversations((current) => [conversation, ...current])
      setActiveId(conversation.id)
    } else {
      updateConversation(conversation.id, (current) => ({
        ...current,
        title: nextTitle,
        updatedAt: timestamp,
        messages: [...current.messages, userMessage],
      }))
    }

    setComposer('')
    setAttachment(null)
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      setIsListening(false)
    }
    setSending(true)

    window.setTimeout(() => {
      let assistantMessage
      if (userMessage.attachment && !text) {
        assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content:
            currentLang === 'as'
              ? `মই আপোনাৰ নথি **${userMessage.attachment.name}** (${userMessage.attachment.size}) লাভ কৰিলোঁ।\n\nমই ইয়াত কেনেকৈ সহায় কৰিব পাৰোঁ?\n- নথিখনৰ **মূল নিয়মবোৰ সংক্ষিপ্ত কৰক**\n- গুৰুত্বপূৰ্ণ **সময়সীমা আৰু তাৰিখ উলিয়াওক**\n- ইয়াৰ ভিত্তিত **প্ৰশ্নৰ উত্তৰ দিয়ক**`
              : `I've received your document **${userMessage.attachment.name}** (${userMessage.attachment.size}).\n\nHow would you like me to assist you with it?\n- **Summarize** the document regulations\n- **Extract** key dates and deadlines\n- **Answer questions** based on its contents`,
          createdAt: new Date().toISOString(),
        }
      } else {
        assistantMessage = getDemoAssistantResponse(text || content, currentLang)
      }
      updateConversation(conversation.id, (current) => ({
        ...current,
        updatedAt: assistantMessage.createdAt,
        messages: [...current.messages, assistantMessage],
      }))
      setSending(false)
    }, 720)
  }

  // -------------------------------------------------------------
  // Forward Message Handlers
  // -------------------------------------------------------------
  const handleForwardToChat = (targetId, message) => {
    const timestamp = new Date().toISOString()
    const prefix = currentLang === 'as' ? 'ফৰৱাৰ্ড কৰা বাৰ্তা:' : 'Forwarded message:'
    const forwardedMessage = {
      id: `message-fwd-${Date.now()}`,
      role: 'user',
      content: `${prefix}\n> ${message.content.replace(/\n/g, '\n> ')}`,
      createdAt: timestamp,
      attachment: message.attachment || null,
    }

    if (targetId === 'new') {
      const title = currentLang === 'as' ? `ফৰৱাৰ্ড: ${message.content.slice(0, 20)}...` : `Forwarded: ${message.content.slice(0, 24)}...`
      const newConv = { ...createConversation(title), messages: [forwardedMessage] }
      setConversations((current) => [newConv, ...current])
      setActiveId(newConv.id)
      setSending(true)
      window.setTimeout(() => {
        const assistantMessage = getDemoAssistantResponse(message.content, currentLang)
        updateConversation(newConv.id, (current) => ({
          ...current,
          updatedAt: assistantMessage.createdAt,
          messages: [...current.messages, assistantMessage],
        }))
        setSending(false)
      }, 700)
      flash(t('forwardedToNewNotice'))
    } else {
      updateConversation(targetId, (current) => ({
        ...current,
        updatedAt: timestamp,
        messages: [...current.messages, forwardedMessage],
      }))
      setActiveId(targetId)
      setSending(true)
      window.setTimeout(() => {
        const assistantMessage = getDemoAssistantResponse(message.content, currentLang)
        updateConversation(targetId, (current) => ({
          ...current,
          updatedAt: assistantMessage.createdAt,
          messages: [...current.messages, assistantMessage],
        }))
        setSending(false)
      }, 700)
      const targetConv = conversations.find((c) => c.id === targetId)
      flash(`${t('forwardedToConvNotice')} "${targetConv?.title || 'conversation'}"!`)
    }
  }

  const handleQuoteToComposer = (content) => {
    setComposer((prev) => (prev ? `${prev}\n\n"${content}"` : `"${content}"\n`))
    flash(t('quotedSuccessNotice'))
  }

  const regenerate = () => {
    if (!activeConversation || sending) return
    const lastUser = [...activeConversation.messages].reverse().find((message) => message.role === 'user')
    if (!lastUser) return
    updateConversation(activeConversation.id, (current) => ({
      ...current,
      messages: current.messages.filter(
        (message) =>
          message.role !== 'assistant' ||
          message.id !== [...current.messages].reverse().find((item) => item.role === 'assistant')?.id
      ),
    }))
    setSending(true)
    window.setTimeout(() => {
      updateConversation(activeConversation.id, (current) => ({
        ...current,
        messages: [...current.messages, getDemoAssistantResponse(lastUser.content, currentLang)],
      }))
      setSending(false)
    }, 650)
  }

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const renameConversation = () => {
    if (!renameValue.trim()) return
    updateConversation(renameId, (conversation) => ({
      ...conversation,
      title: renameValue.trim(),
      updatedAt: new Date().toISOString(),
    }))
    setRenameId(null)
    setRenameValue('')
    flash(t('conversationRenamed'))
  }

  const deleteConversation = () => {
    setConversations((current) => current.filter((conversation) => conversation.id !== deleteId))
    if (activeId === deleteId) setActiveId(null)
    setDeleteId(null)
    flash(t('conversationDeleted'))
  }

  const togglePin = (id) => {
    updateConversation(id, (conversation) => ({ ...conversation, pinned: !conversation.pinned }))
    setConversationMenu(null)
  }

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopiedId(message.id)
      window.setTimeout(() => setCopiedId(null), 1400)
    } catch {
      flash('Copy is unavailable in this browser.')
    }
  }

  const saveStudentPreferences = (next) => {
    setPreferences(next)
    savePreferences(next)
    setSettingsOpen(false)
    flash(t('preferencesSaved'))
  }

  const logout = () => {
    clearCurrentSession()
    window.location.href = '/'
  }

  const canSend = (composer.trim().length > 0 || attachment !== null) && !sending
  const suggestions = (studentTranslations[currentLang] || studentTranslations.en).suggestions

  return (
    <div className={`student-app ${preferences.theme === 'dim' ? 'student-theme-dim' : ''}`}>
      <aside className={`student-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="student-sidebar-top">
          <button className="brand-outline-pill student-brand-pill" onClick={startNewChat} title="CampusIQ">
            <span>CampusIQ</span>
          </button>
          <button className="student-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Instant Bilingual Switcher in Sidebar */}
        <div className="student-lang-container">
          <div className="student-lang-pill">
            <Globe size={13} className="lang-globe-icon" />
            <button
              type="button"
              className={`lang-option ${currentLang === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-option ${currentLang === 'as' ? 'active' : ''}`}
              onClick={() => setLanguage('as')}
            >
              অসমীয়া
            </button>
          </div>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <Plus size={17} /> {t('newChat')} <span>{t('shortcutHint')}</span>
        </button>

        {/* Events & Campus Life */}
        <div className="campuscare-sidebar-section">
          <div className="campuscare-section-label">{t('campusLife') || 'Campus Life'}</div>
          <button
            className={`campuscare-nav-btn ${activeView === 'events' ? 'active' : ''}`}
            onClick={() => { setActiveView('events'); setSidebarOpen(false) }}
          >
            <CalendarDays size={15} /> {t('eventsSection') || 'Events'}
          </button>
          <button
            className={`campuscare-nav-btn ${activeView === 'notices' ? 'active' : ''}`}
            onClick={() => { setActiveView('notices'); setSidebarOpen(false) }}
          >
            <Megaphone size={15} /> {t('noticesSection') || 'Notices'}
          </button>
        </div>

        {/* CampusCare Navigation */}
        <div className="campuscare-sidebar-section">
          <div className="campuscare-section-label">{t('campusCareSection')}</div>
          <button
            className={`campuscare-nav-btn ${activeView === 'raise-issue' ? 'active' : ''}`}
            onClick={() => { setActiveView('raise-issue'); setSidebarOpen(false) }}
          >
            <AlertCircle size={15} /> {t('raiseIssue')}
          </button>
          <button
            className={`campuscare-nav-btn ${activeView === 'my-issues' ? 'active' : ''}`}
            onClick={() => { setActiveView('my-issues'); setSidebarOpen(false) }}
          >
            <ClipboardList size={15} /> {t('myIssues')}
          </button>
        </div>
        <label className="conversation-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchConversations')}
            aria-label={t('searchConversations')}
          />
        </label>
        <div className="conversation-scroll">
          <ConversationGroup
            label={t('pinned')}
            conversations={pinned}
            activeId={activeId}
            menuId={conversationMenu}
            onSelect={selectConversation}
            onMenu={setConversationMenu}
            onPin={togglePin}
            onRename={(conversation) => {
              setRenameId(conversation.id)
              setRenameValue(conversation.title)
              setConversationMenu(null)
            }}
            onDelete={(conversation) => {
              setDeleteId(conversation.id)
              setConversationMenu(null)
            }}
            t={t}
          />
          <ConversationGroup
            label={t('recent')}
            conversations={recent}
            activeId={activeId}
            menuId={conversationMenu}
            onSelect={selectConversation}
            onMenu={setConversationMenu}
            onPin={togglePin}
            onRename={(conversation) => {
              setRenameId(conversation.id)
              setRenameValue(conversation.title)
              setConversationMenu(null)
            }}
            onDelete={(conversation) => {
              setDeleteId(conversation.id)
              setConversationMenu(null)
            }}
            emptyLabel={search ? t('noMatching') : t('emptyConversations')}
            t={t}
          />
        </div>
        <div className="student-sidebar-bottom">
          <div className="student-notif-wrap">
            <button
              className={`sidebar-utility student-notif-btn ${notificationsOpen ? 'active' : ''}`}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
              }}
            >
              <Bell size={16} /> {t('notifications') || 'Notifications'}
              {unreadCount > 0 && <span className="student-notif-badge">{unreadCount}</span>}
            </button>
            {notificationsOpen && (
              <div className="student-notif-popover">
                <div className="popover-heading">
                  <strong>{t('notifications') || 'Notifications'}</strong>
                  <span>{unreadCount > 0 ? `${unreadCount} new` : t('notificationsAllRead') || 'All caught up'}</span>
                </div>
                <div className="notification-list-scroll">
                  {notifications.length === 0 ? (
                    <p className="notification-empty">{t('noNotifications') || 'No notifications yet.'}</p>
                  ) : (
                    notifications.slice(0, 8).map((item) => {
                      const isUnread = !item.read
                      const isIssue = item.linkType === 'issue' || item.type?.includes('issue')
                      const isEvent = item.linkType === 'event' || item.type?.includes('event')
                      return (
                        <div
                          key={item.id}
                          className={`notification-item ${isUnread ? 'is-unread' : ''}`}
                          onClick={() => handleNotificationClick(item)}
                          role="button"
                          tabIndex={0}
                        >
                          <span className={`mini-icon ${isIssue ? 'orange' : isEvent ? 'purple' : 'green'}`}>
                            {isIssue ? <AlertCircle size={14} /> : isEvent ? <CalendarDays size={14} /> : <Bell size={14} />}
                          </span>
                          <div className="notification-item-text">
                            <strong>{item.title || 'Notification'}</strong>
                            <small>{item.message}</small>
                          </div>
                          {isUnread && <span className="unread-dot" />}
                        </div>
                      )
                    })
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className="popover-link" onClick={handleMarkAllRead}>
                    {t('markAllRead') || 'Mark all as read'}
                  </button>
                )}
              </div>
            )}
          </div>
          <button className="sidebar-utility" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} /> {t('settings')}
          </button>
          <button className="student-profile-row" onClick={() => setProfileOpen(!profileOpen)}>
            <span className="student-avatar">{student.avatar || initials(student.name)}</span>
            <span>
              <strong>{student.name}</strong>
              <small>{student.email}</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="student-profile-menu">
              <div className="profile-menu-head">
                <span className="student-avatar large">{student.avatar || initials(student.name)}</span>
                <div>
                  <strong>{student.name}</strong>
                  <small>{student.email}</small>
                </div>
              </div>
              <button
                onClick={() => {
                  setSettingsOpen(true)
                  setProfileOpen(false)
                }}
              >
                <UserRound size={14} /> {t('profilePreferences')}
              </button>
              <button onClick={logout}>
                <LogOut size={14} /> {t('signOut')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <button className="student-drawer-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />
      )}

      <main className="student-main">
        <header className="student-mobile-header">
          <button className="student-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu size={19} />
          </button>
          <button className="brand-outline-pill student-brand-pill compact" onClick={startNewChat} title="CampusIQ">
            <span>CampusIQ</span>
          </button>
          <div className="mobile-header-actions">
            <div className="student-lang-pill compact">
              <button
                type="button"
                className={`lang-option ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-option ${currentLang === 'as' ? 'active' : ''}`}
                onClick={() => setLanguage('as')}
              >
                অস
              </button>
            </div>
            <button
              className="student-mobile-btn student-mobile-notif-btn"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setSidebarOpen(true)
              }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="student-mobile-notif-dot" />}
            </button>
            <button className="student-mobile-new" onClick={startNewChat} aria-label={t('newChat')}>
              <Plus size={18} />
            </button>
          </div>
        </header>

        <div className="student-conversation-wrap">
          {activeView === 'events' ? (
            <StudentEventsView
              student={student}
              t={t}
              currentLang={currentLang}
            />
          ) : activeView === 'notices' ? (
            <StudentNoticesView
              student={student}
              t={t}
              currentLang={currentLang}
            />
          ) : activeView === 'raise-issue' ? (
            <RaiseIssueView
              student={student}
              t={t}
              currentLang={currentLang}
              onSuccess={() => setActiveView('my-issues')}
            />
          ) : activeView === 'my-issues' ? (
            <MyIssuesView
              student={student}
              t={t}
              onRaiseIssue={() => setActiveView('raise-issue')}
            />
          ) : activeConversation?.messages?.length ? (
            <ConversationView
              conversation={activeConversation}
              sending={sending}
              copiedId={copiedId}
              onCopy={copyMessage}
              onForward={(msg) => setForwardingMessage(msg)}
              onRegenerate={regenerate}
              t={t}
            />
          ) : (
            <WelcomeView
              student={student}
              suggestions={suggestions}
              onPrompt={(prompt) => sendMessage(prompt)}
              t={t}
            />
          )}
        </div>

        {/* Composer Area with Voice Mic & Document Attachment — only in chat view */}
        {activeView === 'chat' && (
        <div className={`student-composer-area ${inputFocused ? 'focused' : ''}`}>
          <div className="student-composer-shell">
            {attachment && (
              <div className="attachment-chip">
                <FileText size={13} />
                <span className="attachment-name">{attachment.name}</span>
                <span className="attachment-meta">({attachment.size})</span>
                <button onClick={() => setAttachment(null)} aria-label={t('removeAttachment')} title={t('removeAttachment')}>
                  <X size={13} />
                </button>
              </div>
            )}
            <textarea
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={isListening ? t('placeholderListening') : t('placeholder')}
              rows={1}
              aria-label={t('placeholder')}
            />
            <div className="composer-toolbar">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                  hidden
                  onChange={handleAttachment}
                />
                <button
                  type="button"
                  className="composer-tool"
                  onClick={() => fileInputRef.current?.click()}
                  title={t('attachDocTooltip')}
                  aria-label={t('attachDocTooltip')}
                >
                  <Paperclip size={17} />
                </button>

                <button
                  type="button"
                  className={`composer-tool ${isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? t('micStopTooltip') : t('micStartTooltip')}
                  aria-label={t('micStartTooltip')}
                >
                  {isListening ? <MicOff size={17} className="mic-pulse" /> : <Mic size={17} />}
                </button>

                {isListening ? (
                  <span className="listening-indicator">
                    <span className="pulse-dot" /> {t('listeningBadge')}
                  </span>
                ) : (
                  <span className="composer-hint">{t('enterToSend')}</span>
                )}
              </div>

              <button
                type="button"
                className="send-button"
                onClick={() => sendMessage()}
                disabled={!canSend}
                title={t('sendMessage')}
                aria-label={t('sendMessage')}
              >
                {sending ? <span className="send-loader" /> : <Send size={16} />}
              </button>
            </div>
          </div>
          <p className="student-disclaimer">{t('disclaimer')}</p>
        </div>
        )}
      </main>

      {notice && (
        <div className="student-toast">
          <Check size={15} /> {notice}
        </div>
      )}

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <ForwardDialog
          message={forwardingMessage}
          conversations={conversations}
          activeId={activeId}
          onClose={() => setForwardingMessage(null)}
          onForwardToChat={handleForwardToChat}
          onQuoteToComposer={handleQuoteToComposer}
          t={t}
        />
      )}

      {renameId && (
        <StudentDialog title={t('renameTitle')} onClose={() => setRenameId(null)}>
          <input
            className="student-dialog-input"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && renameConversation()}
            autoFocus
          />
          <div className="student-dialog-actions">
            <button className="student-secondary" onClick={() => setRenameId(null)}>
              {t('cancel')}
            </button>
            <button className="student-primary" onClick={renameConversation}>
              {t('saveName')}
            </button>
          </div>
        </StudentDialog>
      )}

      {deleteId && (
        <StudentDialog title={t('deleteTitle')} onClose={() => setDeleteId(null)}>
          <p className="student-dialog-copy">{t('deleteWarning')}</p>
          <div className="student-dialog-actions">
            <button className="student-secondary" onClick={() => setDeleteId(null)}>
              {t('cancel')}
            </button>
            <button className="student-danger" onClick={deleteConversation}>
              {t('deleteConfirm')}
            </button>
          </div>
        </StudentDialog>
      )}

      {settingsOpen && (
        <SettingsDialog
          preferences={preferences}
          onClose={() => setSettingsOpen(false)}
          onSave={saveStudentPreferences}
          t={t}
        />
      )}
    </div>
  )
}

function ConversationGroup({ label, conversations, activeId, menuId, onSelect, onMenu, onPin, onRename, onDelete, emptyLabel, t }) {
  return (
    <section className="conversation-group">
      <div className="conversation-group-label">
        {label}
        <span>{conversations.length || ''}</span>
      </div>
      {conversations.length ? (
        conversations.map((conversation) => (
          <div className="conversation-row-wrap" key={conversation.id}>
            <button
              className={`conversation-row ${activeId === conversation.id ? 'active' : ''}`}
              onClick={() => onSelect(conversation.id)}
            >
              <MessageCircle size={15} />
              <span>{conversation.title}</span>
              {conversation.demo && <em>{t('demoBadge')}</em>}
            </button>
            <button
              className="conversation-menu-button"
              onClick={() => onMenu(menuId === conversation.id ? null : conversation.id)}
              aria-label={`Options for ${conversation.title}`}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuId === conversation.id && (
              <div className="conversation-menu">
                <button onClick={() => onPin(conversation.id)}>
                  <Pin size={13} /> {conversation.pinned ? t('unpin') : t('pin')}
                </button>
                <button onClick={() => onRename(conversation)}>
                  <Edit3 size={13} /> {t('rename')}
                </button>
                <button className="delete-menu-item" onClick={() => onDelete(conversation)}>
                  <Trash2 size={13} /> {t('delete')}
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        emptyLabel && <p className="conversation-empty">{emptyLabel}</p>
      )}
    </section>
  )
}

function WelcomeView({ student, suggestions, onPrompt, t }) {
  return (
    <div className="student-welcome">
      <div className="welcome-orbit">
        <span>
          <Sparkles size={23} />
        </span>
        <i />
        <i />
        <i />
      </div>
      <p className="student-eyebrow">{t('eyebrow')}</p>
      <h1>
        {t('welcomeHeading')}<span>?</span>
      </h1>
      <p className="welcome-copy">{t('welcomeCopy')}</p>
      <div className="suggestion-grid">
        {suggestions.map(({ title, prompt }, index) => {
          const Icon = suggestionIcons[index] || Hash
          return (
            <button className="suggestion-card" onClick={() => onPrompt(prompt)} key={title}>
              <span className="suggestion-icon">
                <Icon size={17} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{prompt}</small>
              </span>
              <ArrowDown size={15} />
            </button>
          )
        })}
      </div>
      <div className="welcome-account">
        <span className="student-avatar">{student.avatar || initials(student.name)}</span>
        <span>
          {t('signedInAs')} <strong>{student.name}</strong>
        </span>
      </div>
    </div>
  )
}

function ConversationView({ conversation, sending, copiedId, onCopy, onForward, onRegenerate, t }) {
  return (
    <div className="conversation-view">
      <div className="conversation-heading">
        <span className="conversation-heading-icon">
          <MessageCircle size={16} />
        </span>
        <div>
          <h2>{conversation.title}</h2>
          <small>{t('brandName')} conversation</small>
        </div>
        <span className="conversation-demo-label">
          <Zap size={12} /> {t('prototypeLabel')}
        </span>
      </div>
      <div className="messages-list">
        {conversation.messages.map((message) => (
          <MessageBubble
            message={message}
            key={message.id}
            copiedId={copiedId}
            onCopy={onCopy}
            onForward={onForward}
            onRegenerate={onRegenerate}
            t={t}
          />
        ))}
        {sending && (
          <div className="assistant-row">
            <span className="assistant-avatar">
              <Sparkles size={14} />
            </span>
            <div className="typing-bubble">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageBubble({ message, copiedId, onCopy, onForward, onRegenerate, t }) {
  if (message.role === 'user') {
    return (
      <div className="user-row">
        <div className="user-bubble">
          {message.attachment && (
            <div className="message-attachment-card">
              <FileText size={14} />
              <div>
                <strong>{message.attachment.name}</strong>
                {message.attachment.size && <small>({message.attachment.size})</small>}
              </div>
            </div>
          )}
          {message.content}
        </div>
        <div className="user-message-actions">
          <button onClick={() => onForward(message)} title={t('forward')}>
            <Forward size={13} /> {t('forward')}
          </button>
          <button onClick={() => onCopy(message)} title={t('copy')}>
            {copiedId === message.id ? <Check size={13} /> : <Clipboard size={13} />} {copiedId === message.id ? t('copied') : t('copy')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="assistant-row">
      <span className="assistant-avatar">
        <Sparkles size={14} />
      </span>
      <div className="assistant-content">
        <div className="demo-response-label">
          <Sparkles size={12} /> {t('answerLabel')}
        </div>
        <MarkdownContent content={message.content} />
        <div className="message-actions">
          <button onClick={() => onForward(message)} title={t('forward')}>
            <Forward size={13} /> {t('forward')}
          </button>
          <button onClick={() => onCopy(message)} title={t('copy')}>
            {copiedId === message.id ? <Check size={13} /> : <Clipboard size={13} />} {copiedId === message.id ? t('copied') : t('copy')}
          </button>
          <button onClick={onRegenerate} title={t('regenerate')}>
            <Zap size={13} /> {t('regenerate')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ForwardDialog({ message, conversations, activeId, onClose, onForwardToChat, onQuoteToComposer, t }) {
  return (
    <StudentDialog title={t('forwardTitle')} onClose={onClose}>
      <div className="forward-preview">
        <small className="forward-label">{t('messagePreview')}</small>
        <p className="forward-snippet">"{message.content.length > 180 ? `${message.content.slice(0, 180)}...` : message.content}"</p>
        {message.attachment && (
          <div className="forward-attachment-tag">
            <FileText size={12} /> {message.attachment.name}
          </div>
        )}
      </div>

      <div className="forward-options">
        <button
          type="button"
          className="forward-option-btn quote-btn"
          onClick={() => {
            onQuoteToComposer(message.content)
            onClose()
          }}
        >
          <MessageCircle size={15} />
          <div>
            <strong>{t('quoteInComposer')}</strong>
            <small>{t('quoteDesc')}</small>
          </div>
        </button>

        <div className="forward-divider">
          <span>{t('orForwardTo')}</span>
        </div>

        <button
          type="button"
          className="forward-target-btn new-chat-target"
          onClick={() => {
            onForwardToChat('new', message)
            onClose()
          }}
        >
          <Plus size={15} />
          <span>{t('forwardNewChat')}</span>
        </button>

        <div className="forward-conversations-list">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={`forward-target-btn ${conv.id === activeId ? 'current-chat' : ''}`}
              onClick={() => {
                onForwardToChat(conv.id, message)
                onClose()
              }}
            >
              <MessageCircle size={14} />
              <span className="conv-title">{conv.title}</span>
              {conv.id === activeId && <span className="current-badge">{t('currentBadge')}</span>}
            </button>
          ))}
        </div>
      </div>
    </StudentDialog>
  )
}

function MarkdownContent({ content }) {
  const lines = content.split('\n')
  const nodes = []
  let list = []
  let code = []
  let inCode = false
  const flushList = () => {
    if (list.length) {
      nodes.push(
        <ul key={`list-${nodes.length}`}>
          {list.map((item) => (
            <li key={item}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      list = []
    }
  }
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.startsWith('```')) {
      flushList()
      if (inCode) {
        nodes.push(
          <pre key={`code-${index}`}>
            <code>{code.join('\n')}</code>
          </pre>
        )
        code = []
      }
      inCode = !inCode
      continue
    }
    if (inCode) {
      code.push(line)
      continue
    }
    if (line.trim().startsWith('|') && line.includes('|')) {
      flushList()
      const tableLines = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index])
        index += 1
      }
      const rows = tableLines
        .filter((tableLine) => !/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(tableLine.trim()))
        .map((tableLine) =>
          tableLine
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim())
        )
      if (rows.length)
        nodes.push(
          <table key={`table-${index}`}>
            <thead>
              <tr>
                {rows[0].map((cell) => (
                  <th key={cell}>{inlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`}>{inlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )
      index -= 1
      continue
    }
    if (line.startsWith('- ')) {
      list.push(line.slice(2))
      continue
    }
    flushList()
    if (!line.trim()) continue
    if (line.startsWith('### ')) nodes.push(<h4 key={index}>{inlineMarkdown(line.slice(4))}</h4>)
    else if (line.startsWith('## ')) nodes.push(<h3 key={index}>{inlineMarkdown(line.slice(3))}</h3>)
    else if (/^\d+\. /.test(line)) nodes.push(<p className="numbered-line" key={index}>{inlineMarkdown(line)}</p>)
    else nodes.push(<p key={index}>{inlineMarkdown(line)}</p>)
  }
  flushList()
  if (code.length) nodes.push(<pre key="trailing-code"><code>{code.join('\n')}</code></pre>)
  return <div className="markdown-content">{nodes}</div>
}

function inlineMarkdown(value) {
  const parts = value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) =>
    part.startsWith('**') ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : part.startsWith('`') ? (
      <code key={index}>{part.slice(1, -1)}</code>
    ) : (
      part
    )
  )
}

function StudentDialog({ title, onClose, children }) {
  return (
    <div
      className="student-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="student-dialog">
        <div className="student-dialog-heading">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function SettingsDialog({ preferences, onClose, onSave, t }) {
  const [next, setNext] = useState(preferences)
  return (
    <StudentDialog title={t('settingsTitle')} onClose={onClose}>
      {/* Language Section in Settings */}
      <div className="settings-option">
        <div>
          <strong>{t('languageSection')}</strong>
          <small>{t('languageDesc')}</small>
        </div>
        <div className="theme-switcher">
          <button
            className={next.language === 'en' ? 'active' : ''}
            onClick={() => setNext({ ...next, language: 'en' })}
          >
            English
          </button>
          <button
            className={next.language === 'as' ? 'active' : ''}
            onClick={() => setNext({ ...next, language: 'as' })}
          >
            অসমীয়া
          </button>
        </div>
      </div>

      <div className="settings-option">
        <div>
          <strong>{t('appearanceSection')}</strong>
          <small>{t('appearanceDesc')}</small>
        </div>
        <div className="theme-switcher">
          <button className={next.theme === 'light' ? 'active' : ''} onClick={() => setNext({ ...next, theme: 'light' })}>
            {t('light')}
          </button>
          <button className={next.theme === 'dim' ? 'active' : ''} onClick={() => setNext({ ...next, theme: 'dim' })}>
            {t('dim')}
          </button>
        </div>
      </div>

      <div className="settings-option">
        <div>
          <strong>{t('notificationsSection')}</strong>
          <small>{t('notificationsDesc')}</small>
        </div>
        <button
          className={`preference-toggle ${next.notifications ? 'active' : ''}`}
          onClick={() => setNext({ ...next, notifications: !next.notifications })}
          aria-label="Toggle notifications"
        >
          <i />
        </button>
      </div>

      <div className="student-dialog-actions">
        <button className="student-secondary" onClick={onClose}>
          {t('cancel')}
        </button>
        <button className="student-primary" onClick={() => onSave(next)}>
          {t('savePreferences')}
        </button>
      </div>
    </StudentDialog>
  )
}

function initials(name = '') {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST'
  )
}
