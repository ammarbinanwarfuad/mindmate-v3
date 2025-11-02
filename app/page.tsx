import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Your Mental Wellness,{' '}
                            <span className="text-primary-600">Supported by AI</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            MindMate is your 24/7 AI companion designed specifically for university students.
                            Track your mood, chat with AI, connect with peers, and access mental health resources.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link href="/register">
                                <Button size="lg">Get Started Free</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="outline" size="lg">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Everything You Need for Mental Wellness
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md p-6">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Start Your Wellness Journey?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join thousands of students taking control of their mental health
                    </p>
                    <Link href="/register">
                        <Button variant="secondary" size="lg">
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

const features = [
    {
        icon: '💬',
        title: 'AI Chat Support',
        description: 'Chat 24/7 with an empathetic AI trained to provide mental health support',
    },
    {
        icon: '😊',
        title: 'Mood Tracking',
        description: 'Track your daily mood and discover patterns with beautiful visualizations',
    },
    {
        icon: '👥',
        title: 'Peer Community',
        description: 'Connect with fellow students in a safe, supportive community forum',
    },
    {
        icon: '🤝',
        title: 'Smart Matching',
        description: 'Get matched with peers who understand what you\'re going through',
    },
    {
        icon: '📊',
        title: 'Insights & Analytics',
        description: 'Gain insights into your mental health trends and progress over time',
    },
    {
        icon: '🔒',
        title: 'Privacy First',
        description: 'Your data is encrypted and protected. Complete anonymity available',
    },
    {
        icon: '📚',
        title: 'Wellness Resources',
        description: 'Access curated mental health resources, exercises, and coping strategies',
    },
    {
        icon: '🆘',
        title: 'Crisis Detection',
        description: 'Automatic crisis detection with immediate access to professional help',
    },
];

