import React, { ReactNode } from 'react';
import styles from './context-menu.module.scss';
import { PositionModal } from '@/components/Modal/PositionModal';

interface ContextMenuProps {
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  children,
  onClose,
  position,
}) => {
  const triangleSize = 20;

  return (
    <PositionModal
      isOpen={isOpen}
      onRequestClose={onClose}
      position={{ x: position?.x ?? 0, y: (position?.y ?? 0) + triangleSize }}
    >
      <div className={`${styles.root} ${styles['root__polygon-menu']}`}>
        <div className="flex flex-col justify-start items-start">
          {children}
        </div>
      </div>
    </PositionModal>
  );
};
