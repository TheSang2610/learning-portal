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

    isPopular: {
        type: Boolean,
        default: false
    },

    isTrending: {
        type: Boolean,
        default: false
    },

    isNewRelease: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);