import { useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

/**
 * Hook para gestionar alertas y confirmaciones personalizadas
 */
export const useAlert = () => {
  const [alert, setAlert] = useState(null);

  const showAlert = ({ title, message, type = 'info', onConfirm }) => {
    setAlert({ title, message, type, onConfirm });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const AlertComponent = alert ? (
    <AlertModal
      isOpen={true}
      onClose={closeAlert}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      onConfirm={alert.onConfirm}
    />
  ) : null;

  return { showAlert, closeAlert, AlertComponent };
};

/**
 * Componente de modal de alerta
 */
function AlertModal({ isOpen, onClose, title, message, type, onConfirm }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlay={false}
    >
      <div className="text-center">
        {getIcon()}
        {title && (
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {message && (
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        )}
        <div className="mt-6">
          <Button variant="primary" onClick={handleConfirm} fullWidth>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Hook para confirmaciones
 */
export const useConfirm = () => {
  const [confirm, setConfirm] = useState(null);

  const showConfirm = ({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, type = 'warning' }) => {
    return new Promise((resolve) => {
      setConfirm({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          resolve(true);
          setConfirm(null);
        },
        onCancel: () => {
          if (onCancel) onCancel();
          resolve(false);
          setConfirm(null);
        }
      });
    });
  };

  const closeConfirm = () => {
    setConfirm(null);
  };

  const ConfirmComponent = confirm ? (
    <ConfirmModal
      isOpen={true}
      onClose={closeConfirm}
      {...confirm}
    />
  ) : null;

  return { showConfirm, closeConfirm, ConfirmComponent };
};

/**
 * Componente de modal de confirmación
 */
function ConfirmModal({ isOpen, onClose, title, message, confirmText, cancelText, onConfirm, onCancel, type }) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="sm"
      showCloseButton={false}
      closeOnOverlay={false}
    >
      <div className="text-center">
        {getIcon()}
        {title && (
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {message && (
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        )}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={handleCancel} fullWidth>
            {cancelText}
          </Button>
          <Button 
            variant={type === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
