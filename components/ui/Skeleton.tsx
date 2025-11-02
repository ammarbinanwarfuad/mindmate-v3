import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gray-200';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const styles: React.CSSProperties = {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={styles}
        />
    );
}

export function PostCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-start mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="ml-3 flex-1">
                    <Skeleton variant="text" className="w-32 mb-2" />
                    <Skeleton variant="text" className="w-24" />
                </div>
            </div>
            <Skeleton variant="text" className="w-3/4 mb-2" />
            <Skeleton variant="text" className="w-full mb-4" />
            <div className="flex gap-2 mb-4">
                <Skeleton variant="rectangular" className="w-16 h-6" />
                <Skeleton variant="rectangular" className="w-20 h-6" />
            </div>
            <div className="flex gap-4">
                <Skeleton variant="rectangular" className="w-20 h-8" />
                <Skeleton variant="rectangular" className="w-20 h-8" />
                <Skeleton variant="rectangular" className="w-20 h-8" />
            </div>
        </div>
    );
}

export function MatchCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div>
                        <Skeleton variant="text" className="w-32 mb-2" />
                        <Skeleton variant="text" className="w-24" />
                    </div>
                </div>
                <Skeleton variant="rectangular" className="w-20 h-6" />
            </div>
            <Skeleton variant="text" className="w-full mb-2" />
            <Skeleton variant="text" className="w-3/4 mb-4" />
            <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton variant="rectangular" className="w-16 h-6" />
                <Skeleton variant="rectangular" className="w-20 h-6" />
                <Skeleton variant="rectangular" className="w-24 h-6" />
            </div>
            <Skeleton variant="rectangular" className="w-full h-10" />
        </div>
    );
}

export function NotificationSkeleton() {
    return (
        <div className="p-4 border-b">
            <div className="flex items-start gap-3">
                <Skeleton variant="circular" width={32} height={32} />
                <div className="flex-1">
                    <Skeleton variant="text" className="w-48 mb-2" />
                    <Skeleton variant="text" className="w-full mb-1" />
                    <Skeleton variant="text" className="w-20" />
                </div>
            </div>
        </div>
    );
}

