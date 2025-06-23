import React from 'react';
import { Card, Checkbox, Space, Typography } from 'antd';
import { mockCategories } from '../../../services/mockData';
import './CategoryFilter.scss';

const { Title } = Typography;

const CategoryFilter = ({ selectedCategories, onCategoryChange }) => {
    const handleCategoryChange = (categoryId) => {
        const newSelectedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        onCategoryChange(newSelectedCategories);
    };

    return (
        <Card className="category-filter">
            <Title level={4}>Categories</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                {mockCategories.map(category => (
                    <Checkbox
                        key={category._id}
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                    >
                        {category.name}
                    </Checkbox>
                ))}
            </Space>
        </Card>
    );
};

export default CategoryFilter; 