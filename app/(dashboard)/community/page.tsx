'use client';

import { useState, useEffect } from 'react';
import ForumFeed from '@/components/community/ForumFeed';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function CommunityPage() {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagCounts, setTagCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            const response = await fetch('/api/community/tags');
            const result = await response.json();

            if (result.success) {
                setAllTags(result.data.tags);
                setTagCounts(result.data.counts);
            }
        } catch (error) {
            console.error('Failed to load tags:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Community Forum
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Connect, share, and support fellow students
                    </p>
                </div>
                <Link href="/community/new">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg">
                        ✍️ Create Post
                    </Button>
                </Link>
            </div>

            {/* Filter Tags */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-700">Filter by Topic:</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {/* All Posts Button */}
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedTag === null
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                            }
            `}
                    >
                        All Posts
                    </button>

                    {/* Dynamic Tag Buttons */}
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedTag === tag
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                                }
              `}
                        >
                            {tag}
                            {tagCounts[tag] && (
                                <span className={`ml-2 text-xs ${selectedTag === tag ? 'text-purple-200' : 'text-gray-500'}`}>
                                    ({tagCounts[tag]})
                                </span>
                            )}
                        </button>
                    ))}

                    {allTags.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No tags available yet. Create the first post!</p>
                    )}
                </div>
            </div>

            {/* Forum Feed with Filter */}
            <ForumFeed selectedTag={selectedTag} onTagsUpdate={loadTags} />
        </div>
    );
}
