'use client';

interface ActiveStatusIndicatorProps {
    isOnline: boolean;
    size?: 'sm' | 'md' | 'lg';
    showOffline?: boolean;
}

export default function ActiveStatusIndicator({
    isOnline,
    size = 'md',
    showOffline = false
}: ActiveStatusIndicatorProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    if (!isOnline && !showOffline) return null;

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        rounded-full 
        ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
        border-2 border-white
        ${isOnline ? 'animate-pulse' : ''}
      `}
            title={isOnline ? 'Active now' : 'Offline'}
        />
    );
}

