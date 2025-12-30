import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    icon: '📦',
    isActive: true,
    isPopular: false,
    items: []
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  const iconOptions = [
    { value: '🩺', label: 'Khám tổng quát' },
    { value: '💼', label: 'Doanh nghiệp' },
    { value: '💑', label: 'Tiền hôn nhân' },
    { value: '📋', label: 'Định kỳ' },
    { value: '👶', label: 'Thai sản' },
    { value: '👴', label: 'Người cao tuổi' },
    { value: '💪', label: 'Thể thao' },
    { value: '🏥', label: 'Bệnh viện' },
    { value: '📦', label: 'Gói khám' }
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.role !== 'admin') {
          router.push('/')
          return
        }
        setUser(data)
        fetchPackages()
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    }
  }

  async function fetchPackages() {
    try {
      const res = await fetch('/api/services/packages')
      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg => {
    return !searchTerm || 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  function openCreateModal() {
    setEditingPackage(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      icon: '📦',
      isActive: true,
      isPopular: false,
      items: []
    })
    setShowModal(true)
  }

  function openEditModal(pkg) {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      duration: pkg.duration.toString(),
      icon: pkg.icon || '📦',
      isActive: pkg.isActive,
      isPopular: pkg.isPopular || false,
      items: pkg.items || []
    })
    setShowModal(true)
  }

  function addItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', description: '', category: 'Khám lâm sàng', displayOrder: formData.items.length }]
    })
  }

  function removeItem(index) {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  function updateItem(index, field, value) {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const url = editingPackage 
        ? `/api/services/packages/${editingPackage.id}`
        : '/api/services/packages'
      
      const res = await fetch(url, {
        method: editingPackage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: editingPackage ? 'Cập nhật gói khám thành công!' : 'Thêm gói khám thành công!' 
        })
        setShowModal(false)
        fetchPackages()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Có lỗi xảy ra' })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Lỗi kết nối server' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa gói khám này?')) return

    try {
      const res = await fetch(`/api/services/packages/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Xóa gói khám thành công!' })
        fetchPackages()
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Lỗi khi xóa gói khám' })
    }
  }

  async function toggleActive(pkg) {
    try {
      const res = await fetch(`/api/services/packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pkg, isActive: !pkg.isActive })
      })

      if (res.ok) {
        fetchPackages()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý gói khám</h1>
            <p className="text-gray-600 mt-1">Quản lý các gói khám sức khỏe của hệ thống</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm gói khám
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm gói khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Packages Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">Không tìm thấy gói khám nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Gói khám</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Giá</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Thời gian</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Số hạng mục</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center text-2xl">
                            {pkg.icon || '📦'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900">{pkg.name}</div>
                              {pkg.isPopular && (
                                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-semibold">
                                  ⭐ Phổ biến
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {pkg.description || 'Chưa có mô tả'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-teal-600">{formatPrice(pkg.price)}</span>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-700">
                        ⏱️ {pkg.duration} phút
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                          {pkg.items?.length || 0} hạng mục
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleActive(pkg)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 mx-auto ${
                            pkg.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${pkg.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {pkg.isActive ? 'Hoạt động' : 'Tắt'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPackage ? 'Chỉnh sửa gói khám' : 'Thêm gói khám mới'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên gói khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="VD: Gói khám tổng quát"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="VD: 1500000"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="VD: 120"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Checkboxes */}
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">⭐ Phổ biến</span>
                  </label>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về gói khám..."
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Danh sách hạng mục khám</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold hover:bg-teal-200 transition-colors"
                  >
                    + Thêm hạng mục
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Tên hạng mục (VD: Xét nghiệm máu)"
                            required
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Mô tả (tùy chọn)"
                          />
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="Khám lâm sàng">Khám lâm sàng</option>
                            <option value="Xét nghiệm">Xét nghiệm</option>
                            <option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option>
                            <option value="Thủ thuật">Thủ thuật</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {formData.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có hạng mục khám nào. Nhấn "Thêm hạng mục" để bắt đầu.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingPackage ? 'Cập nhật' : 'Thêm mới'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
