'use client';

import { useState, useEffect } from 'react';

const JOURNAL_PROMPTS = [
  {
    category: 'Gratitude',
    icon: '🙏',
    prompts: [
      'What are three things you&apos;re grateful for today?',
      'Who made a positive impact on your day?',
      'What small pleasure did you enjoy today?',
    ],
  },
  {
    category: 'Reflection',
    icon: '💭',
    prompts: [
      'What was the best part of your day?',
      'What challenged you today and how did you handle it?',
      'What did you learn about yourself today?',
    ],
  },
  {
    category: 'Emotional Check-in',
    icon: '❤️',
    prompts: [
      'How are you feeling right now?',
      'What emotions did you experience today?',
      'What do you need to feel better?',
    ],
  },
  {
    category: 'Growth',
    icon: '🌱',
    prompts: [
      'What\'s one thing you\'d like to improve?',
      'What progress have you made this week?',
      'What are you proud of yourself for?',
    ],
  },
  {
    category: 'Future Planning',
    icon: '🎯',
    prompts: [
      'What are you looking forward to tomorrow?',
      'What\'s one small goal for this week?',
      'How can you show yourself kindness tomorrow?',
    ],
  },
];

// Helper functions for localStorage
const getCompletedCategories = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem('journalCompletions');
  if (!stored) return {};

  const data = JSON.parse(stored);
  const lastReset = new Date(data.lastReset);
  const now = new Date();

  // Check if it's past midnight (12 AM)
  if (now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()) {
    // New day - reset completions
    localStorage.removeItem('journalCompletions');
    return {};
  }

  return data.completions || {};
};

const saveCompletedCategory = (category: string) => {
  if (typeof window === 'undefined') return;

  const completions = getCompletedCategories();
  completions[category] = true;

  localStorage.setItem('journalCompletions', JSON.stringify({
    completions,
    lastReset: new Date().toISOString(),
  }));
};

interface JournalHistoryEntry {
  _id: string;
  category: string;
  prompt: string;
  content: string;
  promptIndex: number;
  createdAt: string;
}

export default function JournalPage() {
  const [selectedCategory, setSelectedCategory] = useState(JOURNAL_PROMPTS[0]);
  const [journalEntry, setJournalEntry] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<Record<string, boolean>>({});
  const [historyView, setHistoryView] = useState<'weekly' | 'monthly'>('weekly');
  const [journalHistory, setJournalHistory] = useState<JournalHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryCategories, setSelectedHistoryCategories] = useState<string[]>(
    JOURNAL_PROMPTS.map(p => p.category)
  );
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [showPromptFilter, setShowPromptFilter] = useState(false);

  // Load completed categories on mount
  useEffect(() => {
    setCompletedCategories(getCompletedCategories());
    loadJournalHistory();
  }, []);

  // Load journal history
  const loadJournalHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/journal');
      const result = await response.json();

      if (result.success) {
        setJournalHistory(result.data);
      }
    } catch (error) {
      console.error('Error loading journal history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Check if current category is completed
  const isCurrentCategoryComplete = completedCategories[selectedCategory.category] || false;

  const handleSave = async () => {
    if (!journalEntry.trim()) return;

    try {
      // Save to database
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory.category,
          prompt: selectedCategory.prompts[currentPrompt],
          content: journalEntry,
          promptIndex: currentPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save journal entry');
      }

      // Clear entry
      setJournalEntry('');

      // Reload history to show new entry
      loadJournalHistory();

      // Check if this was the last prompt
      if (currentPrompt === selectedCategory.prompts.length - 1) {
        // All prompts completed - show celebration!
        setShowCelebration(true);
      } else {
        // Move to next prompt without celebration
        setCurrentPrompt(currentPrompt + 1);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    }
  };

  const closeCelebration = () => {
    setShowCelebration(false);

    // Mark this category as completed
    saveCompletedCategory(selectedCategory.category);
    setCompletedCategories(getCompletedCategories());
  };

  const handleRestart = () => {
    setCurrentPrompt(0);
    setJournalEntry('');
  };

  const handleCategoryChange = (category: typeof JOURNAL_PROMPTS[0]) => {
    setSelectedCategory(category);
    setCurrentPrompt(0);
    setJournalEntry('');
  };

  // Toggle category selection
  const toggleHistoryCategory = (category: string) => {
    if (selectedHistoryCategories.includes(category)) {
      setSelectedHistoryCategories(selectedHistoryCategories.filter(c => c !== category));
    } else {
      setSelectedHistoryCategories([...selectedHistoryCategories, category]);
    }
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedHistoryCategories(JOURNAL_PROMPTS.map(p => p.category));
    setSelectedPrompts([]);
  };

  // Toggle prompt selection
  const togglePrompt = (prompt: string) => {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts(selectedPrompts.filter(p => p !== prompt));
    } else {
      setSelectedPrompts([...selectedPrompts, prompt]);
    }
  };

  // Select all prompts for currently selected categories
  const selectAllPrompts = () => {
    const allPrompts = JOURNAL_PROMPTS
      .filter(cat => selectedHistoryCategories.includes(cat.category))
      .flatMap(cat => cat.prompts);
    setSelectedPrompts(allPrompts);
  };

  // Clear all prompt filters
  const clearAllPrompts = () => {
    setSelectedPrompts([]);
  };

  // Get available prompts based on selected categories
  const getAvailablePrompts = () => {
    return JOURNAL_PROMPTS
      .filter(cat => selectedHistoryCategories.includes(cat.category))
      .map(cat => ({
        category: cat.category,
        icon: cat.icon,
        prompts: cat.prompts,
      }));
  };

  // Filter entries based on weekly/monthly view, selected categories, and selected prompts
  const getFilteredEntries = () => {
    const now = new Date();
    const filtered = journalHistory.filter(entry => {
      const entryDate = new Date(entry.createdAt);

      // Time filter
      let withinTimeRange = false;
      if (historyView === 'weekly') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        withinTimeRange = entryDate >= weekAgo;
      } else {
        // Last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        withinTimeRange = entryDate >= monthAgo;
      }

      // Category filter
      const inSelectedCategory = selectedHistoryCategories.includes(entry.category);

      // Prompt filter (only apply if prompts are selected)
      const inSelectedPrompt = selectedPrompts.length === 0 || selectedPrompts.includes(entry.prompt);

      return withinTimeRange && inSelectedCategory && inSelectedPrompt;
    });

    return filtered;
  };

  // Group entries by date
  const groupedEntries = getFilteredEntries().reduce((groups, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, JournalHistoryEntry[]>);

  return (
    <>
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center transform animate-bounce-in shadow-2xl">
            {/* Animated Character */}
            <div className="mb-6 relative">
              <div className="text-8xl animate-celebration inline-block">
                📝
              </div>
              {/* Confetti Effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl absolute animate-confetti-1">🎉</span>
                <span className="text-4xl absolute animate-confetti-2">✨</span>
                <span className="text-4xl absolute animate-confetti-3">⭐</span>
                <span className="text-4xl absolute animate-confetti-4">💫</span>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Great Job! 🎊
            </h2>
            <p className="text-gray-600 mb-6">
              Your journal entry has been saved successfully. Keep up the amazing work on your mental health journey!
            </p>

            {/* OK Button */}
            <button
              onClick={closeCelebration}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Prompts</h1>
          <p className="text-gray-600 mt-2">
            Guided journaling to process emotions and track your mental health journey
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {JOURNAL_PROMPTS.map((category) => {
            const isCategoryCompleted = completedCategories[category.category] || false;
            return (
              <button
                key={category.category}
                onClick={() => handleCategoryChange(category)}
                className={`
                p-4 rounded-xl border-2 transition-all text-center relative
                ${selectedCategory.category === category.category
                    ? 'border-purple-600 bg-purple-50'
                    : isCategoryCompleted
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }
              `}
              >
                {isCategoryCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-semibold text-gray-900">{category.category}</div>
              </button>
            );
          })}
        </div>

        {/* Journal Writing Area */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedCategory.icon} {selectedCategory.category}
            </h2>

            {isCurrentCategoryComplete ? (
              /* Completion Screen - Shown until midnight */
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  All Done for Today!
                </h3>
                <p className="text-gray-600 mb-2">
                  You&apos;ve completed all {selectedCategory.prompts.length} prompts for {selectedCategory.category}.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This will reset at midnight (12:00 AM) so you can journal again tomorrow.
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <button
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Restart Questions (Answer Again)
                  </button>
                  <p className="text-xs text-gray-500">
                    You can answer multiple times if you&apos;d like!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentPrompt + 1} of {selectedCategory.prompts.length}
                  </span>
                  <div className="flex gap-2">
                    {selectedCategory.prompts.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${idx < currentPrompt
                          ? 'bg-green-500'
                          : idx === currentPrompt
                            ? 'bg-purple-600 ring-2 ring-purple-300'
                            : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current Prompt */}
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg mb-6">
                  <p className="text-lg text-gray-900 font-medium">
                    {selectedCategory.prompts[currentPrompt]}
                  </p>
                </div>

                {/* Text Area */}
                <div>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Start writing... your thoughts are private and encrypted 🔒"
                    className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none text-gray-900"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {journalEntry.length} characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setJournalEntry('')}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!journalEntry.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentPrompt === selectedCategory.prompts.length - 1 ? 'Complete' : 'Save & Continue'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tips Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Journaling Tips</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Write freely without judgment - there are no wrong answers</li>
            <li>• Be honest with yourself about your feelings</li>
            <li>• Try to journal at the same time each day</li>
            <li>• Review past entries to track patterns and progress</li>
            <li>• Your entries are completely private and encrypted</li>
          </ul>
        </div>

        {/* Journal History Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📚 Your Journal History</h2>

            {/* Weekly/Monthly Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setHistoryView('weekly')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historyView === 'weekly'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setHistoryView('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historyView === 'monthly'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Filter by Category:
              </span>
              <button
                onClick={selectAllCategories}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Select All Categories
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_PROMPTS.map((category) => {
                const isSelected = selectedHistoryCategories.includes(category.category);
                return (
                  <button
                    key={category.category}
                    onClick={() => toggleHistoryCategory(category.category)}
                    className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-medium
                    ${isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                  `}
                  >
                    <span className="text-sm">{category.icon}</span>
                    <span>{category.category}</span>
                    {isSelected && <span className="text-purple-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Filter - Second Layer */}
          {selectedHistoryCategories.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowPromptFilter(!showPromptFilter)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider hover:text-purple-600 transition-colors"
                >
                  <span>Filter by Question:</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showPromptFilter ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="flex gap-2">
                  {selectedPrompts.length > 0 && (
                    <button
                      onClick={clearAllPrompts}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={selectAllPrompts}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Select All Questions
                  </button>
                </div>
              </div>

              {showPromptFilter && (
                <div className="space-y-3 mt-3">
                  {getAvailablePrompts().map((categoryData) => (
                    <div key={categoryData.category} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <span>{categoryData.icon}</span>
                        <span>{categoryData.category}</span>
                      </h4>
                      <div className="space-y-1.5 ml-5">
                        {categoryData.prompts.map((prompt, idx) => {
                          const isSelected = selectedPrompts.includes(prompt);
                          return (
                            <button
                              key={idx}
                              onClick={() => togglePrompt(prompt)}
                              className={`
                              w-full text-left px-3 py-2 rounded-md border transition-all text-xs
                              ${isSelected
                                  ? 'border-purple-400 bg-purple-50 text-purple-800'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                                }
                            `}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-purple-600 font-bold">{idx + 1}.</span>
                                <span className="flex-1">{prompt}</span>
                                {isSelected && <span className="text-purple-600">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filter Summary */}
              {selectedPrompts.length > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">Filtering by {selectedPrompts.length} question{selectedPrompts.length !== 1 ? 's' : ''}</span>
                    {' '}from selected categories
                  </p>
                </div>
              )}
            </div>
          )}

          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-3 text-sm">Loading...</p>
            </div>
          ) : Object.keys(groupedEntries).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📖</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No entries found
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedHistoryCategories.length === 0
                  ? 'Select at least one category to view entries'
                  : 'Start journaling to see your entries here!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                  {/* Date Header - Compact */}
                  <div className="sticky top-0 bg-white z-10 pb-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-purple-600">📅</span>
                      {new Date(entries[0].createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h3>
                  </div>

                  {/* Entries for this date - Compact */}
                  <div className="space-y-2 ml-4">
                    {entries.map((entry) => {
                      const categoryData = JOURNAL_PROMPTS.find(p => p.category === entry.category);
                      return (
                        <div
                          key={entry._id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-all"
                        >
                          {/* Category Badge - Compact */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-base">{categoryData?.icon || '📝'}</span>
                            <span className="text-xs font-semibold text-purple-700">
                              {entry.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              • {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Prompt - Compact */}
                          <p className="text-xs font-medium text-gray-600 mb-1.5 leading-tight">
                            {entry.prompt}
                          </p>

                          {/* Content - Compact with line clamp */}
                          <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                            {entry.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes celebration {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        @keyframes confetti-1 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-100px, -100px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes confetti-2 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(100px, -100px) rotate(-360deg);
            opacity: 0;
          }
        }

        @keyframes confetti-3 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-100px, 100px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes confetti-4 {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(100px, 100px) rotate(-180deg);
            opacity: 0;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-celebration {
          animation: celebration 0.6s ease-in-out infinite;
        }

        .animate-confetti-1 {
          animation: confetti-1 1s ease-out forwards;
        }

        .animate-confetti-2 {
          animation: confetti-2 1s ease-out forwards;
        }

        .animate-confetti-3 {
          animation: confetti-3 1s ease-out forwards;
        }

        .animate-confetti-4 {
          animation: confetti-4 1s ease-out forwards;
        }
      `}</style>
    </>
  );
}

