require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB Connection...\n');
console.log('Environment Variables Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 
    process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET');
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('ENCRYPTION_KEY exists:', !!process.env.ENCRYPTION_KEY);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testConnection() {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('❌ ERROR: MONGODB_URI is not set in .env.local');
            console.log('\nPlease add this to your .env.local file:');
            console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmate');
            process.exit(1);
        }

        console.log('⏳ Attempting to connect to MongoDB...\n');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ SUCCESS! MongoDB Connected Successfully!\n');
        console.log('Connection Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Database Name:', mongoose.connection.db.databaseName);
        console.log('Host:', mongoose.connection.host);
        console.log('Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('✅ Your database is ready to use!\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.log('❌ FAILED to connect to MongoDB\n');
        console.log('Error Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Error Name:', error.name);
        console.log('Error Message:', error.message);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (error.message.includes('bad auth')) {
            console.log('🔧 FIX: Your MongoDB username or password is incorrect');
            console.log('   1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
            console.log('   2. Click "Database Access"');
            console.log('   3. Reset your password or create a new user');
            console.log('   4. Update MONGODB_URI in .env.local\n');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('🔧 FIX: Cannot find MongoDB server');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify your cluster URL is correct');
            console.log('   3. Make sure your cluster is running\n');
        } else if (error.message.includes('IP')) {
            console.log('🔧 FIX: Your IP address is not whitelisted');
            console.log('   1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
            console.log('   2. Click "Network Access"');
            console.log('   3. Click "Add IP Address"');
            console.log('   4. Click "Allow Access from Anywhere" (0.0.0.0/0)\n');
        } else {
            console.log('🔧 Common fixes:');
            console.log('   1. Check MONGODB_URI format in .env.local');
            console.log('   2. Verify username and password');
            console.log('   3. Check network access in MongoDB Atlas\n');
        }

        process.exit(1);
    }
}

testConnection();

