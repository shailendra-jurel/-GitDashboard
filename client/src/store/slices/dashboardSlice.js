// store/slices/dashboardSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ owner, repo, timeRange }, { rejectWithValue }) => {
    try {
      // Check if owner and repo are defined
      if (!owner || !repo) {
        return rejectWithValue('Repository information is missing');
      }
      const token = localStorage.getItem('github_token');
      const response = await fetch(`/api/dashboard/${owner}/${repo}/metrics?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return rejectWithValue(errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchContributors = createAsyncThunk(
  'dashboard/fetchContributors',
  async ({ owner, repo }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('github_token');
      const response = await fetch(`/api/dashboard/${owner}/${repo}/contributors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contributors');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
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