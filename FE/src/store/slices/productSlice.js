import { createSlice } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

const initialState = {
    products: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null,
    filters: {
        category: null,
        priceRange: null,
        searchQuery: '',
        sortBy: 'newest',
    },
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
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
    },
});

export const {
    setProducts,
    setCurrentProduct,
    setCategories,
    setLoading,
    setError,
    setFilters,
    clearFilters,
} = productSlice.actions;

// Thunks
export const fetchProducts = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const products = await productAPI.getAll();
        dispatch(setProducts(products));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const fetchProductById = (id) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const product = await productAPI.getById(id);
        dispatch(setCurrentProduct(product));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const categories = await productAPI.getCategories();
        dispatch(setCategories(categories));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Selectors
export const selectProducts = (state) => state.product.products;
export const selectCurrentProduct = (state) => state.product.currentProduct;
export const selectCategories = (state) => state.product.categories;
export const selectProductLoading = (state) => state.product.loading;
export const selectProductError = (state) => state.product.error;
export const selectProductFilters = (state) => state.product.filters;

export const selectFilteredProducts = (state) => {
    const { products, filters } = state.product;
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
        filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        filtered = filtered.filter(product =>
            product.price >= min && product.price <= max
        );
    }

    // Apply search query
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    }

    // Apply sorting
    switch (filters.sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        default:
            break;
    }

    return filtered;
};

export default productSlice.reducer; 