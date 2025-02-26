// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import repositoryReducer from './slices/repositorySlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    repositories: repositoryReducer,
    dashboard: dashboardReducer
  }
});

export default store;