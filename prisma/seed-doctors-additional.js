const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding additional doctors...');

  const doctorPassword = await bcrypt.hash('doctor123', 10);

  // Get all specialties
  const specialties = await prisma.specialty.findMany();
  
  if (specialties.length === 0) {
    console.log('⚠️  No specialties found.');
    return;
  }

  const doctorsData = [
    // Khoa Mắt
    {
      email: 'bs.mat1@yourmedicare.vn',
      name: 'BS. Nguyễn Văn Sáng',
      phone: '0901234513',
      specialty: 'Khoa Mắt',
      bio: 'Chuyên gia nhãn khoa với hơn 15 năm kinh nghiệm phẫu thuật đục thủy tinh thể và tật khúc xạ',
      degree: 'Bác sĩ Chuyên khoa II - Thạc sĩ Y khoa',
      experience: '15 năm',
      fees: 550000,
      address1: 'Bệnh viện Mắt TP.HCM',
      address2: '280 Điện Biên Phủ, Quận 3, TP.HCM',
    },
    {
      email: 'bs.mat2@yourmedicare.vn',
      name: 'BS. Trần Thị Ánh',
      phone: '0901234514',
      specialty: 'Khoa Mắt',
      bio: 'Bác sĩ nhãn khoa chuyên điều trị các bệnh về võng mạc và glaucoma',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '9 năm',
      fees: 450000,
      address1: 'Trung tâm Nhãn khoa Quốc tế',
      address2: '155 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
    },
    
    // Khoa Phụ Sản
    {
      email: 'bs.phusan1@yourmedicare.vn',
      name: 'BS. Lê Thị Hương',
      phone: '0901234515',
      specialty: 'Khoa Phụ Sản',
      bio: 'Bác sĩ phụ sản chuyên theo dõi thai nghén và điều trị vô sinh hiếm muộn',
      degree: 'Bác sĩ Chuyên khoa II - Tiến sĩ Y khoa',
      experience: '16 năm',
      fees: 600000,
      address1: 'Bệnh viện Phụ Sản Từ Dũ',
      address2: '284 Cống Quỳnh, Quận 1, TP.HCM',
    },
    {
      email: 'bs.phusan2@yourmedicare.vn',
      name: 'BS. Phạm Thị Ngọc',
      phone: '0901234516',
      specialty: 'Khoa Phụ Sản',
      bio: 'Chuyên gia sản khoa với kinh nghiệm phẫu thuật lấy thai và điều trị các bệnh phụ khoa',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '11 năm',
      fees: 500000,
      address1: 'Bệnh viện Hùng Vương',
      address2: '128 Hồng Bàng, Quận 5, TP.HCM',
    },
    
    // Khoa Tai Mũi Họng
    {
      email: 'bs.tmh1@yourmedicare.vn',
      name: 'BS. Võ Văn Tuấn',
      phone: '0901234517',
      specialty: 'Khoa Tai Mũi Họng',
      bio: 'Bác sĩ tai mũi họng chuyên phẫu thuật các bệnh về tai, mũi, họng',
      degree: 'Bác sĩ Chuyên khoa II - Thạc sĩ Y khoa',
      experience: '14 năm',
      fees: 550000,
      address1: 'Bệnh viện Tai Mũi Họng TP.HCM',
      address2: '178 Đường Hồng Bàng, Quận 5, TP.HCM',
    },
    {
      email: 'bs.tmh2@yourmedicare.vn',
      name: 'BS. Đặng Thị Lan',
      phone: '0901234518',
      specialty: 'Khoa Tai Mũi Họng',
      bio: 'Chuyên điều trị các bệnh viêm tai, viêm xoang và các vấn đề về giọng nói',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '8 năm',
      fees: 400000,
      address1: 'Phòng khám Tai Mũi Họng Đa khoa',
      address2: '456 Lý Thường Kiệt, Quận 10, TP.HCM',
    },
    
    // Khoa Thần Kinh
    {
      email: 'bs.thankinh1@yourmedicare.vn',
      name: 'BS. Hoàng Văn Linh',
      phone: '0901234519',
      specialty: 'Khoa Thần Kinh',
      bio: 'Chuyên gia thần kinh chuyên điều trị đột quỵ, động kinh và các bệnh thoái hóa thần kinh',
      degree: 'Bác sĩ Chuyên khoa II - Tiến sĩ Y khoa',
      experience: '17 năm',
      fees: 650000,
      address1: 'Bệnh viện Thần Kinh TP.HCM',
      address2: '125 Lê Hồng Phong, Quận 10, TP.HCM',
    },
    {
      email: 'bs.thankinh2@yourmedicare.vn',
      name: 'BS. Ngô Thị Xuân',
      phone: '0901234520',
      specialty: 'Khoa Thần Kinh',
      bio: 'Bác sĩ thần kinh chuyên điều trị đau đầu, rối loạn giấc ngủ và bệnh Parkinson',
      degree: 'Bác sĩ Chuyên khoa I - Thạc sĩ Y khoa',
      experience: '10 năm',
      fees: 500000,
      address1: 'Trung tâm Thần kinh Quốc tế',
      address2: '234 Pasteur, Quận 3, TP.HCM',
    },
  ];

  console.log(`\nCreating ${doctorsData.length} additional doctors...`);

  let created = 0;
  let skipped = 0;

  for (const doctorData of doctorsData) {
    try {
      // Find specialty
      const specialty = specialties.find(s => s.name === doctorData.specialty);
      
      if (!specialty) {
        console.log(`⚠️  Specialty "${doctorData.specialty}" not found, skipping ${doctorData.name}`);
        skipped++;
        continue;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: doctorData.email }
      });

      if (existingUser) {
        console.log(`⏭️  ${doctorData.name} already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create user
      const doctor = await prisma.user.create({
        data: {
          email: doctorData.email,
          name: doctorData.name,
          password: doctorPassword,
          role: 'doctor',
          isActive: true,
          phone: doctorData.phone,
        },
      });

      // Create doctor profile
      await prisma.doctorprofile.create({
        data: {
          userId: doctor.id,
          specialtyId: specialty.id,
          bio: doctorData.bio,
          degree: doctorData.degree,
          experience: doctorData.experience,
          fees: doctorData.fees,
          address1: doctorData.address1,
          address2: doctorData.address2,
        },
      });

      console.log(`✅ Created: ${doctorData.name} - ${doctorData.specialty}`);
      created++;

    } catch (error) {
      console.error(`❌ Error creating ${doctorData.name}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n✅ Successfully created ${created} doctors`);
  console.log(`⏭️  Skipped ${skipped} doctors`);
  
  // Display summary
  console.log('\n📊 Summary by specialty:');
  for (const specialty of specialties) {
    const doctorCount = await prisma.doctorprofile.count({
      where: { specialtyId: specialty.id }
    });
    console.log(`   ${specialty.name}: ${doctorCount} bác sĩ`);
  }

  console.log('\n📝 Default password for all doctors: doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding doctors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
