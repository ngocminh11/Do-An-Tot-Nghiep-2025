const mongoose = require('mongoose');
const Account       = require('../Models/Accounts');
const AccountDetail = require('../Models/AccountDetail');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages     = require('../Constants/ResponseMessage');

/* ---------------- Const & Helpers ----------------------------------------- */
const PIN_ROLES   = ['Quản Lý Kho', 'Quản Lý Nhân Sự', 'Quản Lý Chính'];
const DEFAULT_PIN = '000000';
const isValidId   = id => mongoose.Types.ObjectId.isValid(id);

const ensurePin = (role, pin) => {
  if (PIN_ROLES.includes(role))      // role bắt buộc PIN
    return pin || DEFAULT_PIN;
  if (pin) throw new Error('Role hiện tại không được phép có PIN.');
  return null;                       // role không PIN
};

const normalizeAddresses = arr =>
  Array.isArray(arr)
    ? arr.map(a => ({
        id: a.id,
        fullName: a.fullName,
        phoneNumber: a.phoneNumber,
        city: a.city,
        district: a.district,
        ward: a.ward,
        address: a.address,
        isDefault: !!a.isDefault
      }))
    : arr;

/* ========================================================================== */
/* 1) GET /accounts  – Danh sách + phân trang                                 */
/* ========================================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      id,
      fullName,
      email,
      phone,
      role,
      accountStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const accMatch = {};
    if (id && isValidId(id)) accMatch._id = new mongoose.Types.ObjectId(id);
    if (email)  accMatch.email = { $regex: email, $options: 'i' };
    if (role)   accMatch.role  = role;
    if (accountStatus) accMatch.accountStatus = accountStatus;

    const detMatch = {};
    if (fullName) detMatch['detail.fullName'] = { $regex: fullName, $options: 'i' };
    if (phone)    detMatch['detail.phone']    = { $regex: phone,    $options: 'i' };

    const skip = (page - 1) * limit;
    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: accMatch },
      { $lookup: {
          from: 'accountdetails',
          localField: '_id',
          foreignField: 'accountId',
          as: 'detail'
        }},
      { $unwind: '$detail' },
      { $match: detMatch },
      { $sort: { [sortField]: sortDir } },
      { $facet: {
          data:  [ { $skip: Number(skip) }, { $limit: Number(limit) } ],
          total: [ { $count: 'count' } ]
      }}
    ];

    const agg   = await Account.aggregate(pipeline);
    const users = agg[0].data;
    const total = agg[0].total[0]?.count || 0;

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: users,
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit)
    }, Messages.USER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

/* ========================================================================== */
/* 2) GET /accounts/:id – Chi tiết                                            */
/* ========================================================================== */
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, 400, Messages.INVALID_ID);
  try {
    const acc = await Account.findById(id).lean();
    if (!acc) return sendError(res, 404, Messages.USER_NOT_FOUND);
    const det = await AccountDetail.findOne({ accountId: id }).lean();
    return sendSuccess(res, 200, { ...acc, detail: det }, Messages.USER_FETCH_SUCCESS);
  } catch {
    return sendError(res, 500, Messages.INTERNAL_SERVER_ERROR);
  }
};

/* ========================================================================== */
/* 3) POST /accounts – Role KHÔNG có PIN                                       */
/* ========================================================================== */
exports.createUserNoPin = async (req, res) => {
  try {
    if (PIN_ROLES.includes(req.body.role))
      return sendError(res, 400, 'Role yêu cầu PIN – hãy dùng /accounts/with-pin');

    if (req.body.pin)
      return sendError(res, 400, 'Endpoint này không chấp nhận PIN.');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const acc = await Account.create([{
        ...req.body,
        pin: null,
        accountStatus: 'Hoạt động'
      }], { session });

      await AccountDetail.create([{
        accountId: acc[0]._id,
        fullName: req.body.fullName,
        gender: req.body.gender,
        skinType: req.body.skinType,
        phone: req.body.phone,
        address: req.body.address,
        addresses: normalizeAddresses(req.body.addresses)
      }], { session });

      await session.commitTransaction();
      return sendSuccess(res, 201, acc[0], Messages.USER_CREATED);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally { session.endSession(); }
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

/* ========================================================================== */
/* 4) POST /accounts/with-pin – Role CÓ PIN                                    */
/* ========================================================================== */
exports.createUserWithPin = async (req, res) => {
  try {
    if (!PIN_ROLES.includes(req.body.role))
      return sendError(res, 400, 'Role này không yêu cầu PIN – hãy dùng /accounts');

    const pinSave = ensurePin(req.body.role, req.body.pin);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const acc = await Account.create([{
        ...req.body,
        pin: pinSave,
        accountStatus: 'Hoạt động'
      }], { session });

      await AccountDetail.create([{
        accountId: acc[0]._id,
        fullName: req.body.fullName,
        gender: req.body.gender,
        skinType: req.body.skinType,
        phone: req.body.phone,
        address: req.body.address,
        addresses: normalizeAddresses(req.body.addresses)
      }], { session });

      await session.commitTransaction();
      return sendSuccess(res, 201, acc[0], Messages.USER_CREATED);
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally { session.endSession(); }
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

/* ========================================================================== */
/* 5) PUT /accounts/:id – UPDATE KHÔNG PIN                                     */
/* ========================================================================== */
exports.updateUserNoPin = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, 400, Messages.INVALID_ID);

  if ('pin' in req.body)
    return sendError(res, 400, 'Endpoint này không cho phép cập nhật PIN.');
  if (req.body.role && PIN_ROLES.includes(req.body.role))
    return sendError(res, 400, 'Role chuyển sang cần PIN – hãy dùng /accounts/with-pin/:id');

  try {
    const acc = await Account.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!acc) return sendError(res, 404, Messages.USER_NOT_FOUND);

    await AccountDetail.findOneAndUpdate(
      { accountId: id },
      { $set: { addresses: normalizeAddresses(req.body.addresses) } },
      { runValidators: true }
    );

    return sendSuccess(res, 200, acc, Messages.USER_UPDATED);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

/* ========================================================================== */
/* 6) PUT /accounts/with-pin/:id – UPDATE role CÓ PIN                          */
/* ========================================================================== */
exports.updateUserWithPin = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, 400, Messages.INVALID_ID);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const current = await Account.findById(id).session(session);
    if (!current) throw new Error(Messages.USER_NOT_FOUND);

    const newRole = req.body.role || current.role;
    const newPin  =
      ('pin' in req.body)
        ? ensurePin(newRole, req.body.pin)
        : current.pin || (PIN_ROLES.includes(newRole) ? DEFAULT_PIN : null);

    if (!PIN_ROLES.includes(newRole)) req.body.pin = null;
    else req.body.pin = newPin;

    const acc = await Account.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, session });

    await AccountDetail.findOneAndUpdate(
      { accountId: id },
      { $set: { addresses: normalizeAddresses(req.body.addresses) } },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    return sendSuccess(res, 200, acc, Messages.USER_UPDATED);
  } catch (err) {
    await session.abortTransaction();
    return sendError(res, 400, err.message);
  } finally { session.endSession(); }
};

/* ========================================================================== */
/* 7) PATCH /accounts/:id/pin – Đổi PIN                                        */
/* ========================================================================== */
exports.updatePin = async (req, res) => {
  const { id } = req.params;
  const { pin } = req.body;
  if (!isValidId(id))   return sendError(res, 400, Messages.INVALID_ID);
  if (!/^\d{6}$/.test(pin))
    return sendError(res, 400, 'PIN phải gồm đúng 6 chữ số.');

  try {
    const acc = await Account.findById(id);
    if (!acc) return sendError(res, 404, Messages.USER_NOT_FOUND);
    if (!PIN_ROLES.includes(acc.role))
      return sendError(res, 400, 'Role này không dùng PIN.');

    acc.pin = pin;
    await acc.save();
    return sendSuccess(res, 200, null, 'Đổi PIN thành công');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

/* ========================================================================== */
/* 8) DELETE /accounts/:id                                                     */
/* ========================================================================== */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, 400, Messages.INVALID_ID);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const accDel = await Account.findByIdAndDelete(id, { session });
    const detDel = await AccountDetail.findOneAndDelete({ accountId: id }, { session });
    if (!accDel) throw new Error(Messages.USER_NOT_FOUND);

    await session.commitTransaction();
    return sendSuccess(res, 200, null, Messages.USER_DELETED);
  } catch (err) {
    await session.abortTransaction();
    return sendError(res, 500, err.message);
  } finally { session.endSession(); }
};

/* ========================================================================== */
/* 9) POST /accounts/:id/verify-pin  – Kiểm tra PIN                            */
/* ========================================================================== */
exports.verifyPin = async (req, res) => {
  const { id }   = req.params;
  const { pin }  = req.body;

  if (!isValidId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  if (!/^\d{6}$/.test(pin))
    return sendError(res, 400, 'PIN phải gồm đúng 6 chữ số.');

  try {
    const acc = await Account.findById(id).select('pin role');
    if (!acc)
      return sendError(res, 404, Messages.USER_NOT_FOUND);

    if (!PIN_ROLES.includes(acc.role))
      return sendError(res, 400, 'Role này không sử dụng PIN.');

    if (acc.pin !== pin)
      return sendError(res, StatusCodes.ERROR_UNAUTHORIZED ?? 401, 'PIN không chính xác.');

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, 'PIN chính xác.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

/* ========================================================================== */
/* 10) PATCH /accounts/:id/status          – (ADMIN) đổi trạng thái           */
/* ========================================================================== */
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { accountStatus } = req.body;               // 'Hoạt động' | 'Dừng hoạt động' | 'Đã bị khóa'
  const ALLOW = ['Hoạt động', 'Dừng hoạt động', 'Đã bị khóa'];

  if (!isValidId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  if (!ALLOW.includes(accountStatus))
    return sendError(res, 400, 'Trạng thái không hợp lệ.');

  try {
    const acc = await Account.findByIdAndUpdate(
      id,
      { accountStatus },
      { new: true, runValidators: true }
    );
    if (!acc) return sendError(res, 404, Messages.USER_NOT_FOUND);

    return sendSuccess(res, 200, acc, 'Cập nhật trạng thái thành công.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

/* ========================================================================== */
/* 11) PATCH /my-account/status            – (USER) tự “Dừng hoạt động”       */
/* ========================================================================== */
exports.updateOwnStatus = async (req, res) => {
  const { id } = req.params;                        // đã được gán = req.user._id ở route
  const { accountStatus } = req.body;

  // USER chỉ được tự chuyển sang “Dừng hoạt động”
  if (accountStatus !== 'Dừng hoạt động')
    return sendError(res, 400, 'Bạn chỉ có thể tự chuyển sang “Dừng hoạt động”.');

  try {
    const acc = await Account.findByIdAndUpdate(
      id,
      { accountStatus: 'Dừng hoạt động' },
      { new: true, runValidators: true }
    );
    if (!acc) return sendError(res, 404, Messages.USER_NOT_FOUND);

    return sendSuccess(res, 200, acc, 'Tài khoản của bạn đã được đặt thành “Dừng hoạt động”.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};
