// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Lazy loading for images
export const lazyLoadImage = (src, fallback = '/images/products/default.jpg') => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(fallback);
        img.src = src;
    });
};

// Memoization helper for expensive calculations
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
};

// Virtual scrolling helper
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
        totalHeight: items.length * itemHeight
    };
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
    return (...args) => {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
        return result;
    };
};

// Batch state updates
export const batchUpdate = (setState, updates) => {
    setState(prevState => {
        const newState = { ...prevState };
        updates.forEach(([key, value]) => {
            newState[key] = value;
        });
        return newState;
    });
};

// Optimized array operations
export const optimizedFilter = (array, predicate) => {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
};

export const optimizedMap = (array, mapper) => {
    const result = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        result[i] = mapper(array[i], i, array);
    }
    return result;
};

// Memory management
export const cleanupObjectURLs = (urls) => {
    urls.forEach(url => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    });
};

// Event listener optimization
export const addOptimizedEventListener = (element, event, handler, options = {}) => {
    const optimizedHandler = throttle(handler, 16); // ~60fps
    element.addEventListener(event, optimizedHandler, { passive: true, ...options });
    return () => element.removeEventListener(event, optimizedHandler);
};

// Async operation with timeout
export const withTimeout = (promise, timeoutMs = 5000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        )
    ]);
};

// Retry mechanism for failed requests
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Cache management
export class SimpleCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value); // Move to end (LRU)
            return value;
        }
        return null;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }
}

// Image preloading
export const preloadImages = (urls) => {
    return Promise.all(urls.map(url => lazyLoadImage(url)));
};

// Component optimization helpers
export const shouldComponentUpdate = (prevProps, nextProps, keys) => {
    return keys.some(key => prevProps[key] !== nextProps[key]);
};

// Bundle size optimization
export const dynamicImport = (importFn) => {
    return React.lazy(() => importFn());
}; 