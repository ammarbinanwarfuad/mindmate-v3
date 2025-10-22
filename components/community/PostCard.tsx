'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { formatRelativeTime } from '@/lib/utils/helpers';

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
    userReactions?: Map<string, string>;
    commentsCount: number;
    createdAt: string;
    isRepost?: boolean;
    originalAuthor?: string;
}

interface Comment {
    _id: string;
    userId: string;
    authorName: string;
    content: string;
    likes: number;
    likedBy: string[];
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    onDelete?: (postId: string) => void;
    onUpdate?: () => void;
}

export default function PostCard({ post, onDelete, onUpdate }: PostCardProps) {
    const { data: session } = useSession();
    const router = useRouter();

    // State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRepostModal, setShowRepostModal] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isReposting, setIsReposting] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const [showMenu, setShowMenu] = useState(false);

    // Reactions
    const [reactions, setReactions] = useState(post.reactions);
    const [userReaction, setUserReaction] = useState<string | null>(null);

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isCommentAnonymous, setIsCommentAnonymous] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentSort, setCommentSort] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');

    // Repost
    const [repostContent, setRepostContent] = useState('');
    const [isRepostAnonymous, setIsRepostAnonymous] = useState(false);

    const isOwnPost = session?.user?.id === post.userId;

    useEffect(() => {
        if (showComments) {
            loadComments();
        }
    }, [showComments, commentSort]);

    const loadComments = async () => {
        try {
            const response = await fetch(`/api/community/posts/${post._id}/comments?sortBy=${commentSort}`);
            const result = await response.json();
            if (result.success) {
                setComments(result.data);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleReact = async (reactionType: string) => {
        try {
            const response = await fetch(`/api/community/posts/${post._id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reactionType }),
            });

            const result = await response.json();
            if (result.success) {
                setReactions(result.data.reactions);
                setUserReaction(result.data.userReaction);
            }
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch(`/api/community/posts/${post._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    isAnonymous: isCommentAnonymous,
                }),
            });

            if (response.ok) {
                setNewComment('');
                loadComments();
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            const response = await fetch(
                `/api/community/posts/${post._id}/comments/${commentId}/like`,
                { method: 'POST' }
            );

            if (response.ok) {
                loadComments();
            }
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    };

    const handleRepost = async () => {
        setIsReposting(true);
        try {
            const response = await fetch(`/api/community/posts/${post._id}/repost`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: repostContent,
                    isAnonymous: isRepostAnonymous,
                }),
            });

            if (response.ok) {
                setShowRepostModal(false);
                setRepostContent('');
                router.refresh();
            } else {
                alert('Failed to repost');
            }
        } catch (error) {
            console.error('Error reposting:', error);
            alert('An error occurred while reposting');
        } finally {
            setIsReposting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/community/posts/${post._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setShowDeleteModal(false);
                if (onDelete) onDelete(post._id);
                router.refresh();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = async () => {
        setIsEditing(true);
        try {
            const response = await fetch(`/api/community/posts/${post._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent,
                    tags: post.tags,
                }),
            });

            if (response.ok) {
                setShowEditModal(false);
                if (onUpdate) onUpdate();
                router.refresh();
            } else {
                alert('Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const reactionButtons = [
        { type: 'love', emoji: '❤️', label: 'Love', count: reactions.love, color: 'text-red-500' },
        { type: 'supportive', emoji: '💙', label: 'Support', count: reactions.supportive, color: 'text-blue-500' },
        { type: 'relatable', emoji: '🤝', label: 'Relatable', count: reactions.relatable, color: 'text-yellow-600' },
        { type: 'helpful', emoji: '💡', label: 'Helpful', count: reactions.helpful, color: 'text-green-500' },
        { type: 'insightful', emoji: '✨', label: 'Insightful', count: reactions.insightful, color: 'text-purple-500' },
    ];

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                {post.isRepost && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 pb-3 border-b">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span>Reposted from <strong>{post.originalAuthor}</strong></span>
                    </div>
                )}

                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium">{post.authorName}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(post.createdAt)}</span>
                        </div>
                    </div>

                    {isOwnPost && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Post options"
                                title="Options"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </button>

                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                        <button
                                            onClick={() => {
                                                setShowEditModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Post
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteModal(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Post
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {post.content}
                </p>

                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                            <Badge key={index} variant="gray">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b flex-wrap">
                    {reactionButtons.map((reaction) => (
                        <button
                            key={reaction.type}
                            onClick={() => handleReact(reaction.type)}
                            className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                transition-all hover:scale-105
                ${userReaction === reaction.type
                                    ? `${reaction.color} bg-opacity-10 ring-2 ring-current`
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
              `}
                            title={reaction.label}
                        >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count || 0}</span>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.commentsCount} Comments</span>
                        </button>

                        <button
                            onClick={() => setShowRepostModal(true)}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Repost</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Comment Sort */}
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Comments</h4>
                            <select
                                value={commentSort}
                                onChange={(e) => setCommentSort(e.target.value as any)}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                aria-label="Sort comments"
                                title="Sort comments"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="mostLiked">Most Liked</option>
                            </select>
                        </div>

                        {/* Add Comment */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                rows={2}
                            />
                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={isCommentAnonymous}
                                        onChange={(e) => setIsCommentAnonymous(e.target.checked)}
                                        className="mr-2"
                                    />
                                    Post anonymously
                                </label>
                                <Button
                                    size="sm"
                                    onClick={handleComment}
                                    isLoading={isSubmittingComment}
                                    disabled={!newComment.trim()}
                                >
                                    Comment
                                </Button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div key={comment._id} className="bg-white rounded-lg p-3 border">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {comment.authorName}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatRelativeTime(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleLikeComment(comment._id)}
                                        className={`
                      flex items-center gap-1 text-xs
                      ${comment.likedBy?.includes(session?.user?.id || '')
                                                ? 'text-red-500 font-medium'
                                                : 'text-gray-500 hover:text-red-500'
                                            }
                    `}
                                    >
                                        <span>❤️</span>
                                        <span>{comment.likes || 0} {comment.likes === 1 ? 'Like' : 'Likes'}</span>
                                    </button>
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-4">
                                    No comments yet. Be the first to comment!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Post" size="lg">
                <div className="space-y-4">
                    <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <Textarea label="Content" value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} />
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button onClick={handleEdit} isLoading={isEditing}>Save Changes</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Post">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete this post? This action cannot be undone.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>Delete Post</Button>
                    </div>
                </div>
            </Modal>

            {/* Repost Modal */}
            <Modal isOpen={showRepostModal} onClose={() => setShowRepostModal(false)} title="Repost" size="lg">
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <p className="text-sm font-medium text-gray-900 mb-1">{post.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-2">by {post.authorName}</p>
                    </div>

                    <Textarea
                        label="Add your thoughts (optional)"
                        value={repostContent}
                        onChange={(e) => setRepostContent(e.target.value)}
                        placeholder="Share why this resonates with you..."
                        rows={3}
                    />

                    <label className="flex items-center text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isRepostAnonymous}
                            onChange={(e) => setIsRepostAnonymous(e.target.checked)}
                            className="mr-2"
                        />
                        Repost anonymously
                    </label>

                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowRepostModal(false)}>Cancel</Button>
                        <Button onClick={handleRepost} isLoading={isReposting}>Repost</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
