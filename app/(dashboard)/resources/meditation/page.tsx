'use client';

import { useState } from 'react';

const MEDITATIONS = [
    {
        id: 'body-scan',
        title: 'Body Scan Meditation',
        duration: 10,
        description: 'Progressive relaxation through body awareness',
        steps: [
            'Find a comfortable position, sitting or lying down',
            'Close your eyes and take three deep breaths',
            'Starting with your toes, notice any sensations',
            'Slowly move your attention up through your feet, legs, torso',
            'Continue to your arms, shoulders, neck, and head',
            'Notice areas of tension without judgment',
            'Breathe into any tight areas, imagining them softening',
            'Take a moment to feel your whole body',
            'Slowly open your eyes when ready',
        ],
    },
    {
        id: 'mindful-breathing',
        title: 'Mindful Breathing',
        duration: 5,
        description: 'Simple awareness of breath',
        steps: [
            'Sit comfortably with your back straight',
            'Close your eyes or soften your gaze',
            'Notice the natural rhythm of your breath',
            'Feel the air entering through your nose',
            'Notice your chest and belly rising',
            'Feel the breath leaving your body',
            'When your mind wanders, gently return to the breath',
            'Continue for 5 minutes',
            'End by taking three deep breaths',
        ],
    },
    {
        id: 'loving-kindness',
        title: 'Loving-Kindness Meditation',
        duration: 15,
        description: 'Cultivate compassion for yourself and others',
        steps: [
            'Sit comfortably and close your eyes',
            'Think of yourself and silently say: "May I be happy"',
            'Continue: "May I be healthy, May I be safe, May I live with ease"',
            'Now think of someone you love, repeat the phrases for them',
            'Think of a neutral person, offer them the same wishes',
            'Think of someone you find difficult, try offering them kindness',
            'Extend your wishes to all beings everywhere',
            'Notice how you feel',
            'Slowly open your eyes',
        ],
    },
];

export default function MeditationPage() {
    const [selectedMeditation, setSelectedMeditation] = useState(MEDITATIONS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const startMeditation = () => {
        setIsPlaying(true);
        setCurrentStep(0);
        playSteps();
    };

    const playSteps = () => {
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step >= selectedMeditation.steps.length) {
                clearInterval(interval);
                setIsPlaying(false);
                setCurrentStep(0);
            } else {
                setCurrentStep(step);
            }
        }, (selectedMeditation.duration * 60 * 1000) / selectedMeditation.steps.length);
        setTimer(interval);
    };

    const stopMeditation = () => {
        if (timer) clearInterval(timer);
        setIsPlaying(false);
        setCurrentStep(0);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Guided Meditation</h1>
                <p className="text-gray-600 mt-2">
                    Regular meditation can reduce stress, improve focus, and enhance emotional well-being
                </p>
            </div>

            {/* Meditation Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MEDITATIONS.map((meditation) => (
                    <button
                        key={meditation.id}
                        onClick={() => {
                            setSelectedMeditation(meditation);
                            stopMeditation();
                        }}
                        className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${selectedMeditation.id === meditation.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }
            `}
                    >
                        <h3 className="font-bold text-gray-900 mb-1">{meditation.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{meditation.description}</p>
                        <span className="text-xs text-purple-600 font-medium">
                            {meditation.duration} minutes
                        </span>
                    </button>
                ))}
            </div>

            {/* Meditation Player */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMeditation.title}
                </h2>
                <p className="text-gray-600 mb-6">{selectedMeditation.description}</p>

                {!isPlaying ? (
                    <button
                        onClick={startMeditation}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        Start Meditation ({selectedMeditation.duration} min)
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 shadow-md">
                            <p className="text-gray-500 text-sm mb-2">
                                Step {currentStep + 1} of {selectedMeditation.steps.length}
                            </p>
                            <p className="text-xl text-gray-900 leading-relaxed">
                                {selectedMeditation.steps[currentStep]}
                            </p>
                        </div>
                        <button
                            onClick={stopMeditation}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                        >
                            Stop
                        </button>
                    </div>
                )}

                {/* Steps Preview */}
                {!isPlaying && (
                    <div className="mt-6 space-y-2">
                        <h3 className="font-semibold text-gray-900 mb-3">Steps:</h3>
                        {selectedMeditation.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-3 text-sm text-gray-600">
                                <span className="text-purple-600 font-medium">{idx + 1}.</span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

