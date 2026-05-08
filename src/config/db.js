const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        const error = new Error('MONGO_URI is not defined in environment variables');
        console.error(error);
        throw error;
    }

    try {
        const conn = await mongoose.connect(uri);
        isConnected = !!conn.connections[0].readyState;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

module.exports = connectDB;
