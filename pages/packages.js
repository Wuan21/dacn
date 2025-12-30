import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      const res = await fetch('/api/services/packages?isActive=true')
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
        padding: '80px 0 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1 style={{ 
              fontSize: '42px', 
              fontWeight: '700', 
              marginBottom: '16px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Gói Khám Sức Khỏe Toàn Diện
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9, 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Chăm sóc sức khỏe toàn diện với các gói khám được thiết kế chuyên biệt
            </p>

            {/* Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '60px', 
              marginTop: '48px',
              flexWrap: 'wrap'
            }}>
              {[
                { num: packages.length + '+', label: 'Gói khám' },
                { num: '1000+', label: 'Khách hàng' },
                { num: '98%', label: 'Hài lòng' }
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
      <section style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTopColor: '#0d9488',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
          ) : packages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>Chưa có gói khám nào</p>
            </div>
          ) : (
            <>
              {/* Popular Packages */}
              {packages.some(p => p.isPopular) && (
                <div style={{ marginBottom: '48px' }}>
                  <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span>⭐</span> Gói khám phổ biến
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                    gap: '24px'
                  }}>
                    {packages.filter(p => p.isPopular).map(pkg => (
                      <PackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        formatPrice={formatPrice}
                        onClick={() => setSelectedPackage(pkg)}
                        isPopular={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Packages */}
              <div>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>📋</span> Tất cả gói khám
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                  gap: '24px'
                }}>
                  {packages.map(pkg => (
                    <PackageCard 
                      key={pkg.id} 
                      pkg={pkg} 
                      formatPrice={formatPrice}
                      onClick={() => setSelectedPackage(pkg)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
        padding: '60px 0',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '16px' 
          }}>
            Cần tư vấn thêm về gói khám?
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
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📅 Đặt lịch ngay
            </button>
            <button 
              style={{
                padding: '16px 32px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📞 Liên hệ tư vấn
            </button>
          </div>
        </div>
      </section>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div 
          onClick={() => setSelectedPackage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
          >
            {/* Modal Header */}
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
                  {selectedPackage.icon || '📦'}
                </div>
                <div>
                  {selectedPackage.isPopular && (
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      marginBottom: '8px'
                    }}>
                      ⭐ Phổ biến
                    </span>
                  )}
                  <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                    {selectedPackage.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              {/* Description */}
              {selectedPackage.description && (
                <div style={{ marginBottom: '32px' }}>
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
                    Mô tả gói khám
                  </h3>
                  <p style={{
                    color: '#4b5563',
                    lineHeight: '1.7',
                    background: '#f9fafb',
                    padding: '16px',
                    borderRadius: '12px'
                  }}>
                    {selectedPackage.description}
                  </p>
                </div>
              )}

              {/* Price & Duration */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Giá gói</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0d9488' }}>
                    {formatPrice(selectedPackage.price)}
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f0fdfa, #e0f2fe)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Thời gian</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#0891b2' }}>
                    ⏱️ {selectedPackage.duration} phút
                  </div>
                </div>
              </div>

              {/* Items by Category */}
              <div>
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
                  Danh sách khám
                </h3>

                {Object.entries(groupItemsByCategory(selectedPackage.items)).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: '24px' }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {category}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(item => (
                        <div key={item.id} style={{
                          padding: '12px 16px',
                          background: '#f9fafb',
                          borderRadius: '12px',
                          borderLeft: '3px solid #0d9488'
                        }}>
                          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                            ✓ {item.name}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => {
                    setSelectedPackage(null)
                    router.push('/booking')
                  }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #0d9488, #0891b2)',
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
                  onClick={() => setSelectedPackage(null)}
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

function PackageCard({ pkg, formatPrice, onClick, isPopular }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isPopular 
          ? '0 10px 30px rgba(13, 148, 136, 0.2)' 
          : '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isPopular ? '2px solid #0d9488' : 'none',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)'
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isPopular 
          ? '0 10px 30px rgba(13, 148, 136, 0.2)' 
          : '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 1
        }}>
          ⭐ Phổ biến
        </div>
      )}

      {/* Card Header */}
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
          {pkg.icon || '📦'}
        </div>
        
        <h3 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: '700',
          margin: 0
        }}>
          {pkg.name}
        </h3>
      </div>

      {/* Card Body */}
      <div style={{ padding: '24px' }}>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px',
          minHeight: '60px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5'
        }}>
          {pkg.description || 'Gói khám sức khỏe chất lượng cao'}
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

        {/* Items Count */}
        <div style={{
          background: '#f0fdfa',
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#0d9488',
          fontWeight: '600'
        }}>
          <span>✓</span>
          Bao gồm {pkg.items?.length || 0} hạng mục khám
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
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
        >
          Xem chi tiết →
        </button>
      </div>
    </div>
  )
}
