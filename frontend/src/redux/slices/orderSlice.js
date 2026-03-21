import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const createOrder          = createAsyncThunk('orders/create',    async (d, { rejectWithValue }) => { try { const { data } = await axiosInstance.post('/orders', d); return data.order; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchMyOrders        = createAsyncThunk('orders/fetchMy',   async (_, { rejectWithValue }) => { try { const { data } = await axiosInstance.get('/orders/my'); return data.orders; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchOrderById       = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => { try { const { data } = await axiosInstance.get(`/orders/${id}`); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchAllOrders       = createAsyncThunk('orders/fetchAll',  async (_, { rejectWithValue }) => { try { const { data } = await axiosInstance.get('/orders/admin/orders'); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const updateOrderStatus    = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => { try { const { data } = await axiosInstance.patch(`/orders/admin/orders/${id}/status`, { status }); return data.order; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const fetchAnalytics       = createAsyncThunk('orders/analytics', async (_, { rejectWithValue }) => { try { const { data } = await axiosInstance.get('/orders/admin/analytics'); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });
export const createCheckoutSession= createAsyncThunk('orders/checkout',  async (orderId, { rejectWithValue }) => { try { const { data } = await axiosInstance.post('/payments/create-checkout-session', { orderId }); return data; } catch (err) { return rejectWithValue(err.response?.data?.message); } });

const orderSlice = createSlice({
  name: 'orders',
  initialState: { myOrders: [], allOrders: [], selectedOrder: null, analytics: null, checkoutSession: null, loading: false, error: null },
  reducers: {
    clearOrderError:      (s) => { s.error = null; },
    clearCheckoutSession: (s) => { s.checkoutSession = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => { s.loading = false; s.selectedOrder = a.payload; s.myOrders.unshift(a.payload); })
      .addCase(createOrder.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyOrders.pending,   (s) => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.myOrders = a.payload; })
      .addCase(fetchMyOrders.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchOrderById.fulfilled,    (s, a) => { s.selectedOrder = a.payload; })
      .addCase(fetchAllOrders.fulfilled,    (s, a) => { s.allOrders = a.payload.orders || []; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => { const i = s.allOrders.findIndex((o) => o._id === a.payload._id); if (i !== -1) s.allOrders[i] = a.payload; })
      .addCase(fetchAnalytics.fulfilled,    (s, a) => { s.analytics = a.payload; })
      .addCase(createCheckoutSession.fulfilled, (s, a) => { s.checkoutSession = a.payload; });
  },
});

export const { clearOrderError, clearCheckoutSession } = orderSlice.actions;
export default orderSlice.reducer;
