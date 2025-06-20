const AboutSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Hemat Waktu",
      description: "Pesan makanan tanpa perlu mengantri. Ambil pesanan saat sudah siap.",
      bgColor: "bg-kudakan-red/10",
      iconColor: "text-kudakan-red"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Mudah Digunakan",
      description: "Interface yang user-friendly dan dapat diakses dari perangkat mobile maupun desktop.",
      bgColor: "bg-kudakan-yellow/20",
      iconColor: "text-kudakan-yellow"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Pembayaran Fleksibel",
      description: "Berbagai metode pembayaran digital yang aman dan terpercaya.",
      bgColor: "bg-kudakan-green/20",
      iconColor: "text-kudakan-green"
    }
  ]

  return (
    <section id="about" className="py-16 bg-muted/50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tentang <span className="text-kudakan-red">Kudakan</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Platform digital yang menghubungkan mahasiswa dengan kantin universitas untuk kemudahan pemesanan makanan dan minuman.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-xl shadow-lg card-hover slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
