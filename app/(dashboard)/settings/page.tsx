'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        privacy: {
            profileVisibility: 'matches-only',
            showMoodHistory: false,
            showActiveStatus: true,
        },
        preferences: {
            emailNotifications: true,
            pushNotifications: false,
            weeklyDigest: true,
        },
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/user/settings');
            const result = await response.json();

            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setSaveMessage('');

            const response = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            const result = await response.json();

            if (result.success) {
                setSaveMessage('Settings saved successfully!');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                setSaveMessage('Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrivacyChange = (key: string, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [key]: value,
            },
        }));
    };

    const handlePreferenceChange = (key: string, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value,
            },
        }));
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                    <p className="text-gray-600 mt-4">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">
                    Manage your privacy and preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Privacy Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔒 Privacy Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Active Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Active Status
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Show when you&apos;re active on MindMate. When turned off, you won&apos;t see when others are active either.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4" aria-label="Toggle active status">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacy.showActiveStatus}
                                        onChange={(e) => handlePrivacyChange('showActiveStatus', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="Active status toggle"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Profile Visibility */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    Profile Visibility
                                </h3>
                                <select
                                    value={settings.privacy.profileVisibility}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    aria-label="Profile visibility"
                                    title="Profile visibility"
                                >
                                    <option value="public">Public - Everyone can see</option>
                                    <option value="matches-only">Matches Only</option>
                                    <option value="private">Private - Hidden</option>
                                </select>
                            </div>

                            {/* Show Mood History */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Show Mood History
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Allow matches to view your mood tracking history
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4" aria-label="Toggle mood history visibility">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacy.showMoodHistory}
                                        onChange={(e) => handlePrivacyChange('showMoodHistory', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="Show mood history toggle"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>🔔 Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Email Notifications
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Receive important updates via email
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4" aria-label="Toggle email notifications">
                                    <input
                                        type="checkbox"
                                        checked={settings.preferences.emailNotifications}
                                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="Email notifications toggle"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Weekly Digest
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Get a weekly summary of your mood and activities
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4" aria-label="Toggle weekly digest">
                                    <input
                                        type="checkbox"
                                        checked={settings.preferences.weeklyDigest}
                                        onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="Weekly digest toggle"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                        Save Settings
                    </Button>
                    {saveMessage && (
                        <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                            {saveMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

