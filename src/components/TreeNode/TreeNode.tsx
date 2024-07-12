import { User } from '@/app/store/userSlice';
import React from 'react';
import styles from './tree-node.module.scss';
import Image from 'next/image';

interface TreeNodeProps {
  className?: string;
  user: User;
  onDelete: (id: number) => Promise<void>;
  onAssignSupervisor: (id: number) => Promise<void>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>, userId: number) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  user,
  onDelete,
  onAssignSupervisor,
  className,
  onClick,
}) => (
  <div
    key={user.id}
    className={`flex flex-col items-center ${className ?? ''} ${styles.root} ${styles['node-lines']} ${styles.node}`}
  >
    <div
      onClick={(event) => onClick?.(event, user.id)}
      className="border-black border-2 rounded-lg"
    >
      <div
        className={`absolute inline-block border-2 border-black rounded-3xl bg-white ${styles.icon}`}
      >
        <Image
          width={35}
          height={35}
          src={'/employee.svg'}
          className="flex items-center justify-center"
          alt={'man'}
        />
      </div>
      <div className="pl-10 pr-10 pb-5 pt-10">{user.name}</div>
    </div>

    {user.employees.length > 0 && (
      <div
        className={`flex flex-row align-middle justify-center ${styles['children-container']}`}
      >
        {user.employees.map((employee: User) => (
          <TreeNode
            key={employee.id}
            user={employee}
            onDelete={onDelete}
            onAssignSupervisor={onAssignSupervisor}
            onClick={onClick}
          />
        ))}
      </div>
    )}
  </div>
);
