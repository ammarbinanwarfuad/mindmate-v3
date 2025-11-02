import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    conversationId: string; // Unique ID for the conversation between two users
    encryptedContent: string; // Encrypted message content
    iv: string; // Initialization vector for AES-256-GCM
    authTag: string; // Authentication tag for AES-256-GCM
    read: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: String, required: true, index: true },
    encryptedContent: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: Date
}, {
    timestamps: true
});

// Indexes for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, read: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

