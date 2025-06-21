import { useState, useEffect } from 'react'
import { menuAPI, pesananAPI, detailPesananAPI, kantinAPI } from '../services/api.js'

const MahasiswaDashboard = ({ user, onLogout, onGoHome, onGoProfile }) => {
  const [activeTab, setActiveTab] = useState('menu')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [kantinList, setKantinList] = useState([])
  const [loading, setLoading] = useState(true)
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
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Beranda
              </button>
              <button
                onClick={onGoProfile}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profil
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'menu'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📋 Menu Makanan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'cart'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    🛒 Keranjang ({cart.length})
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📦 Pesanan Saya
                  </button>
                </li>
              </ul>
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
}

export default MahasiswaDashboard