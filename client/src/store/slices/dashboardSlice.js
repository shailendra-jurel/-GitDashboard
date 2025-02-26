// store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async ({ repoId, timeRange }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('github_token');
      const response = await fetch(`/api/dashboard/${repoId}?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContributors = createAsyncThunk(
  'dashboard/fetchContributors',
  async (repoId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('github_token');
      const response = await fetch(`/api/dashboard/${repoId}/contributors`, {
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

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: {
      prMerged: [],
      prTimeToMerge: [],
      branchActivity: []
    },
    contributors: [],
    selectedContributors: [],
    timeRange: '3months',
    loading: false,
    error: null
  },
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