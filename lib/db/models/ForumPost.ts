import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment {
    userId: Types.ObjectId;
    authorName: string;
    content: string;
    likes: number;
    likedBy: string[];
    createdAt: Date;
}

export interface IForumPost extends Document {
    userId: Types.ObjectId;
    authorName: string;
    title: string;
    content: string;
    tags: string[];
    reactions: {
        love: number;
        supportive: number;
        relatable: number;
        helpful: number;
        insightful: number;
    };
    userReactions: Map<string, string>;
    comments: Types.DocumentArray<IComment>;
    commentsCount: number;
    isRepost?: boolean;
    originalPostId?: Types.ObjectId;
    originalAuthor?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const ForumPostSchema = new Schema<IForumPost>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    reactions: {
        love: { type: Number, default: 0 },
        supportive: { type: Number, default: 0 },
        relatable: { type: Number, default: 0 },
        helpful: { type: Number, default: 0 },
        insightful: { type: Number, default: 0 }
    },
    userReactions: { type: Map, of: String, default: new Map() },
    comments: [CommentSchema],
    commentsCount: { type: Number, default: 0 },
    isRepost: { type: Boolean, default: false },
    originalPostId: { type: Schema.Types.ObjectId, ref: 'ForumPost' },
    originalAuthor: String
}, {
    timestamps: true
});

ForumPostSchema.index({ createdAt: -1 });
ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ userId: 1 });

export default mongoose.models.ForumPost || mongoose.model<IForumPost>('ForumPost', ForumPostSchema);

