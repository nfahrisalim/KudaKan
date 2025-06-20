const DeliverySection = () => {
  const deliveryServices = [
    {
      name: "GoFood",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Gofood_logo.svg",
      url: "https://gofood.co.id",
      gradient: "from-green-500/20 to-green-600/20",
      border: "border-green-500/30"
    },
    {
      name: "Grab Food", 
      logo: "https://food.grab.com/static/images/logo-grabfood2.svg",
      url: "https://food.grab.com",
      gradient: "from-green-500/20 to-teal-500/20",
      border: "border-green-500/30"
    },
    {
      name: "Shopee Food",
      logo: "http://www.shopeefood.co.id/_next/static/0eb2d0115d4c60e056b5b91ab1813b97.png",
      url: "https://shopee.co.id/food",
      gradient: "from-orange-500/20 to-orange-600/20",
      border: "border-orange-500/30"
    }
  ]

  return (
    <section id="delivery" className="py-16 bg-muted/50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Layanan <span className="text-kudakan-red">Delivery</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tidak bisa datang ke kantin? Biarkan kami antar pesanan Anda! atau order di platform delivery favorit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deliveryServices.map((service, index) => (
            <div 
              key={service.name}
              className={`bg-gradient-to-r ${service.gradient} rounded-xl p-6 border ${service.border} hover:shadow-lg transition-all duration-300 slide-up hover:-translate-y-1`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-full relative mb-4 flex items-center justify-center">
                  <img 
                    src={service.logo} 
                    alt={service.name} 
                    className="h-12 w-auto object-contain max-w-[120px]"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div className="bg-white rounded-lg px-4 py-2 hidden">
                    <div className="text-orange-500 font-bold text-lg">{service.name}</div>
                  </div>
                </div>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 transition duration-300 flex items-center gap-2 shadow-sm"
                >
                  Order via {service.name}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Hours */}
        <div className="mt-10 text-center slide-up">
          <div className="bg-card p-6 rounded-lg shadow-sm inline-block">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-kudakan-red/10 text-kudakan-red">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-medium text-card-foreground">Jam Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  08:00 - 20:00 (Senin - Jumat)
                </p>
                <p className="text-muted-foreground text-sm">
                  09:00 - 18:00 (Sabtu - Minggu)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DeliverySection
