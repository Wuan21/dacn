// Test MongoDB Connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...\n')
  
  try {
    // Test connection by querying database
    await prisma.$connect()
    console.log('✅ Successfully connected to MongoDB!')
    
    // Try to count users (will return 0 if empty)
    const userCount = await prisma.user.count()
    console.log(`📊 Current users in database: ${userCount}`)
    
    // List all collections
    console.log('\n📁 Database is ready!')
    
  } catch (error) {
    console.error('❌ Connection failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Tip: Check your username and password in DATABASE_URL')
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Tip: Check your cluster hostname in DATABASE_URL')
    } else {
      console.log('\n💡 Tip: Make sure DATABASE_URL is correctly set in .env file')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
