import { useState } from 'react'
import HorseLogo from './HorseLogo.jsx'

const KantinDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders')
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Nasi Gudeg',
      price: 15000,
      available: true,
      stock: 20,
      sold: 5
    },
    {
      id: 2,
      name: 'Ayam Geprek',
      price: 12000,
      available: true,
      stock: 15,
      sold: 8
    },
    {
      id: 3,
      name: 'Gado-gado',
      price: 10000,
      available: true,
      stock: 10,
      sold: 3
    },
    {
      id: 4,
      name: 'Bakso',
      price: 8000,
      available: false,
      stock: 0,
      sold: 12
    }
  ])

  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: 'Ahmad Rizki',
      nim: '21/483920/TK/53201',
      items: ['Nasi Gudeg', 'Es Teh Manis'],
      total: 25000,
      status: 'pending',
      time: '14:30',
      date: '2025-06-20'
    },
    {
      id: 2,
      customerName: 'Sari Dewi',
      nim: '21/483921/TK/53202',
      items: ['Ayam Geprek', 'Es Jeruk'],
      total: 20000,
      status: 'preparing',
      time: '14:25',
      date: '2025-06-20'
    },
    {
      id: 3,
      customerName: 'Budi Santoso',
      nim: '21/483922/TK/53203',
      items: ['Gado-gado'],
      total: 10000,
      status: 'ready',
      time: '14:20',
      date: '2025-06-20'
    }
  ])

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  const toggleMenuAvailability = (itemId) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'preparing': return 'Diproses'
      case 'ready': return 'Siap'
      case 'completed': return 'Selesai'
      default: return status
    }
  }

  const todayStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <HorseLogo />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dashboard Kantin
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.kantinName} - {user.ownerName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ID: {user.kantinId}
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pesanan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="text-2xl">💰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp {todayStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="text-2xl">⏳</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Selesai</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.completedOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📦 Kelola Pesanan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'menu'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    🍽️ Kelola Menu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    📈 Laporan
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Kelola Pesanan</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Pesanan #{order.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customerName} ({order.nim})
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {order.time} - {order.date}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                        <ul className="text-sm text-gray-800 dark:text-gray-200">
                          {order.items.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-red-600">
                          Total: Rp {order.total.toLocaleString()}
                        </div>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Mulai Proses
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              Siap Diambil
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Menu</h2>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    + Tambah Menu
                  </button>
                </div>
                <div className="space-y-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-lg font-bold text-red-600 mt-1">Rp {item.price.toLocaleString()}</p>
                          <div className="flex space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Stok: {item.stock}</span>
                            <span>Terjual: {item.sold}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.available 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {item.available ? 'Tersedia' : 'Habis'}
                          </span>
                          <button
                            onClick={() => toggleMenuAvailability(item.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                          >
                            {item.available ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Laporan Penjualan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Menu Terlaris</h3>
                    <div className="space-y-3">
                      {menuItems
                        .sort((a, b) => b.sold - a.sold)
                        .map((item, index) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 bg-red-100 text-red-800 text-xs font-bold rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="text-gray-900 dark:text-white">{item.name}</span>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{item.sold} terjual</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Hari Ini</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Pesanan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{todayStats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Pendapatan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">Rp {todayStats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rata-rata per Pesanan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Rp {Math.round(todayStats.totalRevenue / todayStats.totalOrders).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KantinDashboard