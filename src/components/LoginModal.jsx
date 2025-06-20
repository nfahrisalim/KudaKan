import { useState } from 'react'

const LoginModal = ({ isOpen, onClose }) => {
  const [activeRole, setActiveRole] = useState('mahasiswa')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement login logic with API endpoint
    console.log('Login form submitted:', { ...formData, role: activeRole })
    onClose()
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-kudakan-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-card-foreground">Masuk ke Kudakan</h2>
        
        {/* Role Selection */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setActiveRole('mahasiswa')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeRole === 'mahasiswa'
                ? 'bg-kudakan-red text-kudakan-white'
                : 'bg-muted text-muted-foreground hover:bg-kudakan-red hover:text-kudakan-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Mahasiswa
          </button>
          <button 
            onClick={() => setActiveRole('kantin')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeRole === 'kantin'
                ? 'bg-kudakan-red text-kudakan-white'
                : 'bg-muted text-muted-foreground hover:bg-kudakan-red hover:text-kudakan-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Kantin
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-card-foreground">
              {activeRole === 'mahasiswa' ? 'Email/NIM' : 'Email Kantin'}
            </label>
            <input 
              type="text" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-kudakan-red focus:border-transparent bg-background text-foreground"
              placeholder={activeRole === 'mahasiswa' ? 'Masukkan email atau NIM' : 'Masukkan email kantin'}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-card-foreground">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-kudakan-red focus:border-transparent bg-background text-foreground"
              placeholder="Masukkan password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-kudakan-red text-kudakan-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Masuk sebagai {activeRole === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}
          </button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Belum punya akun? <a href="#" className="text-kudakan-red hover:underline">Daftar sekarang</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
