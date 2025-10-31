import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Xác nhận",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-700 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
