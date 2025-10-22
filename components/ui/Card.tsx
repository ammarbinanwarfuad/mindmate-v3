import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: boolean;
}

export default function Card({
    children,
    className = '',
    padding = true
}: CardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-md ${padding ? 'p-6' : ''} ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = ''
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({
    children,
    className = ''
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
}

export function CardContent({
    children,
    className = ''
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

