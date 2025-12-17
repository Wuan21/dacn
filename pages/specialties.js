import Link from 'next/link'
import Navbar from '../components/Navbar'

export default function Specialties({ specialties }){
  const specialtyIcons = {
    'Cardiology': '❤️',
    'Dermatology': '🩺',
    'Neurology': '🧠',
    'Pediatrics': '👶',
    'Orthopedics': '🦴',
    'Ophthalmology': '👁️',
    'Dentistry': '🦷',
    'General': '🏥'
  }

  return (
    <>
      <Navbar />

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', color: '#1a1a1a', marginBottom: '12px' }}>
            Chuyên khoa
          </h1>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Chọn chuyên khoa phù hợp với nhu cầu khám bệnh của bạn
          </p>
        </div>

        <div className="features">
          {specialties.map(s => (
            <Link href={`/doctors?specialty=${encodeURIComponent(s.name)}`} key={s.id}>
              <div className="feature-card" style={{ cursor: 'pointer', height: '100%' }}>
                <div className="feature-icon">
                  {specialtyIcons[s.name] || '🏥'}
                </div>
                <h3>{s.name}</h3>
                <p style={{ marginTop: '12px', color: '#667eea', fontWeight: '600' }}>
                  Xem danh sách các chuyên khoa và danh sách bác sĩ →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/doctors" className="btn btn-primary" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            Xem tất cả bác sĩ
          </Link>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(){
  const res = await fetch('http://localhost:3000/api/specialties')
  const specialties = await res.json()
  return { props: { specialties } }
}
