import MoodCalendar from '@/components/mood/MoodCalendar';
import QuickMoodEntry from '@/components/mood/QuickMoodEntry';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function MoodPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mood Tracker</h1>
                <p className="text-gray-600 mt-2">
                    Track your daily mood and discover patterns in your mental wellness
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <QuickMoodEntry />

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Mood Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Average this week</span>
                                        <span className="font-semibold">7.2</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-[72%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Average this month</span>
                                        <span className="font-semibold">6.8</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full w-[68%]" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <MoodCalendar />

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Common Triggers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                    Academic Stress
                                </span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                    Sleep Issues
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    Social Anxiety
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

