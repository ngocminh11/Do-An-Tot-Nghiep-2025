// Routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const UserDetail = require('../Models/UserDetail');
const ResponseCode = require('../Constants/ResponseCode');
const ResponseMessage = require('../Constants/ResponseMessage');

const router = express.Router();

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  const { username, email, password, fullname, role_id, phone, status, birth_date, personal_image } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(ResponseCode.BAD_REQUEST).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const newUserDetail = new UserDetail({
      user_id: newUser._id,
      fullname,
      role_id,
      phone,
      status,
      birth_date,
      personal_image,
    });
    await newUserDetail.save();

    res.status(ResponseCode.CREATED).json({ message: ResponseMessage.CREATED });
  } catch (error) {
    res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({ message: ResponseMessage.INTERNAL_SERVER_ERROR });
  }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(ResponseCode.BAD_REQUEST).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(ResponseCode.BAD_REQUEST).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({ message: ResponseMessage.INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;
