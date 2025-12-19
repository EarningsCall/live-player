import { useState } from 'react'
import EventList from './EventList'
import StreamPlayer from './StreamPlayer'

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.mainTitle}>Live Earnings Stream Player</h1>
        <p style={styles.description}>
          Watch live earnings calls in real-time. Select an event below to start streaming.
        </p>
        <div style={styles.demoNotice}>
          <div style={styles.demoNoticeIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                fill="#60a5fa"
              />
            </svg>
          </div>
          <div style={styles.demoNoticeContent}>
            <strong style={styles.demoNoticeTitle}>Demo Mode</strong>
            <p style={styles.demoNoticeText}>
              This demo uses a limited API key that always returns Apple's Q4 2024 earnings call.
              A production API key provides access to all live earnings events across companies.
            </p>
          </div>
        </div>
      </header>

      <EventList
        onSelectEvent={handleSelectEvent}
        selectedEvent={selectedEvent}
      />

      <StreamPlayer
        event={selectedEvent}
        streamUrl={selectedEvent?.streamingUrl}
      />
    </div>
  )
}

const styles = {
  app: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: '0.75rem',
  },
  description: {
    fontSize: '1.125rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  demoNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '0.5rem',
    textAlign: 'left',
  },
  demoNoticeIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  demoNoticeContent: {
    flex: 1,
  },
  demoNoticeTitle: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: '0.25rem',
  },
  demoNoticeText: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    lineHeight: '1.5',
    margin: 0,
  },
}

export default App
