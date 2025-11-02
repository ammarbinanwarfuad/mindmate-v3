import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
    | 'match'
    | 'message'
    | 'post'
    | 'comment'
    | 'reaction'
    | 'repost'
    | 'mood'
    | 'chat'
    | 'system'
    | 'match_accepted'
    | 'profile_view';

export interface INotification extends Document {
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    fromUserId?: Types.ObjectId;
    fromUserName?: string;
    metadata?: any;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['match', 'message', 'post', 'comment', 'reaction', 'repost', 'mood', 'chat', 'system', 'match_accepted', 'profile_view'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    fromUserName: String,
    metadata: Schema.Types.Mixed
}, {
    timestamps: true
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

