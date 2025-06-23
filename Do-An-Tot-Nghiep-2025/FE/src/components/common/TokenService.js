import { mockUsers } from '../../services/mockData';

class TokenService {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static getUser() {
        const token = this.getToken();
        if (!token) return null;

        // In a real app, you would decode the JWT token here
        // For mock data, we'll just return the first user
        return mockUsers[0];
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static startRefreshTimer() {
        // In a real app, you would set up a timer to refresh the token
        // For mock data, we'll just set a mock token
        this.setToken('mock-token');
    }

    static stopRefreshTimer() {
        // In a real app, you would clear the refresh timer
        this.removeToken();
    }
}

export const startTokenRefresh = () => {
    TokenService.startRefreshTimer();
};

export default TokenService; 