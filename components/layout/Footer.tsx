import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-primary-600 mb-4">MindMate</h3>
                        <p className="text-sm text-gray-600">
                            AI-powered mental wellness companion for university students
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/chat" className="hover:text-primary-600">AI Chat Support</Link></li>
                            <li><Link href="/mood" className="hover:text-primary-600">Mood Tracking</Link></li>
                            <li><Link href="/community" className="hover:text-primary-600">Community Forum</Link></li>
                            <li><Link href="/matches" className="hover:text-primary-600">Peer Matching</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/resources/crisis" className="hover:text-primary-600">Crisis Support</Link></li>
                            <li><Link href="/resources/articles" className="hover:text-primary-600">Articles</Link></li>
                            <li><Link href="/resources/exercises" className="hover:text-primary-600">Wellness Exercises</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link href="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
                            <li><Link href="/contact" className="hover:text-primary-600">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                    <p>&copy; {new Date().getFullYear()} MindMate. All rights reserved.</p>
                    <p className="mt-2 text-xs">
                        If you&apos;re in crisis, please contact emergency services or a crisis helpline immediately.
                    </p>
                </div>
            </div>
        </footer>
    );
}

