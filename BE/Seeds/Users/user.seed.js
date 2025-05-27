const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../../Models/User');
const UserDetail = require('../../Models/UserDetail');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/datn_mypham';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

const seed = async () => {
  try {
    const usersPath = path.join(__dirname, 'seed_user.json');
    const detailsPath = path.join(__dirname, 'seed_userdetail.json');

    const usersRaw = fs.readFileSync(usersPath, 'utf8');
    const detailsRaw = fs.readFileSync(detailsPath, 'utf8');

    const users = JSON.parse(usersRaw);
    const userDetails = JSON.parse(detailsRaw);

    for (const user of users) {
      // Kiểm tra user theo email
      let existingUser = await User.findOne({ email: user.email });
      let userId;

      if (existingUser) {
        console.log(`Đã tồn tại User: ${user.email}`);
        userId = existingUser._id;
      } else {
        // Xóa _id và định dạng lại ngày tháng
        delete user._id;
        user.createdAt = new Date(user.createdAt);
        user.lastLogin = new Date(user.lastLogin);

        const newUser = await User.create(user);
        userId = newUser._id;
        console.log(`Đã thêm User: ${user.email}`);
      }

      // Gán _id của user cho userDetail
      const userDetail = userDetails.find(detail => detail.userId === user.id);
      if (!userDetail) {
        console.log(`Không tìm thấy userDetail cho userId: ${user.id}`);
        continue;
      }

      const existsDetail = await UserDetail.findOne({ userId });
      if (existsDetail) {
        console.log(`Đã tồn tại UserDetail cho: ${user.email}`);
        continue;
      }

      userDetail.userId = userId; // Gán ObjectId
      userDetail.dob = new Date(userDetail.dob);

      // Xử lý ObjectId trong addrs
      userDetail.addrs = userDetail.addrs.map(addr => ({
        ...addr,
        addrId: new mongoose.Types.ObjectId(addr.addrId.replace(/ObjectId\("(.+?)"\)/, '$1'))
      }));

      await UserDetail.create(userDetail);
      console.log(`Đã thêm UserDetail cho: ${user.email}`);
    }

    console.log('Seed user & userDetail hoàn tất.');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed:', err);
    process.exit(1);
  }
};

seed();
