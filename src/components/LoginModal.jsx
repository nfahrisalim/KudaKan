
import { useState } from 'react'
import { authAPI, mahasiswaAPI, kantinAPI } from '../services/api.js'
import Toast from './Toast.jsx'
import { useToast } from '../hooks/useToast.jsx'

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState('mahasiswa')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama: '',
    nim: '',
    nama_kantin: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegisterMode) {
        // Register logic
        if (activeRole === 'mahasiswa') {
          await mahasiswaAPI.create({
            nama: formData.nama,
            nim: formData.nim,
            email: formData.email,
            password: formData.password
          })
          showToast('Registrasi mahasiswa berhasil! Silakan login.', 'success')
        } else {
          await kantinAPI.create({
            nama_kantin: formData.nama_kantin,
            email: formData.email,
            password: formData.password
          })
          showToast('Registrasi kantin berhasil! Silakan login.', 'success')
        }
        setIsRegisterMode(false)
        setFormData({
          email: '',
          password: '',
          nama: '',
          nim: '',
          nama_kantin: ''
        })
      } else {
        // Login logic
        const response = await authAPI.login(formData.email, formData.password)
        console.log('Login response:', response)

        if (response.access_token) {
          const userInfo = response.user_info
          console.log('User info from login:', userInfo)
          console.log('Full response structure:', response)
          console.log('User type:', response.user_type)

          let processedUser = null

          if (response.user_type === 'mahasiswa') {
            processedUser = {
              type: 'mahasiswa',
              id: userInfo.id_mahasiswa,
              name: userInfo.nama,
              nim: userInfo.nim,
              email: userInfo.email,
              alamatPengiriman: userInfo.alamat_pengiriman,
              nomorHp: userInfo.nomor_hp,
              isProfileComplete: !!(userInfo.alamat_pengiriman && userInfo.nomor_hp)
            }
          } else if (response.user_type === 'kantin') {
            // Debug semua kemungkinan field ID
            console.log('All userInfo keys:', Object.keys(userInfo))
            console.log('userInfo.id_kantin:', userInfo.id_kantin)
            console.log('userInfo.id:', userInfo.id)
            console.log('userInfo.kantin_id:', userInfo.kantin_id)
            
            // Try multiple possible field names for kantin ID
            const kantinId = userInfo.id_kantin || userInfo.id || userInfo.kantin_id
            
            processedUser = {
              type: 'kantin',
              id: kantinId,
              kantinName: userInfo.nama_kantin,
              email: userInfo.email,
              namaTenant: userInfo.nama_tenant,
              namaPemilik: userInfo.nama_pemilik,
              nomorPemilik: userInfo.nomor_pemilik,
              jamOperasional: userInfo.jam_operasional,
              isProfileComplete: !!(userInfo.nama_tenant && userInfo.nama_pemilik && userInfo.nomor_pemilik && userInfo.jam_operasional)
            }
            
            // Debug log untuk memastikan ID terisi dengan benar
            console.log('Kantin ID from API:', userInfo.id_kantin)
            console.log('Alternative ID fields:', { id: userInfo.id, kantin_id: userInfo.kantin_id })
            console.log('Final processed user ID:', processedUser.id)
          }

          console.log('Processed user:', processedUser)
          
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify(processedUser))
          
          onLoginSuccess(processedUser)
          showToast(`Selamat datang, ${userInfo.nama || userInfo.nama_kantin}!`, 'success')
          onClose()
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      if (isRegisterMode) {
        showToast('Registrasi gagal. Email mungkin sudah terdaftar.', 'error')
      } else {
        showToast('Login gagal. Periksa email dan password Anda.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-kudakan-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md rounded-xl max-w-md w-full p-6 relative shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center text-card-foreground">
            {isRegisterMode ? 'Daftar Akun Kudakan' : 'Masuk ke Kudakan'}
          </h2>

          {/* Role Selection */}
          {isRegisterMode && ( 
            <div className="mb-9">
              <div className="max-w-md mx-auto">
                <div className="relative bg-slate-200 dark:bg-neutral-800 p-1 rounded-2xl">
                  <div
                    className={`absolute top-2 bottom-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl transition-all duration-300 shadow-lg ${
                      activeRole === 'mahasiswa' ? 'left-2 right-1/2 mr-1' : 'right-2 left-1/2 ml-1'
                    }`}
                  />
                  <div className="relative flex">
                    <button
                      onClick={() => setActiveRole('mahasiswa')}
                      className={`flex-1 py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${
                        activeRole === 'mahasiswa' ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round-icon lucide-user-round">
                        <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
                      </svg>
                      Mahasiswa
                    </button>
                    <button
                      onClick={() => setActiveRole('kantin')}
                      className={`flex-1 py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${
                        activeRole === 'kantin' ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chef-hat-icon lucide-chef-hat">
                        <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>
                      </svg>
                      Kantin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Input Tambahan Saat Register Mahasiswa */}
            {isRegisterMode && activeRole === 'mahasiswa' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">NIM</label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                    placeholder="Masukkan NIM"
                    required
                  />
                </div>
              </>
            )}

            {/* Input Tambahan Saat Register Kantin */}
            {isRegisterMode && activeRole === 'kantin' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Kantin</label>
                <input
                  type="text"
                  name="nama_kantin"
                  value={formData.nama_kantin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                  placeholder="Masukkan nama kantin"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {isRegisterMode ? `Email ${activeRole === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}` : `Email`}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                placeholder="Masukkan email"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                placeholder="Masukkan password"
                required
              />
              {/* Show/Hide Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 012.873-4.396m3.186-1.682A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.132 5.225M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="relative flex items-center justify-center gap-3"></div>
              {loading ? 'Memproses...' : (
                isRegisterMode
                ? `Daftar sebagai ${activeRole === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}`
                : `Masuk`
              )}
            </button>

            {/* Toggle Login/Register */}
            <p className="text-center text-sm mt-4">
              {isRegisterMode ? (
                <>
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-kudakan-red hover:underline"
                  >
                    Masuk sekarang
                  </button>
                </>
              ) : (
                <>
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-kudakan-red hover:underline"
                  >
                    Daftar sekarang
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  )
}

export default LoginModal
