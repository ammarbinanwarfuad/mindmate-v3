import QuickMoodEntry from '@/components/mood/QuickMoodEntry';
import MoodCalendar from '@/components/mood/MoodCalendar';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back! Here&apos;s your wellness overview</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mood Streak</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-primary-600">7 days</div>
                            <p className="text-sm text-gray-600 mt-2">Keep it up! 🎉</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Average Mood</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-600">7.2</div>
                            <p className="text-sm text-gray-600 mt-2">This week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Connections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-secondary-600">3</div>
                            <p className="text-sm text-gray-600 mt-2">Peer matches</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Mood Entry */}
                <div className="lg:col-span-1">
                    <QuickMoodEntry />
                </div>

                {/* Mood Calendar */}
                <div className="lg:col-span-2">
                    <MoodCalendar />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="text-gray-600">Logged mood entry</span>
                                    <span className="text-gray-400 ml-auto">2 hours ago</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-gray-600">New chat conversation</span>
                                    <span className="text-gray-400 ml-auto">5 hours ago</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    <span className="text-gray-600">Posted in community</span>
                                    <span className="text-gray-400 ml-auto">1 day ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

