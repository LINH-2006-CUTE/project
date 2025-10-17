import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Cấu trúc dữ liệu cho từng danh mục hàng tháng
interface MonthlyCategory {
  id: number;
  month: string;
  categories: {
    categoryId: number;
    budget: number;
  };
}

interface User {
  id?: number;
  fullname?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: boolean;
  status?: boolean;
  monthlyCategories?: MonthlyCategory[];
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
