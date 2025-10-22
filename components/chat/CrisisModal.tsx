'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CRISIS_RESOURCES } from '@/lib/services/crisis-detection';

interface CrisisModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export default function CrisisModal({ isOpen, onClose, message }: CrisisModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crisis Support" size="lg">
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">{message}</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>If you&apos;re in immediate danger, please call emergency services (911).</strong>
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Crisis Resources:</h4>
                    <div className="space-y-3">
                        {CRISIS_RESOURCES.map((resource, index) => (
                            <div
                                key={index}
                                className="bg-white border rounded-lg p-4"
                            >
                                <h5 className="font-medium text-gray-900">{resource.name}</h5>
                                <p className="text-primary-600 font-semibold mt-1">{resource.phone}</p>
                                <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                {resource.url && (
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary-600 hover:underline mt-2 inline-block"
                                    >
                                        Visit Website →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>I Understand</Button>
                </div>
            </div>
        </Modal>
    );
}

