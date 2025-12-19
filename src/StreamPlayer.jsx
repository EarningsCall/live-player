import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function StreamPlayer({ event, streamUrl }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(1)

  // Auto-connect when event changes
  useEffect(() => {
    if (event && streamUrl) {
      connectStream()
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [event, streamUrl])

  const connectStream = () => {
    const video = videoRef.current

    if (!video) return

    setStatus('connecting')
    setError(null)

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('connected')
        video.play()
        setIsPlaying(true)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          setStatus('error')
          setError(`${data.type}: ${data.details}`)

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, attempting to recover...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, attempting to recover...')
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              setIsPlaying(false)
              break
          }
        }
      })

      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl
      video.addEventListener('loadedmetadata', () => {
        setStatus('connected')
        video.play()
        setIsPlaying(true)
      })
      video.addEventListener('error', () => {
        setStatus('error')
        setError('Failed to load stream')
      })
    } else {
      setStatus('error')
      setError('HLS is not supported in this browser')
    }
  }

  const disconnectStream = () => {
    const video = videoRef.current

    if (video) {
      video.pause()
      video.src = ''
    }

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    setStatus('disconnected')
    setIsPlaying(false)
    setError(null)
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#10b981'
      case 'connecting':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (!event) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h2 style={styles.emptyTitle}>No Event Selected</h2>
          <p style={styles.emptyText}>Select a live earnings event from the list above to start streaming</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {event.symbol} - {event.companyName}
          </h1>
          <p style={styles.subtitle}>
            Q{event.quarter} {event.year} Earnings Call
          </p>
        </div>
        <div style={styles.statusContainer}>
          <div style={{ ...styles.statusDot, backgroundColor: getStatusColor() }} />
          <span style={styles.statusText}>{status.toUpperCase()}</span>
        </div>
      </div>

      <div style={styles.playerContainer}>
        <video
          ref={videoRef}
          style={styles.video}
          controls={false}
        />

        {status === 'disconnected' && (
          <div style={styles.overlay}>
            <p style={styles.overlayText}>Connecting to stream...</p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorText}>Error: {error}</span>
        </div>
      )}

      <div style={styles.controls}>
        <div style={styles.buttonGroup}>
          {status === 'disconnected' ? (
            <button onClick={connectStream} style={styles.button}>
              Connect
            </button>
          ) : (
            <button onClick={disconnectStream} style={styles.buttonSecondary}>
              Disconnect
            </button>
          )}

          {status === 'connected' && (
            <button onClick={togglePlayPause} style={styles.button}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          )}
        </div>

        {status === 'connected' && (
          <div style={styles.volumeContainer}>
            <span style={styles.volumeLabel}>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={styles.volumeSlider}
            />
            <span style={styles.volumeValue}>{Math.round(volume * 100)}%</span>
          </div>
        )}
      </div>

      <div style={styles.info}>
        <h2 style={styles.infoTitle}>Event Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Company:</span>
            <code style={styles.infoValue}>{event.companyName}</code>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Ticker:</span>
            <code style={styles.infoValue}>{event.exchange}:{event.symbol}</code>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Period:</span>
            <code style={styles.infoValue}>Q{event.quarter} {event.year}</code>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Event Date:</span>
            <code style={styles.infoValue}>
              {new Date(event.eventDate).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}
            </code>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Stream URL:</span>
            <code style={styles.infoValue}>{streamUrl}</code>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Protocol:</span>
            <code style={styles.infoValue}>HLS (HTTP Live Streaming)</code>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    marginTop: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.0125em',
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: '#94a3b8',
    marginTop: '0.375rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3.5rem 2rem',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '0.75rem',
    border: '2px dashed rgba(100, 116, 139, 0.3)',
  },
  emptyIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.25rem',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '0.9375rem',
    color: '#64748b',
    maxWidth: '400px',
    margin: '0 auto',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.5rem',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  statusText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  playerContainer: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    aspectRatio: '16 / 9',
  },
  video: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  overlayText: {
    fontSize: '1.25rem',
    color: '#94a3b8',
  },
  errorContainer: {
    backgroundColor: '#7f1d1d',
    border: '1px solid #991b1b',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  errorText: {
    color: '#fecaca',
    fontSize: '0.875rem',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#64748b',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  volumeLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  volumeSlider: {
    width: '120px',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    background: '#475569',
  },
  volumeValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#cbd5e1',
    minWidth: '45px',
  },
  info: {
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
  infoTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#f1f5f9',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#e2e8f0',
    backgroundColor: '#0f172a',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    wordBreak: 'break-all',
  },
}
