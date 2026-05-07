import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  [key: string]: any;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  tokenType: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  tokenType: null,
  user: null,
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ token: string; tokenType: string; user: User }>) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.tokenType = action.payload.tokenType;
      state.user = action.payload.user;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.tokenType = null;
      state.user = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
});

export const { loginSuccess, logout, updateUser } = AuthSlice.actions;

export default AuthSlice.reducer;
