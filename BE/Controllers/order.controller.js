/* ------------------------------------------------------------- *
 *  controllers/order.controller.js                              *
 *  (C) 2024 – COCOO SHOP – Back-end team                        *
 * ------------------------------------------------------------- */

const mongoose  = require('mongoose');
const Order     = require('../Models/Orders');
const OrderDetail = require('../Models/OrderDetails');
const Product   = require('../Models/Products');

const {
  sendSuccess,
  sendError
} = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages    = require('../Constants/ResponseMessage');

/* ========================= CONSTANTS ========================= */
const FLOW      = ['Chờ xác nhận', 'Xác nhận', 'Đang giao hàng', 'Đã hoàn thành'];
const ADMIN_PIN = process.env.ADMIN_PIN || '878889';

const priceOf = p =>
  p.pricingAndInventory.salePrice ?? p.pricingAndInventory.originalPrice;

/* ======================= HELPERS ======================= */

// luôn tạo OrderDetail nếu chưa có (upsert)
const addLog = async (orderId, payload) => {
  try {
    await OrderDetail.updateOne(
      { order: orderId },
      { $push: { logs: { ...payload, at: new Date() } } },
      { upsert: true }
    );
  } catch (e) {
    console.error('[LOG ERROR]', e.message);
  }
};

// factor = +1 (trả kho) | -1 (trừ kho)
const updateStock = async (items, factor) => {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map(it => ({
      updateOne: {
        filter: { _id: it.product },
        update: {
          $inc: { 'pricingAndInventory.stockQuantity': factor * it.quantity }
        }
      }
    }))
  );
};

const validateFlow = (curr, next, pin) => {
  if (!FLOW.includes(next))
    return { ok: false, msg: 'Trạng thái không hợp lệ.' };

  const cur = FLOW.indexOf(curr), nxt = FLOW.indexOf(next);
  if (nxt - cur > 1)
    return { ok: false, msg: `Đơn hàng chưa qua bước "${FLOW[cur + 1]}".` };
  if (nxt < cur && pin !== ADMIN_PIN)
    return { ok: false, msg: 'PIN không hợp lệ để quay lùi trạng thái.' };

  return { ok: true };
};

/* ============================================================ *
 * 1. CREATE ORDER (USER)                                        *
 * ============================================================ */
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, notes, promotionCode } = req.body;

    if (!Array.isArray(items) || items.length === 0)
      return sendError(res, 400, 'Đơn hàng không có sản phẩm.');

    /* ----- Enrich + Kiểm kho ----- */
    const cart = [];
    for (const row of items) {
      if (!row.product || !row.quantity)
        return sendError(res, 400, 'Thiếu product / quantity.');

      const product = await Product.findById(row.product).lean();
      if (!product)
        return sendError(res, 404, `Sản phẩm ${row.product} không tồn tại.`);
      if (row.quantity > product.pricingAndInventory.stockQuantity)
        return sendError(
          res,
          400,
          `${product.basicInformation.productName} không đủ hàng.`
        );

      cart.push({
        product     : product._id,
        productName : product.basicInformation.productName,
        unit        : product.pricingAndInventory.unit,
        currency    : product.pricingAndInventory.currency,
        quantity    : row.quantity,
        price       : priceOf(product),
        discount    : row.discount ?? 0
      });
    }

    const totalAmount = cart.reduce(
      (sum, i) => sum + i.quantity * i.price * (1 - i.discount / 100),
      0
    );

    const order = await Order.create({
      user          : req.user._id,
      items         : cart,
      totalAmount,
      paymentMethod,
      notes,
      promotionCode,
      statusHistory : [{ status: 'Chờ xác nhận' }]
    });

    /* ----- Tạo OrderDetail + log ----- */
    await OrderDetail.create({
      order           : order._id,
      shippingAddress : req.user.addresses.find(a => a.isDefault) || {},
      logs            : [{
        type   : 'create',
        message: 'Tạo đơn hàng',
        actor  : req.user._id,
        role   : 'user'
      }]
    });

    return sendSuccess(res, 201, order, Messages.ORDER_CREATED);
  } catch (err) {
    console.error('[CREATE ORDER]', err);
    return sendError(res, 500, err.message);
  }
};

/* ============================================================ *
 * 2. USER – GET LIST / DETAIL                                   *
 * ============================================================ */
exports.getUserOrders = async (req, res) => {
  const list = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, list, Messages.ORDER_FETCH_SUCCESS);
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  const order = await Order.findById(id).populate('user', 'fullName email phone');
  if (!order)
    return sendError(res, 404, Messages.ORDER_NOT_FOUND);

  if (!order.user._id.equals(req.user._id) && req.user.role !== 'admin')
    return sendError(res, 403, Messages.ERROR_FORBIDDEN);

  return sendSuccess(res, 200, order, Messages.ORDER_FETCH_SUCCESS);
};

/* ============================================================ *
 * 3. USER – CANCEL (≤3h & Chờ xác nhận)                         *
 * ============================================================ */
exports.cancelRequestByUser = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.isValidObjectId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  const order = await Order.findById(id);
  if (!order) return sendError(res, 404, Messages.ORDER_NOT_FOUND);
  if (!order.user.equals(req.user._id))
    return sendError(res, 403, Messages.ERROR_FORBIDDEN);

  const diffHours = (Date.now() - order.createdAt) / 36e5;
  if (order.status !== 'Chờ xác nhận' || diffHours > 3)
    return sendError(res, 400, 'Chỉ huỷ được đơn Chờ xác nhận trong 3 giờ.');

  order.status            = 'Hủy';
  order.paymentStatus     = 'Đã hoàn tiền';
  order.cancellationReason = reason || 'User huỷ';
  order.statusHistory.push({ status: 'Hủy' });
  await order.save();

  await addLog(order._id, {
    type   : 'cancel',
    message: order.cancellationReason,
    actor  : req.user._id,
    role   : 'user'
  });

  return sendSuccess(res, 200, order, 'Huỷ đơn hàng thành công.');
};

/* ============================================================ *
 * 4. ADMIN – GET ALL                                            *
 * ============================================================ */
exports.getAllOrders = async (req, res) => {
  const { page = 1, limit = 10, status, paymentStatus } = req.query;
  const query = { ...(status && { status }), ...(paymentStatus && { paymentStatus }) };

  const orders = await Order.find(query)
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(+limit);

  const total = await Order.countDocuments(query);

  return sendSuccess(
    res,
    200,
    {
      total,
      currentPage: +page,
      perPage    : +limit,
      totalPages : Math.ceil(total / limit),
      data       : orders
    },
    Messages.ORDER_FETCH_SUCCESS
  );
};

/* ============================================================ *
 * 5. ADMIN – UPDATE STATUS                                      *
 * ============================================================ */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id }                        = req.params;
    const { status, shippingInfo,
            pin, reason }               = req.body;

    // 1. validate id ------------------------------------------------
    if (!mongoose.isValidObjectId(id))
      return sendError(res, 400, Messages.INVALID_ID);

    // 2. lấy đơn hàng (KHÔNG lean) ---------------------------------
    const order = await Order.findById(id).populate(
      'items.product',
      'pricingAndInventory.stockQuantity'
    );
    if (!order)
      return sendError(res, 404, Messages.ORDER_NOT_FOUND);
    if (order.status === status)
      return sendError(res, 400, 'Trạng thái không thay đổi.');

    /* ========================================================== */
    /* A. HỦY  –  luôn cho phép, cần lý do                        */
    /* ========================================================== */
    if (status === 'Hủy') {
      if (!reason) return sendError(res, 400, 'Vui lòng nhập lý do hủy.');

      if (['Xác nhận', 'Đang giao hàng'].includes(order.status))
        await updateStock(order.items, +1);          // hoàn kho

      order.status             = 'Hủy';
      order.cancellationReason = reason;
      order.paymentStatus      =
        order.paymentStatus === 'Đã thanh toán' ? 'Chưa hoàn tiền'
                                                : 'Đã hoàn tiền';
      order.statusHistory.push({ status: 'Hủy' });
      await order.save();

      await addLog(order._id, {
        type   : 'cancel',
        message: reason,
        actor  : req.user?._id,
        role   : req.user?.role || 'system'
      });

      return sendSuccess(res, 200, order, Messages.ORDER_STATUS_UPDATED);
    }

    /* ========================================================== */
    /* B. Các trạng thái trong FLOW                              */
    /* ========================================================== */
    const flowChk = validateFlow(order.status, status, pin);
    if (!flowChk.ok) return sendError(res, 400, flowChk.msg);

    // B1. Chuyển sang “Xác nhận” → trừ kho
    if (order.status === 'Chờ xác nhận' && status === 'Xác nhận') {
      const lack = order.items.find(it =>
        it.product.pricingAndInventory.stockQuantity < it.quantity
      );
      if (lack)
        return sendError(res, 400,
          `Sản phẩm ${lack.product} không đủ hàng.`);
      await updateStock(order.items, -1);
    }

    // B2. Sang “Đang giao hàng” → cần shippingInfo
    if (status === 'Đang giao hàng') {
      if (!shippingInfo?.trackingNumber)
        return sendError(res, 400, 'Thiếu thông tin vận chuyển.');
      await OrderDetail.updateOne(
        { order: order._id },
        { $set: { shippingInfo } },
        { upsert: true }
      );
    }

    // B3. cập nhật & log
    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    await addLog(order._id, {
      type   : 'status-change',
      message: `→ ${status}`,
      actor  : req.user?._id,
      role   : req.user?.role || 'system'
    });

    return sendSuccess(res, 200, order, Messages.ORDER_STATUS_UPDATED);

  } catch (err) {
    console.error('[UPDATE STATUS]', err.message);
    console.error(err.stack);
    /* Trả về lỗi chi tiết để dễ debug – production nên ẩn đi */
    return sendError(res, 500, err.message);
  }
};

/* ============================================================ *
 * 6. ADMIN – RESPOND CANCEL REQUEST                              *
 * ============================================================ */
exports.respondCancelRequest = async (req, res) => {
  const { id } = req.params;
  const { accept, reason } = req.body;

  if (!mongoose.isValidObjectId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  const order = await Order.findById(id);
  if (!order || !order.isCancelRequested)
    return sendError(res, 400, 'Không có yêu cầu hủy đơn.');

  if (accept) {
    if (!reason) return sendError(res, 400, 'Phải nhập lý do hủy.');
    if (['Xác nhận', 'Đang giao hàng'].includes(order.status))
      await updateStock(order.items, +1);             // Trả kho

    order.status             = 'Hủy';
    order.cancellationReason = reason;
    order.paymentStatus      =
      order.paymentStatus === 'Đã thanh toán' ? 'Chưa hoàn tiền' : 'Đã hoàn tiền';
    order.statusHistory.push({ status: 'Hủy' });
  } else {
    order.isCancelRequested = false;
    order.cancelRequestTime = null;
  }

  await order.save();

  await addLog(id, {
    type   : accept ? 'cancel' : 'reject-cancel',
    message: accept ? reason : 'Từ chối yêu cầu hủy',
    actor  : req.user._id,
    role   : 'admin'
  });

  const msg = accept ? 'Đã hủy đơn hàng' : 'Đã từ chối yêu cầu hủy';
  return sendSuccess(res, 200, order, msg);
};

/* ============================================================ *
 * 7. ADMIN – UPDATE MISC FIELD                                  *
 * ============================================================ */
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  const allowed = ['paymentMethod', 'paymentStatus', 'notes',
                   'promotionCode', 'shippingInfo', 'estimatedDeliveryDate'];

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  if (!Object.keys(updates).length)
    return sendError(res, 400, 'Không có trường hợp lệ.');

  const order = await Order.findById(id);
  if (!order) return sendError(res, 404, Messages.ORDER_NOT_FOUND);

  const changes = [];
  for (const f of allowed) {
    if (updates[f] !== undefined && updates[f] !== order[f]) {
      changes.push(`"${f}": "${order[f]}" → "${updates[f]}"`);
      order[f] = updates[f];
    }
  }
  await order.save();

  if (changes.length)
    await addLog(id, {
      type   : 'update',
      message: changes.join(', '),
      actor  : req.user._id,
      role   : 'admin'
    });

  return sendSuccess(res, 200, order, Messages.ORDER_UPDATED);
};

/* ============================================================ *
 * 8. ADMIN – DELETE ORDER                                       *
 * ============================================================ */
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return sendError(res, 400, Messages.INVALID_ID);

  await Order.findByIdAndDelete(id);
  await OrderDetail.findOneAndDelete({ order: id });

  return sendSuccess(res, 200, null, Messages.ORDER_DELETED);
};
