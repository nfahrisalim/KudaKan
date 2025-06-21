
import { useState, useEffect } from 'react'
import { authAPI } from '../services/api.js'

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userInfo = await authAPI.getCurrentUser()
          setCurrentUser(userInfo)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const response = await authAPI.login(email, password)
    if (response.access_token) {
      setCurrentUser(response.user_info)
    }
    return response
  }

  const logout = () => {
    authAPI.logout()
    setCurrentUser(null)
  }

  return {
    currentUser,
    loading,
    login,
    logout,
    setCurrentUser
  }
}
