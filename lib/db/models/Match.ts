import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatch extends Document {
    users: Types.ObjectId[];
    requesterId: Types.ObjectId; // Who sent the connection request
    receiverId: Types.ObjectId; // Who received the connection request
    matchScore: number;
    commonInterests: string[];
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    commonInterests: [String],
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, {
    timestamps: true
});

MatchSchema.index({ users: 1, status: 1 });
MatchSchema.index({ requesterId: 1, status: 1 });
MatchSchema.index({ receiverId: 1, status: 1 });
MatchSchema.index({ createdAt: -1 });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

