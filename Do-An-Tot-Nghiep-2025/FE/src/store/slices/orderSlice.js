import { createSlice } from '@reduxjs/toolkit';
import { orderAPI } from '../../services/api';

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    filters: {
        status: null,
        dateRange: null,
        searchQuery: '',
    },
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            const order = state.orders.find(order => order.id === orderId);
            if (order) {
                order.status = status;
            }
            if (state.currentOrder?.id === orderId) {
                state.currentOrder.status = status;
            }
        },
    },
});

export const {
    setOrders,
    setCurrentOrder,
    setLoading,
    setError,
    setFilters,
    clearFilters,
    updateOrderStatus,
} = orderSlice.actions;

// Thunks
export const fetchOrders = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const orders = await orderAPI.getAll();
        dispatch(setOrders(orders));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const fetchOrderById = (id) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const order = await orderAPI.getById(id);
        dispatch(setCurrentOrder(order));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const createOrder = (orderData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const newOrder = await orderAPI.create(orderData);
        dispatch(setOrders([...state.orders, newOrder]));
        dispatch(setError(null));
        return newOrder;
    } catch (error) {
        dispatch(setError(error.message));
        throw error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateOrder = (orderId, data) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const updatedOrder = await orderAPI.update(orderId, data);
        dispatch(setOrders(state.orders.map(order =>
            order.id === orderId ? updatedOrder : order
        )));
        if (state.currentOrder?.id === orderId) {
            dispatch(setCurrentOrder(updatedOrder));
        }
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderFilters = (state) => state.order.filters;

export const selectFilteredOrders = (state) => {
    const { orders, filters } = state.order;
    let filtered = [...orders];

    // Apply status filter
    if (filters.status) {
        filtered = filtered.filter(order => order.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });
    }

    // Apply search query
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(order =>
            order.id.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query)
        );
    }

    return filtered;
};

export default orderSlice.reducer; 