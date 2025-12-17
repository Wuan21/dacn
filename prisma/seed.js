const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);

  // Create specialties
  console.log('Creating specialties...');
  const specialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name: 'Khoa Tim Mạch' },
      update: {},
      create: { name: 'Khoa Tim Mạch' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Khoa Da Liễu' },
      update: {},
      create: { name: 'Khoa Da Liễu' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Khoa Nhi' },
      update: {},
      create: { name: 'Khoa Nhi' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Khoa Chấn Thương Chỉnh Hình' },
      update: {},
      create: { name: 'Khoa Chấn Thương Chỉnh Hình' },
    }),
    prisma.specialty.upsert({
      where: { name: 'Khoa Nội Tổng Hợp' },
      update: {},
      create: { name: 'Khoa Nội Tổng Hợp' },
    }),
  ]);

  console.log(`✅ Created ${specialties.length} specialties`);

  // Create admin user
  console.log('Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yourmedicare.vn' },
    update: {},
    create: {
      email: 'admin@yourmedicare.vn',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Created admin user');

  // Create doctor users and profiles
  console.log('Creating doctors...');
  
  const doctor1 = await prisma.user.upsert({
    where: { email: 'doctor1@yourmedicare.vn' },
    update: {},
    create: {
      email: 'doctor1@yourmedicare.vn',
      name: 'Dr. Nguyễn Thị Hoa',
      password: doctorPassword,
      role: 'doctor',
      isActive: true,
      phone: '0901234567',
    },
  });

  await prisma.doctorprofile.upsert({
    where: { userId: doctor1.id },
    update: {},
    create: {
      userId: doctor1.id,
      specialtyId: specialties[0].id,
      bio: 'Bác sĩ chuyên khoa tim mạch với 10 năm kinh nghiệm',
      degree: 'Bác sĩ Chuyên khoa II',
      experience: '10 năm',
      fees: 500000,
      address1: 'Bệnh viện Đa khoa Trung ương',
      address2: '123 Đường Nguyễn Văn Cừ, Quận 1, TP.HCM',
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@yourmedicare.vn' },
    update: {},
    create: {
      email: 'doctor2@yourmedicare.vn',
      name: 'Dr. Trần Văn Bình',
      password: doctorPassword,
      role: 'doctor',
      isActive: true,
      phone: '0902345678',
    },
  });

  await prisma.doctorprofile.upsert({
    where: { userId: doctor2.id },
    update: {},
    create: {
      userId: doctor2.id,
      specialtyId: specialties[1].id,
      bio: 'Chuyên gia da liễu với nhiều năm kinh nghiệm điều trị bệnh về da',
      degree: 'Bác sĩ Chuyên khoa I',
      experience: '7 năm',
      fees: 400000,
      address1: 'Phòng khám Da liễu Thẩm Mỹ',
      address2: '456 Đường Lê Lợi, Quận 3, TP.HCM',
    },
  });

  const doctor3 = await prisma.user.upsert({
    where: { email: 'doctor3@yourmedicare.vn' },
    update: {},
    create: {
      email: 'doctor3@yourmedicare.vn',
      name: 'Dr. Lê Thị Lan',
      password: doctorPassword,
      role: 'doctor',
      isActive: true,
      phone: '0903456789',
    },
  });

  await prisma.doctorprofile.upsert({
    where: { userId: doctor3.id },
    update: {},
    create: {
      userId: doctor3.id,
      specialtyId: specialties[2].id,
      bio: 'Bác sĩ nhi khoa giàu kinh nghiệm chăm sóc sức khỏe trẻ em',
      degree: 'Bác sĩ Chuyên khoa II',
      experience: '12 năm',
      fees: 450000,
      address1: 'Bệnh viện Nhi đồng 1',
      address2: '789 Đường Hai Bà Trưng, Quận 5, TP.HCM',
    },
  });

  console.log('✅ Created 3 doctors with profiles');

  // Create patient users
  console.log('Creating patients...');
  
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient1@gmail.com' },
    update: {},
    create: {
      email: 'patient1@gmail.com',
      name: 'Nguyễn Văn A',
      password: patientPassword,
      role: 'patient',
      isActive: true,
      phone: '0911111111',
      address: '12 Nguyễn Trãi, Quận 1, TP.HCM',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'male',
    },
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'patient2@gmail.com' },
    update: {},
    create: {
      email: 'patient2@gmail.com',
      name: 'Trần Thị B',
      password: patientPassword,
      role: 'patient',
      isActive: true,
      phone: '0922222222',
      address: '34 Lê Lợi, Quận 3, TP.HCM',
      dateOfBirth: new Date('1995-05-20'),
      gender: 'female',
    },
  });

  const patient3 = await prisma.user.upsert({
    where: { email: 'patient3@gmail.com' },
    update: {},
    create: {
      email: 'patient3@gmail.com',
      name: 'Lê Văn C',
      password: patientPassword,
      role: 'patient',
      isActive: true,
      phone: '0933333333',
      address: '56 Hai Bà Trưng, Quận 5, TP.HCM',
      dateOfBirth: new Date('1988-12-10'),
      gender: 'male',
    },
  });

  console.log('✅ Created 3 patients');

  // Create sample appointments
  console.log('Creating appointments...');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 30, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      datetime: tomorrow,
      status: 'confirmed',
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: doctor2.id,
      datetime: nextWeek,
      status: 'pending',
    },
  });

  console.log('✅ Created 2 sample appointments');

  console.log('\n✨ Seeding complete!');
  console.log('\n📝 Default accounts:');
  console.log('Admin: admin@yourmedicare.vn / admin123');
  console.log('Doctor 1: doctor1@yourmedicare.vn / doctor123');
  console.log('Doctor 2: doctor2@yourmedicare.vn / doctor123');
  console.log('Doctor 3: doctor3@yourmedicare.vn / doctor123');
  console.log('Patient 1: patient1@gmail.com / patient123');
  console.log('Patient 2: patient2@gmail.com / patient123');
  console.log('Patient 3: patient3@gmail.com / patient123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
