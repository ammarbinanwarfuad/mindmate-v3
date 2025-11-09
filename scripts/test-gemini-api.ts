/**
 * Test script to verify Gemini API connection
 * Run with: npx ts-node scripts/test-gemini-api.ts
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API Connection...\n');

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is not set in .env.local');
        process.exit(1);
    }

    console.log(`✅ API Key found (length: ${apiKey.length} characters)`);
    console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

    // Test different model names
    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTest) {
        console.log(`Testing model: ${modelName}...`);
        
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "Hello, MindMate is working!"');
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ ${modelName} - SUCCESS!`);
            console.log(`   Response: ${text.substring(0, 100)}...\n`);
            
            // Use the first working model
            console.log(`\n✅ Recommended model: ${modelName}`);
            console.log(`   Add to .env.local: GEMINI_MODEL=${modelName}`);
            process.exit(0);
            
        } catch (error: any) {
            console.log(`❌ ${modelName} - FAILED`);
            console.log(`   Error: ${error.message}\n`);
        }
    }

    console.error('❌ None of the tested models worked. Please check your API key.');
    process.exit(1);
}

testGeminiAPI().catch(console.error);
