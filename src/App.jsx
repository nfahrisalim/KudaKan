import { useState, useEffect } from 'react'
import ThemeProvider from './components/ThemeProvider.jsx'
import Navbar from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import MenuSection from './components/MenuSection.jsx'
import DeliverySection from './components/DeliverySection.jsx'
import Footer from './components/Footer.jsx'
import LoginModal from './components/LoginModal.jsx'
import MahasiswaDashboard from './components/MahasiswaDashboard.jsx'
import KantinDashboard from './components/KantinDashboard.jsx'
import ProfileCompleteModal from './components/ProfileCompleteModal.jsx'
import ProfileView from './components/ProfileView.jsx'
import Toast from './components/Toast.jsx'
import { useToast } from './hooks/useToast.jsx'
import { authAPI } from './services/api.js'

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showProfileComplete, setShowProfileComplete] = useState(false)
  const [currentView, setCurrentView] = useState('home') // 'home', 'dashboard', 'profile'
  const [loading, setLoading] = useState(true)
  const { toast, showToast, hideToast } = useToast()

  // Check for existing login on app start
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userInfo = await authAPI.getCurrentUser()
          setCurrentUser(userInfo)
          // Check if we were in dashboard before
          const lastView = localStorage.getItem('lastView')
          if (lastView === 'dashboard') {
            setCurrentView('dashboard')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('lastView')
        }
      }
      setLoading(false)
    }

    checkExistingAuth()
  }, [])

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setCurrentView('dashboard')
    localStorage.setItem('lastView', 'dashboard')
    
    // Check if profile is complete
    if (!user.isProfileComplete) {
      setShowProfileComplete(true)
    }
  }

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      authAPI.logout()
      setCurrentUser(null)
      setShowProfileComplete(false)
      setCurrentView('home')
      localStorage.removeItem('lastView')
    }
  }

  const handleProfileComplete = () => {
    setShowProfileComplete(false)
    if (currentUser) {
      setCurrentUser({...currentUser, isProfileComplete: true})
    }
  }

  const handleGoHome = () => {
    setCurrentView('home')
    localStorage.setItem('lastView', 'home')
  }

  const handleGoDashboard = () => {
    setCurrentView('dashboard')
    localStorage.setItem('lastView', 'dashboard')
  }

  const handleGoProfile = () => {
    setCurrentView('profile')
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show dashboard if user is logged in and in dashboard view
  if (currentUser && currentView === 'dashboard') {
    if (currentUser.type === 'mahasiswa') {
      return (
        <ThemeProvider>
          <MahasiswaDashboard 
            user={currentUser} 
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            onGoProfile={handleGoProfile}
          />
        </ThemeProvider>
      )
    } else if (currentUser.type === 'kantin') {
      return (
        <ThemeProvider>
          <KantinDashboard 
            user={currentUser} 
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            onGoProfile={handleGoProfile}
          />
        </ThemeProvider>
      )
    }
  }

  // Show profile view
  if (currentUser && currentView === 'profile') {
    return (
      <ThemeProvider>
        <ProfileView 
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
        />
      </ThemeProvider>
    )
  }

  // Show homepage
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar 
          onLoginClick={() => setIsLoginModalOpen(true)} 
          currentUser={currentUser}
          onGoDashboard={handleGoDashboard}
          onLogout={handleLogout}
          onGoProfile={handleGoProfile}
        />
        <main>
          <HeroSection />
          <AboutSection />
          <MenuSection />
          <DeliverySection />
        </main>
        <Footer />
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        {showProfileComplete && currentUser && (
          <ProfileCompleteModal
            user={currentUser}
            onComplete={handleProfileComplete}
            onClose={() => setShowProfileComplete(false)}
          />
        )}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
