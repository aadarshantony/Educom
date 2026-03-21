import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer    from '../redux/slices/authSlice';
import productReducer from '../redux/slices/productSlice';
import cartReducer    from '../redux/slices/cartSlice';
import wishlistReducer from '../redux/slices/wishlistSlice';
import orderReducer   from '../redux/slices/orderSlice';

const persistConfig = {
  key: 'noir-root',
  storage,
  whitelist: ['auth', 'cart'],
};

const rootReducer = combineReducers({
  auth:     authReducer,
  products: productReducer,
  cart:     cartReducer,
  wishlist: wishlistReducer,
  orders:   orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
