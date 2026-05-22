const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        default: ''
    },

    avatar: {
        type: String,
        default: ''
    },

    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },

    bio: {
        type: String,
        default: ''
    },

    phone: {
        type: String,
        unique: true,
        sparse: true
    },

    status: {
        type: Boolean,
        default: true
    },

    googleId: {
        type: String,
        unique: true,
        sparse: true
    },

    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],

    createdCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]

}, { timestamps: true });


// AUTO GENERATE USER ID
userSchema.pre('save', async function () {

    if (this.userId) {
        return;
    }

    let newUserId;
    let existingUser;

    do {

        newUserId = `USR${Math.floor(
            10000000 + Math.random() * 90000000
        )}`;

        existingUser = await mongoose.models.User.findOne({
            userId: newUserId
        });

    } while (existingUser);

    this.userId = newUserId;
});

module.exports = mongoose.model('User', userSchema);