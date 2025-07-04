const Storage = require('../Models/Storage');
const Product = require('../Models/Products');
const ProductDetail = require('../Models/ProductDetail');
const Category = require('../Models/Categories');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const checkPin = require('../Utils/checkPin');

const isValidId = id => require('mongoose').Types.ObjectId.isValid(id);

// Lấy danh sách phiếu nhập/xuất kho
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;
        const skip = (page - 1) * limit;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        const [storages, total] = await Promise.all([
            Storage.find(filter)
                .populate('product', 'basicInformation')
                .populate('productDetail', 'pricingAndInventory')
                .populate('category', 'name')
                .sort({ createdAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit))
                .lean(),
            Storage.countDocuments(filter)
        ]);
        return sendSuccess(res, StatusCodes.SUCCESS_OK, {
            data: storages,
            totalItems: total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            perPage: Number(limit)
        });
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
};

// Lấy chi tiết 1 phiếu
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'ID không hợp lệ!');
        const storage = await Storage.findById(id)
            .populate('product', 'basicInformation')
            .populate('productDetail', 'pricingAndInventory')
            .populate('category', 'name')
            .lean();
        if (!storage) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy phiếu!');
        return sendSuccess(res, StatusCodes.SUCCESS_OK, storage);
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
};

// Tạo mới phiếu nhập/xuất kho
exports.create = async (req, res) => {
    try {
        const data = req.body;
        // Validate cơ bản
        if (!data.product || !isValidId(data.product)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu sản phẩm!');
        if (!data.type || !['import', 'export'].includes(data.type)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Loại phiếu không hợp lệ!');
        if (!data.quantity || data.quantity <= 0) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Số lượng không hợp lệ!');
        // Có thể validate thêm các trường khác nếu cần
        const storage = await Storage.create(data);
        return sendSuccess(res, StatusCodes.SUCCESS_CREATED, storage, 'Tạo phiếu thành công');
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
};

// Cập nhật phiếu
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'ID không hợp lệ!');
        const data = req.body;
        const storage = await Storage.findByIdAndUpdate(id, data, { new: true })
            .populate('product', 'basicInformation')
            .populate('productDetail', 'pricingAndInventory')
            .populate('category', 'name')
            .lean();
        if (!storage) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy phiếu!');
        return sendSuccess(res, StatusCodes.SUCCESS_OK, storage, 'Cập nhật phiếu thành công');
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
};

// Xóa phiếu
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'ID không hợp lệ!');
        const storage = await Storage.findByIdAndDelete(id);
        if (!storage) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy phiếu!');
        return sendSuccess(res, StatusCodes.SUCCESS_OK, storage, 'Xóa phiếu thành công');
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
};

// Chuyển trạng thái phiếu nhập kho (duyệt phiếu hoặc hủy phiếu)
exports.changeStatus = async (req, res) => {
    // Yêu cầu mã PIN khi duyệt phiếu
    try {
        if (req.body.status === 'Đã Duyệt') {
            await checkPin(req); // sẽ throw nếu thiếu hoặc sai PIN
            delete req.body.pin;
        }
    } catch (e) {
        return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, e.message);
    }
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'ID không hợp lệ!');
        if (!['Đợi Duyệt', 'Đã Duyệt', 'Trả Hàng'].includes(status)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không hợp lệ!');
        const storage = await Storage.findById(id);
        if (!storage) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy phiếu!');
        if (storage.status === status) return sendSuccess(res, StatusCodes.SUCCESS_OK, storage, 'Trạng thái không thay đổi');

        // Nếu chuyển sang Đã Duyệt và là phiếu nhập
        if (status === 'Đã Duyệt' && storage.type === 'import') {
            if (storage.status === 'Đã Duyệt') return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Phiếu đã được duyệt!');
            const detail = await ProductDetail.findById(storage.productDetail);
            if (!detail) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy chi tiết sản phẩm!');
            const oldStock = detail.pricingAndInventory.stockQuantity || 0;
            detail.pricingAndInventory.stockQuantity = oldStock + storage.quantity;
            await detail.save();
        }

        // Nếu chuyển sang Trả Hàng (hủy phiếu)
        if (status === 'Trả Hàng') {
            // Nếu phiếu đã duyệt trước đó thì phải trừ lại tồn kho
            if (storage.status === 'Đã Duyệt' && storage.type === 'import') {
                const detail = await ProductDetail.findById(storage.productDetail);
                if (!detail) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy chi tiết sản phẩm!');
                const oldStock = detail.pricingAndInventory.stockQuantity || 0;
                // Đảm bảo không trừ âm kho
                detail.pricingAndInventory.stockQuantity = Math.max(0, oldStock - storage.quantity);
                await detail.save();
            }
            // Nếu phiếu đang ở Đợi Duyệt thì chỉ cập nhật trạng thái
        }

        storage.status = status;
        await storage.save();
        return sendSuccess(res, StatusCodes.SUCCESS_OK, storage, 'Cập nhật trạng thái thành công');
    } catch (err) {
        return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
}; 