'use client';

import { useState, useEffect } from 'react';

const EXERCISES = [
    {
        id: '4-7-8',
        name: '4-7-8 Breathing',
        description: 'Calms the nervous system and reduces anxiety',
        pattern: [
            { phase: 'Breathe in', duration: 4, color: 'bg-blue-500' },
            { phase: 'Hold', duration: 7, color: 'bg-purple-500' },
            { phase: 'Breathe out', duration: 8, color: 'bg-green-500' },
        ],
    },
    {
        id: 'box',
        name: 'Box Breathing',
        description: 'Used by Navy SEALs to maintain calm under pressure',
        pattern: [
            { phase: 'Breathe in', duration: 4, color: 'bg-blue-500' },
            { phase: 'Hold', duration: 4, color: 'bg-purple-500' },
            { phase: 'Breathe out', duration: 4, color: 'bg-green-500' },
            { phase: 'Hold', duration: 4, color: 'bg-yellow-500' },
        ],
    },
    {
        id: 'coherent',
        name: 'Coherent Breathing',
        description: 'Balances your autonomic nervous system',
        pattern: [
            { phase: 'Breathe in', duration: 5, color: 'bg-blue-500' },
            { phase: 'Breathe out', duration: 5, color: 'bg-green-500' },
        ],
    },
];

export default function BreathingPage() {
    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [round, setRound] = useState(1);
    const totalRounds = 4;

    useEffect(() => {
        if (!isActive) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        // Move to next phase
        const nextPhase = (currentPhase + 1) % selectedExercise.pattern.length;
        if (nextPhase === 0) {
            if (round >= totalRounds) {
                setIsActive(false);
                setRound(1);
                return;
            }
            setRound(round + 1);
        }
        setCurrentPhase(nextPhase);
        setCountdown(selectedExercise.pattern[nextPhase].duration);
    }, [isActive, countdown, currentPhase, selectedExercise, round]);

    const startExercise = () => {
        setIsActive(true);
        setCurrentPhase(0);
        setCountdown(selectedExercise.pattern[0].duration);
        setRound(1);
    };

    const stopExercise = () => {
        setIsActive(false);
        setRound(1);
    };

    const currentPattern = selectedExercise.pattern[currentPhase];
    const progress = countdown / currentPattern.duration;
    const scaleValue = 0.5 + progress * 0.5;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Breathing Exercises</h1>
                <p className="text-gray-600 mt-2">
                    Controlled breathing can quickly reduce stress and anxiety
                </p>
            </div>

            {/* Exercise Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EXERCISES.map((exercise) => (
                    <button
                        key={exercise.id}
                        onClick={() => {
                            setSelectedExercise(exercise);
                            stopExercise();
                        }}
                        className={`
              p-4 rounded-xl border-2 transition-all text-left
              ${selectedExercise.id === exercise.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }
            `}
                    >
                        <h3 className="font-bold text-gray-900 mb-1">{exercise.name}</h3>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                    </button>
                ))}
            </div>

            {/* Breathing Visualizer */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {selectedExercise.name}
                </h2>

                {isActive ? (
                    <div className="space-y-8">
                        {/* Breathing Circle - Dynamic scaling for animation */}
                        <div className="flex items-center justify-center">
                            <div
                                className={`
                  w-64 h-64 rounded-full flex items-center justify-center transition-all duration-1000
                  ${currentPattern.color}
                `}
                                style={{ transform: `scale(${scaleValue})` } as React.CSSProperties}
                            >
                                <div className="text-center text-white">
                                    <p className="text-4xl font-bold mb-2">{countdown}</p>
                                    <p className="text-xl font-semibold">{currentPattern.phase}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="text-center">
                            <p className="text-lg text-gray-700">
                                Round {round} of {totalRounds}
                            </p>
                        </div>

                        <button
                            onClick={stopExercise}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                        >
                            Stop
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-700 mb-4">
                                {selectedExercise.description}
                            </p>
                            <p className="text-sm text-gray-600">
                                Complete {totalRounds} rounds for best results
                            </p>
                        </div>

                        <button
                            onClick={startExercise}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            Start Exercise
                        </button>

                        {/* Pattern Visualization */}
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Breathing Pattern:</h3>
                            <div className="flex items-center gap-2">
                                {selectedExercise.pattern.map((phase, idx) => (
                                    <div key={idx} className="flex-1 text-center">
                                        <div className={`h-16 ${phase.color} rounded-lg mb-2`} />
                                        <p className="text-xs text-gray-600">{phase.phase}</p>
                                        <p className="text-sm font-semibold text-gray-900">{phase.duration}s</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

