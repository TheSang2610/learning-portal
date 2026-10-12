const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    description: {
        type: String,
        required: true
    },

    thumbnail: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        default: 0
    },

    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider", 
        required: false  
    },

    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },

    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }
    ],

    totalDuration: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },

    reviewsCount: {
        type: Number,
        default: 0
    },

    studentsCount: {
        type: Number,
        default: 0
    },

    // So ngay duoc hoc sau khi thanh toan (chi khoa co phi). Quan tri sua tung khoa.
    accessDays: {
        type: Number,
        default: 30,
        min: 1,
        max: 3650
    },
    isPublished: {
        type: Boolean,
        default: false
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],

    // Ba muc trang chu tu xep theo luot xem - xem utils/viewCount.js.
    luotXem: {
        type: Number,
        default: 0
    },
    luotXemThang: {
        type: Number,
        default: 0
    },
    thangLuotXem: {
        type: String,
        default: ''
    }

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);