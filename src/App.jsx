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
import AllMenusView from './components/AllMenusView.jsx'
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
  const [showProfile, setShowProfile] = useState(false)
  const [showAllMenus, setShowAllMenus] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Check for existing login on app start
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('currentUser')

      if (token && storedUser) {
        try {
          // Try to verify token is still valid
          const userInfo = await authAPI.getCurrentUser()

          // Use stored user data if API call successful
          const processedUser = JSON.parse(storedUser)

          // Update with fresh data if needed
          if (userInfo.mahasiswa && userInfo.mahasiswa.id_mahasiswa) {
            processedUser.alamatPengiriman = userInfo.mahasiswa.alamat_pengiriman
            processedUser.nomorHp = userInfo.mahasiswa.nomor_hp
            processedUser.isProfileComplete = !!(userInfo.mahasiswa.alamat_pengiriman && userInfo.mahasiswa.nomor_hp)
          } else if (userInfo.kantin && userInfo.kantin.id_kantin) {
            // Update kantin ID if it was missing from stored data
            if (!processedUser.id) {
              processedUser.id = userInfo.kantin.id_kantin
            }
            processedUser.namaTenant = userInfo.kantin.nama_tenant
            processedUser.namaPemilik = userInfo.kantin.nama_pemilik
            processedUser.nomorPemilik = userInfo.kantin.nomor_pemilik
            processedUser.jamOperasional = userInfo.kantin.jam_operasional
            processedUser.isProfileComplete = !!(userInfo.kantin.nama_tenant && userInfo.kantin.nama_pemilik && userInfo.kantin.nomor_pemilik && userInfo.kantin.jam_operasional)
          }

          console.log('Updated processed user:', processedUser)

          setCurrentUser(processedUser)

          // Save updated user data back to localStorage
          localStorage.setItem('currentUser', JSON.stringify(processedUser))

          // Check if we were in dashboard before
          const lastView = localStorage.getItem('lastView')
          if (lastView === 'dashboard') {
            setCurrentView('dashboard')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('lastView')
          localStorage.removeItem('currentUser')
        }
      }
      setLoading(false)
    }

    checkExistingAuth()
  }, [])

  const handleLoginSuccess = (userData) => {
    console.log('Login success - user data:', userData)
    setCurrentUser(userData)
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setCurrentView('dashboard')
    localStorage.setItem('lastView', 'dashboard')

    // Show profile completion modal if needed
    if (!userData.isProfileComplete) {
      setShowProfileComplete(true)
    }
  }

  const handleLogout = (options = {}) => {
    if (!options.skipConfirm && !confirm('Apakah Anda yakin ingin keluar?')) {
      return
    }

    authAPI.logout()
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setCurrentView('home')
    localStorage.removeItem('lastView')
    showToast('Berhasil keluar', 'success')
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

  const handleViewAllMenus = () => {
    if (currentUser) {
      setShowAllMenus(true)
    } else {
      setIsLoginModalOpen(true)
    }
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
      const user = currentUser
      if (showProfile) {
        return (
          <ProfileView
            user={user}
            onBack={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )
      }

      if (showAllMenus) {
        return (
          <AllMenusView
            user={user}
            onBack={() => setShowAllMenus(false)}
            onAddToCart={(item) => {
              // Handle add to cart - you might want to pass this to MahasiswaDashboard
              console.log('Add to cart:', item)
            }}
          />
        )
      }
      return (
        <ThemeProvider>
          <MahasiswaDashboard
            user={user}
            onLogout={handleLogout}
            onGoHome={() => setCurrentView('home')}
            onGoProfile={() => setShowProfile(true)}
            onViewAllMenus={() => setShowAllMenus(true)}
          />
        </ThemeProvider>
      )
    } else if (currentUser.type === 'kantin') {
      return (
        <ThemeProvider>
          <KantinDashboard 
            user={currentUser} 
            onLogout={handleLogout}
            onGoHome={() => setCurrentView('home')}
            onGoProfile={() => setCurrentView('profile')}
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
          <MenuSection 
            onViewAllMenus={handleViewAllMenus} 
            user={currentUser}
            onShowLogin={() => setIsLoginModalOpen(true)}
            onAddToCart={(item) => {
              if (currentUser && currentUser.type === 'mahasiswa') {
                // Navigate to dashboard and add to cart
                setCurrentView('dashboard');
                // You can pass the item to be added to cart here if needed
              }
            }}
          />
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