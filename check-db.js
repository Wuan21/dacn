const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        activationCode: true
      }
    });
    
    console.log('\n Total users found:', users.length);
    console.log('\n👥 Users:');
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}, Active: ${u.isActive}, Code: ${u.activationCode}`);
    });
    
    console.log('\n Stats:');
    console.log('  - Doctors:', users.filter(u => u.role === 'doctor').length);
    console.log('  - Patients:', users.filter(u => u.role === 'patient').length);
    console.log('  - Admins:', users.filter(u => u.role === 'admin').length);
    console.log('  - Active:', users.filter(u => u.isActive).length);
    console.log('  - Inactive:', users.filter(u => !u.isActive).length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
