import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.scss';

const Loading = ({ size = 'large', text = 'Loading...' }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

    return (
        <div className="loading-container">
            <Spin indicator={antIcon} size={size} />
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default Loading; 