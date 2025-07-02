import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import { AuthProviderWithNavigate } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthModalProvider } from './contexts/AuthModalContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <Router>
        <AuthProviderWithNavigate>
          <AuthModalProvider>
            <App />
          </AuthModalProvider>
        </AuthProviderWithNavigate>
      </Router>
    </ConfigProvider>
  </React.StrictMode>
);