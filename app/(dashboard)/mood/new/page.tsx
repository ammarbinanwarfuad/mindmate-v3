'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { MOOD_EMOJIS, COMMON_TRIGGERS, COMMON_ACTIVITIES } from '@/lib/utils/constants';

export default function NewMoodPage() {
    const router = useRouter();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [journalEntry, setJournalEntry] = useState('');
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [sleepHours, setSleepHours] = useState<number | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleTrigger = (trigger: string) => {
        setSelectedTriggers(prev =>
            prev.includes(trigger)
                ? prev.filter(t => t !== trigger)
                : [...prev, trigger]
        );
    };

    const toggleActivity = (activity: string) => {
        setSelectedActivities(prev =>
            prev.includes(activity)
                ? prev.filter(a => a !== activity)
                : [...prev, activity]
        );
    };

    const handleSubmit = async () => {
        if (selectedMood === null) {
            setError('Please select your mood');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodScore: selectedMood,
                    emoji: MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS],
                    journalEntry: journalEntry || undefined,
                    triggers: selectedTriggers,
                    activities: selectedActivities,
                    sleepHours,
                }),
            });

            if (response.ok) {
                router.push('/mood');
                router.refresh();
            } else {
                const result = await response.json();
                setError(result.error || 'Failed to save mood entry');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Log Your Mood</h1>
                <p className="text-gray-600 mt-2">
                    Take a moment to check in with yourself
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>How are you feeling today?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-3">
                            {Object.entries(MOOD_EMOJIS).map(([score, emoji]) => (
                                <button
                                    key={score}
                                    onClick={() => setSelectedMood(parseInt(score))}
                                    className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl
                    border-2 transition-all hover:scale-105
                    ${selectedMood === parseInt(score)
                                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                                            : 'border-gray-200 hover:border-purple-300 bg-white'
                                        }
                  `}
                                >
                                    <span className="text-4xl mb-2">{emoji}</span>
                                    <span className="text-sm font-medium text-gray-700">{score}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>What triggered this feeling?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_TRIGGERS.map(trigger => (
                                <button
                                    key={trigger}
                                    onClick={() => toggleTrigger(trigger)}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedTriggers.includes(trigger)
                                            ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                                        }
                  `}
                                >
                                    {trigger}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>What activities did you do today?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_ACTIVITIES.map(activity => (
                                <button
                                    key={activity}
                                    onClick={() => toggleActivity(activity)}
                                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedActivities.includes(activity)
                                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                                        }
                  `}
                                >
                                    {activity}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sleep (optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={sleepHours || ''}
                                onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="Hours of sleep"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-gray-600">hours</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Journal Entry (optional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={journalEntry}
                            onChange={(e) => setJournalEntry(e.target.value)}
                            placeholder="How are you feeling? What's on your mind?..."
                            rows={6}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            🔒 Your journal entries are encrypted and private
                        </p>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={selectedMood === null}
                    >
                        Save Mood Entry
                    </Button>
                </div>
            </div>
        </div>
    );
}

