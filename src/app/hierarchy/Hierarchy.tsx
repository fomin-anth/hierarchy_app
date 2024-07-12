'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  assignSupervisor,
  createUser,
  deleteUser,
  fetchUsers,
  setError,
  User,
  UserError,
  UsersState,
} from '@/app/store/userSlice';
import { useAppDispatch } from '../store';
import Button from '@/components/Button/Button';
import { TreeNode } from '@/components/TreeNode/TreeNode';
import styles from './hierarchy.module.scss';
import { Modal } from '@/components/Modal/Modal';
import { Form } from '@/components/Form/Form';
import { Input } from '@/components/Input/Input';
import { ContextMenu } from '@/components/ContextMenu/ContextMenu';

enum UserModals {
  CreateModal = 'CreateModal',
  ReassignModal = 'ReassignModal',
}

interface SelectedUser {
  userId: number;
  pos: { x: number; y: number };
}

const Hierarchy: React.FC = () => {
  const dispatch = useAppDispatch();
  const rootUsers = useSelector(
    (state: { users: UsersState }) => state.users.rootUsers,
  );

  const users = useSelector(
    (state: { users: UsersState }) => state.users.users,
  );

  const getUser = (userId?: number) => {
    if (typeof userId !== 'number') {
      return;
    }
    return users[userId];
  };

  const usersStatus = useSelector(
    (state: { users: UsersState }) => state.users.status,
  );

  const error = useSelector(
    (state: { users: UsersState }) => state.users.error,
  );

  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const closeContextMenu = () => {
    setSelectedUser(null);
  };

  const [openedModal, setOpenedModal] = useState<UserModals | null>(null);

  const closeModal = () => {
    setOpenedModal(null);
  };

  useEffect(() => {
    if (error === UserError.InternalError) {
      alert('Произошла непредвиденная ошибка');
      return;
    }
  }, [error]);

  useEffect(() => {
    if (usersStatus === 'idle') {
      void dispatch(fetchUsers());
    }
  }, [usersStatus, dispatch]);

  const getAllUserEmployeesIncludeNotDirect = (user?: User) => {
    if (!user) {
      return [];
    }
    const stack = [user];
    const allEmployeeIds: number[] = [];
    while (stack.length) {
      const user = stack.pop();
      user?.employees.forEach((u) => {
        stack.push(u);
        allEmployeeIds.push(u.id);
      });
    }
    return allEmployeeIds;
  };

  const getAccessibleSupervisors = (
    users: Record<number, User>,
    userId?: number,
  ) => {
    const user = getUser(userId);
    const allEmployeesIds = [
      user?.supervisorId,
      userId,
      ...getAllUserEmployeesIncludeNotDirect(user),
    ];
    return Object.values(users).filter((u) => !allEmployeesIds.includes(u.id));
  };

  const handleSelectNode = (
    event: React.MouseEvent<HTMLDivElement>,
    userId: number,
  ) => {
    event.preventDefault(); // Prevent default browser context menu
    setSelectedUser({
      userId,
      pos: { x: event.clientX, y: event.clientY },
    });
  };

  const handleDelete = async (id?: number) => {
    if (typeof id !== 'number') {
      setError(UserError.InternalError);
      return;
    }
    await dispatch(deleteUser(id));
  };

  const handleAssignSupervisor = async (
    userId?: number,
    supervisorId?: number,
  ) => {
    if (typeof userId !== 'number' || typeof supervisorId !== 'number') {
      setError(UserError.InternalError);
      return;
    }
    await dispatch(
      assignSupervisor({
        userId: userId,
        supervisorId: supervisorId,
      }),
    );
    setOpenedModal(null);
    closeContextMenu();
  };

  const handleCreateUser = async ({
    name,
    supervisorId,
  }: {
    name: string;
    supervisorId: string | null;
  }) => {
    await dispatch(
      createUser({
        name,
        supervisorId: supervisorId ? parseInt(supervisorId) : undefined,
      }),
    );
    setOpenedModal(null);
  };

  return (
    <>
      <ContextMenu
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
        }}
        position={selectedUser?.pos}
      >
        <button
          onClick={() =>
            void handleDelete(selectedUser?.userId).then(closeContextMenu)
          }
        >
          Удалить
        </button>
        <button
          onClick={() => {
            setOpenedModal(UserModals.ReassignModal);
          }}
        >
          Изменить руководителя
        </button>
      </ContextMenu>
      <Modal
        isOpen={openedModal === UserModals.CreateModal}
        onRequestClose={closeModal}
        contentLabel="Создание пользователя"
      >
        <Form<{ name: string; supervisorId: null | string }>
          initialValues={{ name: '', supervisorId: null }}
          onSubmit={(formData) => void handleCreateUser(formData)}
          submitButtonLabel="Создать"
        >
          <label className="flex flex-col mb-4">
            <span className="mb-1">Имя</span>
            <Input
              type="text"
              name="name"
              className="px-4 py-2 rounded border border-gray-300"
            />
          </label>
          <label className="flex flex-col mb-4">
            <span className="mb-1">Руководитель</span>
            <select
              className="p-2 bg-white border-1 border-2 rounded-md font-sans"
              name="supervisorId"
              defaultValue={undefined}
            >
              {[
                <option key={-1} value={undefined}>
                  Не назначать
                </option>,
                ...Object.values(users).map((u) => {
                  return (
                    <option value={u.id} key={u.id}>
                      {u.id} {u.name}
                    </option>
                  );
                }),
              ]}
            </select>
          </label>
        </Form>
      </Modal>
      <Modal
        isOpen={openedModal === UserModals.ReassignModal}
        onRequestClose={closeModal}
        contentLabel="Переназначить руководителя"
      >
        <Form<{ userId?: number; supervisorId: null | string }>
          initialValues={{ userId: selectedUser?.userId, supervisorId: null }}
          onSubmit={(formData) => {
            void handleAssignSupervisor(
              formData.userId,
              parseInt(formData.supervisorId ?? ''),
            );
          }}
          submitButtonLabel="Переназначить"
        >
          <span>
            Сотрудник: {selectedUser?.userId}{' '}
            {getUser(selectedUser?.userId)?.name}
          </span>
          <label className="flex flex-col mb-4">
            <span className="mb-1">Руководитель</span>
            <select
              className="p-2 bg-white border-1 border-2 rounded-md font-sans"
              name="supervisorId"
              defaultValue={undefined}
            >
              {getAccessibleSupervisors(users, selectedUser?.userId).map(
                (u) => {
                  return (
                    <option value={u.id} key={u.id}>
                      {u.id} {u.name}
                    </option>
                  );
                },
              )}
            </select>
          </label>
        </Form>
      </Modal>
      <div className="pt-20 flex flex-row justify-center items-start">
        <Button
          className="fixed right-10 top-5"
          onClick={() => {
            setOpenedModal(UserModals.CreateModal);
          }}
        >
          Добавить пользователя
        </Button>
        {rootUsers.map((user) => (
          <TreeNode
            key={user.id}
            className={`p-4 flex items-center justify-center ${styles['root-node']} ${styles['disable-lines']}`}
            user={user}
            onDelete={handleDelete}
            onAssignSupervisor={handleAssignSupervisor}
            onClick={handleSelectNode}
          />
        ))}
      </div>
    </>
  );
};

export default Hierarchy;
