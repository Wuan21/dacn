const mysql = require('mysql2/promise');

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'yourmedicare'
    });

    console.log('✓ Connected to database: yourmedicare\n');

    // Show all tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables trong database:');
    if (tables.length === 0) {
      console.log('Không có bảng nào!');
    } else {
      tables.forEach((table) => {
        console.log(`  ✓ ${Object.values(table)[0]}`);
      });
    }

    // Check service table specifically
    console.log('\n🔍 Kiểm tra bảng service:');
    try {
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM service');
      console.log(`  ✓ Bảng service tồn tại và có ${rows[0].count} dòng dữ liệu`);
    } catch (err) {
      console.log('Bảng service không tồn tại!');
    }

    await connection.end();
  } catch (error) {
    console.error('Lỗi kết nối database:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Database "yourmedicare" không tồn tại!');
      console.log('   Bạn cần tạo database trước.');
    }
  }
}

checkTables();
