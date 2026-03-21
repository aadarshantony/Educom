import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/users/profile');
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put('/users/profile', profileData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token') || null, loading: false, error: null },
  reducers: {
    logout: (state) => { state.user = null; state.token = null; localStorage.removeItem('token'); },
    clearAuthError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (s) => { s.loading = true;  s.error = null; })
      .addCase(loginUser.fulfilled,  (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(loginUser.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(updateProfile.fulfilled,(s, a) => { s.user = a.payload.user; });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
