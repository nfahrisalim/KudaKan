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

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
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
      </div>
    </ThemeProvider>
  )
}

export default App
