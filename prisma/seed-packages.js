const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedServicePackages() {
  console.log('🌱 Seeding service packages...')

  // Clear existing packages
  try {
    await prisma.servicepackageitem.deleteMany({})
    await prisma.servicepackage.deleteMany({})
    console.log('🗑️  Cleared existing packages')
  } catch (error) {
    console.log('Note: No existing packages to clear')
  }

  const packages = [
    {
      name: 'Gói khám tổng quát',
      description: 'Gói khám sức khỏe toàn diện với đầy đủ các xét nghiệm cần thiết. Phù hợp cho mọi lứa tuổi, đặc biệt người trưởng thành cần kiểm tra sức khỏe định kỳ.',
      price: 1500000,
      duration: 120,
      icon: '🩺',
      isActive: true,
      isPopular: true,
      items: [
        { name: 'Khám lâm sàng tổng quát', description: 'Khám nội khoa, ngoại khoa toàn diện', category: 'Khám lâm sàng', displayOrder: 1 },
        { name: 'Xét nghiệm máu tổng quát', description: 'Công thức máu, đếm tiểu cầu, hồng cầu, bạch cầu', category: 'Xét nghiệm', displayOrder: 2 },
        { name: 'Xét nghiệm nước tiểu', description: 'Phân tích nước tiểu 10 thông số', category: 'Xét nghiệm', displayOrder: 3 },
        { name: 'Xét nghiệm chức năng gan', description: 'GOT, GPT, Bilirubin toàn phần', category: 'Xét nghiệm', displayOrder: 4 },
        { name: 'Xét nghiệm chức năng thận', description: 'Ure, Creatinin, Acid Uric', category: 'Xét nghiệm', displayOrder: 5 },
        { name: 'Xét nghiệm đường huyết', description: 'Glucose máu lúc đói', category: 'Xét nghiệm', displayOrder: 6 },
        { name: 'Xét nghiệm mỡ máu', description: 'Cholesterol toàn phần, HDL, LDL, Triglycerid', category: 'Xét nghiệm', displayOrder: 7 },
        { name: 'X-quang phổi', description: 'Chụp X-quang tim phổi thẳng', category: 'Chẩn đoán hình ảnh', displayOrder: 8 },
        { name: 'Siêu âm bụng tổng quát', description: 'Siêu âm gan, mật, tụy, lách, thận', category: 'Chẩn đoán hình ảnh', displayOrder: 9 },
        { name: 'Điện tim', description: 'Điện tâm đồ 12 chuyển đạo', category: 'Chẩn đoán hình ảnh', displayOrder: 10 },
        { name: 'Tư vấn kết quả', description: 'Tư vấn kết quả và hướng dẫn điều trị (nếu có)', category: 'Khám lâm sàng', displayOrder: 11 }
      ]
    },
    {
      name: 'Gói khám doanh nghiệp',
      description: 'Gói khám sức khỏe định kỳ cho cán bộ nhân viên doanh nghiệp. Đầy đủ các xét nghiệm cơ bản, thời gian khám nhanh gọn, phù hợp khám hàng loạt.',
      price: 1200000,
      duration: 90,
      icon: '💼',
      isActive: true,
      isPopular: true,
      items: [
        { name: 'Khám nội khoa', description: 'Khám lâm sàng nội khoa tổng quát', category: 'Khám lâm sàng', displayOrder: 1 },
        { name: 'Đo chiều cao, cân nặng, BMI', description: 'Đo các chỉ số thể chất cơ bản', category: 'Khám lâm sàng', displayOrder: 2 },
        { name: 'Đo huyết áp', description: 'Đo và đánh giá huyết áp', category: 'Khám lâm sàng', displayOrder: 3 },
        { name: 'Xét nghiệm máu tổng quát', description: 'Công thức máu', category: 'Xét nghiệm', displayOrder: 4 },
        { name: 'Xét nghiệm nước tiểu', description: 'Phân tích nước tiểu cơ bản', category: 'Xét nghiệm', displayOrder: 5 },
        { name: 'Xét nghiệm chức năng gan', description: 'GOT, GPT', category: 'Xét nghiệm', displayOrder: 6 },
        { name: 'Xét nghiệm đường huyết', description: 'Glucose máu lúc đói', category: 'Xét nghiệm', displayOrder: 7 },
        { name: 'X-quang tim phổi', description: 'Chụp X-quang tim phổi thẳng', category: 'Chẩn đoán hình ảnh', displayOrder: 8 },
        { name: 'Điện tim', description: 'Điện tâm đồ', category: 'Chẩn đoán hình ảnh', displayOrder: 9 },
        { name: 'Khám mắt', description: 'Khám thị lực cơ bản', category: 'Khám lâm sàng', displayOrder: 10 }
      ]
    },
    {
      name: 'Gói khám tiền hôn nhân',
      description: 'Gói khám sức khỏe toàn diện dành cho các cặp đôi chuẩn bị kết hôn. Bao gồm các xét nghiệm sàng lọc bệnh truyền nhiễm, hormone sinh dục và tư vấn chuyên sâu.',
      price: 2500000,
      duration: 150,
      icon: '💑',
      isActive: true,
      isPopular: true,
      items: [
        { name: 'Khám phụ khoa (nữ)', description: 'Khám phụ khoa chuyên sâu', category: 'Khám lâm sàng', displayOrder: 1 },
        { name: 'Khám nam khoa (nam)', description: 'Khám nam khoa chuyên sâu', category: 'Khám lâm sàng', displayOrder: 2 },
        { name: 'Xét nghiệm máu tổng quát', description: 'Công thức máu đầy đủ', category: 'Xét nghiệm', displayOrder: 3 },
        { name: 'Xét nghiệm nhóm máu', description: 'Xác định nhóm máu ABO, Rh', category: 'Xét nghiệm', displayOrder: 4 },
        { name: 'Xét nghiệm HIV', description: 'Sàng lọc HIV', category: 'Xét nghiệm', displayOrder: 5 },
        { name: 'Xét nghiệm viêm gan B, C', description: 'HBsAg, Anti HCV', category: 'Xét nghiệm', displayOrder: 6 },
        { name: 'Xét nghiệm VDRL', description: 'Sàng lọc giang mai (Syphilis)', category: 'Xét nghiệm', displayOrder: 7 },
        { name: 'Xét nghiệm Rubella IgG', description: 'Kháng thể bệnh rubella ở nữ', category: 'Xét nghiệm', displayOrder: 8 },
        { name: 'Xét nghiệm hormone sinh dục', description: 'FSH, LH, Testosterone/Estrogen', category: 'Xét nghiệm', displayOrder: 9 },
        { name: 'Xét nghiệm chức năng gan, thận', description: 'GOT, GPT, Ure, Creatinin', category: 'Xét nghiệm', displayOrder: 10 },
        { name: 'Xét nghiệm đường huyết', description: 'Glucose máu', category: 'Xét nghiệm', displayOrder: 11 },
        { name: 'Siêu âm tử cung, buồng trứng (nữ)', description: 'Siêu âm phụ khoa qua đường bụng', category: 'Chẩn đoán hình ảnh', displayOrder: 12 },
        { name: 'Tinh dịch đồ (nam)', description: 'Phân tích tinh dịch', category: 'Xét nghiệm', displayOrder: 13 },
        { name: 'X-quang tim phổi', description: 'Chụp X-quang tim phổi', category: 'Chẩn đoán hình ảnh', displayOrder: 14 },
        { name: 'Tư vấn kế hoạch hóa gia đình', description: 'Tư vấn bác sĩ sản phụ khoa chuyên khoa', category: 'Khám lâm sàng', displayOrder: 15 }
      ]
    },
    {
      name: 'Gói khám định kỳ',
      description: 'Gói khám sức khỏe định kỳ cơ bản, phù hợp cho người cần theo dõi sức khỏe thường xuyên. Giá cả hợp lý, thời gian nhanh gọn.',
      price: 800000,
      duration: 60,
      icon: '📋',
      isActive: true,
      isPopular: false,
      items: [
        { name: 'Khám nội khoa', description: 'Khám lâm sàng cơ bản', category: 'Khám lâm sàng', displayOrder: 1 },
        { name: 'Đo chiều cao, cân nặng', description: 'Đo và tính chỉ số BMI', category: 'Khám lâm sàng', displayOrder: 2 },
        { name: 'Đo huyết áp', description: 'Đo và theo dõi huyết áp', category: 'Khám lâm sàng', displayOrder: 3 },
        { name: 'Xét nghiệm máu cơ bản', description: 'Công thức máu', category: 'Xét nghiệm', displayOrder: 4 },
        { name: 'Xét nghiệm đường huyết', description: 'Glucose máu lúc đói', category: 'Xét nghiệm', displayOrder: 5 },
        { name: 'Xét nghiệm mỡ máu', description: 'Cholesterol, Triglycerid', category: 'Xét nghiệm', displayOrder: 6 },
        { name: 'X-quang phổi', description: 'Chụp X-quang tim phổi', category: 'Chẩn đoán hình ảnh', displayOrder: 7 },
        { name: 'Tư vấn kết quả', description: 'Tư vấn kết quả xét nghiệm', category: 'Khám lâm sàng', displayOrder: 8 }
      ]
    }
  ]

  for (const pkg of packages) {
    const items = pkg.items
    delete pkg.items

    await prisma.servicepackage.create({
      data: {
        ...pkg,
        items: {
          create: items
        }
      }
    })
    console.log(`✅ Created package: ${pkg.name}`)
  }

  console.log('✅ Service packages seeded successfully!')
}

seedServicePackages()
  .catch((e) => {
    console.error('Error seeding service packages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
