const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  buttonText: { type: String, default: 'Explore' },
  linkUrl: { type: String, default: '' },
  backgroundColor: { type: String, default: '#0056d2' },
  textColor: { type: String, default: '#ffffff' },
  imageUrl: { type: String },
  cloudinaryId: { type: String },
  displayType: { type: String, enum: ['DISCOUNT', 'IMAGE', 'DEFAULT'], default: 'DEFAULT' },
  discountText: { type: String },
  discountSubtext: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  page: { 
    type: String, 
    required: true,
    enum: ['HOME', 'COURSE_LIST', 'PRODUCT_LIST', 'CART'], 
    default: 'HOME'
  }

}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);