const HeroSection = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight fade-in">
              <span className="text-kudakan-red">Kudakan</span><br />
              Sistem Pemesanan <span className="text-kudakan-yellow">Kantin</span><br />
              <span className="text-3xl md:text-4xl">Universitas</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-md slide-up">
              Pesan makanan dan minuman favorit Anda di kantin universitas dengan mudah dan cepat.
            </p>
            <div className="flex flex-wrap gap-4 slide-up">
              <button 
                onClick={() => scrollToSection('menu')}
                className="btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Lihat Menu
              </button>
              <button 
                onClick={() => scrollToSection('delivery')}
                className="btn-secondary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 15h12M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Pesan Sekarang
              </button>
            </div>
          </div>

          <div className="md:w-1/2">
            <div className="relative h-[400px] w-full md:h-[500px] rounded-lg overflow-hidden shadow-xl slide-up">
              <img 
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="University canteen food display with various Indonesian dishes" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kudakan-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
