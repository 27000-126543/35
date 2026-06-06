const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const dbModule = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '燃气调度后端服务运行正常', timestamp: new Date().toISOString() });
});

fs.readdirSync(path.join(__dirname, 'routes')).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(`./routes/${file}`);
    const base = '/api/' + file.replace('.js', '').replace('_', '-');
    app.use(base, route);
    console.log(`📡 注册路由: ${base}`);
  }
});

app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

(async () => {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  await dbModule.init();

  app.listen(PORT, () => {
    console.log(`\n🚀 燃气调度后端服务已启动: http://localhost:${PORT}`);
    console.log(`📦 SQLite数据库: ${path.join(dataDir, 'gas_dispatch.db')}`);
  });
})();
