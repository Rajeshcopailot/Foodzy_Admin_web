import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => {
  const modalRef = useRef(null);
  const deleteButtonRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      deleteButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content" ref={modalRef}>
        <div className="delete-modal-header">
          <h2>Delete Confirmation</h2>
          <button 
            className="delete-modal-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="delete-modal-body">
          <p>Are you sure you want to delete this menu item?</p>
          <div className="item-name">{itemName}</div>
          <p className="warning-text">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            This action cannot be undone
          </p>
        </div>

        <div className="delete-modal-footer">
          <button
            type="button"
            className="delete-modal-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            ref={deleteButtonRef}
            type="button"
            className="delete-modal-delete"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
