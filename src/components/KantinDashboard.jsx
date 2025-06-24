import { useState, useEffect } from 'react'
import { menuAPI, pesananAPI, detailPesananAPI, authAPI, kantinAPI } from '../services/api.js'
import Toast from './Toast.jsx'
import ProfileCompleteModal from './ProfileCompleteModal.jsx'
import { useToast } from '../hooks/useToast.jsx'

// Helper function untuk emoji menu
const getMenuEmoji = (type) => {
  switch (type) {
    case 'makanan': return '🍛'
    case 'minuman': return '🥤'
    case 'snack': return '🍪'
    default: return '🍽️'
  }
}

const KantinDashboard = ({ user, onLogout, onGoHome, onGoProfile }) => {
  const [activeTab, setActiveTab] = useState('orders')
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [newMenuItem, setNewMenuItem] = useState({
    nama_menu: '',
    harga: '',
    tipe_menu: 'makanan'
  })
  const [editingItem, setEditingItem] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Check profile status on mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const userInfo = await authAPI.getCurrentUser()
        const isComplete = userInfo.is_profile_complete || false
        setProfileComplete(isComplete)
        if (!isComplete) {
          setShowProfileModal(true)
        }
      } catch (error) {
        console.error('Error checking profile status:', error)
      }
    }

    if (user.id) {
      checkProfileStatus()
    }
  }, [user.id])

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!user.id) return

      try {
        setLoading(true)

        // Fetch menu items untuk kantin ini
        const menus = await menuAPI.getByKantin(user.id)
        const menuData = menus.map(menu => ({
          id: menu.id_menu,
          name: menu.nama_menu,
          price: parseInt(menu.harga),
          available: true, // API tidak menyediakan field available, default true
          stock: 50, // Mock data untuk stock
          sold: Math.floor(Math.random() * 20), // Mock data untuk sold
          type: menu.tipe_menu,
          originalData: menu
        }))

        setMenuItems(menuData)

        // Fetch pesanan untuk kantin ini
        const kantinOrders = await pesananAPI.getByKantin(user.id)
        const ordersWithDetails = await Promise.all(
          kantinOrders.map(async (order) => {
            const details = await pesananAPI.getWithDetails(order.id_pesanan)

            return {
              id: order.id_pesanan,
              customerName: details.mahasiswa?.nama || 'Unknown',
              nim: details.mahasiswa?.nim || 'Unknown',
              items: details.detail_pesanan?.map(d => {
                const menu = menus.find(m => m.id_menu === d.id_menu)
                return menu ? `${menu.nama_menu} (${d.jumlah}x)` : 'Unknown Item'
              }) || [],
              total: details.detail_pesanan?.reduce((sum, d) => sum + parseInt(d.harga_total), 0) || 0,
              status: order.status === 'proses' ? 'pending' : 'completed',
              time: new Date(order.tanggal).toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              date: new Date(order.tanggal).toLocaleDateString('id-ID'),
              originalData: order
            }
          })
        )

        setOrders(ordersWithDetails)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const apiStatus = newStatus === 'completed' ? 'selesai' : 'proses'
      await pesananAPI.updateStatus(orderId, apiStatus)

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Gagal mengupdate status pesanan')
    }
  }

  const toggleMenuAvailability = (itemId) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ))
  }

  const handleAddMenuItem = async () => {
    if (!newMenuItem.nama_menu || !newMenuItem.harga) {
      showToast('Nama menu dan harga harus diisi', 'error')
      return
    }

    if (!user.id) {
      console.error('User ID is missing when trying to add menu item')
      showToast('ID pengguna tidak valid. Silakan logout dan login ulang.', 'error')
      return
    }

    setIsUploading(true)
    showToast(editingItem ? 'Memperbarui menu...' : 'Mengunggah menu...', 'info')

    try {
      console.log(editingItem ? 'Updating menu item:' : 'Adding menu item for user ID:', user.id)

      const menuData = {
        ...newMenuItem,
        id_kantin: user.id,
        harga: parseInt(newMenuItem.harga)
      }

      let response
      if (editingItem) {
        // Update existing menu
        response = await menuAPI.update(editingItem.id, menuData)
      } else {
        // Create new menu
        if (selectedImage) {
          console.log('Creating menu with image')
          showToast('Mengunggah gambar menu...', 'info')
          response = await menuAPI.createWithImage(menuData, selectedImage)
        } else {
          console.log('Creating menu without image')
          response = await menuAPI.create(menuData)
        }
      }

      console.log('Menu operation successful:', response)

      // Reset form
      setNewMenuItem({
        nama_menu: '',
        harga: '',
        tipe_menu: 'makanan'
      })
      setEditingItem(null)
      setSelectedImage(null)
      setImagePreview(null)

      showToast('Memperbarui daftar menu...', 'info')

      // Refresh menu list
      const updatedMenus = await menuAPI.getByKantin(user.id)
      const menuData2 = updatedMenus.map(menu => ({
        id: menu.id_menu,
        name: menu.nama_menu,
        price: parseInt(menu.harga),
        available: true,
        stock: 50,
        sold: Math.floor(Math.random() * 20),
        type: menu.tipe_menu,
        originalData: menu
      }))

      setMenuItems(menuData2)
      showToast(editingItem ? 'Menu berhasil diperbarui!' : 'Menu berhasil ditambahkan!', 'success')
    } catch (error) {
      console.error('Error with menu operation:', error)
      if (error.message.includes('Token expired')) {
        showToast('Sesi login expired. Silakan login ulang.', 'error')
        onLogout({ skipConfirm: true })
      } else if (error.message.includes('Gagal terhubung')) {
        showToast('Koneksi bermasalah. Periksa internet Anda.', 'error')
      } else {
        showToast(`Gagal ${editingItem ? 'memperbarui' : 'menambahkan'} menu. Silakan coba lagi.`, 'error')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditMenuItem = (item) => {
    setEditingItem(item)
    setNewMenuItem({
      nama_menu: item.name,
      harga: item.price.toString(),
      tipe_menu: item.type
    })
    setActiveTab('add-menu')
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setNewMenuItem({
      nama_menu: '',
      harga: '',
      tipe_menu: 'makanan'
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return

    try {
      showToast('Menghapus menu...', 'info')
      await menuAPI.delete(itemId)
      
      // Update state immediately after successful deletion
      setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId))
      showToast('Menu berhasil dihapus!', 'success')
    } catch (error) {
      console.error('Error deleting menu:', error)
      showToast('Gagal menghapus menu', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'preparing': return 'Diproses'
      case 'ready': return 'Siap'
      case 'completed': return 'Selesai'
      default: return status
    }
  }

  const todayStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  }

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout({ skipConfirm: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://raw.githubusercontent.com/Adrian29-gpu/Assets/main/logo_fix.png"
                alt="Kudakan Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dashboard Kantin
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.kantinName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Home Button */}
              <button
                onClick={() => {
                  localStorage.setItem('lastView', 'home')
                  if (onGoHome) {
                    onGoHome()
                  } else {
                    window.location.href = '/'
                  }
                }}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <svg className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="relative z-10">Beranda</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => onGoProfile?.()}
                className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 border border-gray-300 dark:border-gray-600">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-xl"></div>
                <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Profil</span>
                <div className="absolute -left-1 -top-1 w-14 h-11 bg-purple-400 opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >

                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Keluar</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp {todayStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="text-2xl">⏳</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                <h3 className="text-lg font-semibold">Kelola Kantin Anda</h3>
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                        activeTab === 'orders'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          activeTab === 'orders' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Kelola Pesanan</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'orders' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}></p>
                        </div>
                      </div>
                      {activeTab === 'orders' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => setActiveTab('menu')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === 'menu'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          activeTab === 'menu' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Kelola Menu</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'menu' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}></p>
                        </div>
                      </div>
                      {activeTab === 'menu' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => setActiveTab('add-menu')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === 'add-menu'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          activeTab === 'add-menu' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Tambah Menu</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'add-menu' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}></p>
                        </div>
                      </div>
                      {activeTab === 'add-menu' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === 'analytics'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          activeTab === 'analytics' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Laporan</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'analytics' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}></p>
                        </div>
                      </div>
                      {activeTab === 'analytics' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Kelola Pesanan</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Pesanan #{order.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customerName} ({order.nim})
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {order.time} - {order.date}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                        <ul className="text-sm text-gray-800 dark:text-gray-200">
                          {order.items.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-red-600">
                          Total: Rp {order.total.toLocaleString()}
                        </div>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Mulai Proses
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Siap Diambil
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Menu</h2>
                  <button 
                    onClick={() => setActiveTab('add-menu')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    + Tambah Menu
                  </button>
                </div>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-lg font-bold text-red-600 mt-1">Rp {item.price.toLocaleString()}</p>
                          <div className="flex space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Stok: {item.stock}</span>
                            <span>Terjual: {item.sold}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.available 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {item.available ? 'Tersedia' : 'Habis'}
                          </span>
                          <button
                            onClick={() => toggleMenuAvailability(item.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                          >
                            {item.available ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => handleEditMenuItem(item)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'add-menu' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
                </h2>
                <div className="max-w-md">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      value={newMenuItem.nama_menu}
                      onChange={(e) => setNewMenuItem({...newMenuItem, nama_menu: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Masukkan nama menu"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Harga
                    </label>
                    <input
                      type="number"
                      value={newMenuItem.harga}
                      onChange={(e) => setNewMenuItem({...newMenuItem, harga: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Masukkan harga"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipe Menu
                    </label>
                    <select
                      value={newMenuItem.tipe_menu}
                      onChange={(e) => setNewMenuItem({...newMenuItem, tipe_menu: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="makanan">Makanan</option>
                      <option value="minuman">Minuman</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gambar Menu (Opsional)
                    </label>
                    <div className="flex flex-col space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddMenuItem}
                      disabled={isUploading}
                      className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ${
                        isUploading ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {isUploading ? (editingItem ? 'Memperbarui...' : 'Menambahkan...') : (editingItem ? 'Perbarui Menu' : 'Tambah Menu')}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('menu')
                        cancelEdit()
                      }}
                      disabled={isUploading}
                      className={`px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Laporan Penjualan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Menu Terlaris</h3>
                    <div className="space-y-3">
                      {menuItems
                        .sort((a, b) => b.sold - a.sold)
                        .map((item, index) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-gray-900 dark:text-white">{item.name}</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{item.sold} terjual</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Hari Ini</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Pesanan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{todayStats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Pendapatan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Rp {todayStats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rata-rata per Pesanan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Rp {Math.round(todayStats.totalRevenue / todayStats.totalOrders).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Profile Complete Modal */}
      {showProfileModal && (
        <ProfileCompleteModal
          user={user}
          onComplete={() => {
            setShowProfileModal(false)
            setProfileComplete(true)
            showToast('Profil berhasil dilengkapi!', 'success')
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  )
};


const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-8 pb-6 pt-8 text-left shadow-2xl transition-all duration-300 w-full max-w-md border border-gray-200 dark:border-gray-700">

          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Apakah Anda yakin ingin keluar dari dashboard?
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KantinDashboard