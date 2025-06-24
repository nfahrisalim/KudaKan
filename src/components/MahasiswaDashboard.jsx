import { useState, useEffect } from 'react'
import { menuAPI, pesananAPI, detailPesananAPI, kantinAPI } from '../services/api.js'

const MahasiswaDashboard = ({ user, onLogout, onGoHome, onGoProfile }) => {
  const [activeTab, setActiveTab] = useState('menu')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [kantinList, setKantinList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentPesanan, setCurrentPesanan] = useState(null)

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch menu items
        const menus = await menuAPI.getAll()

        // Fetch kantin list untuk mapping nama kantin
        const kantins = await kantinAPI.getAll()

        // Map menu dengan info kantin
        const menuWithKantin = menus.map(menu => {
          const kantin = kantins.find(k => k.id_kantin === menu.id_kantin)
          return {
            id: menu.id_menu,
            name: menu.nama_menu,
            price: parseInt(menu.harga),
            canteen: kantin ? kantin.nama_kantin : 'Unknown',
            image: getMenuEmoji(menu.tipe_menu),
            available: true,
            type: menu.tipe_menu,
            kantinId: menu.id_kantin,
            originalData: menu
          }
        })

        setMenuItems(menuWithKantin)
        setKantinList(kantins)

        // Fetch pesanan mahasiswa
        if (user.id) {
          const userOrders = await pesananAPI.getByMahasiswa(user.id)
          const ordersWithDetails = await Promise.all(
            userOrders.map(async (order) => {
              const details = await pesananAPI.getWithDetails(order.id_pesanan)
              const kantin = kantins.find(k => k.id_kantin === order.id_kantin)

              return {
                id: order.id_pesanan,
                items: details.detail_pesanan?.map(d => {
                  const menu = menus.find(m => m.id_menu === d.id_menu)
                  return menu ? `${menu.nama_menu} (${d.jumlah}x)` : 'Unknown Item'
                }) || [],
                total: details.detail_pesanan?.reduce((sum, d) => sum + parseInt(d.harga_total), 0) || 0,
                status: order.status === 'proses' ? 'Sedang Diproses' : 'Selesai',
                date: new Date(order.tanggal).toLocaleDateString('id-ID'),
                canteen: kantin ? kantin.nama_kantin : 'Unknown',
                originalData: order
              }
            })
          )

          setOrders(ordersWithDetails)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user.id])

  // Helper function untuk emoji menu
  const getMenuEmoji = (type) => {
    switch (type) {
      case 'makanan': return '🍛'
      case 'minuman': return '🥤'
      case 'snack': return '🍪'
      default: return '🍽️'
    }
  }

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1, cartId: Date.now() }])
  }

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId))
  }

  const getTotalCart = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleOrder = async () => {
    if (cart.length === 0) return

    try {
      // Group cart items by kantin
      const ordersByKantin = cart.reduce((acc, item) => {
        const kantinId = item.kantinId
        if (!acc[kantinId]) {
          acc[kantinId] = []
        }
        acc[kantinId].push(item)
        return acc
      }, {})

      // Create separate pesanan for each kantin
      for (const [kantinId, items] of Object.entries(ordersByKantin)) {
        // Create pesanan
        const pesanan = await pesananAPI.create({
          id_kantin: parseInt(kantinId),
          id_mahasiswa: user.id,
          status: 'proses'
        })

        // Add detail pesanan for each item
        for (const item of items) {
          await detailPesananAPI.createAutoCalculate(
            pesanan.id_pesanan,
            item.id,
            item.quantity
          )
        }
      }

      // Clear cart and refresh orders
      setCart([])

      // Refresh orders list
      const userOrders = await pesananAPI.getByMahasiswa(user.id)
      const ordersWithDetails = await Promise.all(
        userOrders.map(async (order) => {
          const details = await pesananAPI.getWithDetails(order.id_pesanan)
          const kantin = kantinList.find(k => k.id_kantin === order.id_kantin)

          return {
            id: order.id_pesanan,
            items: details.detail_pesanan?.map(d => {
              const menu = menuItems.find(m => m.id === d.id_menu)
              return menu ? `${menu.name} (${d.jumlah}x)` : 'Unknown Item'
            }) || [],
            total: details.detail_pesanan?.reduce((sum, d) => sum + parseInt(d.harga_total), 0) || 0,
            status: order.status === 'proses' ? 'Sedang Diproses' : 'Selesai',
            date: new Date(order.tanggal).toLocaleDateString('id-ID'),
            canteen: kantin ? kantin.nama_kantin : 'Unknown',
            originalData: order
          }
        })
      )

      setOrders(ordersWithDetails)
      alert('Pesanan berhasil dibuat!')

    } catch (error) {
      console.error('Error creating order:', error)
      alert('Gagal membuat pesanan. Silakan coba lagi.')
    }
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
                  Dashboard Mahasiswa
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.name} - {user.nim}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onGoHome}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <svg className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="relative z-10">Beranda</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              <button
                onClick={onGoProfile}
                className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 border border-gray-300 dark:border-gray-600"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-xl"></div>
                <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Profil</span>
                <div className="absolute -left-1 -top-1 w-14 h-11 bg-purple-400 opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >
              {/* <button
                onClick={onLogout}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              > */}
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                <h3 className="text-lg font-semibold">Navigasi Menu Kudakan</h3>
              </div>
              
              {/* Navigation Items */}
              <div className="p-4">
                <ul className="space-y-3">
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
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 13H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zM17 5h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM17 13h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Menu Makanan</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'menu' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Lihat semua menu</p>
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
                      onClick={() => setActiveTab('cart')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === 'cart'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
                          activeTab === 'cart' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.35 2.15a1 1 0 001.41 1.41L7 13m0 0l2.83 2.83a1 1 0 001.41-1.41L7 13z" />
                          </svg>
                          {/* Cart Badge */}
                          {cart.length > 0 && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                              activeTab === 'cart'
                                ? 'bg-white text-red-600'
                                : 'bg-red-500 text-white'
                            }`}>
                              {cart.length > 9 ? '9+' : cart.length}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Keranjang</span>
                            {cart.length > 0 && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                activeTab === 'cart'
                                  ? 'bg-white/20 text-white'
                                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {cart.length}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'cart' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {cart.length === 0 ? 'Keranjang kosong' : `${cart.length} item di keranjang`}
                          </p>
                        </div>
                      </div>
                      {activeTab === 'cart' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>
                  
                  <li>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === 'orders'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          activeTab === 'orders' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Pesanan Saya</span>
                          <p className={`text-xs mt-0.5 ${
                            activeTab === 'orders' 
                              ? 'text-white/80' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>Riwayat pesanan saya</p>
                        </div>
                      </div>
                      {activeTab === 'orders' && (
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
            {activeTab === 'menu' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Menu Makanan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-2">{item.image}</div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.canteen}</p>
                      <p className="text-lg font-bold text-red-600 mb-3">Rp {item.price.toLocaleString()}</p>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.available}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          item.available
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.available ? 'Tambah ke Keranjang' : 'Tidak Tersedia'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Keranjang Belanja</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-500 dark:text-gray-400">Keranjang masih kosong</p>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.cartId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{item.image}</div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.canteen}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-red-600">Rp {item.price.toLocaleString()}</span>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                        <span className="text-2xl font-bold text-red-600">Rp {getTotalCart().toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={handleOrder}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Pesan Sekarang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Pesanan Saya</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Pesanan #{order.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{order.canteen} • {order.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'Selesai'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Items: {order.items.join(', ')}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        Total: Rp {order.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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

export default MahasiswaDashboard