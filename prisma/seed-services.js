const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sampleServices = [
  // Khám chuyên khoa
  {
    name: 'Khám Tim Mạch',
    description: 'Khám và tư vấn các bệnh lý về tim mạch, điện tâm đồ, siêu âm tim',
    price: 300000,
    duration: 30,
    category: 'Khám chuyên khoa',
    icon: '🫀',
    isActive: true
  },
  {
    name: 'Khám Tiêu Hóa',
    description: 'Khám và điều trị các bệnh lý về đường tiêu hóa, gan mật tụy',
    price: 250000,
    duration: 30,
    category: 'Khám chuyên khoa',
    icon: '🩺',
    isActive: true
  },
  {
    name: 'Khám Thần Kinh',
    description: 'Khám và điều trị các bệnh lý về thần kinh, đau đầu, mất ngủ',
    price: 350000,
    duration: 40,
    category: 'Khám chuyên khoa',
    icon: '🧠',
    isActive: true
  },
  {
    name: 'Khám Da Liễu',
    description: 'Khám và điều trị các bệnh lý về da, mụn, nấm da, viêm da',
    price: 200000,
    duration: 25,
    category: 'Khám chuyên khoa',
    icon: '🩹',
    isActive: true
  },
  {
    name: 'Khám Nội Tiết',
    description: 'Khám và điều trị các bệnh lý về nội tiết, đái tháo đường, tuyến giáp',
    price: 300000,
    duration: 35,
    category: 'Khám chuyên khoa',
    icon: '💉',
    isActive: true
  },
  
  // Xét nghiệm
  {
    name: 'Xét Nghiệm Máu Tổng Quát',
    description: 'Xét nghiệm công thức máu, đo lường các chỉ số máu cơ bản',
    price: 100000,
    duration: 15,
    category: 'Xét nghiệm',
    icon: '🔬',
    isActive: true
  },
  {
    name: 'Xét Nghiệm Đường Huyết',
    description: 'Đo đường huyết lúc đói và sau ăn, HbA1c',
    price: 120000,
    duration: 15,
    category: 'Xét nghiệm',
    icon: '💉',
    isActive: true
  },
  {
    name: 'Xét Nghiệm Chức Năng Gan',
    description: 'Đo các chỉ số chức năng gan (GOT, GPT, Bilirubin)',
    price: 150000,
    duration: 15,
    category: 'Xét nghiệm',
    icon: '🧬',
    isActive: true
  },
  {
    name: 'Xét Nghiệm Chức Năng Thận',
    description: 'Đo Urê, Creatinin, Acid Uric',
    price: 150000,
    duration: 15,
    category: 'Xét nghiệm',
    icon: '🔬',
    isActive: true
  },
  {
    name: 'Xét Nghiệm Lipid Máu',
    description: 'Đo Cholesterol, Triglyceride, HDL, LDL',
    price: 180000,
    duration: 15,
    category: 'Xét nghiệm',
    icon: '🩸',
    isActive: true
  },
  
  // Chẩn đoán hình ảnh
  {
    name: 'Chụp X-Quang Phổi',
    description: 'Chụp X-quang lồng ngực để kiểm tra phổi và tim',
    price: 200000,
    duration: 20,
    category: 'Chẩn đoán hình ảnh',
    icon: '🩻',
    isActive: true
  },
  {
    name: 'Chụp CT Scanner',
    description: 'Chụp CT đa lớp cắt để chẩn đoán chi tiết',
    price: 1500000,
    duration: 45,
    category: 'Chẩn đoán hình ảnh',
    icon: '🔍',
    isActive: true
  },
  {
    name: 'Chụp MRI',
    description: 'Chụp cộng hưởng từ để chẩn đoán chính xác',
    price: 3000000,
    duration: 60,
    category: 'Chẩn đoán hình ảnh',
    icon: '🔍',
    isActive: true
  },
  
  // Siêu âm
  {
    name: 'Siêu Âm Bụng Tổng Quát',
    description: 'Siêu âm gan, mật, tụy, lách, thận',
    price: 250000,
    duration: 30,
    category: 'Siêu âm',
    icon: '📋',
    isActive: true
  },
  {
    name: 'Siêu Âm Tim',
    description: 'Siêu âm tim qua thành ngực để đánh giá chức năng tim',
    price: 400000,
    duration: 40,
    category: 'Siêu âm',
    icon: '🫀',
    isActive: true
  },
  {
    name: 'Siêu Âm Thai',
    description: 'Siêu âm thai nhi theo dõi sự phát triển của thai',
    price: 300000,
    duration: 30,
    category: 'Siêu âm',
    icon: '👶',
    isActive: true
  },
  {
    name: 'Siêu Âm Tuyến Giáp',
    description: 'Siêu âm tuyến giáp để phát hiện u, nang, viêm',
    price: 200000,
    duration: 25,
    category: 'Siêu âm',
    icon: '🔍',
    isActive: true
  },
  
  // Nội soi
  {
    name: 'Nội Soi Dạ Dày - Tá Tràng',
    description: 'Nội soi đường tiêu hóa trên để chẩn đoán và điều trị',
    price: 800000,
    duration: 45,
    category: 'Nội soi',
    icon: '🔬',
    isActive: true
  },
  {
    name: 'Nội Soi Đại Tràng',
    description: 'Nội soi đại tràng để phát hiện polyp, viêm loét',
    price: 1200000,
    duration: 60,
    category: 'Nội soi',
    icon: '🔬',
    isActive: true
  },
  
  // Vật lý trị liệu
  {
    name: 'Vật Lý Trị Liệu Cột Sống',
    description: 'Điều trị đau lưng, thoát vị đĩa đệm bằng vật lý trị liệu',
    price: 250000,
    duration: 45,
    category: 'Vật lý trị liệu',
    icon: '💪',
    isActive: true
  },
  {
    name: 'Vật Lý Trị Liệu Khớp',
    description: 'Điều trị viêm khớp, đau khớp bằng vật lý trị liệu',
    price: 200000,
    duration: 40,
    category: 'Vật lý trị liệu',
    icon: '🦴',
    isActive: true
  },
  
  // Tư vấn sức khỏe
  {
    name: 'Tư Vấn Dinh Dưỡng',
    description: 'Tư vấn chế độ ăn uống khoa học, lập thực đơn phù hợp',
    price: 300000,
    duration: 45,
    category: 'Tư vấn sức khỏe',
    icon: '🥗',
    isActive: true
  },
  {
    name: 'Tư Vấn Sức Khỏe Tâm Thần',
    description: 'Tư vấn tâm lý, sức khỏe tinh thần',
    price: 400000,
    duration: 60,
    category: 'Tư vấn sức khỏe',
    icon: '🧘',
    isActive: true
  }
]

async function seedServices() {
  console.log('🌱 Seeding services...')
  
  for (const service of sampleServices) {
    try {
      await prisma.service.create({
        data: service
      })
      console.log(`✓ Created service: ${service.name}`)
    } catch (error) {
      console.log(`✗ Service "${service.name}" already exists or error: ${error.message}`)
    }
  }
  
  console.log('✅ Services seeding completed!')
}

seedServices()
  .catch((e) => {
    console.error('Error seeding services:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
