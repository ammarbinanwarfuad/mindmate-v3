'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const quickActions = [
        { href: '/mood/new', label: 'Log Mood', icon: '📝', color: 'from-purple-600 to-blue-600' },
        { href: '/chat', label: 'Talk to MindMate', icon: '💬', color: 'from-blue-600 to-cyan-600' },
        { href: '/matches', label: 'Find Support', icon: '🤝', color: 'from-green-600 to-teal-600' },
    ];

    const resources = [
        { href: '/resources/meditation', label: 'Meditation', icon: '🧘' },
        { href: '/resources/breathing', label: 'Breathing Exercises', icon: '🌬️' },
        { href: '/resources/journal', label: 'Journal Prompts', icon: '📔' },
        { href: '/resources/crisis', label: 'Crisis Support', icon: '🆘' },
    ];

    return (
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16">
            <div className="p-6 space-y-8">
                {/* Quick Actions */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        {quickActions.map(action => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all
                  bg-gradient-to-r ${action.color} text-white shadow-md
                  hover:shadow-lg transform hover:-translate-y-0.5
                `}
                            >
                                <span className="text-xl">{action.icon}</span>
                                <span className="font-medium">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Wellness Resources
                    </h3>
                    <div className="space-y-1">
                        {resources.map(resource => {
                            const isActive = pathname === resource.href;
                            return (
                                <Link
                                    key={resource.href}
                                    href={resource.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                                            ? 'bg-purple-50 text-purple-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <span>{resource.icon}</span>
                                    <span className="text-sm">{resource.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Emergency Support */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🆘</span>
                        <h4 className="font-semibold text-red-900">Need Help Now?</h4>
                    </div>
                    <p className="text-sm text-red-800 mb-3">
                        If you&apos;re in crisis, help is available 24/7
                    </p>

                    <a
                        href="tel:988"
                        className="block w-full bg-red-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Call 988
                    </a>
                    <p className="text-xs text-red-700 mt-2 text-center">
                        Suicide & Crisis Lifeline
                    </p>
                </div>
            </div>
        </aside>
    );
}

