import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const requiredEnvVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GEMINI_API_KEY',
    'ENCRYPTION_KEY',
];

const optionalEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

// Check required variables
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required variable: ${varName}`);
        hasErrors = true;
    } else {
        console.log(`✅ ${varName} is set`);
    }
});

// Check ENCRYPTION_KEY length
if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
    console.error('❌ ENCRYPTION_KEY must be exactly 32 characters');
    hasErrors = true;
}

// Check optional variables
console.log('\n📋 Optional variables:');
optionalEnvVars.forEach((varName) => {
    if (process.env[varName]) {
        console.log(`✅ ${varName} is set`);
    } else {
        console.log(`⚠️  ${varName} is not set (optional)`);
    }
});

if (hasErrors) {
    console.error('\n❌ Environment setup incomplete. Please check your .env.local file.');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set!');
    process.exit(0);
}

