
const API_BASE_URL = 'https://kudakan-backend.vercel.app/api/v1'

// Storage untuk token
const getToken = () => localStorage.getItem('token')
const setToken = (token) => localStorage.setItem('token', token)
const removeToken = () => localStorage.removeItem('token')

// Helper untuk membuat request dengan auth
const makeRequest = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    if (response.access_token) {
      setToken(response.access_token)
    }
    
    return response
  },
  
  logout: () => {
    removeToken()
  },
  
  getCurrentUser: () => makeRequest('/auth/me'),
  
  changePassword: (currentPassword, newPassword) => 
    makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
}

// Mahasiswa API
export const mahasiswaAPI = {
  create: (data) => makeRequest('/mahasiswa/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  completeProfile: (alamatPengiriman, nomorHp) => 
    makeRequest('/mahasiswa/complete-profile', {
      method: 'PUT',
      body: JSON.stringify({
        alamat_pengiriman: alamatPengiriman,
        nomor_hp: nomorHp
      })
    }),
  
  getProfileStatus: () => makeRequest('/mahasiswa/profile-status')
}

// Kantin API
export const kantinAPI = {
  create: (data) => makeRequest('/kantin/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAll: (skip = 0, limit = 100) => 
    makeRequest(`/kantin/?skip=${skip}&limit=${limit}`),
  
  getById: (id) => makeRequest(`/kantin/${id}`),
  
  getWithMenus: (id) => makeRequest(`/kantin/${id}/with-menus`),
  
  completeProfile: (data) => makeRequest('/kantin/complete-profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  getProfileStatus: () => makeRequest('/kantin/profile-status')
}

// Menu API
export const menuAPI = {
  getAll: (skip = 0, limit = 100) => 
    makeRequest(`/menu/?skip=${skip}&limit=${limit}`),
  
  getByKantin: (kantinId) => makeRequest(`/menu/kantin/${kantinId}`),
  
  getById: (id) => makeRequest(`/menu/${id}`),
  
  create: (data) => makeRequest('/menu/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id, data) => makeRequest(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id) => makeRequest(`/menu/${id}`, {
    method: 'DELETE'
  }),
  
  search: (query) => makeRequest(`/menu/search/${encodeURIComponent(query)}`),
  
  getByType: (type) => makeRequest(`/menu/tipe/${type}`),
  
  getByKantinAndType: (kantinId, type) => 
    makeRequest(`/menu/kantin/${kantinId}/tipe/${type}`)
}

// Pesanan API
export const pesananAPI = {
  create: (data) => makeRequest('/pesanan/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAll: (skip = 0, limit = 100) => 
    makeRequest(`/pesanan/?skip=${skip}&limit=${limit}`),
  
  getById: (id) => makeRequest(`/pesanan/${id}`),
  
  getWithDetails: (id) => makeRequest(`/pesanan/${id}/with-details`),
  
  updateStatus: (id, status) => makeRequest(`/pesanan/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  delete: (id) => makeRequest(`/pesanan/${id}`, {
    method: 'DELETE'
  }),
  
  getByMahasiswa: (mahasiswaId) => 
    makeRequest(`/pesanan/mahasiswa/${mahasiswaId}`),
  
  getByKantin: (kantinId) => 
    makeRequest(`/pesanan/kantin/${kantinId}`)
}

// Detail Pesanan API
export const detailPesananAPI = {
  create: (data) => makeRequest('/detail-pesanan/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  createAutoCalculate: (idPesanan, idMenu, jumlah) => 
    makeRequest(`/detail-pesanan/auto-calculate?id_pesanan=${idPesanan}&id_menu=${idMenu}&jumlah=${jumlah}`, {
      method: 'POST'
    }),
  
  getByPesanan: (pesananId) => 
    makeRequest(`/detail-pesanan/pesanan/${pesananId}`),
  
  getPesananTotal: (pesananId) => 
    makeRequest(`/detail-pesanan/pesanan/${pesananId}/total`),
  
  update: (id, data) => makeRequest(`/detail-pesanan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id) => makeRequest(`/detail-pesanan/${id}`, {
    method: 'DELETE'
  })
}
