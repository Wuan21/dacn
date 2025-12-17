const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('adminpass', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Site Admin',
      password: hash,
      role: 'admin'
    }
  })

  const cardiology = await prisma.specialty.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: { name: 'Cardiology' }
  })

  const derm = await prisma.specialty.upsert({
    where: { name: 'Dermatology' },
    update: {},
    create: { name: 'Dermatology' }
  })

  const dpass = await bcrypt.hash('doctorpass', 10)
  const doc1 = await prisma.user.upsert({
    where: { email: 'doc1@example.com' },
    update: {},
    create: {
      email: 'doc1@example.com',
      name: 'Dr. Alice',
      password: dpass,
      role: 'doctor'
    }
  })

  await prisma.doctorProfile.upsert({
    where: { userId: doc1.id },
    update: {},
    create: {
      userId: doc1.id,
      specialtyId: cardiology.id,
      bio: 'Cardiologist with 10 years experience.'
    }
  })

  const doc2 = await prisma.user.upsert({
    where: { email: 'doc2@example.com' },
    update: {},
    create: {
      email: 'doc2@example.com',
      name: 'Dr. Bob',
      password: dpass,
      role: 'doctor'
    }
  })

  await prisma.doctorProfile.upsert({
    where: { userId: doc2.id },
    update: {},
    create: {
      userId: doc2.id,
      specialtyId: derm.id,
      bio: 'Dermatology specialist.'
    }
  })

  const ppass = await bcrypt.hash('patientpass', 10)
  await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      name: 'John Patient',
      password: ppass,
      role: 'patient'
    }
  })

  console.log('Seed finished.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
