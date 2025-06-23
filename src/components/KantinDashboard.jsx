import { useState, useEffect } from 'react'
import { menuAPI, pesananAPI, detailPesananAPI } from '../services/api.js'

// Helper function untuk emoji menu
const getMenuEmoji = (type) => {
  switch (type) {
    case 'makanan': return '🍛'
    case 'minuman': return '🥤'
    case 'snack': return '🍪'
    default: return '🍽️'
  }
}

const KantinDashboard = ({ user, onLogout, onGoProfile }) => {
  const [activeTab, setActiveTab] = useState('orders')
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMenuItem, setNewMenuItem] = useState({
    nama_menu: '',
    harga: '',
    tipe_menu: 'makanan'
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

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
      alert('Nama menu dan harga harus diisi')
      return
    }

    // Check if user is logged in
    if (!user || !user.id) {
      alert('Sesi login telah berakhir. Silakan login ulang.')
      onLogout()
      return
    }

    try {
      const menuData = {
        id_kantin: user.id,
        nama_menu: newMenuItem.nama_menu,
        harga: parseInt(newMenuItem.harga),
        tipe_menu: newMenuItem.tipe_menu
      }

      let createdMenu
      if (selectedImage) {
        createdMenu = await menuAPI.createWithImage(menuData, selectedImage)
      } else {
        createdMenu = await menuAPI.create(menuData)
      }

      const newMenu = {
        id: createdMenu.id_menu,
        name: createdMenu.nama_menu,
        price: parseInt(createdMenu.harga),
        available: true,
        stock: 50,
        sold: 0,
        type: createdMenu.tipe_menu,
        image: createdMenu.img_menu || getMenuEmoji(createdMenu.tipe_menu),
        originalData: createdMenu
      }

      setMenuItems([...menuItems, newMenu])
      setNewMenuItem({ nama_menu: '', harga: '', tipe_menu: 'makanan' })
      setSelectedImage(null)
      setImagePreview(null)
      alert('Menu berhasil ditambahkan!')

    } catch (error) {
      console.error('Error adding menu:', error)
      
      // Handle specific error types
      if (error.message.includes('Token expired') || error.message.includes('401')) {
        alert('Sesi login telah berakhir. Silakan login ulang.')
        onLogout()
      } else if (error.message.includes('422')) {
        alert('Data tidak valid. Periksa kembali input Anda.')
      } else {
        alert('Gagal menambahkan menu: ' + error.message)
      }
    }
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
      await menuAPI.delete(itemId)
      setMenuItems(menuItems.filter(item => item.id !== itemId))
      alert('Menu berhasil dihapus!')
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('Gagal menghapus menu')
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.setItem('lastView', 'home')
                  window.location.href = '/'
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Beranda
              </button>
              <button
                onClick={() => onGoProfile?.()}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </button>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin keluar?')) {
                    onLogout()
                  }
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

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
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📦 Kelola Pesanan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'menu'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    🍽️ Kelola Menu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('add-menu')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'add-menu'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    ➕ Tambah Menu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📈 Laporan
                  </button>
                </li>
              </ul>
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
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tambah Menu Baru</h2>
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
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tambah Menu
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('menu')
                        setSelectedImage(null)
                        setImagePreview(null)
                        setNewMenuItem({ nama_menu: '', harga: '', tipe_menu: 'makanan' })
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
    </div>
  )
}

export default KantinDashboard