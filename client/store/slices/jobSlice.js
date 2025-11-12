import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchJobs = createAsyncThunk(
  'job/fetchJobs',
  async (params = {}) => {
    const response = await axios.get(`${API_URL}/jobs`, { params });
    return response.data;
  }
);

export const fetchJobStats = createAsyncThunk(
  'job/fetchStats',
  async () => {
    const response = await axios.get(`${API_URL}/jobs/stats`);
    return response.data;
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState: {
    jobs: [],
    stats: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data || [];
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats || {};
      });
  },
});

export default jobSlice.reducer;
