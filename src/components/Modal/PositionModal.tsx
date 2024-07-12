import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  position: { x: number; y: number };
  children?: ReactNode;
}

export const PositionModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  children,
  position,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={true}
      style={{ content: { left: position.x, top: position.y } }}
      className="absolute transform -translate-x-1/2 -translate-y-1 bg-white"
      overlayClassName="absolute inset-0 bg-transparent"
    >
      {children}
    </ReactModal>
  );
};
