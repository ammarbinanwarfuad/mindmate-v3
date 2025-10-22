'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forumPostSchema, type ForumPostInput } from '@/lib/utils/validation';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const COMMON_TAGS = [
    'Stress & Anxiety',
    'Depression',
    'Academic Pressure',
    'Relationships',
    'Self-Care',
    'Sleep Issues',
    'Loneliness',
    'Family',
    'Social Anxiety',
    'Motivation',
];

export default function CreatePostPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<ForumPostInput>({
        resolver: zodResolver(forumPostSchema),
        defaultValues: {
            tags: [],
        },
    });

    const toggleTag = (tag: string) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag].slice(0, 5); // Max 5 tags

        setSelectedTags(newTags);
        setValue('tags', newTags);
    };

    const onSubmit = async (data: ForumPostInput) => {
        try {
            setIsSubmitting(true);
            setError('');

            const response = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    tags: selectedTags,
                    isAnonymous,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create post');
            }

            // Successfully created, redirect to community page
            await router.push('/community');
            window.location.href = '/community'; // Force refresh to show new post
        } catch (err: unknown) {
            setError((err as Error).message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create a Post</h1>
                <p className="text-gray-600 mt-2">
                    Share your thoughts and experiences with the community
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        {...register('title')}
                        label="Post Title"
                        placeholder="What's on your mind?"
                        error={errors.title?.message}
                    />

                    <Textarea
                        {...register('content')}
                        label="Content"
                        placeholder="Share your thoughts, experiences, or ask for support..."
                        rows={8}
                        error={errors.content?.message}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tags (Select up to 5)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`
                    px-3 py-1 rounded-full text-sm font-medium transition-all
                    ${selectedTags.includes(tag)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                  `}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        {selectedTags.length === 5 && (
                            <p className="text-xs text-gray-500 mt-2">Maximum 5 tags selected</p>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="mt-1 mr-3"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-900">
                                    Post anonymously
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Your name will be hidden and shown as &quot;Anonymous User&quot;
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={selectedTags.length === 0}
                        >
                            Create Post
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Community Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be respectful and supportive to others</li>
                    <li>• No personal attacks or hate speech</li>
                    <li>• Protect your privacy - don&apos;t share personal information</li>
                    <li>• If you&apos;re in crisis, please seek immediate help (988)</li>
                </ul>
            </div>
        </div>
    );
}

