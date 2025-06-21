import { FiInstagram, FiTwitter, FiFacebook, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import HorseLogo from './HorseLogo.jsx'

const Footer = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      icon: <FiInstagram className="w-5 h-5" />,
      href: '#',
    },
    {
      name: 'Twitter',
      icon: <FiTwitter className="w-5 h-5" />,
      href: '#',
    },
    {
      name: 'Facebook',
      icon: <FiFacebook className="w-5 h-5" />,
      href: '#',
    },
  ]

  const contactItems = [
    {
      icon: <FiMapPin className="w-4 h-4" />,
      text: 'Universitas Hasanuddin, Makassar',
    },
    {
      icon: <FiPhone className="w-4 h-4" />,
      text: '+62 21 1234 5678',
    },
    {
      icon: <FiMail className="w-4 h-4" />,
      text: 'info@kudakan.ac.id',
    },
  ]

  return (
    <footer className="bg-kudakan-black text-kudakan-white py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://raw.githubusercontent.com/nfahrisalim/Assets/main/Kudakan/Kuda_Logo.jpeg"
                alt="Kudakan Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-xl">
                Kuda<span className="text-kudakan-red">kan</span>
              </span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Platform pemesanan kantin universitas yang memudahkan mahasiswa untuk memesan makanan dan minuman favorit mereka.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-300 hover:text-kudakan-red transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Jam Operasional</h3>
            <p className="text-gray-300 text-sm mb-2">Senin - Jumat: 07:00 - 21:00</p>
            <p className="text-gray-300 text-sm mb-2">Sabtu: 08:00 - 20:00</p>
            <p className="text-gray-300 text-sm">Minggu: 09:00 - 18:00</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            {contactItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <span className="text-kudakan-red">{item.icon}</span>
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">© 2025 Kudakan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
