const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { 
        type: String, 
        enum: ['student', 'instructor', 'admin'], 
        default: 'student' 
    },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

