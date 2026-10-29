const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const foodSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      required: [true, 'Mã món ăn là bắt buộc'],
      unique: true,
      trim: true,
      default: () => `FOOD-${randomUUID()}`,
    },
    name: {
      type: String,
      required: [true, 'Tên món ăn là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Loại món ăn là bắt buộc'],
      trim: true,
    },
    cuisine: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [String], 
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Giá bán là bắt buộc'],
      min: [0, 'Giá bán không được âm'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng không được âm'],
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;