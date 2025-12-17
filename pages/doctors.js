import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'

export default function Doctors({ doctors, specialty }){
  const router = useRouter()

  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', color: '#1a1a1a', marginBottom: '12px' }}>
            {specialty ? `Bác sĩ chuyên khoa ${specialty}` : 'Danh sách bác sĩ'}
          </h1>
          <p style={{ fontSize: '18px', color: '#666' }}>
            {specialty 
              ? `Tìm và đặt lịch với bác sĩ ${specialty} phù hợp` 
              : 'Chọn bác sĩ phù hợp và đặt lịch khám ngay'
            }
          </p>
          {specialty && (
            <div style={{ marginTop: '16px' }}>
              <Link href="/specialties" style={{ color: '#2563eb', fontWeight: '500' }}>
                ← Xem tất cả chuyên khoa
              </Link>
            </div>
          )}
        </div>

        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍⚕️</div>
            <h3 style={{ color: '#666', marginBottom: '8px' }}>Chưa có bác sĩ</h3>
            <p style={{ color: '#999' }}>Hiện tại chưa có bác sĩ nào trong chuyên khoa này</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {doctors.map(d => (
              <div key={d.id} className="doctor-card">
                <div className="doctor-avatar">
                  {d.profileImage ? (
                    <img 
                      src={d.profileImage} 
                      alt={d.name} 
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                    />
                  ) : (
                    d.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{d.name}</h3>
                  <div className="doctor-specialty">
                    <span style={{ marginRight: '6px' }}>🏥</span>
                    {d.specialty}
                  </div>
                  {d.bio && (
                    <p className="doctor-bio">{d.bio}</p>
                  )}
                  <Link href={`/booking?doctorId=${d.id}`}>
                    <button className="btn-book">
                      📅 Đặt lịch khám
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .doctor-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .doctor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .doctor-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .doctor-info {
          width: 100%;
        }

        .doctor-name {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .doctor-specialty {
          display: inline-block;
          padding: 6px 12px;
          background: #f0f0ff;
          color: #667eea;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .doctor-bio {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 12px 0 16px 0;
        }

        .btn-book {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 15px;
        }

        .btn-book:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps({ query }){
  const params = new URLSearchParams()
  if (query.specialty) params.append('specialty', query.specialty)
  params.append('includeImage', 'true')
  
  const res = await fetch(`http://localhost:3000/api/doctors?${params.toString()}`)
  const doctors = await res.json()
  return { props: { doctors, specialty: query.specialty || null } }
}
