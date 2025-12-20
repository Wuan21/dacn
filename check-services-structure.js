const mysql = require('mysql2/promise');

async function checkServicesStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'yourmedicare'
    });

    console.log('✓ Connected to yourmedicare database\n');

    // Show structure of services table
    const [columns] = await connection.query('DESCRIBE services');
    console.log('Cấu trúc bảng services:');
    console.log('─────────────────────────────────────────');
    columns.forEach((col) => {
      console.log(`${col.Field.padEnd(15)} | ${col.Type.padEnd(20)} | ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} | ${col.Default || ''}`);
    });

    // Check data
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM services');
    console.log(`\nTổng số dịch vụ: ${rows[0].count}`);

    await connection.end();
  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}

checkServicesStructure();
