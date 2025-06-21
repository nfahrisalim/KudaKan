import { useState } from 'react'
import { useTheme } from './ThemeProvider.jsx'

const Navbar = ({ onLoginClick, currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 w-full z-50 shadow-sm transition-colors duration-300 ${
      theme === 'light' ? 'bg-white' : 'bg-neutral-900'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => scrollToSection('home')}
          >
            <img
              src="https://raw.githubusercontent.com/Adrian29-gpu/Assets/main/logo_fix.png"
              alt="Kudakan Logo"
              className="w-8 h-8 object-contain"
            />
            <span className={`font-bold text-2xl ${
              theme === 'light' ? 'text-stone-800' : 'text-white'
            }`}>
              Kuda<span className="text-kudakan-red">kan</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'about', 'menu', 'delivery'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`transition-colors ${
                  theme === 'light'
                    ? 'text-stone-800 hover:text-stone-600'
                    : 'text-gray-200 hover:text-kudakan-red'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-neutral-700 hover:bg-neutral-600'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Login/Dashboard Button */}
            {currentUser ? (
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Dashboard
              </button>
            ) : (
              <button onClick={onLoginClick} className="btn-primary">
                Masuk
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                theme === 'light' ? 'bg-gray-200' : 'bg-neutral-700'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${
                theme === 'light' ? 'text-stone-800' : 'text-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 rounded-lg p-4 ${
            theme === 'light' ? 'bg-gray-100' : 'bg-neutral-800'
          }`}>
            <div className="flex flex-col space-y-4">
              {['home', 'about', 'menu', 'delivery'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left transition-colors ${
                    theme === 'light'
                      ? 'text-stone-800 hover:text-stone-600'
                      : 'text-gray-200 hover:text-kudakan-red'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
              {currentUser ? (
                <button
                  onClick={() => {
                    window.location.reload()
                    setIsMobileMenuOpen(false)
                  }}
                  className="btn-primary w-fit"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick()
                    setIsMobileMenuOpen(false)
                  }}
                  className="btn-primary w-fit"
                >
                  Masuk
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
