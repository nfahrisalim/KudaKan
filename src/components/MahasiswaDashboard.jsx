import { useState, useEffect } from "react";
import {
  pesananAPI,
  menuAPI,
  kantinAPI,
  authAPI,
  mahasiswaAPI,
} from "../services/api.js";
import Toast from "./Toast.jsx";
import ProfileCompleteModal from "./ProfileCompleteModal.jsx";
import { useToast } from "../hooks/useToast.jsx";

const MahasiswaDashboard = ({ user, onLogout, onGoHome, onGoProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [kantinList, setKantinList] = useState([]);
  const [selectedKantin, setSelectedKantin] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu"); // 'menu', 'cart', 'orders'
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Check profile status on mount
  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const userInfo = await authAPI.getCurrentUser();
        console.log("Profile status check:", userInfo);

        // For mahasiswa, check if all required fields are present
        let isComplete = false;
        if (userInfo.mahasiswa) {
          const mahasiswa = userInfo.mahasiswa;
          isComplete = !!(mahasiswa.alamat_pengiriman && mahasiswa.nomor_hp);
        } else {
          isComplete = userInfo.is_profile_complete || false;
        }

        console.log("Profile complete status:", isComplete);
        setProfileComplete(isComplete);

        if (!isComplete) {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error("Error checking profile status:", error);
      }
    };

    if (user.id) {
      checkProfileStatus();
    }
  }, [user.id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch kantins
        const kantins = await kantinAPI.getAll();
        setKantinList(kantins);

        // Fetch all menus
        const allMenus = await menuAPI.getAll();
        const menuData = allMenus.map((menu) => {
          const kantin = kantins.find((k) => k.id_kantin === menu.id_kantin);
          return {
            id: menu.id_menu,
            name: menu.nama_menu,
            description: menu.deskripsi || "Tidak ada deskripsi",
            price: parseInt(menu.harga),
            available: true,
            image: menu.img_menu || getDefaultMenuImage(menu.tipe_menu),
            emoji: getMenuEmoji(menu.tipe_menu),
            type: menu.tipe_menu,
            canteen: kantin ? kantin.nama_kantin : "Unknown Kantin",
            kantinId: menu.id_kantin,
            originalData: menu,
          };
        });
        setMenuItems(menuData);

        // Fetch orders jika user ada
        if (user.id) {
          const userOrders = await pesananAPI.getByMahasiswa(user.id);
          const ordersWithDetails = await Promise.all(
            userOrders.map(async (order) => {
              const details = await pesananAPI.getWithDetails(order.id_pesanan);
              return {
                id: order.id_pesanan,
                kantinName: details.kantin?.nama_kantin || "Unknown Kantin",
                items:
                  details.detail_pesanan?.map((d) => {
                    return d.menu
                      ? `${d.menu.nama_menu} (${d.jumlah}x)`
                      : "Unknown Item";
                  }) || [],
                total:
                  details.detail_pesanan?.reduce(
                    (sum, d) => sum + parseInt(d.harga_total),
                    0,
                  ) || 0,
                status:
                  order.status === "proses" ? "Sedang Diproses" : "Selesai",
                time: new Date(order.tanggal).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: new Date(order.tanggal).toLocaleDateString("id-ID"),
                originalData: order,
              };
            }),
          );
          setOrders(ordersWithDetails);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user.id]);

  // Helper function untuk emoji menu
  const getMenuEmoji = (type) => {
    switch (type) {
      case "makanan":
        return "🍛";
      case "minuman":
        return "🥤";
      case "snack":
        return "🍪";
      default:
        return "🍽️";
    }
  };

  // Helper function untuk default image
  const getDefaultMenuImage = (type) => {
    switch (type) {
      case "makanan":
        return "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      case "minuman":
        return "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      case "snack":
        return "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
      default:
        return "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
    }
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const getTotalCart = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;

    try {
      // Group cart items by kantin
      const ordersByKantin = cart.reduce((acc, item) => {
        const kantinId = item.kantinId;
        if (!acc[kantinId]) {
          acc[kantinId] = [];
        }
        acc[kantinId].push(item);
        return acc;
      }, {});

      // Create separate pesanan for each kantin using new API format
      for (const [kantinId, items] of Object.entries(ordersByKantin)) {
        // Prepare menu items for the new API format
        const menuItemsForOrder = items.map(item => ({
          id_menu: item.id,
          jumlah: item.quantity
        }));

        // Create pesanan using the new endpoint that accepts menu_items directly
        await pesananAPI.create({
          menu_items: menuItemsForOrder
        });
      }

      // Clear cart and refresh orders
      setCart([]);

      // Refresh orders list
      const userOrders = await pesananAPI.getByMahasiswa(user.id);
      const ordersWithDetails = await Promise.all(
        userOrders.map(async (order) => {
          const details = await pesananAPI.getWithDetails(order.id_pesanan);
          const kantin = kantinList.find(
            (k) => k.id_kantin === order.id_kantin,
          );

          return {
            id: order.id_pesanan,
            kantinName: details.kantin?.nama_kantin || kantin?.nama_kantin || "Unknown Kantin",
            items:
              details.detail_pesanan?.map((d) => {
                return d.menu
                  ? `${d.menu.nama_menu} (${d.jumlah}x)`
                  : "Unknown Item";
              }) || [],
            total:
              details.detail_pesanan?.reduce(
                (sum, d) => sum + parseInt(d.harga_total),
                0,
              ) || 0,
            status: order.status === "proses" ? "Sedang Diproses" : "Selesai",
            time: new Date(order.tanggal).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(order.tanggal).toLocaleDateString("id-ID"),
            originalData: order,
          };
        }),
      );

      setOrders(ordersWithDetails);
      showToast("Pesanan berhasil dibuat!", "success");
    } catch (error) {
      console.error("Error creating order:", error);
      showToast("Gagal membuat pesanan. Silakan coba lagi.", "error");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    onLogout({ skipConfirm: true });
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
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dashboard Mahasiswa
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.name} - {user.nim}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onGoHome}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <svg
                  className="w-4 h-4 transform group-hover:rotate-12 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="relative z-10">Beranda</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              <button
                onClick={onGoProfile}
                className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 border border-gray-300 dark:border-gray-600"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-xl"></div>
                <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Profil</span>
                <div className="absolute -left-1 -top-1 w-14 h-11 bg-purple-400 opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              >
                {/* <button
                onClick={onLogout}
                className="group relative px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 overflow-hidden"
              > */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <span className="relative z-10 font-medium">Keluar</span>
                <div className="absolute -left-2 -top-2 w-16 h-16 bg-white opacity-10 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                <h3 className="text-lg font-semibold">Navigasi Menu Kudakan</h3>
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setActiveTab("menu")}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === "menu"
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            activeTab === "menu"
                              ? "bg-white/20 text-white"
                              : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM9 13H7a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zM17 5h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zM17 13h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Menu Makanan</span>
                          <p
                            className={`text-xs mt-0.5 ${
                              activeTab === "menu"
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            Lihat semua menu
                          </p>
                        </div>
                      </div>
                      {activeTab === "menu" && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => setActiveTab("cart")}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === "cart"
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative ${
                            activeTab === "cart"
                              ? "bg-white/20 text-white"
                              : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800/40"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.35 2.15a1 1 0 001.41 1.41L7 13m0 0l2.83 2.83a1 1 0 001.41-1.41L7 13z"
                            />
                          </svg>
                          {/* Cart Badge */}
                          {cart.length > 0 && (
                            <div
                              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                                activeTab === "cart"
                                  ? "bg-white text-red-600"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {cart.length > 9 ? "9+" : cart.length}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Keranjang</span>
                            {cart.length > 0 && (
                              <span
                                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                  activeTab === "cart"
                                    ? "bg-white/20 text-white"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {cart.length}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              activeTab === "cart"
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {cart.length === 0
                              ? "Keranjang kosong"
                              : `${cart.length} item di keranjang`}
                          </p>
                        </div>
                      </div>
                      {activeTab === "cart" && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] relative ${
                        activeTab === "orders"
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            activeTab === "orders"
                              ? "bg-white/20 text-white"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium">Pesanan Saya</span>
                          <p
                            className={`text-xs mt-0.5 ${
                              activeTab === "orders"
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            Riwayat pesanan saya
                          </p>
                        </div>
                      </div>
                      {activeTab === "orders" && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "menu" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Menu Makanan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-600"
                    >
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-48 object-cover transition-all duration-300 hover:rotate-1 hover:scale-105 hover:shadow-xl cursor-pointer"
                          onError={(e) => {
                            e.target.src = getDefaultMenuImage(item.type);
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1">
                          <span className="text-lg">{item.emoji}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {item.canteen}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-red-600">
                            Rp {item.price.toLocaleString()}
                          </p>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                              item.available
                                ? "bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-700 text-white hover:bg-red-700 hover:scale-105 hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {item.available && (
                              <span className="transition-transform duration-300 hover:rotate-90">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                              </span>
                            )}
                            {item.available ? "Tambah" : "Habis"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "cart" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Keranjang Belanja
                </h2>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Keranjang masih kosong
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4 mb-6">
                      {cart.map((item, index) => (
                        <div
                          key={item.cartId}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30 hover:border-red-400/50 dark:hover:border-red-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-500/20"
                          style={{
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          {/* Animated background gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 -z-10"></div> */}
                          
                          <div className="relative flex items-center justify-between p-6">
                            <div className="flex items-center space-x-5">
                              {/* Enhanced image with glow effect */}
                              <div className="relative group/image">
                                <div className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover/image:opacity-20 blur-md transition-all duration-300"></div>
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="relative w-20 h-20 object-cover rounded-xl border-2 border-gray-200/50 dark:border-gray-600/50 group-hover/image:border-red-400/50 transition-all duration-300 group-hover/image:scale-105 group-hover/image:shadow-lg"
                                  onError={(e) => {
                                    e.target.src = getDefaultMenuImage(item.type);
                                  }}
                                />
                                {/* Quantity badge */}
                                {/* <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                                  {item.quantity}
                                </div> */}
                              </div>
                              
                              <div className="space-y-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                  {item.name}
                                </h4>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                  {item.canteen}
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">
                                    Jumlah: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                  Rp {(item.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                              

                              <button
                                onClick={() => removeFromCart(item.cartId)}
                                className="group/btn relative px-3 py-2 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-red-300/30 hover:border-red-400/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                                
                                <div className="relative flex items-center gap-2">
                                  <svg 
                                    className="w-5 h-5 text-red-600 group-hover/btn:text-red-500 transition-colors duration-300" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span className="text-sm font-medium text-red-600 group-hover/btn:text-red-500 hidden sm:inline">
                                    Hapus
                                  </span>
                                </div>
                                
                                {/* Ripple effect */}
                                {/* <div className="absolute inset-0 rounded-xl bg-red-400 opacity-0 group-active/btn:opacity-30 transition-opacity duration-150"></div> */}
                              </button>
                            </div>
                          </div>
                          
                          {/* Animated bottom border */}
                          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
                          
                          {/* Subtle scan line effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                        </div>
                      ))}
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70 backdrop-blur-sm border-t-4 border-gradient-to-r from-red-500 to-orange-500 shadow-2xl shadow-red-500/10 dark:shadow-red-500/20">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 animate-pulse"></div>
                      
                      {/* Content */}
                      <div className="relative p-6 space-y-6">
                        {/* Total Section */}
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              Total Pembayaran:
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                              Rp {getTotalCart().toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Separator with animation */}
                        <div className="relative h-px bg-gradient-to-r from-transparent via-red-300 to-transparent">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 scale-x-0 animate-pulse origin-center"></div>
                        </div>
                        
                        {/* Order Button */}
                        <button
                          onClick={handleOrder}
                          className="group relative w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 active:scale-95 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-100"></div>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          
                          <div className="relative flex items-center justify-center gap-3">
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="group-hover:tracking-wider transition-all duration-300">
                              Pesan Sekarang
                            </span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                          
                          <div className="absolute inset-0 rounded-xl bg-red-400 opacity-0 group-active:opacity-30 transition-opacity duration-150"></div>
                        </button>
                        
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Pesanan Saya
                </h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Pesanan #{order.id}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.canteen} • {order.date}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "Selesai"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Items: {order.items.join(", ")}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        Total: Rp {order.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Profile Complete Modal */}
      {showProfileModal && (
        <ProfileCompleteModal
          user={user}
          onComplete={() => {
            setShowProfileModal(false);
            setProfileComplete(true);
            showToast("Profil berhasil dilengkapi!", "success");
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
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
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Apakah Anda yakin ingin keluar dari dashboard?
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

export default MahasiswaDashboard;
