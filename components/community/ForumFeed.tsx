'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

interface Post {
    _id: string;
    userId: string;
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
    commentsCount: number;
    createdAt: string;
    isRepost?: boolean;
    originalAuthor?: string;
    userReaction?: string | null;
}

interface ForumFeedProps {
    selectedTag?: string | null;
    onTagsUpdate?: () => void;
}

export default function ForumFeed({ selectedTag, onTagsUpdate }: ForumFeedProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, [selectedTag]);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const url = selectedTag
                ? `/api/community/posts?tag=${encodeURIComponent(selectedTag)}`
                : '/api/community/posts';

            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                setPosts(result.data);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = (postId: string) => {
        setPosts(posts.filter(p => p._id !== postId));
        // Reload tags after deletion
        if (onTagsUpdate) {
            onTagsUpdate();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {selectedTag && posts.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-sm text-purple-800">
                        Showing posts tagged with <strong>&quot;{selectedTag}&quot;</strong> ({posts.length} {posts.length === 1 ? 'post' : 'posts'})
                    </span>
                </div>
            )}

            {posts.map((post) => (
                <PostCard
                    key={post._id}
                    post={post}
                    onDelete={handleDeletePost}
                    onUpdate={() => {
                        loadPosts();
                        if (onTagsUpdate) onTagsUpdate();
                    }}
                />
            ))}

            {posts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-600 text-lg">
                        {selectedTag ? `No posts tagged "${selectedTag}"` : 'No posts yet'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        {selectedTag
                            ? 'Try selecting a different tag or view all posts'
                            : 'Be the first to share your thoughts with the community!'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

