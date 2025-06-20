// SocketServerChat/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Đảm bảo dotenv được gọi sớm để process.env có giá trị

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MongoDB Atlas URI is not defined in .env file. Exiting.");
    process.exit(1);
}

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        console.log('MongoDB for Chat already connected.');
        return;
    }
    try {
        console.log(`Attempting to connect to MongoDB Atlas with URI: ${MONGODB_URI.substring(0, MONGODB_URI.indexOf('@'))}...`); // Log URI nhưng ẩn pass
        await mongoose.connect(MONGODB_URI, {
            // Các tùy chọn này không còn cần thiết trong Mongoose v6+
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true, // không còn hỗ trợ
            // useFindAndModify: false, // không còn hỗ trợ
        });
        console.log('MongoDB connected successfully for Chat via Atlas.');
    } catch (err) {
        console.error('MongoDB Chat connection error:', err.message);
        console.error('Full error object:', err); // Log full error object để debug
        process.exit(1); // Thoát tiến trình nếu không kết nối được DB
    }
};

module.exports = connectDB;