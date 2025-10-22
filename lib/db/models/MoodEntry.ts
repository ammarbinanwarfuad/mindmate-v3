import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMoodEntry extends Document {
    userId: Types.ObjectId;
    date: Date;
    moodScore: number;
    emoji: string;
    journalEntry?: {
        encrypted: string;
        iv: string;
        authTag: string;
    };
    triggers: string[];
    activities: string[];
    sleepHours?: number;
    analyzedSentiment: number;
    aiInsights?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MoodEntrySchema = new Schema<IMoodEntry>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, default: Date.now },
    moodScore: { type: Number, required: true, min: 1, max: 10 },
    emoji: { type: String, required: true },
    journalEntry: {
        encrypted: String,
        iv: String,
        authTag: String
    },
    triggers: [String],
    activities: [String],
    sleepHours: Number,
    analyzedSentiment: { type: Number, default: 0 },
    aiInsights: String
}, {
    timestamps: true
});

MoodEntrySchema.index({ userId: 1, date: -1 });
MoodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.MoodEntry || mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);

