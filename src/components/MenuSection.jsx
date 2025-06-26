import { useState, useEffect } from 'react'
import { menuAPI, kantinAPI } from '../services/api.js'

const MenuSection = ({ onViewAllMenus, user, onShowLogin, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('makanan')
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      setLoading(true)
      
      // Fetch kantins first
      const kantins = await kantinAPI.getAll()
      
      // Fetch all menus
      const allMenus = await menuAPI.getAll()
      const menuData = allMenus.map(menu => {
        const kantin = kantins.find(k => k.id_kantin === menu.id_kantin)
        return {
          id: menu.id_menu,
          name: menu.nama_menu,
          description: menu.deskripsi || 'Tidak ada deskripsi',
          price: parseInt(menu.harga),
          image: menu.img_menu || getDefaultImage(menu.tipe_menu),
          type: menu.tipe_menu,
          canteen: kantin ? kantin.nama_kantin : 'Unknown Kantin',
          kantinId: menu.id_kantin,
          originalData: menu
        }
      })
      
      setMenuItems(menuData)
    } catch (error) {
      console.error('Error fetching menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultImage = (type) => {
    switch (type) {
      case 'makanan':
        return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'
      case 'minuman':
        return 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'
      case 'snack':
        return 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'
      default:
        return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250'
    }
  }

  const handleAddToCart = (item) => {
    if (!user) {
      onShowLogin()
      return
    }
    
    if (onAddToCart) {
      onAddToCart(item)
    }
  }

  const categories = [
    { id: 'makanan', name: 'Makanan', icon: '🍽️' },
    { id: 'minuman', name: 'Minuman', icon: '☕' },
    { id: 'snack', name: 'Snack', icon: '🍪' }
  ]

  const currentItems = menuItems.filter(item => item.type === activeCategory).slice(0, 6)

  return (
    <section id="menu" className="py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Menu <span className="text-kudakan-red">Kantin</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilihan makanan dan minuman segar dari berbagai kantin di universitas.
          </p>
        </div>

        {/* Menu Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 slide-up">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-kudakan-red text-kudakan-white'
                  : 'bg-muted text-muted-foreground hover:bg-kudakan-red hover:text-kudakan-white'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kudakan-red mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat menu...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-card rounded-xl shadow-lg overflow-hidden card-hover slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = getDefaultImage(item.type)
                    }}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.canteen}</p>
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-kudakan-red">Rp {item.price.toLocaleString()}</span>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="px-4 py-2 bg-kudakan-red text-kudakan-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {user ? 'Tambah' : 'Login'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Tidak ada item di kategori ini.</p>
              </div>
            )}
          </>
        )}

        {/* More Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              if (!user) {
                onShowLogin()
                return
              }
              
              if (onViewAllMenus) {
                onViewAllMenus()
              } else {
                alert('Fitur lihat semua menu akan segera hadir!')
              }
            }}
            className="group relative px-8 py-4 bg-gradient-to-r from-kudakan-red to-red-700 text-kudakan-white rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto font-semibold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <span className="relative z-10">{user ? 'Lihat Semua Menu' : 'Login untuk Lihat Menu'}</span>
            <svg className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute -right-2 -top-2 w-20 h-20 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-400"></div>
          </button>
        </div>
      </div>
    </section>
  )
}

export default MenuSection
