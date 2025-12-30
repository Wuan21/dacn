const mysql = require('mysql2/promise');
const fs = require('fs');

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const databaseUrl = envContent.match(/DATABASE_URL="([^"]+)"/)?.[1];

async function runMigration() {
  if (!databaseUrl) {
    console.error('❌ Could not find DATABASE_URL in .env');
    return;
  }
  
  const connection = await mysql.createConnection(databaseUrl);
  
  try {
    console.log('Adding activationCode column...');
    await connection.execute(`
      ALTER TABLE \`users\` 
      ADD COLUMN \`activationCode\` VARCHAR(191) NULL
    `);
    
    console.log('Adding activationCodeExpiry column...');
    await connection.execute(`
      ALTER TABLE \`users\` 
      ADD COLUMN \`activationCodeExpiry\` DATETIME(3) NULL
    `);
    
    console.log('Updating existing users to active...');
    await connection.execute(`
      UPDATE \`users\` SET \`isActive\` = TRUE WHERE \`isActive\` IS NULL
    `);
    
    console.log('Changing isActive default...');
    await connection.execute(`
      ALTER TABLE \`users\` 
      MODIFY COLUMN \`isActive\` BOOLEAN NOT NULL DEFAULT false
    `);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ Columns already exist, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    await connection.end();
  }
}

runMigration();
