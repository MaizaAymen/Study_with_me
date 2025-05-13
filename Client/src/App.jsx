"use client"

import React, { useState, useEffect } from "react"
import "./App.css"

const fetchWithTimeout = (url, options, timeout = 60000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out")), timeout)

    fetch(url, options)
      .then((response) => {
        clearTimeout(timer)
        resolve(response)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

function App() {
  const [input, setInput] = useState("")
  const [response1, setResponse1] = useState("")
  const [response2, setResponse2] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [authMode, setAuthMode] = useState('login') // or 'register'
  const [authUser, setAuthUser] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authConfirm, setAuthConfirm] = useState('')
  const [authRole, setAuthRole] = useState('student')
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Auto-close sidebar on small screens
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false)
      }
      // Auto-open sidebar on larger screens
      if (window.innerWidth >= 768 && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }

    // Set initial sidebar state based on screen size
    if (window.innerWidth >= 768) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [sidebarOpen])

  // Fetch chat history when authenticated
  useEffect(() => {
    if (token) {
      fetch('http://localhost:4000/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setChatHistory(data))
        .catch(err => console.error(err))
    }
  }, [token])

  // Handle auth submit
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    // Validate registration fields
    if (authMode === 'register') {
      if (!authName || !authEmail || !authUser || !authPass || !authConfirm || !authRole) return setAuthError('All fields are required')
      if (authPass !== authConfirm) return setAuthError('Passwords do not match')
    }
    setAuthLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUser, password: authPass, name: authName, email: authEmail, role: authRole })
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Auth failed')
      } else if (authMode === 'login') {
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        // after register, switch to login
        setAuthMode('login')
        setAuthUser('')
        setAuthPass('')
      }
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setResponse1('')
    setResponse2('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page refresh
    if (!input.trim()) return // Prevent empty submissions

    setLoading(true)
    setError("")

    // Close sidebar automatically on mobile when submitting
    if (windowWidth < 768) {
      setSidebarOpen(false)
    }

    try {
      const res = await fetchWithTimeout("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: input }),
        mode: "cors",
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResponse1(data.message1)
        setResponse2(data.message2)
      }
    } catch (err) {
      // Handle timeout explicitly
      if (err.message === 'Request timed out') {
        setError('The request timed out. Please try again — AI responses can take longer.');
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatLinks = (text) => {
    if (!text) return ""

    const urlRegex = /(https?:\/\/[^\s]+)/g

    const parts = text.split(urlRegex)
    const matches = text.match(urlRegex) || []

    return parts.map((part, i) => {
      if (matches.includes(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="resource-link">
            <LinkIcon />
            <span>{part.replace(/(^\w+:|^)\/\//, "").substring(0, 30)}...</span>
          </a>
        )
      }
      return part
    })
  }

  // Format response text with enhanced styling
  const formatResponseText = (text) => {
    if (!text) return ""

    // Process headings (lines starting with # or ##)
    const processHeadings = (line) => {
      if (line.startsWith("# ")) {
        return <h3 className="response-heading-1">{line.substring(2)}</h3>
      } else if (line.startsWith("## ")) {
        return <h4 className="response-heading-2">{line.substring(3)}</h4>
      }
      return line
    }

    // Process bold text (text between ** or __)
    const processBoldText = (line) => {
      const boldRegex = /(\*\*|__)(.*?)\1/g
      return line.split(boldRegex).map((part, i) => {
        if (i % 3 === 2) {
          return <strong key={i}>{part}</strong>
        }
        return part
      })
    }

    // Process italic text (text between * or _)
    const processItalicText = (content) => {
      if (typeof content !== "string") return content

      const italicRegex = /(\*|_)(.*?)\1/g
      const parts = content.split(italicRegex)

      return parts.map((part, i) => {
        if (i % 3 === 2) {
          return <em key={i}>{part}</em>
        }
        return part
      })
    }

    // Process bullet points (lines starting with - or *)
    const processBulletPoints = (line) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return <li className="response-list-item">{line.trim().substring(2)}</li>
      }
      return line
    }

    // Split by double newlines to create paragraphs
    return text.split("\n\n").map((paragraph, index) => {
      // Check if paragraph contains bullet points
      const lines = paragraph.split("\n")
      const hasBulletPoints = lines.some((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "))

      if (hasBulletPoints) {
        return (
          <ul key={index} className="response-list">
            {lines.map((line, lineIndex) => {
              const processedLine = processBulletPoints(line)
              if (typeof processedLine !== "string") {
                return processedLine
              }
              return <p key={lineIndex}>{processItalicText(processBoldText(processedLine))}</p>
            })}
          </ul>
        )
      }

      return (
        <div key={index} className="response-paragraph">
          {lines.map((line, lineIndex) => {
            // Process headings first
            const processedLine = processHeadings(line)

            if (typeof processedLine !== "string") {
              return <div key={lineIndex}>{processedLine}</div>
            }

            // Process bold and italic text
            const formattedLine = processItalicText(processBoldText(processedLine))

            return (
              <span key={lineIndex} className="line">
                {formattedLine}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            )
          })}
        </div>
      )
    })
  }

  // Simple icon components
  const LinkIcon = () => (
    <svg
      className="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  )

  const MenuIcon = () => (
    <svg
      className="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {sidebarOpen ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </>
      ) : (
        <>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </>
      )}
    </svg>
  )

  const ResourceIcon = () => (
    <svg
      className="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  )

  const SendIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  )

  // Navbar component
  const Navbar = () => (
    <nav className="navbar">
      <h1 className="nav-title">Study With Me</h1>
      <div className="nav-links">
        <button className={`nav-item ${!showHistory ? 'active' : ''}`} onClick={() => setShowHistory(false)} data-cy="chat-tab">Chat</button>
        <button className={`nav-item ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(true)} data-cy="history-tab">History</button>
      </div>
    </nav>
  )

  // Handle sidebar toggle and add overlay for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    // If not authenticated, show login/register form
    !token ? (
      <div className="auth-container">
        <div className="book book1"></div>
        <div className="book book2"></div>
        <div className="book book3"></div>
        <form className="auth-form" onSubmit={handleAuth} data-cy="auth-form">
          <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          {authError && <div className="auth-error">{authError}</div>}
          {authMode === 'register' && (
            <>
              <input type="text" placeholder="Full Name" value={authName} onChange={e => setAuthName(e.target.value)} className="auth-input" disabled={authLoading} data-cy="register-name" />
              <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="auth-input" disabled={authLoading} data-cy="register-email" />
              <select value={authRole} onChange={e => setAuthRole(e.target.value)} className="auth-input auth-select" disabled={authLoading} data-cy="register-role">
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </>
          )}
          <input type="text" placeholder="Username" value={authUser} onChange={e => setAuthUser(e.target.value)} className="auth-input" required disabled={authLoading} data-cy="auth-username" />
          <input type="password" placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="auth-input" required disabled={authLoading} data-cy="auth-password" />
          {authMode === 'register' && <input type="password" placeholder="Confirm Password" value={authConfirm} onChange={e => setAuthConfirm(e.target.value)} className="auth-input" required disabled={authLoading} data-cy="register-confirm-password" />}
          <button type="submit" className="auth-button" disabled={authLoading} data-cy="auth-submit-button">
            {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <p className="auth-switch">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="auth-switch-button" data-cy="auth-mode-switch">
              {authMode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    ) : (
      <div className="app-container">
        <Navbar />
        <button className="logout-button" onClick={handleLogout} data-cy="logout-button">Logout</button>
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && windowWidth < 768 && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-header">
            <h2>
              <ResourceIcon /> Resources
            </h2>
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              data-cy="sidebar-toggle"
            >
              <MenuIcon />
            </button>
          </div>

          <div className="sidebar-content">
            {response2 ? (
              <div className="resource-section">
                <h3>Helpful Links</h3>
                <div className="resource-links">{formatLinks(response2)}</div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No resources available yet. Ask a question to get helpful links.</p>
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <p>Powered by AI Chat</p>
          </div>
        </div>

        {/* Main Content */}
        <div className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
          {showHistory ? (
            <div className="history-container" data-cy="chat-history-container">
              {chatHistory.length ? chatHistory.map((chat, idx) => (
                <div key={idx} className="history-item" data-cy="history-item">
                  <p className="history-message" data-cy="history-user-message"><strong>You:</strong> {chat.message}</p>
                  <p className="history-response" data-cy="history-bot-response"><strong>Bot:</strong> {chat.response1}</p>
                </div>
              )) : <p data-cy="no-history-message">No chat history available.</p>}
            </div>
          ) : (
            <>
              <div className="chat-header">
                <h1 className="app-title">
                  <span className="title-gradient">Study</span> With Me
                </h1>
                {!sidebarOpen && (
                  <button className="sidebar-toggle-mobile" onClick={toggleSidebar} aria-label="Open sidebar" data-cy="sidebar-toggle-mobile">
                    <MenuIcon />
                  </button>
                )}
              </div>

              <div className="chat-messages" data-cy="chat-messages">
                {error && <div className="error-message" data-cy="error-message">{error}</div>}

                {response1 && (
                  <div className="response-message" data-cy="ai-response">
                    <div className="message-content" data-cy="response-content">{formatResponseText(response1)}</div>
                  </div>
                )}

                {!response1 && !error && (
                  <div className="welcome-message" data-cy="welcome-message">
                    <h2 className="welcome-title" data-cy="welcome-title">
                      Welcome to <span className="title-gradient">Study With Me</span>
                    </h2>
                    <p data-cy="welcome-text">Ask any question to get started. I'm here to help with your studies!</p>
                    <div className="welcome-suggestions">
                      <p className="suggestion-title">Try asking about:</p>
                      <div className="suggestion-buttons">
                        <button className="suggestion-button" onClick={() => setInput("Explain quantum physics")} data-cy="suggestion-physics">
                          Quantum Physics
                        </button>
                        <button className="suggestion-button" onClick={() => setInput("Help me understand photosynthesis")} data-cy="suggestion-photosynthesis">
                          Photosynthesis
                        </button>
                        <button className="suggestion-button" onClick={() => setInput("What is machine learning?")} data-cy="suggestion-ml">
                          Machine Learning
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input-container">
                <form onSubmit={handleSubmit} className="chat-form" data-cy="chat-form">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    required
                    className="chat-input"
                    disabled={loading}
                    data-cy="chat-input"
                  />
                  <button type="submit" className="send-button" disabled={loading} data-cy="send-button">
                    {loading ? <span className="loading-spinner" data-cy="spinner"></span> : <SendIcon />}
                  </button>
                </form>
                {loading && <div className="loading-indicator" data-cy="loading-indicator">Processing your question...</div>}
              </div>
            </>
          )}
        </div>
      </div>
    )
  )
}

export default App
