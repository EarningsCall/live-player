# Live Earnings Stream Player

A React application demonstrating how to integrate with live earnings call streaming using HLS (HTTP Live Streaming) protocol. This app fetches live earnings events from an API and allows users to select and stream earnings calls in real-time.

## Features

- **Live Event Discovery**: Fetches current earnings calls from the EarningsCall API
- **Event Selection**: Browse and select from available live earnings events
- **Real-time HLS Streaming**: Stream selected earnings calls using HLS.js
- **Connection Management**: Monitor connection status (Disconnected, Connecting, Connected, Error)
- **Playback Controls**: Play/Pause and volume control
- **Automatic Error Recovery**: Handles network and media errors gracefully
- **Event Details**: Displays company information, ticker, quarter, and event date
- **Auto-refresh**: Event list refreshes every 60 seconds
- **Modern UI**: Clean, responsive interface with status indicators
- **Cross-browser Support**: Works on modern browsers including Safari with native HLS

## API Integration

This application integrates with the EarningsCall API to fetch live events:

**API Endpoint**: `https://prod.earningscall.dev/live-events?apikey=demo`

**Response Format**:
```json
{
  "events": [
    {
      "exchange": "NASDAQ",
      "symbol": "AAPL",
      "year": 2024,
      "quarter": 4,
      "companyName": "Apple Inc.",
      "eventDate": "2024-11-01T17:00:00Z",
      "streamingUrl": "https://earningscall.biz/live-demo/dynamic-playlist/playlist.m3u8"
    }
  ],
  "count": 1
}
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/live-player.git
cd live-player
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Integration Guide

### Fetching Live Events

#### 1. Create an EventList Component

```jsx
import { useEffect, useState } from 'react'

const API_URL = 'https://prod.earningscall.dev/live-events?apikey=demo'

function EventList({ onSelectEvent }) {
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
      const response = await fetch(API_URL)
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {events.map((event) => (
        <div key={event.symbol} onClick={() => onSelectEvent(event)}>
          <h3>{event.companyName}</h3>
          <p>{event.exchange}:{event.symbol} - Q{event.quarter} {event.year}</p>
        </div>
      ))}
    </div>
  )
}
```

#### 2. Manage Event Selection in App Component

```jsx
import { useState } from 'react'
import EventList from './EventList'
import StreamPlayer from './StreamPlayer'

function App() {
  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <div>
      <EventList onSelectEvent={setSelectedEvent} />
      <StreamPlayer
        event={selectedEvent}
        streamUrl={selectedEvent?.streamingUrl}
      />
    </div>
  )
}
```

### Basic HLS Integration

Here's how to integrate HLS streaming in your React application:

#### 1. Install HLS.js

```bash
npm install hls.js
```

#### 2. Create a Stream Player Component

```jsx
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

function StreamPlayer({ streamUrl }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play()
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              hls.destroy()
              break
          }
        }
      })

      hlsRef.current = hls

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamUrl
      video.play()
    }
  }, [streamUrl])

  return <video ref={videoRef} controls />
}
```

#### 3. Use the Component

```jsx
function App() {
  return (
    <StreamPlayer
      streamUrl="https://earningscall.biz/live-demo/dynamic-playlist/playlist.m3u8"
    />
  )
}
```

## Key Concepts

### HLS (HTTP Live Streaming)

HLS is an adaptive streaming protocol developed by Apple. It works by breaking the stream into small HTTP-based file segments and serving them via a playlist file (M3U8).

### HLS.js Configuration

Important configuration options:

- `enableWorker`: Offloads processing to a web worker for better performance
- `lowLatencyMode`: Reduces latency for live streams
- `backBufferLength`: How much buffer to keep (seconds)

### Error Handling

The example handles three types of errors:

1. **Network Errors**: Attempts to reload the stream
2. **Media Errors**: Attempts to recover the media pipeline
3. **Fatal Errors**: Destroys the HLS instance and requires reconnection

### Browser Compatibility

- **Modern Browsers**: Uses HLS.js for playback
- **Safari**: Uses native HLS support built into the browser

## Project Structure

```
live-player/
├── src/
│   ├── App.jsx              # Main app component with event selection state
│   ├── EventList.jsx        # Fetches and displays live events
│   ├── StreamPlayer.jsx     # HLS stream player with controls
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Customization

### Change API Endpoint

Edit the `API_URL` constant in `src/EventList.jsx` to use your own API:

```jsx
const API_URL = 'YOUR_API_ENDPOINT_HERE'
```

The API should return a response in this format:
```json
{
  "events": [
    {
      "exchange": "string",
      "symbol": "string",
      "year": number,
      "quarter": number,
      "companyName": "string",
      "eventDate": "ISO 8601 date string",
      "streamingUrl": "HLS stream URL"
    }
  ],
  "count": number
}
```

### Use a Direct Stream URL (Skip API)

If you want to stream a specific URL without the event list, modify `src/App.jsx`:

```jsx
function App() {
  const event = {
    symbol: 'DEMO',
    companyName: 'Demo Company',
    exchange: 'NASDAQ',
    quarter: 1,
    year: 2024,
    eventDate: new Date().toISOString(),
  }

  return <StreamPlayer event={event} streamUrl="YOUR_STREAM_URL_HERE" />
}
```

### Styling

The component uses inline styles for simplicity. You can extract these to CSS modules or styled-components:

```jsx
// Current approach
<div style={styles.container}>

// Alternative with CSS modules
import styles from './StreamPlayer.module.css'
<div className={styles.container}>
```

### Additional Controls

Add more controls by extending the component:

```jsx
// Speed control
<select onChange={(e) => video.currentTime = e.target.value}>
  <option value="0.5">0.5x</option>
  <option value="1">1x</option>
  <option value="1.5">1.5x</option>
</select>

// Quality selection
hls.on(Hls.Events.MANIFEST_PARSED, () => {
  const levels = hls.levels
  // Display quality options
})
```

## Troubleshooting

### Stream won't play

- Check that the stream URL is accessible
- Verify CORS headers allow your domain
- Check browser console for specific errors

### High latency

- Reduce `backBufferLength` in HLS.js config
- Enable `lowLatencyMode`
- Consider using LL-HLS if supported by your stream

### Buffering issues

- Increase `backBufferLength` for more stable playback
- Check network connection quality
- Verify stream bitrate matches connection speed

## Resources

- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
- [HLS Protocol Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT License - see LICENSE file for details
