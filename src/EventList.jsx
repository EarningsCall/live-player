import { useEffect, useState } from 'react'

const API_URL = 'https://prod.earningscall.dev/live-events?apikey=demo'

export default function EventList({ onSelectEvent, selectedEvent }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
    // Refresh events every 60 seconds
    const interval = setInterval(fetchEvents, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  if (loading && events.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Live Earnings Events</h2>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading live events...</p>
        </div>
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Live Earnings Events</h2>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Failed to load events: {error}</p>
          <button onClick={fetchEvents} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Live Earnings Events</h2>
        <div style={styles.headerInfo}>
          <span style={styles.count}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
          <button onClick={fetchEvents} style={styles.refreshButton} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No live earnings events at the moment</p>
          <p style={styles.emptySubtext}>Check back later for live streams</p>
        </div>
      ) : (
        <div style={styles.eventGrid}>
          {events.map((event, index) => {
            const isSelected = selectedEvent?.symbol === event.symbol &&
                             selectedEvent?.eventDate === event.eventDate

            return (
              <div
                key={`${event.symbol}-${event.eventDate}-${index}`}
                style={{
                  ...styles.eventCard,
                  ...(isSelected ? styles.eventCardSelected : {})
                }}
                onClick={() => onSelectEvent(event)}
              >
                <div style={styles.eventHeader}>
                  <div style={styles.symbolContainer}>
                    <span style={styles.exchange}>{event.exchange}</span>
                    <span style={styles.symbol}>{event.symbol}</span>
                  </div>
                  {isSelected && (
                    <div style={styles.nowPlayingBadge}>
                      <div style={styles.playingDot}></div>
                      <span style={styles.nowPlayingText}>PLAYING</span>
                    </div>
                  )}
                </div>

                <h3 style={styles.companyName}>{event.companyName}</h3>

                <div style={styles.eventDetails}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Quarter:</span>
                    <span style={styles.detailValue}>Q{event.quarter} {event.year}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Time:</span>
                    <span style={styles.detailValue}>{formatDate(event.eventDate)}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.streamLabel}>
                    {isSelected ? 'Currently Streaming' : 'Click to Stream'}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={styles.playIcon}
                  >
                    <path
                      d="M6.667 4.167v11.666l8.333-5.833-8.333-5.833z"
                      fill={isSelected ? '#3b82f6' : '#64748b'}
                    />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    marginBottom: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  count: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e2e8f0',
    backgroundColor: '#334155',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    backgroundColor: '#7f1d1d',
    border: '1px solid #991b1b',
    borderRadius: '0.75rem',
  },
  errorText: {
    color: '#fecaca',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  retryButton: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  eventCard: {
    padding: '1.5rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  eventCardSelected: {
    backgroundColor: '#1e3a5f',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3)',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  symbolContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  exchange: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  symbol: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  nowPlayingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: '9999px',
  },
  playingDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  nowPlayingText: {
    fontSize: '0.625rem',
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: '0.05em',
  },
  companyName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    fontWeight: '600',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #334155',
  },
  streamLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  playIcon: {
    transition: 'transform 0.2s',
  },
}

// Add these keyframes to your global CSS (index.css)
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  button:hover {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .eventCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`
document.head.appendChild(styleSheet)
