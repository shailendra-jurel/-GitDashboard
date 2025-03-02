// store/slices/dashboardSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ owner, repo, timeRange }, { rejectWithValue }) => {
    try {
      // Enhanced validation with detailed error message
      if (!owner || !repo) {
        console.error('Repository data incomplete:', { owner, repo, timeRange });
        return rejectWithValue('Repository owner or name is missing. Please select a repository again.');
      }
      
      console.log('Fetching dashboard data for:', { owner, repo, timeRange });
      return await apiService.get(`/dashboard/${owner}/${repo}/metrics?timeRange=${timeRange || '3m'}`);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchContributors = createAsyncThunk(
  'dashboard/fetchContributors',
  async ({ owner, repo }, { rejectWithValue }) => {
    try {
      if (!owner || !repo) {
        return rejectWithValue('Repository owner or name is missing');
      }

      return await apiService.get(`/dashboard/${owner}/${repo}/contributors`);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch contributors');
    }
  }
);

const initialState = {
  metrics: {
    prMerged: [],
    prTimeToMerge: [],
    branchActivity: []
  },
  contributors: [],
  selectedContributors: [],
  timeRange: '3m',
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
    toggleContributor: (state, action) => {
      const contributorId = action.payload;
      if (state.selectedContributors.includes(contributorId)) {
        state.selectedContributors = state.selectedContributors.filter(id => id !== contributorId);
      } else {
        state.selectedContributors.push(contributorId);
      }
    },
    clearSelectedContributors: (state) => {
      state.selectedContributors = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContributors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContributors.fulfilled, (state, action) => {
        state.loading = false;
        state.contributors = action.payload;
      })
      .addCase(fetchContributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setTimeRange, toggleContributor, clearSelectedContributors } = dashboardSlice.actions;
export default dashboardSlice.reducer;