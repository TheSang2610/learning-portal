const mongoose = require('mongoose');

// Tren Vercel moi function chay trong mot container co the bi tat/bat lien tuc.
// Cache PROMISE (khong phai co true/false) tren globalThis vi:
//   - nhieu request cung den luc container vua khoi dong -> tat ca cho chung
//     mot lan ket noi, thay vi moi request tu mo mot ket noi toi Atlas
//   - module co the bi danh gia lai; global song lau hon module scope
//
// Bug cu: `let isConnected` chi duoc gan SAU khi await xong, nen cac request
// den song song luc dang ket noi deu thay isConnected = false va cung goi
// mongoose.connect() -> bung so ket noi toi Atlas moi lan cold start.
const globalForMongoose = globalThis;

if (!globalForMongoose.__mongoosePromise) {
    globalForMongoose.__mongoosePromise = null;
}

const connectDB = async () => {
    if (globalForMongoose.__mongoosePromise) {
        return globalForMongoose.__mongoosePromise;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    globalForMongoose.__mongoosePromise = mongoose
        .connect(uri, {
            // Serverless: moi container chi phuc vu it request cung luc,
            // pool lon chi lam Atlas cham het han muc ket noi.
            maxPoolSize: 10,
            minPoolSize: 0,
            // Mac dinh 30s - qua lau, request treo cho den khi Vercel cat.
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        })
        .then((conn) => {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        })
        .catch((error) => {
            // Xoa cache de lan sau con thu lai duoc, neu khong container nay
            // se giu mai mot promise da that bai.
            globalForMongoose.__mongoosePromise = null;
            console.error('MongoDB connection error:', error.message);
            throw error;
        });

    return globalForMongoose.__mongoosePromise;
};

module.exports = connectDB;
