const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas Network Access');
      console.log('   Go to: https://cloud.mongodb.com/ → Network Access → Add IP Address');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Solution: Check your database username and password');
    }
    
    process.exit(1);
  }
}

testConnection();

