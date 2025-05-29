import React from 'react';
import { Spin } from 'antd';
import './Loading.scss';

const Loading = ({ fullScreen = false }) => {
    return (
        <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
            <Spin size="large" />
        </div>
    );
};

export default Loading; 