// Basic sentiment analysis
// This is a simple implementation. For production, consider using a dedicated NLP library

const positiveWords = [
    'happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'better',
    'good', 'excellent', 'fantastic', 'proud', 'grateful', 'thankful', 'blessed',
    'peaceful', 'calm', 'relaxed', 'content', 'hopeful', 'optimistic',
];

const negativeWords = [
    'sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'hate', 'terrible',
    'awful', 'bad', 'worse', 'worst', 'difficult', 'hard', 'struggling', 'painful',
    'hurt', 'lonely', 'isolated', 'hopeless', 'overwhelming', 'exhausted',
];

export function analyzeSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);

    let score = 0;

    words.forEach(word => {
        if (positiveWords.includes(word)) {
            score += 1;
        } else if (negativeWords.includes(word)) {
            score -= 1;
        }
    });

    // Normalize to -1 to 1 range
    const maxScore = Math.max(positiveWords.length, negativeWords.length);
    const normalizedScore = Math.max(-1, Math.min(1, score / maxScore));

    return normalizedScore;
}

export function getSentimentLabel(score: number): string {
    if (score >= 0.5) return 'Very Positive';
    if (score >= 0.2) return 'Positive';
    if (score >= -0.2) return 'Neutral';
    if (score >= -0.5) return 'Negative';
    return 'Very Negative';
}

