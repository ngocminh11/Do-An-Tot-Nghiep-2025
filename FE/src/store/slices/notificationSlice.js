import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [], // {id, message, read}
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
        },
        markAsRead: (state, action) => {
            const id = action.payload;
            const notif = state.notifications.find(n => n.id === id);
            if (notif) notif.read = true;
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.read = true);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.notifications.filter(n => !n.read).length;

export default notificationSlice.reducer; 