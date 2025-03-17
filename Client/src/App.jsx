
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
      const res = await fetch("http://localhost:4000/chat", {
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
            {part}
          </a>
        )
      }
      // Otherwise, it's just text
      return part
    })
  }

  return (
    <div className="app-container">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "←" : "→"}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Resources</h2>
        </div>
        <div className="sidebar-content">
          {response2 && (
            <div className="resource-section">
              <h3>Helpful Links</h3>
              <div className="resource-links">{formatLinks(response2)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="chat-header">
          <h1>Chat with me</h1>
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

