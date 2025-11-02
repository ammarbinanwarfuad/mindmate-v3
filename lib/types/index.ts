// Shared types used across the application

export interface User {
    id: string;
    email: string;
    name: string;
    profile: {
        university?: string;
        year?: number;
        anonymous: boolean;
        bio?: string;
    };
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    university?: string;
    year?: number;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    ageConfirmed: boolean;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface MoodEntry {
    _id: string;
    userId: string;
    date: string;
    moodScore: number;
    emoji: string;
    triggers: string[];
    activities: string[];
    sleepHours?: number;
    journalEntry?: string;
    analyzedSentiment?: number;
    aiInsights?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
}

export interface Conversation {
    _id: string;
    userId: string;
    messages: ChatMessage[];
    lastMessageAt: Date;
    crisisDetected: boolean;
}

export interface Match {
    _id: string;
    users: string[];
    matchScore: number;
    commonInterests: string[];
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
}

export interface ForumPost {
    _id: string;
    userId: string;
    authorName: string;
    title: string;
    content: string;
    tags: string[];
    reactions: {
        supportive: number;
        relatable: number;
        helpful: number;
    };
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'match' | 'message' | 'post' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

