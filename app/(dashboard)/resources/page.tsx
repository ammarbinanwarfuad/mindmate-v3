import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ResourcesPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Wellness Resources</h1>
                <p className="text-gray-600 mt-2">
                    Helpful resources for your mental health journey
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-900">🆘 Crisis Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-800 mb-4">
                            If you&apos;re in crisis, immediate help is available.
                        </p>
                        <Link href="/resources/crisis">
                            <Button variant="danger" className="w-full">
                                Get Help Now
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>📚 Articles & Guides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Evidence-based articles on mental health topics
                        </p>
                        <Link href="/resources/articles">
                            <Button variant="outline" className="w-full">
                                Browse Articles
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🧘 Meditation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Guided meditation for stress relief and mindfulness
                        </p>
                        <Link href="/resources/meditation">
                            <Button variant="outline" className="w-full">
                                Start Meditation
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🫁 Breathing Exercises</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Breathing techniques to calm anxiety and stress
                        </p>
                        <Link href="/resources/breathing">
                            <Button variant="outline" className="w-full">
                                Start Breathing
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>📖 Journal Prompts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Guided journaling for self-reflection and growth
                        </p>
                        <Link href="/resources/journal">
                            <Button variant="outline" className="w-full">
                                Start Journaling
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>🎓 Academic Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Managing academic stress and staying balanced
                        </p>
                        <Link href="/resources/academic">
                            <Button variant="outline" className="w-full">
                                Learn More
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>💬 Therapy Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Find professional therapy and counseling services
                        </p>
                        <Link href="/resources/therapy">
                            <Button variant="outline" className="w-full">
                                Find Support
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>📖 Self-Help Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            CBT worksheets, mood trackers, and more
                        </p>
                        <Link href="/resources/tools">
                            <Button variant="outline" className="w-full">
                                Explore Tools
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

