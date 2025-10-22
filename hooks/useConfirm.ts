import { useState, useCallback } from 'react';

interface ConfirmOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [options, setOptions] = useState<ConfirmOptions>({});
    const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((msg: string, opts: ConfirmOptions = {}) => {
        return new Promise<boolean>((resolve) => {
            setMessage(msg);
            setOptions(opts);
            setIsOpen(true);
            setResolveCallback(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolveCallback) {
            resolveCallback(true);
        }
        setIsOpen(false);
        setResolveCallback(null);
    }, [resolveCallback]);

    const handleCancel = useCallback(() => {
        if (resolveCallback) {
            resolveCallback(false);
        }
        setIsOpen(false);
        setResolveCallback(null);
    }, [resolveCallback]);

    return {
        isOpen,
        message,
        options,
        confirm,
        handleConfirm,
        handleCancel
    };
}

