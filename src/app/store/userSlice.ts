import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getConfig } from '@/config/getConfig';

export interface User {
  id: number;
  name: string;
  supervisorId: number | null;
  employees: User[];
}

export interface HttpUser {
  id: number;
  name: string;
  supervisorId: number | null;
}

export enum UserError {
  NotFound = 'Not found',
  InternalError = 'Internal error',
}

export interface UsersState {
  rootUsers: User[];
  users: Record<number, User>;
  status: 'idle' | 'loading' | 'loaded';
  error: UserError | null;
}

const initialState: UsersState = {
  rootUsers: [],
  users: {},
  status: 'idle',
  error: null,
};

const { api_url } = getConfig();

const buildUserHierarchy = (
  users: HttpUser[],
): { rootUsers: User[]; userMap: Record<number, User> } => {
  const userMap: Record<number, User> = {};
  users.forEach((user) => {
    userMap[user.id] = {
      id: user.id,
      name: user.name,
      employees: [],
      supervisorId: user.supervisorId,
    };
  });

  const rootUsers: User[] = [];
  users.forEach((user) => {
    if (typeof user.supervisorId == 'number') {
      userMap[user.supervisorId].employees.push(userMap[user.id]);
    } else {
      rootUsers.push(userMap[user.id]);
    }
  });
  return { rootUsers, userMap };
};

export const fetchUsers = createAsyncThunk<{
  rootUsers: User[];
  userMap: Record<number, User>;
}>('users/fetchHierarchy', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ users: HttpUser[] }>(
      `${api_url}/user/hierarchy`,
    );
    const res = response.data;
    return buildUserHierarchy(res.users);
  } catch (error) {
    console.log(error);
    return rejectWithValue('Internal error');
  }
});

export const setError = createAsyncThunk(
  'users/setError',
  (error: UserError) => {
    return error;
  },
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (user: { name: string; supervisorId?: number }): Promise<HttpUser> => {
    const response = await axios.post<HttpUser>(`${api_url}/user`, user);
    return {
      id: response.data.id,
      name: response.data.name,
      supervisorId: response.data.supervisorId,
    };
  },
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number) => {
    await axios.delete(`${api_url}/user/${id.toString()}`);
    return id;
  },
);

export const assignSupervisor = createAsyncThunk(
  'users/assignSupervisor',
  async ({
    userId,
    supervisorId,
  }: {
    userId: number;
    supervisorId: number;
  }) => {
    await axios.patch(`${api_url}/user/${userId.toString()}/supervisor`);
    return { userId, supervisorId };
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.rootUsers = action.payload.rootUsers;
        state.users = action.payload.userMap;
      })
      .addCase(
        fetchUsers.rejected,
        (
          state,
          action: PayloadAction<
            unknown,
            string,
            { rejectedWithValue: boolean }
          >,
        ) => {
          state.error = action.payload as UserError;
        },
      )
      .addCase(createUser.fulfilled, (state, action) => {
        const newUser: User = {
          id: action.payload.id,
          name: action.payload.name,
          employees: [],
          supervisorId: action.payload.supervisorId,
        };
        state.users[action.payload.id] = newUser;
        if (typeof action.payload.supervisorId === 'number') {
          state.users[action.payload.supervisorId].employees.push(newUser);
          state.rootUsers = buildUserHierarchy(
            Object.values(state.users).map((u) => ({
              name: u.name,
              supervisorId: u.supervisorId,
              id: u.id,
            })),
          ).rootUsers;
        } else {
          state.rootUsers.push(newUser);
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;

        const { [userId]: _, ...rest } = state.users;
        const deletedUserSupervisor = _.supervisorId;
        const employeesOfRemoved = _.employees;
        employeesOfRemoved.forEach((e) => {
          state.users[e.id].supervisorId = deletedUserSupervisor;
        });
        state.users = rest;

        const { rootUsers, userMap } = buildUserHierarchy(
          Object.values(state.users).map((u) => ({
            name: u.name,
            supervisorId: u.supervisorId,
            id: u.id,
          })),
        );

        state.users = userMap;
        state.rootUsers = rootUsers;
      })
      .addCase(assignSupervisor.fulfilled, (state, action) => {
        const { userId, supervisorId } = action.payload;
        const user = state.users[userId];
        user.supervisorId = supervisorId;

        const { rootUsers, userMap } = buildUserHierarchy(
          Object.values(state.users).map((u) => ({
            name: u.name,
            supervisorId: u.supervisorId,
            id: u.id,
          })),
        );

        state.users = userMap;
        state.rootUsers = rootUsers;
      })
      .addCase(setError.fulfilled, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
