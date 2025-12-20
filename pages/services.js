import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const router = useRouter()

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🏥', color: '#0d9488' },
    { id: 'Khám chuyên khoa', name: 'Khám chuyên khoa', icon: '👨‍⚕️', color: '#7c3aed' },
    { id: 'Xét nghiệm', name: 'Xét nghiệm', icon: '🔬', color: '#dc2626' },
    { id: 'Chẩn đoán hình ảnh', name: 'Chẩn đoán hình ảnh', icon: '📷', color: '#ea580c' },
    { id: 'Thủ thuật', name: 'Thủ thuật', icon: '💉', color: '#2563eb' }
  ]

  const categoryIcons = {
    'Khám chuyên khoa': '👨‍⚕️',
    'Xét nghiệm': '🔬',
    'Chẩn đoán hình ảnh': '📷',
    'Thủ thuật': '💉',
    'Khám tổng quát': '🩺',
    'Tư vấn': '💬'
  }

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      setLoading(true)
      const res = await fetch('/api/services?isActive=true')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setServices(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Không thể tải danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getServiceIcon = (service) => {
    return service.icon || categoryIcons[service.category] || '🏥'
  }

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category)
    return cat?.color || '#0d9488'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
        padding: '60px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '10%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1 style={{ 
              fontSize: '42px', 
              fontWeight: '700', 
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Dịch Vụ Y Tế Chất Lượng Cao
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9, 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Đội ngũ bác sĩ chuyên môn cao, trang thiết bị hiện đại, phục vụ tận tâm 24/7
            </p>
            
            {/* Search Box */}
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Tìm kiếm dịch vụ (VD: Khám tim mạch, Xét nghiệm máu...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 24px 18px 54px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '50px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                opacity: 0.5
              }}>🔍</span>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '60px', 
              marginTop: '48px',
              flexWrap: 'wrap'
            }}>
              {[
                { num: '50+', label: 'Dịch vụ' },
                { num: '100+', label: 'Bác sĩ' },
                { num: '24/7', label: 'Hỗ trợ' }
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>{stat.num}</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  background: selectedCategory === cat.id 
                    ? `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)` 
                    : '#f3f4f6',
                  color: selectedCategory === cat.id ? 'white' : '#374151',
                  boxShadow: selectedCategory === cat.id ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                  transform: selectedCategory === cat.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '48px 0 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #e5e7eb',
                borderTopColor: '#0d9488',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Đang tải dịch vụ...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '36px'
              }}>❌</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Có lỗi xảy ra</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
              <button
                onClick={fetchServices}
                style={{
                  padding: '12px 24px',
                  background: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Thử lại
              </button>
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '36px'
              }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Không tìm thấy dịch vụ</h3>
              <p style={{ color: '#6b7280' }}>Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#6b7280' }}>
                  Tìm thấy <strong style={{ color: '#0d9488' }}>{filteredServices.length}</strong> dịch vụ
                </p>
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {filteredServices.map((service) => {
                  const categoryColor = getCategoryColor(service.category)
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{
                        background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`,
                        padding: '32px 24px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Decorative circle */}
                        <div style={{
                          position: 'absolute',
                          top: '-20px',
                          right: '-20px',
                          width: '80px',
                          height: '80px',
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: '50%'
                        }}></div>
                        
                        <div style={{
                          width: '64px',
                          height: '64px',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          fontSize: '32px'
                        }}>
                          {getServiceIcon(service)}
                        </div>
                        
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'rgba(255,255,255,0.25)',
                          borderRadius: '20px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {service.category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '24px' }}>
                        <h3 style={{
                          fontSize: '17px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '12px',
                          minHeight: '44px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {service.name}
                        </h3>
                        
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '16px',
                          minHeight: '40px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.5'
                        }}>
                          {service.description || 'Dịch vụ y tế chất lượng cao'}
                        </p>

                        {/* Price & Duration */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 0',
                          borderTop: '1px solid #f3f4f6',
                          marginBottom: '16px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Giá từ</div>
                            <div style={{ 
                              fontSize: '18px', 
                              fontWeight: '700', 
                              color: categoryColor 
                            }}>
                              {formatPrice(service.price)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Thời gian</div>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ⏱️ {service.duration} phút
                            </div>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/booking')
                          }}
                          style={{
                            width: '100%',
                            padding: '14px',
                            background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)'
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          📅 Đặt lịch ngay
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
        padding: '60px 0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '16px' 
          }}>
            Cần tư vấn thêm về dịch vụ?
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '32px' 
          }}>
            Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => router.push('/booking')}
              style={{
                padding: '16px 32px',
                background: 'white',
                color: '#0d9488',
                border: 'none',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              📅 Đặt lịch khám ngay
            </button>
            <a 
              href="tel:1900xxxx"
              style={{
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: '50px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              📞 Hotline: 1900 xxxx
            </a>
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div 
          onClick={() => setSelectedService(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, ${getCategoryColor(selectedService.category)}, ${getCategoryColor(selectedService.category)}cc)`,
              padding: '32px',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedService(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px'
                }}>
                  {getServiceIcon(selectedService)}
                </div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}>
                    {selectedService.category}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                    {selectedService.name}
                  </h2>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              {/* Price & Duration Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #99f6e4'
                }}>
                  <div style={{ fontSize: '14px', color: '#0d9488', marginBottom: '4px', fontWeight: '500' }}>
                    💰 Chi phí dịch vụ
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f766e' }}>
                    {formatPrice(selectedService.price)}
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #93c5fd'
                }}>
                  <div style={{ fontSize: '14px', color: '#2563eb', marginBottom: '4px', fontWeight: '500' }}>
                    ⏱️ Thời gian
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8' }}>
                    {selectedService.duration} phút
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {selectedService.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ width: '4px', height: '20px', background: '#0d9488', borderRadius: '2px' }}></span>
                    Mô tả dịch vụ
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.7',
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    {selectedService.description}
                  </p>
                </div>
              )}
              
              {/* Benefits */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ width: '4px', height: '20px', background: '#0d9488', borderRadius: '2px' }}></span>
                  Lợi ích khi sử dụng dịch vụ
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { icon: '👨‍⚕️', text: 'Đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm' },
                    { icon: '🏥', text: 'Trang thiết bị y tế hiện đại, tiên tiến' },
                    { icon: '✅', text: 'Quy trình khám chữa bệnh chuyên nghiệp' },
                    { icon: '💙', text: 'Tư vấn và hỗ trợ tận tình 24/7' }
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease'
                    }}>
                      <span style={{ fontSize: '24px' }}>{item.icon}</span>
                      <span style={{ color: '#4b5563', fontWeight: '500' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedService(null)
                    router.push('/booking')
                  }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: `linear-gradient(135deg, ${getCategoryColor(selectedService.category)}, ${getCategoryColor(selectedService.category)}dd)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  📅 Đặt lịch khám ngay
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  style={{
                    padding: '16px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
