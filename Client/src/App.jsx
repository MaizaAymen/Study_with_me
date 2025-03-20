
import { useState, useEffect } from "react"
import "./App.css"

const fetchWithTimeout = (url, options, timeout = 15000) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

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
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page refresh
    setLoading(true)
    setError("")

    // Close sidebar automatically on mobile when submitting
    if (windowWidth < 768) {
      setSidebarOpen(false)
    }

    try {
      const res = await fetchWithTimeout("https://study-with-me-nakk.vercel.app/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      setError(err.message)
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

  // Handle sidebar toggle and add overlay for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="app-container">
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
        <div className="chat-header">
          <h1>Study With Me</h1>
          {!sidebarOpen && (
            <button className="sidebar-toggle-mobile" onClick={toggleSidebar} aria-label="Open sidebar">
              <MenuIcon />
            </button>
          )}
        </div>

        <div className="chat-messages">
          {error && <p className="error-message">{error}</p>}

          {response1 && (
            <div className="response-message">
              <div className="message-content">{response1}</div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          {loading && <div className="loading-indicator">Loading...</div>}

          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your message"
              required
              className="chat-input"
            />
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App

