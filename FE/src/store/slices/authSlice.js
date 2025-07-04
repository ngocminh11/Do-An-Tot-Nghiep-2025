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
export const login = (email, password, otp) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        // Bước 1: Lấy otpToken
        const { otpToken } = await userAPI.loginStep1(email, password);
        // Bước 2: Xác thực OTP, lấy accessToken và refreshToken
        const { user, accessToken, refreshToken } = await userAPI.loginStep2(otpToken, otp);
        if (accessToken) {
            localStorage.setItem('token', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        dispatch(setCredentials({ user, token: accessToken }));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const register = (userData, otpToken) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const { user, accessToken, refreshToken } = await userAPI.register(userData, otpToken);
        if (accessToken) {
            localStorage.setItem('token', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        dispatch(setCredentials({ user, token: accessToken }));
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
        const token = localStorage.getItem('token');
        dispatch(setCredentials({ user: updatedUser, token }));
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