import React from 'react';

const AddPromotion = () => {
    return (
        <div className="wm-add-promotion">
            <h2>Thêm khuyến mãi mới</h2>
            <form>
                <div><label>Tên khuyến mãi: <input type="text" /></label></div>
                <div><label>Giảm (%): <input type="number" /></label></div>
                <div><label>Bắt đầu: <input type="date" /></label></div>
                <div><label>Kết thúc: <input type="date" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddPromotion; 