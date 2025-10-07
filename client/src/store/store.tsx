import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';      // quản lý 1 user (đăng nhập)
import usersReducer from '../features/usersSlice';    // quản lý danh sách user

const store = configureStore({
  reducer: {
    user: userReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
