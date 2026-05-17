const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
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

    category: {
        type: String,
        required: true
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

    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    totalDuration: {
        type: Number,
        default: 0
    },

    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);