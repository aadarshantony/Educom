import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const { data } = await axiosInstance.get(`/products?${query}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch products'); }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get(`/products/${id}`);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Product not found'); }
});

export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/products', productData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.patch(`/products/${id}`, productData);
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addProductReview = createAsyncThunk('products/addReview', async ({ productId, ...reviewData }, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
    return { productId, ...data };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], selectedProduct: null, total: 0, page: 1, pages: 1,
    loading: false, detailLoading: false, error: null,
    filters: { keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' },
  },
  reducers: {
    setFilters:           (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    clearFilters:         (s)    => { s.filters = { keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' }; },
    clearSelectedProduct: (s)    => { s.selectedProduct = null; },
    clearProductError:    (s)    => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.products; s.total = a.payload.total; s.page = a.payload.page; s.pages = a.payload.pages; })
      .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProductById.pending,   (s) => { s.detailLoading = true; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedProduct = a.payload; })
      .addCase(fetchProductById.rejected,  (s, a) => { s.detailLoading = false; s.error = a.payload; })
      .addCase(deleteProduct.fulfilled,    (s, a) => { s.items = s.items.filter((p) => p._id !== a.payload); });
  },
});

export const { setFilters, clearFilters, clearSelectedProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
