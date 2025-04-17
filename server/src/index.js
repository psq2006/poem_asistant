require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const poemRoutes = require('./routes/poem');
const userPoemRoutes = require('./routes/userPoem');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/poem-recommendation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 路由
app.use('/api/poems', poemRoutes);
app.use('/api/user-poems', userPoemRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 