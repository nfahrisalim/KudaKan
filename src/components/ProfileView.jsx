
import { useState, useEffect } from 'react'
import { mahasiswaAPI, kantinAPI, authAPI } from '../services/api.js'
import { useToast } from '../hooks/useToast.jsx'
import Toast from './Toast.jsx'

const ProfileView = ({ user, onBack, onLogout }) => {
  const [profileData, setProfileData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [formData, setFormData] = useState({})
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const data = await authAPI.getCurrentUser()
      console.log('Raw profile data:', data)
      
      // Process data based on user type
      let processedData = {}
      
      if (user.type === 'mahasiswa') {
        // Check if data has mahasiswa nested object or direct properties
        if (data.mahasiswa) {
          processedData = {
            email: data.email,
            nama_mahasiswa: data.mahasiswa.nama,
            nim: data.mahasiswa.nim,
            alamat_pengiriman: data.mahasiswa.alamat_pengiriman,
            nomor_hp: data.mahasiswa.nomor_hp
          }
        } else {
          // Direct properties (fallback)
          processedData = {
            email: data.email,
            nama_mahasiswa: data.nama || data.name,
            nim: data.nim,
            alamat_pengiriman: data.alamat_pengiriman,
            nomor_hp: data.nomor_hp
          }
        }
      } else if (user.type === 'kantin') {
        // Check if data has kantin nested object or direct properties
        if (data.kantin) {
          processedData = {
            email: data.email,
            nama_kantin: data.kantin.nama_kantin,
            nama_tenant: data.kantin.nama_tenant,
            nama_pemilik: data.kantin.nama_pemilik,
            nomor_pemilik: data.kantin.nomor_pemilik,
            jam_operasional: data.kantin.jam_operasional
          }
        } else {
          // Direct properties (fallback)
          processedData = {
            email: data.email,
            nama_kantin: data.nama_kantin || data.kantinName,
            nama_tenant: data.nama_tenant,
            nama_pemilik: data.nama_pemilik,
            nomor_pemilik: data.nomor_pemilik,
            jam_operasional: data.jam_operasional
          }
        }
      } else {
        // Fallback to original data structure
        processedData = data
      }
      
      console.log('Processed profile data:', processedData)
      setProfileData(processedData)
      setFormData(processedData)
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Gagal memuat data profil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      showToast('Menyimpan perubahan profil...', 'info')
      
      if (user.type === 'mahasiswa') {
        const updateData = {
          alamat_pengiriman: formData.alamat_pengiriman || formData.alamatPengiriman,
          nomor_hp: formData.nomor_hp || formData.nomorHp
        }
        await mahasiswaAPI.completeProfile(updateData.alamat_pengiriman, updateData.nomor_hp)
      } else if (user.type === 'kantin') {
        // Format data sesuai dengan API schema KantinProfileUpdate
        const updateData = {
          nama_tenant: formData.nama_tenant || formData.namaTenant,
          nama_pemilik: formData.nama_pemilik || formData.namaPemilik,
          nomor_pemilik: formData.nomor_pemilik || formData.nomorPemilik,
          jam_operasional: formData.jam_operasional || formData.jamOperasional
        }
        
        console.log('Sending kantin profile update:', updateData)
        await kantinAPI.updateProfile(updateData)
      }

      showToast('Profil berhasil diperbarui', 'success')
      setIsEditing(false)
      setTimeout(() => {
        fetchProfileData()
      }, 500)
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Gagal memperbarui profil. Periksa data yang dimasukkan.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Password baru tidak cocok', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Password minimal 6 karakter', 'error')
      return
    }

    try {
      setLoading(true)
      showToast('Mengubah password...', 'info')
      
      // Format sesuai dengan ChangePasswordRequest schema
      await authAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      showToast('Password berhasil diubah', 'success')
      setShowPasswordForm(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.message.includes('401')) {
        showToast('Password lama tidak benar', 'error')
      } else {
        showToast('Gagal mengubah password. Silakan coba lagi.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://raw.githubusercontent.com/Adrian29-gpu/Assets/main/logo_fix.png"
                alt="Kudakan Logo"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Profil {user.type === 'mahasiswa' ? 'Mahasiswa' : 'Kantin'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 border border-gray-300 dark:border-gray-600 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-xl"></div>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Kembali ke Dashboard</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-blue-400 opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <span className="relative z-10 font-medium">Keluar</span>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="absolute -right-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Profil</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditing ? 'Batal' : 'Edit Profil'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            {user.type === 'mahasiswa' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    NIM
                  </label>
                  <input
                    type="text"
                    value={profileData.nim || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={profileData.nama_mahasiswa || profileData.name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat Pengiriman
                  </label>
                  <textarea
                    name="alamat_pengiriman"
                    value={formData.alamat_pengiriman || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    rows="3"
                    placeholder={!formData.alamat_pengiriman && !isEditing ? "Belum diisi" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor HP
                  </label>
                  <input
                    type="text"
                    name="nomor_hp"
                    value={formData.nomor_hp || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    placeholder={!formData.nomor_hp && !isEditing ? "Belum diisi" : ""}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Kantin
                  </label>
                  <input
                    type="text"
                    value={profileData.nama_kantin || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Tenant
                  </label>
                  <input
                    type="text"
                    name="nama_tenant"
                    value={formData.nama_tenant || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    placeholder={!formData.nama_tenant && !isEditing ? "Belum diisi" : "Masukkan nama tenant"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Pemilik
                  </label>
                  <input
                    type="text"
                    name="nama_pemilik"
                    value={formData.nama_pemilik || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    placeholder={!formData.nama_pemilik && !isEditing ? "Belum diisi" : "Masukkan nama pemilik"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nomor Pemilik
                  </label>
                  <input
                    type="text"
                    name="nomor_pemilik"
                    value={formData.nomor_pemilik || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    placeholder={!formData.nomor_pemilik && !isEditing ? "Belum diisi" : "Masukkan nomor telepon pemilik"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    name="jam_operasional"
                    value={formData.jam_operasional || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white ${
                      isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700'
                    } dark:border-gray-600`}
                    placeholder={!formData.jam_operasional && !isEditing ? "Belum diisi" : "Contoh: 08:00 - 17:00"}
                  />
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData(profileData)
                }}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ubah Password</h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {showPasswordForm ? 'Batal' : 'Ubah Password'}
            </button>
          </div>

          {showPasswordForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Lama
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Mengubah...' : 'Ubah Password'}
              </button>
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
};

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-8 pb-6 pt-8 text-left shadow-2xl transition-all duration-300 w-full max-w-md border border-gray-200 dark:border-gray-700">
          
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Apakah Anda yakin ingin logout dari akun Anda?
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView