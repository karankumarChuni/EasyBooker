import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchImportHistory = createAsyncThunk(
  'import/fetchHistory',
  async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await axios.get(`${API_URL}/import/history`, {
      params: { page, limit },
    });
    return response.data;
  }
);

export const triggerImport = createAsyncThunk(
  'import/trigger',
  async () => {
    const response = await axios.post(`${API_URL}/import/trigger`);
    return response.data;
  }
);

export const fetchQueueStats = createAsyncThunk(
  'import/queueStats',
  async () => {
    const response = await axios.get(`${API_URL}/import/queue-stats`);
    return response.data;
  }
);

const importSlice = createSlice({
  name: 'import',
  initialState: {
    history: [],
    pagination: {},
    queueStats: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImportHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchImportHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchImportHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(triggerImport.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(triggerImport.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(fetchQueueStats.fulfilled, (state, action) => {
        state.queueStats = action.payload.stats || {};
      });
  },
});

export const { clearError } = importSlice.actions;
export default importSlice.reducer;
