import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();
export const useAuthModal = () => useContext(AuthModalContext);

export const AuthModalProvider = ({ children }) => {
    const [showLogin, setShowLogin] = useState(false);
    return (
        <AuthModalContext.Provider value={{ showLogin, setShowLogin }}>
            {children}
        </AuthModalContext.Provider>
    );
}; 