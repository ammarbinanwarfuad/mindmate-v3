import { Schema, model, models, Document, Types } from 'mongoose';

export interface IJournalEntry extends Document {
    userId: Types.ObjectId;
    category: string;
    prompt: string;
    content: string;
    promptIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['Gratitude', 'Reflection', 'Emotional Check-in', 'Growth', 'Future Planning'],
        },
        prompt: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        promptIndex: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for querying user's journal entries by date and category
JournalEntrySchema.index({ userId: 1, createdAt: -1 });
JournalEntrySchema.index({ userId: 1, category: 1, createdAt: -1 });

const JournalEntryModel = models.JournalEntry || model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntryModel;

