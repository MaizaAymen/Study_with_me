import { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page refresh
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResponse1(data.message1);
        setResponse2(data.message2);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1>Chat with me</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message"
            required
          />
          <button type="submit">Send</button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <p>Loading...</p>}

        {response1 && (
          <div>
            <h1>Response 1</h1>
            <h2>{response1}</h2>
          </div>
        )}

        {response2 && (
          <div>
            <h1>Response 2</h1>
            <h2>{response2}</h2>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
