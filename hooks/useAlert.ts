import { useState, useCallback } from 'react';

interface AlertOptions {
    title?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
}

export function useAlert() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [options, setOptions] = useState<AlertOptions>({});

    const showAlert = useCallback((msg: string, opts: AlertOptions = {}) => {
        setMessage(msg);
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const hideAlert = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        message,
        options,
        showAlert,
        hideAlert
    };
}

