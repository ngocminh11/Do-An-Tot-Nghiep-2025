import { createSlice } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

// Thunks
export const login = (email, password) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const user = await userAPI.login(email, password);
        dispatch(setCredentials({ user, token: 'mock-token' }));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const register = (userData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const user = await userAPI.register(userData);
        dispatch(setCredentials({ user, token: 'mock-token' }));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateProfile = (userId, data) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const updatedUser = await userAPI.updateProfile(userId, data);
        dispatch(setCredentials({ user: updatedUser, token: 'mock-token' }));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer; 