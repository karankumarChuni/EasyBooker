import { configureStore } from '@reduxjs/toolkit';
import importReducer from './slices/importSlice';
import jobReducer from './slices/jobSlice';

export const store = configureStore({
  reducer: {
    import: importReducer,
    job: jobReducer,
  },
});
