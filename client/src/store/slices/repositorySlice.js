// store/slices/repositorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchRepositories = createAsyncThunk(
  'repositories/fetchRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('github_token');
      const response = await fetch('/api/repositories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSelectedRepositories = createAsyncThunk(
  'repositories/saveSelected',
  async (selectedRepos, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('github_token');
      const response = await fetch('/api/repositories/selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ repositories: selectedRepos })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save selected repositories');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const repositorySlice = createSlice({
  name: 'repositories',
  initialState: {
    available: [],
    selected: [],
    loading: false,
    error: null,
    currentRepository: null
  },
  reducers: {
    setCurrentRepository: (state, action) => {
      state.currentRepository = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepositories.fulfilled, (state, action) => {
        state.loading = false;
        state.available = action.payload.repositories;
        state.selected = action.payload.selectedRepositories || [];
        if (state.selected.length > 0 && !state.currentRepository) {
          state.currentRepository = state.selected[0];
        }
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveSelectedRepositories.fulfilled, (state, action) => {
        state.selected = action.payload.repositories;
        if (state.selected.length > 0 && !state.currentRepository) {
          state.currentRepository = state.selected[0];
        }
      });
  }
});

export const { setCurrentRepository } = repositorySlice.actions;
export default repositorySlice.reducer;

