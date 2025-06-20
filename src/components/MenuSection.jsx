import { useState } from 'react'

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('makanan')

  const menuData = {
    makanan: [
      {
        id: 1,
        name: "Nasi Ayam Geprek",
        description: "Nasi putih dengan ayam geprek pedas dan lalapan segar",
        price: "15.000",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        id: 2,
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan telur, ayam, dan kerupuk",
        price: "12.000",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        id: 3,
        name: "Bakso Jumbo",
        description: "Bakso besar dengan mie, tahu, dan kuah hangat",
        price: "10.000",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      }
    ],
    minuman: [
      {
        id: 4,
        name: "Es Jeruk Segar",
        description: "Jus jeruk segar dengan es batu",
        price: "5.000",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      },
      {
        id: 5,
        name: "Es Teh Manis",
        description: "Teh manis dingin yang menyegarkan",
        price: "3.000",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      }
    ],
    snack: [
      {
        id: 6,
        name: "Pisang Goreng",
        description: "Pisang goreng crispy dengan topping coklat",
        price: "8.000",
        image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
      }
    ]
  }

  const categories = [
    { id: 'makanan', name: 'Makanan', icon: '🍽️' },
    { id: 'minuman', name: 'Minuman', icon: '☕' },
    { id: 'snack', name: 'Snack', icon: '🍪' }
  ]

  const currentItems = menuData[activeCategory] || []

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
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">{item.name}</h3>
                <p className="text-muted-foreground mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-kudakan-red">Rp {item.price}</span>
                  <button className="px-4 py-2 bg-kudakan-red text-kudakan-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada item di kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default MenuSection
