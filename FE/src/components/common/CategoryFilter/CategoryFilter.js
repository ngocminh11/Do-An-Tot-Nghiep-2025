import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Space, Typography, Spin } from 'antd';
import categoryService from '../../../services/categoryService';
import './CategoryFilter.scss';

const { Title } = Typography;

const CategoryFilter = ({ selectedCategories, onCategoryChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getCategories({ status: 'active' });
                setCategories(response.data || []);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh mục sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId) => {
        const newSelectedCategories = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        onCategoryChange(newSelectedCategories);
    };

    if (loading) {
        return (
            <Card className="category-filter">
                <Title level={4}>Danh mục</Title>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="small" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="category-filter">
                <Title level={4}>Danh mục</Title>
                <div style={{ color: '#ff4d4f', textAlign: 'center', padding: '10px' }}>
                    {error}
                </div>
            </Card>
        );
    }

    return (
        <Card className="category-filter">
            <Title level={4}>Danh mục</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
                {categories.map(category => (
                    <Checkbox
                        key={category._id}
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                    >
                        {category.name}
                    </Checkbox>
                ))}
                {categories.length === 0 && (
                    <div style={{ color: '#999', textAlign: 'center', padding: '10px' }}>
                        Không có danh mục nào
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default CategoryFilter; 