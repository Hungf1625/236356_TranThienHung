const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('Connection failed: MONGODB_URI is not set');
        process.exit(1);
    }

    mongoose.connect(mongoUri, { dbName: '236356_TranThienHung' })
        .then(() => console.log('Đã kết nối mongoose'))
        .catch(err => {
            console.error('Connection failed:', err.message);
            process.exit(1);
        });
};

module.exports = connectDB;