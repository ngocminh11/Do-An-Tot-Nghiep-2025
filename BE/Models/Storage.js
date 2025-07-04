const mongoose = require('mongoose');
const { Schema } = mongoose;

const StorageSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productDetail: { type: Schema.Types.ObjectId, ref: 'ProductDetail' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' }, // nếu là xuất kho cho đơn hàng
    type: { type: String, enum: ['import', 'export'], required: true }, // nhập/xuất
    quantity: { type: Number, required: true },
    originalPrice: { type: Number }, // giá nhập
    batchCode: { type: String },
    mfgDate: { type: Date },
    expDate: { type: Date },
    note: { type: String },
    supplier: { type: String },
    supplierCode: { type: String },
    supplierAddress: { type: String },
    supplierPhone: { type: String },
    supplierEmail: { type: String },
    createdBy: { type: String }, // người tạo phiếu
    receivedBy: { type: String },
    billCode: { type: String },
    billDate: { type: Date },
    paymentMethod: { type: String },
    shippingFee: { type: Number },
    discount: { type: Number },
    vat: { type: Number },
    totalBeforeDiscount: { type: Number },
    totalDiscount: { type: Number },
    totalAfterDiscount: { type: Number },
    totalVAT: { type: Number },
    totalFinal: { type: Number },
    status: { type: String, enum: ['Đợi Duyệt', 'Đã Duyệt','Trả Hàng'], default: 'Đợi Duyệt' }, // trạng thái phiếu nhập kho
}, { timestamps: true });

module.exports = mongoose.model('Storage', StorageSchema); 