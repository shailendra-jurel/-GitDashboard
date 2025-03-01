import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';

export const fetchRepositories = createAsyncThunk(
  'repositories/fetchRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/repositories');
      // Store selected repositories in localStorage
      if (response.selectedRepositories) {
        localStorage.setItem('selectedRepositories', JSON.stringify(response.selectedRepositories));
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSelectedRepositories = createAsyncThunk(
  'repositories/saveSelected',
  async (selectedRepos, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/repositories/selected', { repositories: selectedRepos });
      // Store in localStorage after successful save
      localStorage.setItem('selectedRepositories', JSON.stringify(selectedRepos));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const repositorySlice = createSlice({
  name: 'repositories',
  initialState: {
    available: [],
    selected: JSON.parse(localStorage.getItem('selectedRepositories')) || [],
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
        // Only update selected if localStorage is empty
        if (!state.selected.length) {
          state.selected = action.payload.selectedRepositories || [];
        }
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

