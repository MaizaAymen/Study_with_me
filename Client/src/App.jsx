
import { useState } from "react"
import "./App.css"

function App() {
  const [input, setInput] = useState("")
  const [response1, setResponse1] = useState("")
  const [response2, setResponse2] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault() // Prevents page refresh
    setLoading(true)
    setError("")

    try {
      const res = await fetch("https://study-with-me-7otu.vercel.app/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
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

  // Function to format links in text
  const formatLinks = (text) => {
    if (!text) return ""

    // Regular expression to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g

    // Split the text by URLs and map through the parts
    const parts = text.split(urlRegex)
    const matches = text.match(urlRegex) || []

    return parts.map((part, i) => {
      // If this part is a URL (it matches with a URL from matches array)
      if (matches.includes(part)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="resource-link">
            <LinkIcon />
            <span>{part.replace(/(^\w+:|^)\/\//, "").substring(0, 30)}...</span>
          </a>
        )
      }
      // Otherwise, it's just text
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

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>
            <ResourceIcon /> Resources
          </h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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
            <button className="sidebar-toggle-mobile" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
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
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App

