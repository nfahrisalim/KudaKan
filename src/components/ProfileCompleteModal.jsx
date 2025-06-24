import { useState } from 'react'
import { mahasiswaAPI, kantinAPI } from '../services/api.js'

const ProfileCompleteModal = ({ user, onComplete, onClose }) => {
  const [formData, setFormData] = useState({
    alamat_pengiriman: '',
    nomor_hp: '',
    nama_tenant: '',
    nama_pemilik: '',
    nomor_pemilik: '',
    jam_operasional: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (user.type === 'mahasiswa') {
        await mahasiswaAPI.completeProfile(formData.alamat_pengiriman, formData.nomor_hp)
      } else if (user.type === 'kantin') {
        await kantinAPI.completeProfile({
          nama_tenant: formData.nama_tenant,
          nama_pemilik: formData.nama_pemilik,
          nomor_pemilik: formData.nomor_pemilik,
          jam_operasional: formData.jam_operasional
        })
      }

      onComplete()
    } catch (error) {
      console.error('Error completing profile:', error)
      alert('Gagal melengkapi profil. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Lengkapi Profil
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Silakan lengkapi informasi profil Anda untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {user.type === 'mahasiswa' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alamat Pengiriman
                </label>
                <textarea
                  required
                  value={formData.alamat_pengiriman}
                  onChange={(e) => setFormData({...formData, alamat_pengiriman: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  required
                  value={formData.nomor_hp}
                  onChange={(e) => setFormData({...formData, nomor_hp: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </>
          )}

          {user.type === 'kantin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Tenant
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_tenant}
                  onChange={(e) => setFormData({...formData, nama_tenant: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nama tenant kantin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_pemilik}
                  onChange={(e) => setFormData({...formData, nama_pemilik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nama pemilik kantin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nomor Pemilik
                </label>
                <input
                  type="tel"
                  required
                  value={formData.nomor_pemilik}
                  onChange={(e) => setFormData({...formData, nomor_pemilik: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jam Operasional
                </label>
                <input
                  type="text"
                  required
                  value={formData.jam_operasional}
                  onChange={(e) => setFormData({...formData, jam_operasional: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="07:00 - 17:00"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Nanti
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileCompleteModal