import { useState, useEffect, useRef } from 'react'

const useWebSocket = (url = 'wss://shine-backend.vercel.app') => {
  const [lastMessage, setLastMessage] = useState(null)
  const [readyState, setReadyState] = useState(0) // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  const ws = useRef(null)

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify(message))
    }
  }

  useEffect(() => {
    // For now, simulate WebSocket connection
    setReadyState(1) // Simulate connected state
    
    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  return {
    lastMessage,
    readyState,
    sendMessage
  }
}

export default useWebSocket