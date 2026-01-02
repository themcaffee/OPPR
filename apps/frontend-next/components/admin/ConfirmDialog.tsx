'use client';

import { Modal } from './Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}
