require('dotenv').config();

console.log('🔍 ENVIRONMENT VARIABLES CHECK');
console.log('==================================================');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.MONGODB_URI) {
    console.log('MongoDB URI length:', process.env.MONGODB_URI.length);
    console.log('MongoDB URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
} else {
    console.log('❌ MONGODB_URI is not set!');
}

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'abra_fleet_backend', '.env');
console.log('\n📁 Checking .env file path:', envPath);
console.log('📁 .env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const mongoLine = lines.find(line => line.startsWith('MONGODB_URI='));
    console.log('📋 MongoDB line from .env:', mongoLine ? mongoLine.substring(0, 50) + '...' : 'NOT FOUND');
}