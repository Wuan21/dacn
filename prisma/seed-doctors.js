const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding doctors...');

  const doctorPassword = await bcrypt.hash('doctor123', 10);

  // Get all specialties
  const specialties = await prisma.specialty.findMany();
  
  if (specialties.length === 0) {
    console.log('⚠️  No specialties found. Please run main seed first.');
    return;
  }

  console.log(`Found ${specialties.length} specialties`);

  const doctorsData = [
    // Khoa Tim Mạch
    {
      email: 'bs.timm1@yourmedicare.vn',
      name: 'BS. Nguyễn Văn Minh',
      phone: '0901234501',
      specialty: 'Khoa Tim Mạch',
      bio: 'Chuyên gia tim mạch với hơn 15 năm kinh nghiệm điều trị các bệnh về tim mạch',
      degree: 'Bác sĩ Chuyên khoa II - Tiến sĩ Y khoa',
      experience: '15 năm',
      fees: 600000,
      address1: 'Bệnh viện Tim Tâm Đức',
      address2: '123 Đường Trần Hưng Đạo, Quận 1, TP.HCM',
    },
    {
      email: 'bs.timm2@yourmedicare.vn',
      name: 'BS. Lê Thị Thu',
      phone: '0901234502',
      specialty: 'Khoa Tim Mạch',
      bio: 'Bác sĩ tim mạch giàu kinh nghiệm trong điều trị suy tim và rối loạn nhịp tim',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '8 năm',
      fees: 500000,
      address1: 'Trung tâm Tim mạch',
      address2: '456 Đường Võ Thị Sáu, Quận 3, TP.HCM',
    },
    
    // Khoa Da Liễu
    {
      email: 'bs.dalieu1@yourmedicare.vn',
      name: 'BS. Trần Văn Hùng',
      phone: '0901234503',
      specialty: 'Khoa Da Liễu',
      bio: 'Chuyên gia da liễu - thẩm mỹ da, điều trị mụn, nám và các bệnh da liễu',
      degree: 'Bác sĩ Chuyên khoa II - Thạc sĩ Y khoa',
      experience: '12 năm',
      fees: 450000,
      address1: 'Phòng khám Da liễu Thẩm Mỹ Quốc tế',
      address2: '789 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    },
    {
      email: 'bs.dalieu2@yourmedicare.vn',
      name: 'BS. Phạm Thị Lan',
      phone: '0901234504',
      specialty: 'Khoa Da Liễu',
      bio: 'Bác sĩ da liễu chuyên điều trị các bệnh về da, móng, tóc',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '7 năm',
      fees: 350000,
      address1: 'Bệnh viện Da liễu TP.HCM',
      address2: '234 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
    },
    
    // Khoa Nhi
    {
      email: 'bs.nhi1@yourmedicare.vn',
      name: 'BS. Hoàng Văn Tuấn',
      phone: '0901234505',
      specialty: 'Khoa Nhi',
      bio: 'Bác sĩ nhi khoa chuyên chăm sóc sức khỏe trẻ sơ sinh và trẻ nhỏ',
      degree: 'Bác sĩ Chuyên khoa II',
      experience: '14 năm',
      fees: 500000,
      address1: 'Bệnh viện Nhi đồng 1',
      address2: '341 Sư Vạn Hạnh, Quận 10, TP.HCM',
    },
    {
      email: 'bs.nhi2@yourmedicare.vn',
      name: 'BS. Đỗ Thị Mai',
      phone: '0901234506',
      specialty: 'Khoa Nhi',
      bio: 'Chuyên gia nhi khoa với kinh nghiệm điều trị các bệnh nhiễm trùng và tiêu hóa ở trẻ',
      degree: 'Bác sĩ Chuyên khoa I - Thạc sĩ Y khoa',
      experience: '9 năm',
      fees: 400000,
      address1: 'Bệnh viện Nhi đồng 2',
      address2: '14 Lý Tự Trọng, Quận 1, TP.HCM',
    },
    {
      email: 'bs.nhi3@yourmedicare.vn',
      name: 'BS. Vũ Văn Đạt',
      phone: '0901234507',
      specialty: 'Khoa Nhi',
      bio: 'Bác sĩ nhi khoa chuyên tư vấn dinh dưỡng và chăm sóc sức khỏe toàn diện cho trẻ',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '6 năm',
      fees: 350000,
      address1: 'Phòng khám Nhi khoa An Khang',
      address2: '567 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    },
    
    // Khoa Chấn Thương Chỉnh Hình
    {
      email: 'bs.chanthuong1@yourmedicare.vn',
      name: 'BS. Nguyễn Thanh Long',
      phone: '0901234508',
      specialty: 'Khoa Chấn Thương Chỉnh Hình',
      bio: 'Chuyên gia chấn thương chỉnh hình, phẫu thuật xương khớp và cột sống',
      degree: 'Bác sĩ Chuyên khoa II - Tiến sĩ Y khoa',
      experience: '18 năm',
      fees: 650000,
      address1: 'Bệnh viện Chấn thương Chỉnh hình TP.HCM',
      address2: '929 Kha Vạn Cân, Thủ Đức, TP.HCM',
    },
    {
      email: 'bs.chanthuong2@yourmedicare.vn',
      name: 'BS. Trương Văn Kiên',
      phone: '0901234509',
      specialty: 'Khoa Chấn Thương Chỉnh Hình',
      bio: 'Bác sĩ chấn thương chỉnh hình chuyên điều trị gãy xương và chấn thương thể thao',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '10 năm',
      fees: 500000,
      address1: 'Trung tâm Y tế Thể thao Quốc gia',
      address2: '200 Võ Văn Tần, Quận 3, TP.HCM',
    },
    
    // Khoa Nội Tổng Hợp
    {
      email: 'bs.noi1@yourmedicare.vn',
      name: 'BS. Phan Văn Nam',
      phone: '0901234510',
      specialty: 'Khoa Nội Tổng Hợp',
      bio: 'Bác sĩ nội khoa chuyên điều trị các bệnh lý tiêu hóa, gan mật',
      degree: 'Bác sĩ Chuyên khoa II - Thạc sĩ Y khoa',
      experience: '13 năm',
      fees: 550000,
      address1: 'Bệnh viện Đại học Y Dược TP.HCM',
      address2: '215 Hồng Bàng, Quận 5, TP.HCM',
    },
    {
      email: 'bs.noi2@yourmedicare.vn',
      name: 'BS. Lý Thị Hồng',
      phone: '0901234511',
      specialty: 'Khoa Nội Tổng Hợp',
      bio: 'Chuyên gia nội khoa điều trị bệnh đái tháo đường, tăng huyết áp và bệnh thận',
      degree: 'Bác sĩ Chuyên khoa II',
      experience: '11 năm',
      fees: 500000,
      address1: 'Bệnh viện Nội tiết TP.HCM',
      address2: '339 Trần Hưng Đạo, Quận 1, TP.HCM',
    },
    {
      email: 'bs.noi3@yourmedicare.vn',
      name: 'BS. Đặng Văn Phú',
      phone: '0901234512',
      specialty: 'Khoa Nội Tổng Hợp',
      bio: 'Bác sĩ nội khoa với kinh nghiệm điều trị các bệnh hô hấp và dị ứng',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '8 năm',
      fees: 400000,
      address1: 'Bệnh viện Phạm Ngọc Thạch',
      address2: '120 Hồng Bàng, Quận 5, TP.HCM',
    },
  ];

  console.log(`\nCreating ${doctorsData.length} doctors...`);

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
