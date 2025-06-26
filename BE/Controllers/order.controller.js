// controllers/order.controller.js

const mongoose = require('mongoose');
const Order = require('../Models/Orders');
const Product = require('../Models/Products');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

const getEffectivePrice = (product) => {
  return product.pricingAndInventory.salePrice ?? product.pricingAndInventory.originalPrice;
};

// ================= USER ================= //

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, notes, promotionCode } = req.body;
    const userId = req.user._id;

    console.log('Received order data:', { items, paymentMethod, notes, promotionCode }); // Debug log

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Đơn hàng không có sản phẩm');
    }

    // Validate each item has required fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, `Item ${i + 1} thiếu product ID`);
      }
      if (!item.quantity || item.quantity <= 0) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, `Item ${i + 1} có số lượng không hợp lệ`);
      }
    }

    const enrichedItems = await Promise.all(items.map(async (item, index) => {
      console.log(`Processing item ${index}:`, item); // Debug log

      // Convert string ID to ObjectId if needed
      const productId = typeof item.product === 'string' ? item.product : item.product.toString();
      console.log(`Looking for product with ID: ${productId}`); // Debug log

      const product = await Product.findById(productId);
      console.log(`Product found for item ${index}:`, product ? {
        _id: product._id,
        productName: product.basicInformation?.productName,
        hasBasicInfo: !!product.basicInformation
      } : 'NOT FOUND'); // Debug log

      if (!product) {
        throw new Error(`Sản phẩm với ID ${productId} không tồn tại`);
      }

      if (!product.basicInformation || !product.basicInformation.productName) {
        throw new Error(`Sản phẩm ${product._id} thiếu thông tin tên sản phẩm`);
      }

      const stock = product.pricingAndInventory.stockQuantity;
      if (item.quantity > stock) {
        throw new Error(`Sản phẩm "${product.basicInformation.productName}" không đủ hàng`);
      }

      const price = getEffectivePrice(product);

      const enrichedItem = {
        product: product._id,
        productName: product.basicInformation.productName,
        unit: product.pricingAndInventory.unit,
        currency: product.pricingAndInventory.currency,
        quantity: item.quantity,
        price,
        discount: item.discount || 0
      };

      console.log(`Enriched item ${index}:`, enrichedItem); // Debug log

      return enrichedItem;
    }));

    console.log('All enriched items:', enrichedItems); // Debug log

    const totalAmount = enrichedItems.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);

    // Tạo order object trực tiếp thay vì sử dụng mongoose constructor
    const orderData = {
      user: userId,
      items: enrichedItems,
      totalAmount,
      paymentMethod,
      notes,
      promotionCode,
      statusHistory: [{ status: 'Chờ xác nhận' }],
    };

    console.log('Order data to save:', orderData); // Debug log

    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Sau khi tạo đơn hàng thành công, kiểm tra trạng thái
    if (savedOrder.status === 'completed') {
      // Trừ số lượng tồn kho cho từng sản phẩm
      for (const item of savedOrder.items) {
        const product = await Product.findById(item.product);
        if (product && product.pricingAndInventory && typeof product.pricingAndInventory.stockQuantity === 'number') {
          product.pricingAndInventory.stockQuantity = Math.max(0, product.pricingAndInventory.stockQuantity - item.quantity);
          await product.save();
        }
      }
    }

    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedOrder, Messages.ORDER_CREATED);
  } catch (error) {
    console.error('Order creation error:', error); // Debug log
    console.error('Error stack:', error.stack); // Debug log
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, orders, Messages.ORDER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id).populate('user', 'fullName email');
    if (!order) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return sendError(res, StatusCodes.ERROR_FORBIDDEN, Messages.FORBIDDEN);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.cancelRequestByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id);
    if (!order) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    if (order.user.toString() !== req.user._id.toString()) return sendError(res, StatusCodes.ERROR_FORBIDDEN, Messages.FORBIDDEN);

    // Kiểm tra trạng thái đơn hàng
    if (order.status === 'Chờ xác nhận') {
      // Cho phép hủy đơn hàng ở trạng thái chờ xác nhận
      const within3Hours = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60) <= 3;
      if (!within3Hours) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Chỉ có thể hủy đơn hàng trong vòng 3 giờ sau khi đặt.');
      }
    } else if (order.status === 'Xác nhận') {
      // Đơn hàng đã xác nhận, yêu cầu liên hệ email
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST,
        'Đơn hàng đã được xác nhận. Vui lòng liên hệ email support@example.com để được hỗ trợ hủy đơn.');
    } else if (order.status === 'Đang giao hàng') {
      // Đơn hàng đang giao, không cho phép hủy
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST,
        'Đơn hàng đang được giao. Không thể hủy đơn hàng lúc này.');
    } else if (['Đã hoàn thành', 'Hủy'].includes(order.status)) {
      // Đơn hàng đã hoàn thành hoặc đã hủy
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST,
        'Đơn hàng đã hoàn thành hoặc đã hủy. Không thể thực hiện thao tác này.');
    }

    order.isCancelRequested = true;
    order.cancelRequestTime = new Date();
    await order.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_CANCEL_REQUEST_SENT);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// ================= ADMIN ================= //

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, idUser, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (idUser && mongoose.Types.ObjectId.isValid(idUser)) query.user = idUser;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const orders = await Order.find(query)
      .populate('user', 'fullName email')
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit),
      data: orders
    }, Messages.ORDER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shippingInfo, pin } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id)
      .populate('items.product', 'pricingAndInventory.stockQuantity');

    if (!order)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    //  ▸ Không đổi
    if (order.status === status)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không thay đổi.');

    // 1. Nếu chuyển từ 'Xác nhận' về 'Chờ xác nhận' thì phải nhập đúng mã PIN
    if (order.status === 'Xác nhận' && status === 'Chờ xác nhận') {
      // Giả sử mã PIN đúng là '123456' (bạn có thể thay đổi logic xác thực này)
      if (pin !== '878889') {
        return sendError(res, StatusCodes.ERROR_FORBIDDEN, 'Mã PIN không đúng. Không thể chuyển trạng thái.');
      }
    }

    /** ============= 1. Trừ kho khi XÁC NHẬN lần đầu ============= */
    const deductStock = (order.status === 'Chờ xác nhận') && status === 'Xác nhận';

    if (deductStock) {
      // Kiểm kho
      for (const it of order.items) {
        if (!it.product)
          return sendError(res, 400, 'Sản phẩm đã bị xóa khỏi hệ thống.');
        const inStock = it.product.pricingAndInventory.stockQuantity;
        if (inStock < it.quantity)
          return sendError(res, 400,
            `Sản phẩm ${it.product._id} chỉ còn ${inStock} trong kho.`);
      }
      // Trừ kho
      await Product.bulkWrite(order.items.map(it => ({
        updateOne: {
          filter: { _id: it.product._id },
          update: { $inc: { 'pricingAndInventory.stockQuantity': -it.quantity } }
        }
      })));
    }

    /** ============= 2. Hoàn kho khi HỦY sau khi đã trừ ============= */
    const restoreStock =
      ['Xác nhận', 'Đang giao'].includes(order.status) && status === 'Hủy';

    if (restoreStock) {
      await Product.bulkWrite(order.items.map(it => ({
        updateOne: {
          filter: { _id: it.product._id },
          update: { $inc: { 'pricingAndInventory.stockQuantity': it.quantity } }
        }
      })));
    }

    /** ============= 3. Cập nhật trạng thái & lịch sử ============= */
    order.status = status;
    order.statusHistory.push({ status });
    // Nếu chuyển sang Đang giao hàng thì lưu shippingInfo
    if (status === 'Đang giao hàng' && shippingInfo) {
      order.shippingInfo = shippingInfo;
    }
    // 2. Nếu hủy đơn hàng, xử lý trạng thái thanh toán
    if (status === 'Hủy') {
      if (order.paymentStatus === 'Đã thanh toán') {
        order.paymentStatus = 'Đã hoàn tiền';
      } // nếu chưa thanh toán thì giữ nguyên paymentStatus
    }
    await order.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_STATUS_UPDATED);
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.respondCancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id);
    if (!order || !order.isCancelRequested)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Không có yêu cầu hủy đơn');

    // ❌ Nếu đơn đã xác nhận trở đi thì không được hủy
    const notCancelableStatuses = ['Xác nhận', 'Đang giao', 'Hoàn thành'];
    if (accept && notCancelableStatuses.includes(order.status)) {
      return sendError(
        res,
        StatusCodes.ERROR_BAD_REQUEST,
        'Đơn hàng đã được xác nhận, không thể hủy.'
      );
    }

    if (accept) {
      order.status = 'Hủy';
      order.statusHistory.push({ status: 'Hủy' });
      order.cancellationReason = reason || 'Người bán chấp nhận hủy đơn';

      // (Tùy chọn) Nếu muốn hoàn kho nếu trạng thái trước đó là "Chờ xác nhận"
      // hoặc kiểm tra theo logic bạn đã có
    } else {
      order.isCancelRequested = false;
      order.cancelRequestTime = null;
    }

    await order.save();
    return sendSuccess(
      res,
      StatusCodes.SUCCESS_OK,
      order,
      accept ? Messages.ORDER_CANCELED : Messages.ORDER_CANCEL_REQUEST_DECLINED
    );
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const updates = { ...req.body };
    delete updates._id;

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedOrder) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updatedOrder, Messages.ORDER_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.ORDER_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
