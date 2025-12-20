const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  console.log('\nChecking Database...\n');

  // Check all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });
  
  console.log('Users:');
  users.forEach(u => {
    console.log(`  - ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}`);
  });

  // Check all appointments
  const appointments = await prisma.appointment.findMany({
    include: {
      user_appointment_patientIdTouser: {
        select: { id: true, name: true, email: true }
      },
      user_appointment_doctorIdTouser: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  console.log('\nAppointments:');
  appointments.forEach(apt => {
    console.log(`  - ID: ${apt.id}`);
    console.log(`    Patient: ${apt.user_appointment_patientIdTouser.name} (ID: ${apt.patientId})`);
    console.log(`    Doctor: ${apt.user_appointment_doctorIdTouser.name} (ID: ${apt.doctorId})`);
    console.log(`    DateTime: ${apt.datetime}`);
    console.log(`    Status: ${apt.status}`);
  });

  // Check doctors
  const doctors = await prisma.user.findMany({
    where: { role: 'doctor' },
    include: {
      doctorprofile: {
        include: {
          specialty: true
        }
      }
    }
  });

  console.log('\nDoctors:');
  doctors.forEach(doc => {
    console.log(`  - ID: ${doc.id}, Name: ${doc.name}, Email: ${doc.email}`);
    if (doc.doctorprofile) {
      console.log(`    Specialty: ${doc.doctorprofile.specialty.name}`);
      console.log(`    Fees: ${doc.doctorprofile.fees}`);
    }
  });

  await prisma.$disconnect();
}

checkDB().catch(console.error);
