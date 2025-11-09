import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, buildContextSummary } from './user-context';

// Validate API key
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in environment variables!');
    console.error('Please add GEMINI_API_KEY to your .env.local file');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const BASE_SYSTEM_PROMPT = `You are MindMate, an empathetic AI wellness companion for university students. Your role:

1. Listen actively and validate feelings
2. Provide evidence-based coping strategies (CBT, mindfulness)
3. Never diagnose or replace professional therapy
4. Detect crisis situations and provide resources
5. Be warm, supportive, and non-judgmental
6. Use simple, student-friendly language

Remember: You're a supportive friend, not a therapist.`;

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    message: string;
    crisisDetected: boolean;
    sentiment: number;
    error?: boolean;
}

/**
 * Build personalized system prompt with user context
 */
function buildSystemPrompt(userContext?: UserContext): string {
    if (!userContext || !userContext.privacySettings.allowPersonalization) {
        return BASE_SYSTEM_PROMPT;
    }

    const contextSummary = buildContextSummary(userContext);
    
    return `${BASE_SYSTEM_PROMPT}

USER CONTEXT (Use this to provide personalized, context-aware responses):
${contextSummary}

Important Guidelines:
- Reference the user's specific mood patterns, triggers, and activities when relevant
- Use their name and personal details naturally in conversation
- Remember past conversations and strategies discussed
- Acknowledge their progress and patterns when appropriate
- Be mindful of their privacy - only reference data they've shared
- If mood is declining or triggers are frequent, offer specific help
- Suggest activities that have been effective for them in the past`;
}

export async function getChatResponse(
    conversationHistory: ChatMessage[],
    userMessage: string,
    userContext?: UserContext
): Promise<ChatResponse> {
    try {
        // Use gemini-1.5-flash as fallback if 2.0 is not available
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const systemPrompt = buildSystemPrompt(userContext);

        const chatHistory = conversationHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

        // Use systemInstruction to persist personalized context throughout conversation
        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            },
        });

        // Send user message directly - systemInstruction handles the context
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const assistantMessage = response.text();

        const crisisDetected = detectCrisis(userMessage);

        return {
            message: assistantMessage,
            crisisDetected,
            sentiment: 0,
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            model: modelName,
            hasApiKey: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        });
        return {
            message: "I'm having trouble connecting right now. Please try again in a moment.",
            crisisDetected: false,
            sentiment: 0,
            error: true,
        };
    }
}

export async function getChatResponseStreaming(
    conversationHistory: ChatMessage[],
    userMessage: string,
    onChunk: (text: string) => void,
    userContext?: UserContext
): Promise<ChatResponse> {
    try {
        // Use gemini-1.5-flash as fallback if 2.0 is not available
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });
        const systemPrompt = buildSystemPrompt(userContext);

        const chatHistory = conversationHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

        // Use systemInstruction to persist personalized context throughout conversation
        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        // Send user message directly - systemInstruction handles the context
        const result = await chat.sendMessageStream(userMessage);
        let fullText = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
        }

        const crisisDetected = detectCrisis(userMessage);

        return {
            message: fullText,
            crisisDetected,
            sentiment: 0,
        };

    } catch (error) {
        console.error('Gemini Streaming Error:', error);
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        console.error('Streaming Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            model: modelName,
            hasApiKey: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
        });
        return {
            message: "I'm having trouble connecting right now. Please try again in a moment.",
            crisisDetected: false,
            sentiment: 0,
            error: true,
        };
    }
}

export async function generateMoodInsights(
    moodData: { date: string; moodScore: number; triggers: string[]; activities: string[] }[]
): Promise<string> {
    try {
        // Use gemini-1.5-flash as fallback if 2.0 is not available
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `As a mental wellness AI, analyze this mood data and provide brief, actionable insights (3-4 sentences):

${JSON.stringify(moodData, null, 2)}

Focus on patterns, triggers, and helpful suggestions.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Mood insights generation error:', error);
        return 'Unable to generate insights at this time.';
    }
}

function detectCrisis(text: string): boolean {
    const crisisKeywords = [
        'suicide',
        'kill myself',
        'end it all',
        'want to die',
        'self harm',
        'cutting',
        'hurting myself',
        'no reason to live',
        'better off dead',
    ];

    const lowerText = text.toLowerCase();
    return crisisKeywords.some(keyword => lowerText.includes(keyword));
}

