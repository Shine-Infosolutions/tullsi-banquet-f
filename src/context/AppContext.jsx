import { createContext, useContext, useState } from 'react'
import axios from 'axios'

// Configure axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tulsi-banquet-backend.vercel.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    axios: axiosInstance
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext