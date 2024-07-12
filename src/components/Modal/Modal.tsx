import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  contentLabel?: string;
  children?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  contentLabel,
  children,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-10 rounded-md shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur"
    >
      {contentLabel && <h1 className="pb-8">{contentLabel}</h1>}
      {children}
    </ReactModal>
  );
};
