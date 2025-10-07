import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  fullname: string;
  email: string;
  password: string;
  phone: string;
  gender: boolean;
  status: boolean;
}

interface UsersState {
  users: User[];
}

const initialState: UsersState = {
  users: [],
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = usersSlice.actions;
export default usersSlice.reducer;