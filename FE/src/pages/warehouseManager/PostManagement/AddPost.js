import React from 'react';

const AddPost = () => {
    return (
        <div className="wm-add-post">
            <h2>Thêm bài viết mới</h2>
            <form>
                <div><label>Tiêu đề: <input type="text" /></label></div>
                <div><label>Tác giả: <input type="text" /></label></div>
                <div><label>Nội dung: <textarea /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default AddPost; 