import React, { useState, useEffect } from 'react';
import cartService from '../../../services/cartService';
import './CartManagement.scss';
import { toast } from 'react-toastify';

const CartManagement = () => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllCarts();
    }, []);

    const fetchAllCarts = async () => {
        try {
            setLoading(true);
            const response = await cartService.getAllCarts();
            // The backend likely returns an array of cart items, let's group them by user
            const cartsByUser = response.data.reduce((acc, cartItem) => {
                const userId = cartItem.user._id;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: cartItem.user,
                        items: [],
                        total: 0,
                    };
                }
                acc[userId].items.push(cartItem);
                acc[userId].total += cartItem.product.price * cartItem.quantity;
                return acc;
            }, {});
            setCarts(Object.values(cartsByUser));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching carts:', error);
            toast.error('Lỗi khi tải giỏ hàng!');
            setLoading(false);
        }
    };

    const handleClearCart = async (userId) => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng của người dùng này?')) {
            try {
                await cartService.clearCartByUserId(userId);
                toast.success('Xóa giỏ hàng thành công!');
                fetchAllCarts(); // Refresh the list
            } catch (error) {
                console.error('Error clearing cart:', error);
                toast.error('Lỗi khi xóa giỏ hàng!');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="cart-management">
            <h2>Quản lý Giỏ hàng</h2>
            {carts.map((cart) => (
                <div key={cart.user._id} className="cart-user-section">
                    <h3>Giỏ hàng của: {cart.user.username} ({cart.user.email})</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Hình ảnh</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.product.name}</td>
                                    <td><img src={item.product.images[0]} alt={item.product.name} width="50" /></td>
                                    <td>{item.product.price.toLocaleString()} VND</td>
                                    <td>{item.quantity}</td>
                                    <td>{(item.product.price * item.quantity).toLocaleString()} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-summary">
                        <strong>Tổng cộng: {cart.total.toLocaleString()} VND</strong>
                        <button onClick={() => handleClearCart(cart.user._id)} className="btn-clear-cart">
                            Xóa giỏ hàng
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartManagement; 