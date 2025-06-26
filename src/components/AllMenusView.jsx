
import { useState, useEffect } from 'react'
import { menuAPI, kantinAPI } from '../services/api.js'
import { useToast } from '../hooks/useToast.jsx'
import Toast from './Toast.jsx'

const AllMenusView = ({ onBack, user, onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedKantin, setSelectedKantin] = useState('all')
  const [kantinList, setKantinList] = useState([])
  const { toast, showToast, hideToast } = useToast()

  // Helper function untuk emoji menu
  const getMenuEmoji = (type) => {
    switch (type) {
      case 'makanan': return '🍛'
      case 'minuman': return '🥤'
      case 'snack': return '🍪'
      default: return '🍽️'
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    filterMenus()
  }, [searchTerm, selectedType, selectedKantin, menuItems])

  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Fetch kantins first
      const kantins = await kantinAPI.getAll()
      setKantinList(kantins)

      // Fetch all menus
      const allMenus = await menuAPI.getAll()
      const menuData = allMenus.map(menu => {
        const kantin = kantins.find(k => k.id_kantin === menu.id_kantin)
        return {
          id: menu.id_menu,
          name: menu.nama_menu,
          description: menu.deskripsi || 'Tidak ada deskripsi',
          price: parseInt(menu.harga),
          available: true,
          image: getMenuEmoji(menu.tipe_menu),
          type: menu.tipe_menu,
          canteen: kantin ? kantin.nama_kantin : 'Unknown Kantin',
          kantinId: menu.id_kantin,
          originalData: menu
        }
      })

      setMenuItems(menuData)
    } catch (error) {
      console.error('Error fetching menus:', error)
      showToast('Gagal memuat data menu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterMenus = () => {
    let filtered = menuItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.canteen.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // Filter by kantin
    if (selectedKantin !== 'all') {
      filtered = filtered.filter(item => item.kantinId === parseInt(selectedKantin))
    }

    setFilteredItems(filtered)
  }

  const handleAddToCart = (item) => {
    if (onAddToCart) {
      onAddToCart(item)
      showToast(`${item.name} ditambahkan ke keranjang`, 'success')
    } else {
      showToast('Silakan login untuk menambahkan ke keranjang', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Semua Menu Kudakan
              </h1>
            </div>
            <button
              onClick={onBack}
              className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 border border-gray-300 dark:border-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Kembali</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cari Menu
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama menu, deskripsi, atau kantin..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipe Menu
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Semua Tipe</option>
                <option value="makanan">🍛 Makanan</option>
                <option value="minuman">🥤 Minuman</option>
                <option value="snack">🍪 Snack</option>
              </select>
            </div>

            {/* Kantin Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kantin
              </label>
              <select
                value={selectedKantin}
                onChange={(e) => setSelectedKantin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Semua Kantin</option>
                {kantinList.map((kantin) => (
                  <option key={kantin.id_kantin} value={kantin.id_kantin}>
                    {kantin.nama_kantin}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Menampilkan {filteredItems.length} dari {menuItems.length} menu
          </p>
        </div>

        {/* Menu Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="text-4xl mb-3 text-center">{item.image}</div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-red-600 font-medium mb-2">
                    {item.canteen}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">
                      Rp {item.price.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'makanan' ? 'bg-orange-100 text-orange-800' :
                      item.type === 'minuman' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
                      item.available
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.available ? 'Tambah ke Keranjang' : 'Tidak Tersedia'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Tidak ada menu ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coba ubah filter pencarian Anda
            </p>
          </div>
        )}
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}

export default AllMenusView
