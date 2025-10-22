'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MOOD_EMOJIS } from '@/lib/utils/constants';

export default function QuickMoodEntry() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (selectedMood === null) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodScore: selectedMood,
                    emoji: MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS],
                    triggers: [],
                    activities: [],
                }),
            });

            if (response.ok) {
                setSelectedMood(null);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to submit mood:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>

            <div className="grid grid-cols-5 gap-2 mb-4">
                {Object.entries(MOOD_EMOJIS).map(([score, emoji]) => (
                    <button
                        key={score}
                        onClick={() => setSelectedMood(parseInt(score))}
                        className={`
              aspect-square flex flex-col items-center justify-center rounded-lg
              border-2 transition-all hover:scale-105
              ${selectedMood === parseInt(score)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }
            `}
                    >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-xs mt-1">{score}</span>
                    </button>
                ))}
            </div>

            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={selectedMood === null}
                isLoading={isSubmitting}
            >
                Log Mood
            </Button>
        </Card>
    );
}

