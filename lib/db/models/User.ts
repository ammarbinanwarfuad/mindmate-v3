import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface IExperience {
    company: string;
    title: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
}

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    profile: {
        name: string;
        headline?: string;
        university?: string;
        year?: number;
        anonymous: boolean;
        bio?: string;
        about?: string;
        profilePicture?: string;
        coverPhoto?: string;
        education?: IEducation[];
        experience?: IExperience[];
    };
    preferences: {
        notifications: boolean;
        publicProfile: boolean;
        shareData: boolean;
    };
    privacy: {
        dataCollection: {
            allowAnalytics: boolean;
            allowResearch: boolean;
            allowPersonalization: boolean;
        };
        visibility: {
            profilePublic: boolean;
            showInMatching: boolean;
            allowMessages: string;
        };
        showActiveStatus?: boolean;
    };
    lastActive?: Date;
    isOnline?: boolean;
    consent: {
        termsAccepted: boolean;
        termsVersion: string;
        privacyAccepted: boolean;
        ageConfirmed: boolean;
        consentDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    profile: {
        name: { type: String, required: true },
        headline: String,
        university: String,
        year: Number,
        anonymous: { type: Boolean, default: false },
        bio: String,
        about: String,
        profilePicture: String,
        coverPhoto: String,
        education: [{
            school: { type: String, required: true },
            degree: String,
            fieldOfStudy: String,
            startDate: String,
            endDate: String,
            description: String
        }],
        experience: [{
            company: { type: String, required: true },
            title: { type: String, required: true },
            employmentType: String,
            location: String,
            startDate: String,
            endDate: String,
            currentlyWorking: { type: Boolean, default: false },
            description: String
        }]
    },
    preferences: {
        notifications: { type: Boolean, default: true },
        publicProfile: { type: Boolean, default: false },
        shareData: { type: Boolean, default: true }
    },
    privacy: {
        dataCollection: {
            allowAnalytics: { type: Boolean, default: false },
            allowResearch: { type: Boolean, default: false },
            allowPersonalization: { type: Boolean, default: true }
        },
        visibility: {
            profilePublic: { type: Boolean, default: false },
            showInMatching: { type: Boolean, default: true },
            allowMessages: { type: String, enum: ['everyone', 'matches', 'none'], default: 'matches' }
        },
        showActiveStatus: { type: Boolean, default: true }
    },
    lastActive: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    consent: {
        termsAccepted: { type: Boolean, required: true },
        termsVersion: { type: String, required: true },
        privacyAccepted: { type: Boolean, required: true },
        ageConfirmed: { type: Boolean, required: true },
        consentDate: { type: Date, required: true }
    }
}, {
    timestamps: true
});

UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

