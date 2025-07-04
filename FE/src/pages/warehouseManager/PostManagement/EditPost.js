import React from 'react';

const EditPost = () => {
    return (
        <div className="wm-edit-post">
            <h2>Chỉnh sửa bài viết</h2>
            <form>
                <div><label>Tiêu đề: <input type="text" defaultValue="Bài viết 1" /></label></div>
                <div><label>Tác giả: <input type="text" defaultValue="Admin" /></label></div>
                <div><label>Nội dung: <textarea defaultValue="Nội dung bài viết 1" /></label></div>
                <button type="submit">Lưu</button>
            </form>
        </div>
    );
};

export default EditPost; 