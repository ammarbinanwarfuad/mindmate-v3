import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, buildContextSummary } from './user-context';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const systemPrompt = buildSystemPrompt(userContext);

        const chatHistory = conversationHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
            },
        });

        // Include system prompt and context for first message or when context is provided
        let messageWithContext: string;
        if (conversationHistory.length === 0) {
            // First message - include full system prompt with context
            messageWithContext = `${systemPrompt}\n\nUser: ${userMessage}`;
        } else if (userContext && conversationHistory.length <= 2) {
            // Early in conversation - include context reminder if relevant
            messageWithContext = userMessage;
        } else {
            // Regular message - just send the user message
            messageWithContext = userMessage;
        }

        const result = await chat.sendMessage(messageWithContext);
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const systemPrompt = buildSystemPrompt(userContext);

        const chatHistory = conversationHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            },
        });

        // Include system prompt and context for first message
        let messageWithContext: string;
        if (conversationHistory.length === 0) {
            messageWithContext = `${systemPrompt}\n\nUser: ${userMessage}`;
        } else {
            messageWithContext = userMessage;
        }

        const result = await chat.sendMessageStream(messageWithContext);
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

