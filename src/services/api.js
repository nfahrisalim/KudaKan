const API_BASE_URL = "https://kudakan-backend.vercel.app/api/v1";

// Storage untuk token
const getToken = () => {
  const token = localStorage.getItem("token");
  console.log("Current token:", token ? "exists" : "null");
  return token;
};

const setToken = (token) => {
  console.log("Setting token:", token ? "token set" : "null token");
  localStorage.setItem("token", token);
};

const removeToken = () => {
  console.log("Removing token");
  localStorage.removeItem("token");
  localStorage.removeItem("lastView");
};

// Helper untuk membuat request dengan auth
const makeRequest = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("Making request to:", url, "with token:", token ? "yes" : "no");

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.log("Token expired, removing from storage");
      removeToken();
      throw new Error("Token expired");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  
  // For DELETE requests or responses without content, return empty object
  return {};
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.access_token) {
      setToken(response.access_token);
      console.log(
        "Token saved after login:",
        response.access_token.substring(0, 20) + "...",
      );
    }

    return response;
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: () => makeRequest("/auth/me"),

  changePassword: (currentPassword, newPassword) =>
    makeRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),
};

// Mahasiswa API
export const mahasiswaAPI = {
  create: (data) =>
    makeRequest("/mahasiswa/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  completeProfile: (alamatPengiriman, nomorHp) =>
    makeRequest("/mahasiswa/complete-profile", {
      method: "PUT",
      body: JSON.stringify({
        alamat_pengiriman: alamatPengiriman,
        nomor_hp: nomorHp,
      }),
    }),

  getProfileStatus: () => makeRequest("/mahasiswa/profile-status"),
};

// Kantin API
export const kantinAPI = {
  create: (data) =>
    makeRequest("/kantin/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (skip = 0, limit = 100) =>
    makeRequest(`/kantin/?skip=${skip}&limit=${limit}`),

  getById: (id) => makeRequest(`/kantin/${id}`),

  getWithMenus: (id) => makeRequest(`/kantin/${id}/with-menus`),

  completeProfile: (data) =>
    makeRequest("/kantin/complete-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateProfile: (data) =>
    makeRequest("/kantin/complete-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getProfileStatus: () => makeRequest("/kantin/profile-status"),
};

// Menu API
export const menuAPI = {
  getAll: (skip = 0, limit = 100) =>
    makeRequest(`/menu/?skip=${skip}&limit=${limit}`),

  getByKantin: (kantinId) => makeRequest(`/menu/kantin/${kantinId}`),

  getById: (id) => makeRequest(`/menu/${id}`),

  create: (data) =>
    makeRequest("/menu/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createWithImage: async (data, imageFile) => {
    const token = getToken();

    if (!token) {
      console.log("No token found for createWithImage");
      throw new Error("Token tidak ditemukan. Silakan login ulang.");
    }

    // Validate required data
    if (!data.id_kantin) {
      console.error("Missing id_kantin in data:", data);
      throw new Error("ID Kantin tidak valid. Silakan logout dan login ulang.");
    }

    console.log("Creating menu with image, token exists:", !!token);
    console.log("Menu data:", data);

    const formData = new FormData();

    // Ensure id_kantin is properly converted to integer
    const kantinId = parseInt(data.id_kantin);
    if (isNaN(kantinId)) {
      throw new Error("ID Kantin tidak valid.");
    }

    // Based on API schema, the fields should match exactly
    formData.append("id_kantin", kantinId);
    formData.append("nama_menu", data.nama_menu);
    formData.append("harga", data.harga); // Keep as string or number as per API
    formData.append("tipe_menu", data.tipe_menu);

    if (imageFile) {
      formData.append("image", imageFile);
      console.log(
        "Image file added to form data:",
        imageFile.name,
        imageFile.size,
      );
    }

    // Log form data contents
    for (let [key, value] of formData.entries()) {
      console.log(
        "FormData:",
        key,
        typeof value === "object" ? "File object" : value,
      );
    }

    try {
      const response = await fetch(`${API_BASE_URL}/menu/with-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        
        if (response.status === 401) {
          console.log("401 error - token expired or invalid");
          removeToken();
          throw new Error("Token expired");
        } else if (response.status === 422) {
          console.log("422 error - validation error");
          throw new Error("Data tidak valid. Periksa kembali input Anda.");
        }
        
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("Menu created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error in createWithImage:", error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      }
      
      throw error;
    }
  },

  update: (id, data) =>
    makeRequest(`/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    makeRequest(`/menu/${id}`, {
      method: "DELETE",
    }),

  search: (query) => makeRequest(`/menu/search/${encodeURIComponent(query)}`),

  getByType: (type) => makeRequest(`/menu/tipe/${type}`),

  getByKantinAndType: (kantinId, type) =>
    makeRequest(`/menu/kantin/${kantinId}/tipe/${type}`),
};

// Pesanan API
export const pesananAPI = {
  create: (data) =>
    makeRequest("/pesanan/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (skip = 0, limit = 100) =>
    makeRequest(`/pesanan/?skip=${skip}&limit=${limit}`),

  getById: (id) => makeRequest(`/pesanan/${id}`),

  getWithDetails: (id) => makeRequest(`/pesanan/${id}/with-details`),

  updateStatus: (id, status) =>
    makeRequest(`/pesanan/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  delete: (id) =>
    makeRequest(`/pesanan/${id}`, {
      method: "DELETE",
    }),

  getByMahasiswa: (mahasiswaId) =>
    makeRequest(`/pesanan/mahasiswa/${mahasiswaId}`),

  getByKantin: (kantinId) => makeRequest(`/pesanan/kantin/${kantinId}`),
};

// Detail Pesanan API
export const detailPesananAPI = {
  create: (data) =>
    makeRequest("/detail-pesanan/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createAutoCalculate: (idPesanan, idMenu, jumlah) =>
    makeRequest(
      `/detail-pesanan/auto-calculate?id_pesanan=${idPesanan}&id_menu=${idMenu}&jumlah=${jumlah}`,
      {
        method: "POST",
      },
    ),

  getByPesanan: (pesananId) =>
    makeRequest(`/detail-pesanan/pesanan/${pesananId}`),

  getPesananTotal: (pesananId) =>
    makeRequest(`/detail-pesanan/pesanan/${pesananId}/total`),

  update: (id, data) =>
    makeRequest(`/detail-pesanan/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    makeRequest(`/detail-pesanan/${id}`, {
      method: "DELETE",
    }),
};
