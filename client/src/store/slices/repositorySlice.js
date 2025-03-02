import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';

export const fetchRepositories = createAsyncThunk(
  'repositories/fetchRepositories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/repositories');
      console.log('Repository API response:', response);
      
      // Store selected repositories in localStorage
      if (response.selectedRepositories) {
        localStorage.setItem('selectedRepositories', JSON.stringify(response.selectedRepositories));
      }
      return response;
    } catch (error) {
      console.error('Error fetching repositories:', error);
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
      console.error('Error saving selected repositories:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to normalize repository objects
const normalizeRepository = (repo) => {
  if (!repo) return null;
  
  // Create a standardized repository object
  const normalizedRepo = {
    ...repo,
    id: repo.id || (repo.full_name ? `id-${repo.full_name}` : null),
    name: repo.name || (repo.full_name ? repo.full_name.split('/')[1] : null),
    owner: {
      login: repo.owner?.login || 
            (repo.full_name ? repo.full_name.split('/')[0] : null) ||
            (repo.owner?.name)
    },
    full_name: repo.full_name || 
               repo.fullName || 
               (repo.owner?.login && repo.name ? `${repo.owner.login}/${repo.name}` : null)
  };
  
  return normalizedRepo;
};

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
      // Normalize the repository before storing
      state.currentRepository = normalizeRepository(action.payload);
      console.log('Current repository set:', state.currentRepository);
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
        
        // Normalize all repositories
        state.available = action.payload.repositories?.map(normalizeRepository) || [];
        console.log('Available repositories normalized:', state.available);
        
        // Only update selected if localStorage is empty
        if (!state.selected.length && action.payload.selectedRepositories) {
          state.selected = action.payload.selectedRepositories.map(normalizeRepository);
          console.log('Selected repositories set from API:', state.selected);
        } else if (state.selected.length) {
          console.log('Using selected repositories from localStorage');
        }
        
        // Set current repository if needed
        if (state.selected.length > 0 && !state.currentRepository) {
          state.currentRepository = normalizeRepository(state.selected[0]);
          console.log('Current repository initialized from selection:', state.currentRepository);
        }
      })
      .addCase(fetchRepositories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Repository fetch rejected:', action.payload);
      })
      .addCase(saveSelectedRepositories.fulfilled, (state, action) => {
        // Normalize the selected repositories
        state.selected = action.payload.repositories?.map(normalizeRepository) || 
                        action.meta.arg.map(normalizeRepository);
                        
        console.log('Selected repositories saved:', state.selected);
        
        // Update current repository if needed
        if (state.selected.length > 0 && !state.currentRepository) {
          state.currentRepository = normalizeRepository(state.selected[0]);
          console.log('Current repository set after save:', state.currentRepository);
        }
      });
  }
});

export const { setCurrentRepository } = repositorySlice.actions;
export default repositorySlice.reducer;