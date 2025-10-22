'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AlertModal from '@/components/ui/AlertModal';
import { useAlert } from '@/hooks/useAlert';
import { Pencil, Plus, Trash2, Camera, X, Briefcase, GraduationCap } from 'lucide-react';

interface Education {
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

interface Experience {
    company: string;
    title: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
}

interface Profile {
    name: string;
    headline?: string;
    bio?: string;
    about?: string;
    profilePicture?: string;
    coverPhoto?: string;
    university?: string;
    year?: number;
    anonymous: boolean;
    education?: Education[];
    experience?: Experience[];
}

export default function ProfilePage() {
    const { isOpen, message, options, showAlert, hideAlert } = useAlert();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);

    // Modal states
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
    const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch('/api/user/profile', {
                cache: 'no-store',
            });
            const result = await response.json();

            if (result.success) {
                setProfile(result.data.profile);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (field: string) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile?.name,
                    headline: profile?.headline,
                    university: profile?.university,
                    year: profile?.year,
                    bio: profile?.bio,
                    about: profile?.about,
                    anonymous: profile?.anonymous,
                    education: profile?.education,
                    experience: profile?.experience,
                }),
            });

            if (response.ok) {
                setEditMode(null);
                showAlert('Profile updated successfully!', { type: 'success' });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showAlert('Failed to update profile', { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file', { type: 'warning' });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert('Image size must be less than 2MB', { type: 'warning' });
            return;
        }

        setIsUploadingImage(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Image = reader.result as string;
                    const response = await fetch('/api/user/profile-picture', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        await loadProfile();
                        showAlert('Profile picture updated successfully!', { type: 'success' });
                        window.dispatchEvent(new Event('profilePictureUpdated'));
                    } else {
                        showAlert(result.error || 'Failed to upload image', { type: 'error' });
                    }
                } catch (error) {
                    showAlert('Failed to upload image', { type: 'error' });
                } finally {
                    setIsUploadingImage(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to upload image:', error);
            setIsUploadingImage(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file', { type: 'warning' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size must be less than 5MB', { type: 'warning' });
            return;
        }

        setIsUploadingCover(true);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Image = reader.result as string;
                    const response = await fetch('/api/user/cover-photo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        await loadProfile();
                        showAlert('Cover photo updated successfully!', { type: 'success' });
                    } else {
                        showAlert(result.error || 'Failed to upload cover photo', { type: 'error' });
                    }
                } catch (error) {
                    showAlert('Failed to upload cover photo', { type: 'error' });
                } finally {
                    setIsUploadingCover(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to upload cover photo:', error);
            setIsUploadingCover(false);
        }
    };

    const handleRemoveCover = async () => {
        if (!confirm('Are you sure you want to remove your cover photo?')) {
            return;
        }

        setIsUploadingCover(true);

        try {
            const response = await fetch('/api/user/cover-photo', {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadProfile();
                showAlert('Cover photo removed successfully!', { type: 'success' });
            }
        } catch (error) {
            console.error('Failed to remove cover photo:', error);
            showAlert('Failed to remove cover photo', { type: 'error' });
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleAddEducation = () => {
        setCurrentEducation({
            school: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            description: '',
        });
        setEditingIndex(null);
        setShowEducationModal(true);
    };

    const handleEditEducation = (index: number) => {
        setCurrentEducation(profile?.education?.[index] || null);
        setEditingIndex(index);
        setShowEducationModal(true);
    };

    const handleSaveEducation = () => {
        if (!currentEducation?.school) {
            showAlert('School name is required', { type: 'warning' });
            return;
        }

        const updatedEducation = [...(profile?.education || [])];
        if (editingIndex !== null) {
            updatedEducation[editingIndex] = currentEducation;
        } else {
            updatedEducation.push(currentEducation);
        }

        setProfile({ ...profile!, education: updatedEducation });
        setShowEducationModal(false);
        setCurrentEducation(null);
        setEditingIndex(null);
    };

    const handleDeleteEducation = (index: number) => {
        if (!confirm('Are you sure you want to delete this education entry?')) {
            return;
        }

        const updatedEducation = [...(profile?.education || [])];
        updatedEducation.splice(index, 1);
        setProfile({ ...profile!, education: updatedEducation });
    };

    const handleAddExperience = () => {
        setCurrentExperience({
            company: '',
            title: '',
            employmentType: '',
            location: '',
            startDate: '',
            endDate: '',
            currentlyWorking: false,
            description: '',
        });
        setEditingIndex(null);
        setShowExperienceModal(true);
    };

    const handleEditExperience = (index: number) => {
        setCurrentExperience(profile?.experience?.[index] || null);
        setEditingIndex(index);
        setShowExperienceModal(true);
    };

    const handleSaveExperience = () => {
        if (!currentExperience?.company || !currentExperience?.title) {
            showAlert('Company and title are required', { type: 'warning' });
            return;
        }

        const updatedExperience = [...(profile?.experience || [])];
        if (editingIndex !== null) {
            updatedExperience[editingIndex] = currentExperience;
        } else {
            updatedExperience.push(currentExperience);
        }

        setProfile({ ...profile!, experience: updatedExperience });
        setShowExperienceModal(false);
        setCurrentExperience(null);
        setEditingIndex(null);
    };

    const handleDeleteExperience = (index: number) => {
        if (!confirm('Are you sure you want to delete this experience entry?')) {
            return;
        }

        const updatedExperience = [...(profile?.experience || [])];
        updatedExperience.splice(index, 1);
        setProfile({ ...profile!, experience: updatedExperience });
    };

    if (isLoading) {
        return <div className="text-center py-12">Loading profile...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-8">
            {/* Cover Photo Section */}
            <div className="relative bg-white rounded-t-xl overflow-hidden shadow-sm">
                <div className="relative h-64 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
                    {profile?.coverPhoto && (
                        <img
                            src={profile.coverPhoto}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                            aria-label="Upload cover photo"
                        />
                        <button
                            onClick={() => coverInputRef.current?.click()}
                            disabled={isUploadingCover}
                            className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                            title="Change cover photo"
                        >
                            <Camera className="w-5 h-5 text-gray-700" />
                        </button>
                        {profile?.coverPhoto && (
                            <button
                                onClick={handleRemoveCover}
                                disabled={isUploadingCover}
                                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                                title="Remove cover photo"
                            >
                                <X className="w-5 h-5 text-red-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Picture and Header Info */}
                <div className="px-8 pb-6">
                    <div className="relative -mt-20 mb-4">
                        <div className="relative inline-block">
                            {profile?.profilePicture ? (
                                <img
                                    src={profile.profilePicture}
                                    alt="Profile"
                                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
                                />
                            ) : (
                                <div className="w-40 h-40 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-xl">
                                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                aria-label="Upload profile picture"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                                title="Change profile picture"
                            >
                                <Camera className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                    </div>

                    {/* Name and Headline Section */}
                    <div className="space-y-2">
                        {editMode === 'header' ? (
                            <div className="space-y-3">
                                <Input
                                    value={profile?.name || ''}
                                    onChange={(e) => setProfile({ ...profile!, name: e.target.value })}
                                    placeholder="Your Name"
                                    className="text-2xl font-bold"
                                />
                                <Input
                                    value={profile?.headline || ''}
                                    onChange={(e) => setProfile({ ...profile!, headline: e.target.value })}
                                    placeholder="Professional headline (e.g., Student at XYZ University)"
                                    className="text-lg"
                                />
                                <div className="flex gap-2">
                                    <Button onClick={() => handleSave('header')} isLoading={isSaving}>
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditMode(null)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                                    <button
                                        onClick={() => setEditMode('header')}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        aria-label="Edit header"
                                    >
                                        <Pencil className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                                {profile?.headline && (
                                    <p className="text-lg text-gray-700 mt-1">{profile.headline}</p>
                                )}
                                {profile?.bio && (
                                    <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>About</CardTitle>
                    <button
                        onClick={() => setEditMode(editMode === 'about' ? null : 'about')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Edit about section"
                    >
                        <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                </CardHeader>
                <CardContent>
                    {editMode === 'about' ? (
                        <div className="space-y-3">
                            <Textarea
                                value={profile?.about || ''}
                                onChange={(e) => setProfile({ ...profile!, about: e.target.value })}
                                placeholder="Tell us about yourself..."
                                rows={6}
                            />
                            <div className="flex gap-2">
                                <Button onClick={() => handleSave('about')} isLoading={isSaving}>
                                    Save
                                </Button>
                                <Button variant="outline" onClick={() => setEditMode(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {profile?.about || 'No about information added yet.'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-gray-600" />
                        <CardTitle>Education</CardTitle>
                    </div>
                    <button
                        onClick={handleAddEducation}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Add education"
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                </CardHeader>
                <CardContent>
                    {profile?.education && profile.education.length > 0 ? (
                        <div className="space-y-4">
                            {profile.education.map((edu, index) => (
                                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                                            {edu.degree && (
                                                <p className="text-gray-700">
                                                    {edu.degree}
                                                    {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                                                </p>
                                            )}
                                            {(edu.startDate || edu.endDate) && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {edu.startDate} - {edu.endDate || 'Present'}
                                                </p>
                                            )}
                                            {edu.description && (
                                                <p className="text-gray-600 mt-2">{edu.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <button
                                                onClick={() => handleEditEducation(index)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                aria-label="Edit education"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEducation(index)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                aria-label="Delete education"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No education added yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Experience Section */}
            <Card className="mt-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                        <CardTitle>Experience</CardTitle>
                    </div>
                    <button
                        onClick={handleAddExperience}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Add experience"
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                </CardHeader>
                <CardContent>
                    {profile?.experience && profile.experience.length > 0 ? (
                        <div className="space-y-4">
                            {profile.experience.map((exp, index) => (
                                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                            <p className="text-gray-700">
                                                {exp.company}
                                                {exp.employmentType && ` · ${exp.employmentType}`}
                                            </p>
                                            {(exp.startDate || exp.endDate) && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {exp.startDate} -{' '}
                                                    {exp.currentlyWorking ? 'Present' : exp.endDate}
                                                </p>
                                            )}
                                            {exp.location && (
                                                <p className="text-sm text-gray-600">{exp.location}</p>
                                            )}
                                            {exp.description && (
                                                <p className="text-gray-600 mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <button
                                                onClick={() => handleEditExperience(index)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                aria-label="Edit experience"
                                            >
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExperience(index)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                aria-label="Delete experience"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No experience added yet.</p>
                    )}
                </CardContent>
            </Card>

            {/* Save Changes Button */}
            {(profile?.education || profile?.experience) && (
                <div className="mt-6 flex justify-end">
                    <Button onClick={() => handleSave('all')} isLoading={isSaving}>
                        Save All Changes
                    </Button>
                </div>
            )}

            {/* Education Modal */}
            {showEducationModal && (
                <Modal
                    isOpen={showEducationModal}
                    onClose={() => {
                        setShowEducationModal(false);
                        setCurrentEducation(null);
                        setEditingIndex(null);
                    }}
                    title={editingIndex !== null ? 'Edit Education' : 'Add Education'}
                >
                    <div className="space-y-4">
                        <Input
                            label="School *"
                            value={currentEducation?.school || ''}
                            onChange={(e) =>
                                setCurrentEducation({ ...currentEducation!, school: e.target.value })
                            }
                            placeholder="e.g., Harvard University"
                        />
                        <Input
                            label="Degree"
                            value={currentEducation?.degree || ''}
                            onChange={(e) =>
                                setCurrentEducation({ ...currentEducation!, degree: e.target.value })
                            }
                            placeholder="e.g., Bachelor's"
                        />
                        <Input
                            label="Field of Study"
                            value={currentEducation?.fieldOfStudy || ''}
                            onChange={(e) =>
                                setCurrentEducation({
                                    ...currentEducation!,
                                    fieldOfStudy: e.target.value,
                                })
                            }
                            placeholder="e.g., Computer Science"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="month"
                                value={currentEducation?.startDate || ''}
                                onChange={(e) =>
                                    setCurrentEducation({
                                        ...currentEducation!,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="End Date"
                                type="month"
                                value={currentEducation?.endDate || ''}
                                onChange={(e) =>
                                    setCurrentEducation({ ...currentEducation!, endDate: e.target.value })
                                }
                            />
                        </div>
                        <Textarea
                            label="Description"
                            value={currentEducation?.description || ''}
                            onChange={(e) =>
                                setCurrentEducation({
                                    ...currentEducation!,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Describe your education..."
                            rows={4}
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEducationModal(false);
                                    setCurrentEducation(null);
                                    setEditingIndex(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEducation}>Save</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Experience Modal */}
            {showExperienceModal && (
                <Modal
                    isOpen={showExperienceModal}
                    onClose={() => {
                        setShowExperienceModal(false);
                        setCurrentExperience(null);
                        setEditingIndex(null);
                    }}
                    title={editingIndex !== null ? 'Edit Experience' : 'Add Experience'}
                >
                    <div className="space-y-4">
                        <Input
                            label="Title *"
                            value={currentExperience?.title || ''}
                            onChange={(e) =>
                                setCurrentExperience({ ...currentExperience!, title: e.target.value })
                            }
                            placeholder="e.g., Software Engineer"
                        />
                        <Input
                            label="Company *"
                            value={currentExperience?.company || ''}
                            onChange={(e) =>
                                setCurrentExperience({ ...currentExperience!, company: e.target.value })
                            }
                            placeholder="e.g., Google"
                        />
                        <Input
                            label="Employment Type"
                            value={currentExperience?.employmentType || ''}
                            onChange={(e) =>
                                setCurrentExperience({
                                    ...currentExperience!,
                                    employmentType: e.target.value,
                                })
                            }
                            placeholder="e.g., Full-time, Part-time, Internship"
                        />
                        <Input
                            label="Location"
                            value={currentExperience?.location || ''}
                            onChange={(e) =>
                                setCurrentExperience({ ...currentExperience!, location: e.target.value })
                            }
                            placeholder="e.g., New York, NY"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="month"
                                value={currentExperience?.startDate || ''}
                                onChange={(e) =>
                                    setCurrentExperience({
                                        ...currentExperience!,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="End Date"
                                type="month"
                                value={currentExperience?.endDate || ''}
                                onChange={(e) =>
                                    setCurrentExperience({
                                        ...currentExperience!,
                                        endDate: e.target.value,
                                    })
                                }
                                disabled={currentExperience?.currentlyWorking}
                            />
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={currentExperience?.currentlyWorking || false}
                                onChange={(e) =>
                                    setCurrentExperience({
                                        ...currentExperience!,
                                        currentlyWorking: e.target.checked,
                                        endDate: e.target.checked ? '' : currentExperience?.endDate,
                                    })
                                }
                                className="rounded border-gray-300"
                                aria-label="I currently work here"
                            />
                            <span className="text-sm text-gray-700">I currently work here</span>
                        </label>
                        <Textarea
                            label="Description"
                            value={currentExperience?.description || ''}
                            onChange={(e) =>
                                setCurrentExperience({
                                    ...currentExperience!,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Describe your role and responsibilities..."
                            rows={4}
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowExperienceModal(false);
                                    setCurrentExperience(null);
                                    setEditingIndex(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSaveExperience}>Save</Button>
                        </div>
                    </div>
                </Modal>
            )}

            <AlertModal
                isOpen={isOpen}
                onClose={hideAlert}
                message={message}
                type={options.type}
                title={options.title}
                confirmText={options.confirmText}
            />
        </div>
    );
}
