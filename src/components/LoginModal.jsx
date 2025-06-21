
import { useState } from 'react'
import { authAPI, mahasiswaAPI, kantinAPI } from '../services/api.js'
import Toast from './Toast.jsx'
import { useToast } from '../hooks/useToast.jsx'

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState('mahasiswa')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
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

        if (response.access_token) {
          const userInfo = response.user_info

          if (response.user_type === 'mahasiswa') {
            onLoginSuccess({
              type: 'mahasiswa',
              id: userInfo.id_mahasiswa,
              name: userInfo.nama,
              nim: userInfo.nim,
              email: userInfo.email,
              alamatPengiriman: userInfo.alamat_pengiriman,
              nomorHp: userInfo.nomor_hp,
              isProfileComplete: userInfo.is_profile_complete
            })
          } else if (response.user_type === 'kantin') {
            onLoginSuccess({
              type: 'kantin',
              id: userInfo.id_kantin,
              kantinName: userInfo.nama_kantin,
              email: userInfo.email,
              namaTenant: userInfo.nama_tenant,
              namaPemilik: userInfo.nama_pemilik,
              nomorPemilik: userInfo.nomor_pemilik,
              jamOperasional: userInfo.jam_operasional,
              isProfileComplete: userInfo.is_profile_complete
            })
          }

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store-icon lucide-store">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
              </svg>
              Kantin
            </button>
          </div>

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
                {activeRole === 'mahasiswa' ? 'Email Mahasiswa' : 'Email Kantin'}
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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-black placeholder-gray-500 dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-kudakan-red focus:outline-none"
                placeholder="Masukkan password"
                required
              />
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-kudakan-red text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (
                isRegisterMode
                  ? `Daftar sebagai ${activeRole === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}`
                  : `Masuk sebagai ${activeRole === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}`
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
