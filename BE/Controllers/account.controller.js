const User = require('../Models/Users');

exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      id,        // <-- nhận param id ở đây
      fullName,
      email,
      phone,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // map id param thành idUser field trong DB
    if (id) {
      query.idUser = id;
    }

    if (fullName) query.fullName = new RegExp(fullName, 'i');
    if (email) query.email = new RegExp(email, 'i');
    if (phone) query.phone = new RegExp(phone, 'i');
    if (role) query.role = role;

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .sort({ [sortField]: sortDirection })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      data: users,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm user mới
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Sửa user theo _id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params; // id này là idUser truyền trên URL
    if (!id) {
      return res.status(400).json({ error: 'Thiếu idUser trong URL' });
    }

    const updates = { ...req.body };

    // Không cho phép cập nhật idUser
    if (updates.idUser) delete updates.idUser;

    const updatedUser = await User.findOneAndUpdate(
      { idUser: id },    // tìm theo idUser
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Không tìm thấy user để cập nhật' });
    }

    res.json({
      message: 'Cập nhật thành công',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Xóa user theo _id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Thiếu idUser' });

    const deletedUser = await User.findOneAndDelete({ idUser: id });

    if (!deletedUser) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({ message: 'Xóa thành công user theo idUser' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};