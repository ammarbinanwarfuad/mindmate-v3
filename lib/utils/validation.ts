import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    university: z.string().optional(),
    year: z.number().min(1).max(7).optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
    privacyAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the privacy policy',
    }),
    ageConfirmed: z.boolean().refine((val) => val === true, {
        message: 'You must confirm you are 18 or older',
    }),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Mood validation schemas
export const moodEntrySchema = z.object({
    moodScore: z.number().min(1).max(10),
    emoji: z.string(),
    journalEntry: z.string().optional(),
    triggers: z.array(z.string()).default([]),
    activities: z.array(z.string()).default([]),
    sleepHours: z.number().min(0).max(24).optional(),
});

// Forum post validation
export const forumPostSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    content: z.string().min(10, 'Content must be at least 10 characters').max(5000),
    tags: z.array(z.string()).max(5),
});

// Profile update validation
export const educationSchema = z.object({
    school: z.string().min(1, 'School name is required'),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().max(1000).optional(),
});

export const experienceSchema = z.object({
    company: z.string().min(1, 'Company name is required'),
    title: z.string().min(1, 'Job title is required'),
    employmentType: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    currentlyWorking: z.boolean().optional(),
    description: z.string().max(1000).optional(),
});

export const profileUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    headline: z.string().max(120).optional(),
    university: z.string().optional(),
    year: z.number().min(1).max(7).optional(),
    bio: z.string().max(500).optional(),
    about: z.string().max(2000).optional(),
    anonymous: z.boolean().optional(),
    education: z.array(educationSchema).optional(),
    experience: z.array(experienceSchema).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MoodEntryInput = z.infer<typeof moodEntrySchema>;
export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

