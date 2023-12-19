import React from 'react';

/**
 * ModalAlert component represents a modal dialog box styled to mimic the look of a Windows 95 alert.
 * It includes a title bar with a close button and displays a message.
 *
 * @component
 * @param {Object} props - The props for the ModalAlert component.
 * @param {string} props.title - The title to be displayed on the modal's title bar.
 * @param {string} props.message - The message to be displayed inside the modal.
 * @param {Function} props.onClose - The function to call when the modal is requested to be closed.
 * @returns A React element representing the modal dialog.
 */

function AlertModal({ title, message, onClose }) {
  return (
    <div className="win95-modal">
      <div className="win95-modal-titlebar">
        <span className="title">{title}</span>
        <button className="close-button" onClick={onClose}>X</button>
      </div>
      <div className="win95-modal-body">
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default AlertModal;
