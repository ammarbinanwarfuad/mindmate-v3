'use client';

import { useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
}

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK'
}: AlertModalProps) {
    // Auto-close success messages after 3 seconds
    useEffect(() => {
        if (isOpen && type === 'success') {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, type, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success':
                return 'Success!';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            default:
                return 'Notice';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="text-center py-4">
                {getIcon()}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{getTitle()}</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
                <Button onClick={onClose} className="w-full sm:w-auto px-8">
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}

