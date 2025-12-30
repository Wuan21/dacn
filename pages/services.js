import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Services() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPackage, setSelectedPackage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      setLoading(true)
      const res = await fetch('/api/services/packages?isActive=true')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPackages(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching packages:', error)
      setError('Không thể tải danh sách gói khám')
    } finally {
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return pkg.name.toLowerCase().includes(search) ||
           pkg.description?.toLowerCase().includes(search) ||
           pkg.items?.some(item => item.name.toLowerCase().includes(search))
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const groupItemsByCategory = (items) => {
    const grouped = {}
    items.forEach(item => {
      const cat = item.category || 'Khác'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(item)
    })
    return grouped
  }

  const categoryIcons = {
    'Khám lâm sàng': '👨‍⚕️',
    'Xét nghiệm': '🔬',
    'Chẩn đoán hình ảnh': '📷',
    'Khác': '📋'
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
              Gói Khám Sức Khỏe
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9, 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Gói khám toàn diện với đội ngũ bác sĩ chuyên môn cao, trang thiết bị hiện đại
            </p>
            
            {/* Search Box */}
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder="Tìm kiếm gói khám (VD: Gói khám tổng quát, Xét nghiệm máu...)"
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
                { num: '4+', label: 'Gói khám' },
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

      {/* Packages Grid */}
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
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Đang tải gói khám...</p>
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
                onClick={fetchPackages}
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
          ) : filteredPackages.length === 0 ? (
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
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Không tìm thấy gói khám</h3>
              <p style={{ color: '#6b7280' }}>Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#6b7280' }}>
                  Tìm thấy <strong style={{ color: '#0d9488' }}>{filteredPackages.length}</strong> gói khám
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px'
              }}>
                {filteredPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e5e7eb',
                      position: 'relative'
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
                    {pkg.isPopular && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                        zIndex: 1
                      }}>
                        ⭐ Phổ biến
                      </div>
                    )}

                    <div style={{
                      background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                      padding: '32px 24px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
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
                        {pkg.icon || '🏥'}
                      </div>
                    </div>

                    <div style={{ padding: '24px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '12px',
                        minHeight: '44px'
                      }}>
                        {pkg.name}
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
                        {pkg.description || 'Gói khám sức khỏe toàn diện'}
                      </p>

                      <div style={{
                        background: '#f0fdfa',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#0d9488',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📋 Bao gồm {pkg.items?.length || 0} phần khám
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderTop: '1px solid #f3f4f6',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Giá gói</div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '700', 
                            color: '#0d9488' 
                          }}>
                            {formatPrice(pkg.price)}
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
                            ⏱️ {pkg.duration} phút
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPackage(pkg)
                        }}
                        style={{
                          width: '100%',
                          padding: '14px',
                          background: 'linear-gradient(135deg, #0d9488, #0891b2)',
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
                          e.currentTarget.style.transform = 'scale(1.03)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        Xem chi tiết
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div 
          onClick={() => setSelectedPackage(null)}
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
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0d9488, #0891b2)',
              padding: '32px',
              color: 'white',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedPackage(null)}
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
                  cursor: 'pointer'
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
                  {selectedPackage.icon || '🏥'}
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                    {selectedPackage.name}
                  </h2>
                  <p style={{ opacity: 0.9 }}>{selectedPackage.description}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
                marginBottom: '32px',
                padding: '20px',
                background: '#f0fdfa',
                borderRadius: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Giá gói</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0d9488' }}>
                    {formatPrice(selectedPackage.price)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Thời gian</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>
                    ⏱️ {selectedPackage.duration} phút
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>
                Gói khám bao gồm:
              </h3>

              {selectedPackage.items && selectedPackage.items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.entries(groupItemsByCategory(selectedPackage.items)).map(([category, items]) => (
                    <div key={category}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#0d9488',
                        fontWeight: '600'
                      }}>
                        <span style={{ fontSize: '20px' }}>{categoryIcons[category] || '📋'}</span>
                        <span>{category}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '32px' }}>
                        {items.map((item, idx) => (
                          <div key={idx} style={{
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            borderLeft: '3px solid #0d9488'
                          }}>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                              {item.name}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => router.push('/booking')}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '32px',
                  background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Đặt lịch khám ngay
              </button>
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
