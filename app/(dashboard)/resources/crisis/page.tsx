const CRISIS_RESOURCES = [
    {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        text: 'Text "HELLO" to 741741',
        available: '24/7',
        description: 'Free and confidential support for people in distress',
        color: 'border-red-600 bg-red-50',
    },
    {
        name: 'Crisis Text Line',
        text: 'Text "HOME" to 741741',
        available: '24/7',
        description: 'Text-based crisis support',
        color: 'border-orange-600 bg-orange-50',
    },
    {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        available: '24/7',
        description: 'Substance abuse and mental health services',
        color: 'border-blue-600 bg-blue-50',
    },
    {
        name: 'Trevor Project (LGBTQ+ Youth)',
        phone: '1-866-488-7386',
        text: 'Text "START" to 678678',
        available: '24/7',
        description: 'Crisis intervention for LGBTQ+ young people',
        color: 'border-purple-600 bg-purple-50',
    },
];

export default function CrisisPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h1 className="text-3xl font-bold text-red-900 mb-2">🆘 Crisis Support</h1>
                <p className="text-red-800">
                    If you&apos;re experiencing a mental health emergency, please reach out immediately.
                    Help is available 24/7.
                </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-yellow-900 mb-2">⚠️ When to Seek Immediate Help</h3>
                <ul className="space-y-2 text-yellow-800">
                    <li>• Thoughts of suicide or self-harm</li>
                    <li>• Plans or means to harm yourself</li>
                    <li>• Hearing voices or seeing things others don&apos;t</li>
                    <li>• Severe panic or anxiety attacks</li>
                    <li>• Extreme mood swings</li>
                    <li>• Loss of touch with reality</li>
                </ul>
            </div>

            <div className="space-y-4">
                {CRISIS_RESOURCES.map((resource, idx) => (
                    <div
                        key={idx}
                        className={`border-2 rounded-xl p-6 ${resource.color}`}
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.name}</h3>
                        <p className="text-gray-700 mb-4">{resource.description}</p>

                        <div className="space-y-2">
                            {resource.phone && (
                                <a
                                    href={`tel:${resource.phone}`}
                                    className="block bg-white px-4 py-3 rounded-lg font-semibold text-center hover:shadow-md transition-shadow"
                                >
                                    📞 Call: {resource.phone}
                                </a>
                            )}
                            {resource.text && (
                                <div className="bg-white px-4 py-3 rounded-lg text-center">
                                    💬 {resource.text}
                                </div>
                            )}
                            <p className="text-sm text-gray-600 text-center">
                                Available: {resource.available}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-3">Campus Resources</h3>
                <p className="text-blue-800 mb-4">
                    Your university likely offers free counseling services. Contact your student health center.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Find Campus Counseling
                </button>
            </div>
        </div>
    );
}

