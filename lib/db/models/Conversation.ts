import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface IConversation extends Document {
    userId: Types.ObjectId;
    messages: IMessage[];
    lastMessageAt: Date;
    crisisDetected: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    crisisDetected: { type: Boolean, default: false }
}, {
    timestamps: true
});

ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

