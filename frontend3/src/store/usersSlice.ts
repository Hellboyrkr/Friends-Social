import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { linkUsers, unlinkUsers } from '../api/relationships';
import { User, UserInput } from '../types';
import { AppDispatch } from './index';
import { edgeAdded, edgeRemoved, userPatched } from './graphSlice';

type UsersState = {
  items: User[];
  selectedId?: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
};

const initialState: UsersState = {
  items: [],
  status: 'idle'
};

/* -------------------- Thunks -------------------- */

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  return await getUsers();
});

export const addUser = createAsyncThunk('users/add', async (input: UserInput) => {
  return await createUser(input);
});

export const editUser = createAsyncThunk(
  'users/edit',
  async ({ id, patch }: { id: string; patch: Partial<UserInput> }) => {
    return await updateUser(id, patch);
  }
);

export const removeUser = createAsyncThunk('users/remove', async (id: string) => {
  await deleteUser(id);
  return id;
});

/**
 * Connect two users by ids (A ↔ B)
 * Uses existing API helpers and immediately reflects in graph via edgeAdded.
 */
export const connectUsers = (aId: string, bId: string) => async (dispatch: AppDispatch) => {
  await linkUsers(aId, bId);
  dispatch(edgeAdded({ id: `${aId}-${bId}`, source: aId, target: bId, type: 'default' } as any));
  toast.success('Users connected');
};

/**
 * Disconnect two users by ids (A ✕ B)
 * Uses existing API helpers and immediately reflects in graph via edgeRemoved.
 */
export const disconnectUsers = (aId: string, bId: string) => async (dispatch: AppDispatch) => {
  await unlinkUsers(aId, bId);
  dispatch(edgeRemoved({ id: `${aId}-${bId}` }));
  toast.success('Connection removed');
};

/**
 * Add a hobby by chip id (e.g. 'h3') OR custom id (e.g. 'custom-hiking')
 * and send hobby names (strings) to the backend.
 */
const ID_TO_NAME: Record<string, string> = {
  h1: 'Cycling',
  h2: 'Gaming',
  h3: 'Cooking',
  h4: 'Reading',
  h5: 'Music',
};

export const addHobbyToUser =
  (userId: string, hobbyId: string) =>
  async (dispatch: AppDispatch, getState: () => any) => {
    const state = getState();
    const user: User | undefined = state.users.items.find((u: User) => u.id === userId);
    if (!user) return;

    // Convert incoming id to a name; for custom ids, prefer the existing Hobby object name
    const nameFromId = ID_TO_NAME[hobbyId];
    let nameToAdd: string | undefined = nameFromId;
    if (!nameToAdd) {
      // try to locate the hobby in Sidebar slice by id
      const found = state.hobbies.items.find((h: any) => h.id === hobbyId);
      if (found) nameToAdd = found.name;
    }
    if (!nameToAdd) {
      // last resort: if id was actually a name, accept it
      nameToAdd = hobbyId;
    }

    const currentNames = new Set(
      (user.hobbies ?? [])
        .filter(Boolean)
        .map((h: any) => (typeof h === 'string' ? h : h.name))
    );
    if (currentNames.has(nameToAdd)) {
      toast('Hobby already added');
      return;
    }

    const nextNames = [...currentNames, nameToAdd];
    try {
      const updated = await dispatch(editUser({ id: userId, patch: { hobbies: nextNames } })).unwrap();
      dispatch(syncGraphAfterEdit(updated)); // updates node + UI list
      toast.success('Hobby added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add hobby');
    }
  };

/* -------------------- Slice -------------------- */

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string | undefined>) => {
      state.selectedId = action.payload;
    },
    reflectUser: (state, action: PayloadAction<User>) => {
      const idx = state.items.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUsers.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchUsers.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message; })

      .addCase(addUser.fulfilled, (s, a) => { s.items.push(a.payload); toast.success('User created'); })
      .addCase(editUser.fulfilled, (s, a) => {
        const idx = s.items.findIndex((u) => u.id === a.payload.id);
        if (idx >= 0) s.items[idx] = a.payload;
        toast.success('User updated');
      })
      .addCase(removeUser.fulfilled, (s, a) => {
        s.items = s.items.filter((u) => u.id !== a.payload);
        toast.success('User deleted');
      });
  }
});

export const { selectUser, reflectUser } = usersSlice.actions;

export const syncGraphAfterEdit = (user: User) => (dispatch: AppDispatch) => {
  dispatch(userPatched(user));
  dispatch(reflectUser(user));
};

export default usersSlice.reducer;
