import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchCart      = createAsyncThunk('cart/fetch',  async (_, { rejectWithValue }) => { try { const { data } = await axiosInstance.get('/cart'); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const addToCart      = createAsyncThunk('cart/add',    async ({ productId, quantity = 1 }, { rejectWithValue }) => { try { const { data } = await axiosInstance.post('/cart/add', { productId, quantity }); return data.cart; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const updateCartItem = createAsyncThunk('cart/update', async ({ productId, quantity }, { rejectWithValue }) => { try { const { data } = await axiosInstance.patch('/cart/update', { productId, quantity }); return data.cart; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const removeFromCart = createAsyncThunk('cart/remove', async (productId, { rejectWithValue }) => { try { const { data } = await axiosInstance.delete(`/cart/remove/${productId}`); return data.cart; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const clearCartAPI   = createAsyncThunk('cart/clear',  async (_, { rejectWithValue }) => { try { await axiosInstance.delete('/cart/clear'); return null; } catch (err) { return rejectWithValue(err.response?.data?.message); } });

const setCartState = (state, action) => {
  state.loading = false;
  state.items      = action.payload?.items      ?? [];
  state.totalPrice = action.payload?.totalPrice ?? 0;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalPrice: 0, loading: false, error: null, coupon: null },
  reducers: {
    applyCoupon:   (s, a) => { s.coupon = a.payload; },
    removeCoupon:  (s)    => { s.coupon = null; },
    clearCartState:(s)    => { s.items = []; s.totalPrice = 0; s.coupon = null; },
  },
  extraReducers: (builder) => {
    [fetchCart, addToCart, updateCartItem, removeFromCart].forEach((thunk) => {
      builder
        .addCase(thunk.pending,  (s) => { s.loading = true; })
        .addCase(thunk.fulfilled, setCartState)
        .addCase(thunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    });
    builder.addCase(clearCartAPI.fulfilled, (s) => { s.items = []; s.totalPrice = 0; s.coupon = null; });
  },
});

export const { applyCoupon, removeCoupon, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
