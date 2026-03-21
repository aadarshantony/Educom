import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchWishlist      = createAsyncThunk('wishlist/fetch',  async (_, { rejectWithValue }) => { try { const { data } = await axiosInstance.get('/wishlist'); return data.wishlist; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const toggleWishlist     = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => { try { const { data } = await axiosInstance.post('/wishlist/toggle', { productId }); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => { try { await axiosInstance.delete(`/wishlist/remove/${productId}`); return productId; } catch (err) { return rejectWithValue(err.response?.data?.message); } });

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending,   (s) => { s.loading = true; })
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.loading = false; s.items = a.payload || []; })
      .addCase(fetchWishlist.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(toggleWishlist.fulfilled, (s, a) => {
        if (a.payload.isInWishlist === false) {
          const id = a.meta.arg;
          s.items = s.items.filter((item) => (item._id || item) !== id);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (s, a) => {
        s.items = s.items.filter((item) => (item._id || item) !== a.payload);
      });
  },
});

export default wishlistSlice.reducer;
