'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { MOOD_EMOJIS } from '@/lib/utils/constants';
import { getMoodBgColor } from '@/lib/utils/helpers';

interface MoodEntry {
    date: string;
    moodScore: number;
    emoji: string;
}

export default function MoodCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [moodData, setMoodData] = useState<MoodEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMoodData = useCallback(async () => {
        try {
            setIsLoading(true);
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            const response = await fetch(
                `/api/mood?startDate=${start}&endDate=${end}`
            );
            const result = await response.json();

            if (result.success) {
                setMoodData(result.data);
            }
        } catch (error) {
            console.error('Failed to load mood data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        loadMoodData();
    }, [loadMoodData]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getMoodForDate = (date: Date) => {
        return moodData.find(mood =>
            isSameDay(new Date(mood.date), date)
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}

                {days.map(day => {
                    const mood = getMoodForDate(day);
                    const today = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                aspect-square flex flex-col items-center justify-center rounded-lg
                ${mood ? getMoodBgColor(mood.moodScore) : 'bg-gray-50'}
                ${today ? 'ring-2 ring-primary-500' : ''}
                transition-all hover:scale-105
              `}
                        >
                            <div className="text-xs text-gray-600">{format(day, 'd')}</div>
                            {mood && (
                                <div className="text-2xl">{mood.emoji}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-50 rounded mr-2" />
                    <span className="text-gray-600">Good</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-50 rounded mr-2" />
                    <span className="text-gray-600">Moderate</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-50 rounded mr-2" />
                    <span className="text-gray-600">Low</span>
                </div>
            </div>
        </div>
    );
}

