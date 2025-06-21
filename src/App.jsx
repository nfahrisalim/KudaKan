import { useState } from 'react'
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
import Toast from './components/Toast.jsx'
import { useToast } from './hooks/useToast.jsx'

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showProfileComplete, setShowProfileComplete] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    
    // Check if profile is complete
    if (!user.isProfileComplete) {
      setShowProfileComplete(true)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setShowProfileComplete(false)
  }

  const handleProfileComplete = () => {
    setShowProfileComplete(false)
    if (currentUser) {
      setCurrentUser({...currentUser, isProfileComplete: true})
    }
  }

  // Show dashboard if user is logged in
  if (currentUser) {
    if (currentUser.type === 'mahasiswa') {
      return (
        <ThemeProvider>
          <MahasiswaDashboard user={currentUser} onLogout={handleLogout} />
        </ThemeProvider>
      )
    } else if (currentUser.type === 'kantin') {
      return (
        <ThemeProvider>
          <KantinDashboard user={currentUser} onLogout={handleLogout} />
        </ThemeProvider>
      )
    }
  }

  // Show homepage if not logged in
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />
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
