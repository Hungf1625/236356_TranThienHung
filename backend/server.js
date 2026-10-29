require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Thêm CORS
const app = express();
const connectDB = require('./configs/database.js');
const port = process.env.PORT || 5000;
const Food = require('./models/foods.js');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const foodIdFilter = (id) => {
  if (/^[a-f\d]{24}$/i.test(id)) {
    return { $or: [{ foodId: id }, { _id: id }] };
  }

  return { foodId: id };
};

// Cấu hình CORS linh hoạt cho Production
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://mern-frontend-236356.onrender.com'  
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Cho phép nếu origin nằm trong whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Cho phép tất cả khi không phải production (dev local)
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Chặn các origin không được phép
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối Database
connectDB();

// ============== ROUTES ==============

// Test route
app.get('/api/hello', (req, res) => {
    console.log(`Server đang hoạt động - deploy test`);
    res.json({ 
        message: 'Server đang hoạt động - deploy test',
        status: 'success'
    });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// GET - Lấy tất cả món ăn
app.get('/api/foods', async (req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.json({ success: true, data: foods });
});

// GET - Tìm món ăn theo tên, mã, loại, ẩm thực hoặc nguyên liệu
app.get('/api/foods/search', async (req, res) => {
  const query = req.query.q;

  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp từ khóa tìm kiếm qua query parameter q',
    });
  }

  const searchRegex = new RegExp(escapeRegex(query.trim()), 'i');
  const foods = await Food.find({
    $or: [
      { name: searchRegex },
      { foodId: searchRegex },
      { category: searchRegex },
      { cuisine: searchRegex },
      { ingredients: searchRegex },
    ],
  }).sort({ createdAt: -1 });

  res.json({ success: true, data: foods });
});

// GET - Lấy một món ăn theo foodId hoặc MongoDB _id
app.get('/api/foods/:id', async (req, res) => {
  const targetFood = await Food.findOne(foodIdFilter(req.params.id));

  if (!targetFood) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy món ăn',
    });
  }

  res.json({ success: true, data: targetFood });
});

// POST - Tạo món ăn
app.post('/api/foods', async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu món ăn phải là một object JSON',
    });
  }

  const foodData = { ...req.body };
  delete foodData.foodId;
  const targetFood = await Food.create(foodData);
  res.status(201).json({ success: true, data: targetFood });
});

// PUT - Cập nhật món ăn theo foodId hoặc MongoDB _id
app.put('/api/foods/:id', async (req, res) => {
  if (
    !req.body ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp object JSON có dữ liệu cần cập nhật',
    });
  }

  const foodData = { ...req.body };
  delete foodData.foodId;
  if (Object.keys(foodData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp thông tin món ăn cần cập nhật (không bao gồm foodId)',
    });
  }

  const targetFood = await Food.findOneAndUpdate(
    foodIdFilter(req.params.id),
    foodData,
    { new: true, runValidators: true }
  );

  if (!targetFood) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy món ăn',
    });
  }

  res.json({ success: true, data: targetFood });
});

// DELETE - Xóa món ăn theo foodId hoặc MongoDB _id
app.delete('/api/foods/:id', async (req, res) => {
  const targetFood = await Food.findOneAndDelete(foodIdFilter(req.params.id));

  if (!targetFood) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy món ăn',
    });
  }

  res.json({
    success: true,
    message: 'Đã xóa món ăn',
    data: targetFood,
  });
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Mã món ăn đã tồn tại',
    });
  }

  console.error('API error:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi máy chủ',
  });
});

// ============== START SERVER ==============
app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
    console.log(`📚 API Foods: http://localhost:${port}/api/foods`);
});