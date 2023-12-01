import React from "react";
import Modal from "react-modal";
import "../../../styles/DeleteConfirmationModal.css";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  firefighterName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  firefighterName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      contentLabel="Delete Confirmation Modal"
      ariaHideApp={false}
      className="delete-confirmation-modal"
    >
      <div>
        <h2>Delete Confirmation</h2>
        <p>
          Are you sure you want to delete the firefighter with name:{" "}
          {firefighterName || ""}?
        </p>
        <button className="cancelButton" onClick={onCancel}>
          Cancel
        </button>
        <button className="confirmButton" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
