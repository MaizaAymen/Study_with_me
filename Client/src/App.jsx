"use client"

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
  }, [sidebarOpen])

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
          <h1 className="app-title">
            <span className="title-gradient">Study</span> With Me
          </h1>
          {!sidebarOpen && (
            <button className="sidebar-toggle-mobile" onClick={toggleSidebar} aria-label="Open sidebar">
              <MenuIcon />
            </button>
          )}
        </div>

        <div className="chat-messages">
          {error && <div className="error-message">{error}</div>}

          {response1 && (
            <div className="response-message">
              <div className="message-content">{formatResponseText(response1)}</div>
            </div>
          )}

          {!response1 && !error && (
            <div className="welcome-message">
              <h2 className="welcome-title">
                Welcome to <span className="title-gradient">Study With Me</span>
              </h2>
              <p>Ask any question to get started. I'm here to help with your studies!</p>
              <div className="welcome-suggestions">
                <p className="suggestion-title">Try asking about:</p>
                <div className="suggestion-buttons">
                  <button className="suggestion-button" onClick={() => setInput("Explain quantum physics")}>
                    Quantum Physics
                  </button>
                  <button className="suggestion-button" onClick={() => setInput("Help me understand photosynthesis")}>
                    Photosynthesis
                  </button>
                  <button className="suggestion-button" onClick={() => setInput("What is machine learning?")}>
                    Machine Learning
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              required
              className="chat-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : <SendIcon />}
            </button>
          </form>
          {loading && <div className="loading-indicator">Processing your question...</div>}
        </div>
      </div>
    </div>
  )
}

export default App
