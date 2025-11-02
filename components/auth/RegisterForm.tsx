'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/utils/validation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        try {
            setIsLoading(true);
            setError('');

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Registration failed');
                return;
            }

            router.push('/login?registered=true');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        {...register('name')}
                        label="Full Name"
                        placeholder="John Doe"
                        error={errors.name?.message}
                    />

                    <Input
                        {...register('email')}
                        type="email"
                        label="Email"
                        placeholder="your@email.com"
                        error={errors.email?.message}
                    />

                    <Input
                        {...register('password')}
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                    />

                    <Input
                        {...register('university')}
                        label="University (Optional)"
                        placeholder="Your University"
                        error={errors.university?.message}
                    />

                    <Input
                        {...register('year', { valueAsNumber: true })}
                        type="number"
                        label="Year (Optional)"
                        placeholder="1"
                        min="1"
                        max="7"
                        error={errors.year?.message}
                    />

                    <div className="space-y-2">
                        <label className="flex items-start">
                            <input
                                {...register('termsAccepted')}
                                type="checkbox"
                                className="mt-1 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                                I accept the{' '}
                                <Link href="/terms" className="text-primary-600 hover:underline">
                                    Terms & Conditions
                                </Link>
                            </span>
                        </label>
                        {errors.termsAccepted && (
                            <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
                        )}

                        <label className="flex items-start">
                            <input
                                {...register('privacyAccepted')}
                                type="checkbox"
                                className="mt-1 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                                I accept the{' '}
                                <Link href="/privacy" className="text-primary-600 hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.privacyAccepted && (
                            <p className="text-sm text-red-600">{errors.privacyAccepted.message}</p>
                        )}

                        <label className="flex items-start">
                            <input
                                {...register('ageConfirmed')}
                                type="checkbox"
                                className="mt-1 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                                I confirm that I am 18 years or older
                            </span>
                        </label>
                        {errors.ageConfirmed && (
                            <p className="text-sm text-red-600">{errors.ageConfirmed.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

