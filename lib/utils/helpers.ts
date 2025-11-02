import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

// Date formatting helpers
export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isToday(dateObj)) {
        return 'Today';
    }

    if (isYesterday(dateObj)) {
        return 'Yesterday';
    }

    return format(dateObj, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
}

// String helpers
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Mood helpers
export function getMoodColor(score: number): string {
    if (score <= 3) return 'text-red-600';
    if (score <= 5) return 'text-orange-600';
    if (score <= 7) return 'text-yellow-600';
    return 'text-green-600';
}

export function getMoodBgColor(score: number): string {
    if (score <= 3) return 'bg-red-50';
    if (score <= 5) return 'bg-orange-50';
    if (score <= 7) return 'bg-yellow-50';
    return 'bg-green-50';
}

export function getMoodLabel(score: number): string {
    if (score <= 2) return 'Very Low';
    if (score <= 4) return 'Low';
    if (score <= 6) return 'Moderate';
    if (score <= 8) return 'Good';
    return 'Excellent';
}

// Array helpers
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const group = String(item[key]);
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

// API response helpers
export function successResponse<T>(data: T, message?: string) {
    return {
        success: true,
        data,
        message,
    };
}

export function errorResponse(message: string, status = 500) {
    return {
        success: false,
        error: message,
        status,
    };
}

// Local storage helpers (client-side only)
export function getLocalStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

export function setLocalStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

