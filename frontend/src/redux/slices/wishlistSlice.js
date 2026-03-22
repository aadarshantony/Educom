import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/wishlist');
      return data.wishlist;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axiosInstance.post('/wishlist/toggle', { productId });

      // After any toggle, re-fetch the full wishlist so the items array
      // has complete product objects (not just IDs) and stays in sync.
      dispatch(fetchWishlist());

      return data; // { isInWishlist, wishlist }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.delete(`/wishlist/remove/${productId}`);
      dispatch(fetchWishlist());
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending,   (s) => { s.loading = true; })
      .addCase(fetchWishlist.fulfilled, (s, a) => {
        s.loading = false;
        s.items   = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchWishlist.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload;
      });

    // toggleWishlist — state is refreshed by the fetchWishlist dispatch inside the thunk.
    // We just need to handle the loading flag here.
    builder
      .addCase(toggleWishlist.pending,  (s) => { s.loading = true; })
      .addCase(toggleWishlist.fulfilled,(s) => { s.loading = false; })
      .addCase(toggleWishlist.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

    // removeFromWishlist — also refreshes via fetchWishlist inside the thunk.
    builder
      .addCase(removeFromWishlist.pending,  (s) => { s.loading = true; })
      .addCase(removeFromWishlist.fulfilled,(s) => { s.loading = false; })
      .addCase(removeFromWishlist.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export default wishlistSlice.reducer;