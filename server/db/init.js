const { initDb } = require('./schema');
const { seedAll } = require('./seed');
const { closeDb, save } = require('./index');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/gas_dispatch.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  已删除旧数据库');
}

(async () => {
  await initDb();
  await seedAll();
  save();
  closeDb();
  console.log('\n🎉 数据库初始化完成！');
})();
