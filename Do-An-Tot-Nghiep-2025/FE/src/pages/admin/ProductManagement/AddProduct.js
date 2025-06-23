import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Divider,
  message,
  Modal,
  Space
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import tagService from '../../../services/tagService';
import { useNavigate } from 'react-router-dom';
import './ProductManagement.scss';

const { Option } = Select;
const { TextArea } = Input;

const STORAGE_KEY = 'product_form_draft';

const AddProduct = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);

  // Thêm hàm tạo SKU từ tên sản phẩm
  const generateSKU = (productName) => {
    if (!productName) return '';
    // Chuyển đổi tên sản phẩm thành SKU
    const sku = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/[^a-z0-9]/g, '-') // Thay thế ký tự đặc biệt bằng dấu gạch ngang
      .replace(/-+/g, '-') // Loại bỏ dấu gạch ngang liên tiếp
      .replace(/^-|-$/g, ''); // Loại bỏ dấu gạch ngang ở đầu và cuối
    return sku;
  };

  // Thêm các validation rules
  const productNameRules = [
    { required: true, message: 'Vui lòng nhập tên sản phẩm' },
    { min: 2, message: 'Tên sản phẩm phải có ít nhất 2 ký tự' },
    { max: 200, message: 'Tên sản phẩm không được vượt quá 200 ký tự' }
  ];

  const skuRules = [
    { required: false, message: 'Vui lòng nhập mã SKU' },
    { pattern: /^[a-z0-9-]+$/, message: 'SKU chỉ được chứa chữ cái thường, số và dấu gạch ngang' },
    { min: 3, message: 'SKU phải có ít nhất 3 ký tự' },
    { max: 50, message: 'SKU không được vượt quá 50 ký tự' }
  ];

  const priceRules = [
    { required: true, message: 'Vui lòng nhập giá' },
    { type: 'number', min: 0, message: 'Giá không được âm' }
  ];

  const stockRules = [
    { required: true, message: 'Vui lòng nhập số lượng tồn kho' },
    { type: 'number', min: 0, message: 'Số lượng không được âm' }
  ];

  // Thêm các options cho các trường select
  const skinTypes = [
    'Da mụn',
    'Da nhạy cảm',
    'Da khô',
    'Da dầu',
    'Da hỗn hợp',
    'Da thường',
    'Da lão hóa',
    'Da nám',
    'Da mất nước',
    'Da dầu nhạy cảm',
    'Da khô nhạy cảm',
    'Da mụn nhạy cảm',
    'Da dầu mụn',
    'Da khô mụn',
    'Da hỗn hợp thiên dầu',
    'Da hỗn hợp thiên khô',
    'Da nhạy cảm dễ kích ứng',
    'Da bị tổn thương',
    'Da sau điều trị',
    'Da sau phẫu thuật'
  ];

  const units = [
    'Chai',
    'Tuýp',
    'Hộp',
    'Lọ',
    'Bộ',
    'Cái',
    'Gói',
    'ml',
    'g',
    'kg',
    'l',
    'Cặp',
    'Hũ',
    'Túi',
    'Viên',
    'Miếng',
    'Ống',
    'Bình xịt',
    'Bình xịt phun sương',
    'Bình xịt định liều'
  ];

  const certifications = [
    'FDA (Cục Quản lý Thực phẩm và Dược phẩm Hoa Kỳ)',
    'CE (Chứng nhận Châu Âu)',
    'ISO 9001 (Quản lý chất lượng)',
    'ISO 22716 (Sản xuất mỹ phẩm)',
    'GMP (Thực hành sản xuất tốt)',
    'Halal (Chứng nhận Hồi giáo)',
    'Cruelty Free (Không thử nghiệm trên động vật)',
    'Vegan (Thuần chay)',
    'Organic (Hữu cơ)',
    'Made in Vietnam (Sản xuất tại Việt Nam)',
    'Made in Korea (Sản xuất tại Hàn Quốc)',
    'Made in Japan (Sản xuất tại Nhật Bản)',
    'Made in France (Sản xuất tại Pháp)',
    'Made in USA (Sản xuất tại Mỹ)',
    'Made in Germany (Sản xuất tại Đức)',
    'Made in Italy (Sản xuất tại Ý)',
    'Made in Switzerland (Sản xuất tại Thụy Sĩ)',
    'Made in Australia (Sản xuất tại Úc)',
    'Made in UK (Sản xuất tại Anh)',
    'Made in Canada (Sản xuất tại Canada)'
  ];

  const commonIngredients = [
    // Vitamin và dẫn xuất
    'Vitamin A (Retinol)',
    'Vitamin B3 (Niacinamide)',
    'Vitamin B5 (Panthenol)',
    'Vitamin B7 (Biotin)',
    'Vitamin C (Axit Ascorbic)',
    'Vitamin D (Calciferol)',
    'Vitamin E (Tocopherol)',
    'Vitamin K (Phylloquinone)',
    'Vitamin F (Axit béo thiết yếu)',
    'Vitamin P (Bioflavonoid)',

    // Axit
    'Axit Hyaluronic (Hyaluronic Acid)',
    'Axit Salicylic (Salicylic Acid)',
    'Axit Glycolic (Glycolic Acid)',
    'Axit Lactic (Lactic Acid)',
    'Axit Mandelic (Mandelic Acid)',
    'Axit Azelaic (Azelaic Acid)',
    'Axit Kojic (Kojic Acid)',
    'Axit Tranexamic (Tranexamic Acid)',
    'Axit Ferulic (Ferulic Acid)',
    'Axit Linoleic (Linoleic Acid)',
    'Axit Linolenic (Linolenic Acid)',
    'Axit Oleic (Oleic Acid)',
    'Axit Stearic (Stearic Acid)',
    'Axit Palmitic (Palmitic Acid)',
    'Axit Myristic (Myristic Acid)',
    'Axit Lauric (Lauric Acid)',
    'Axit Caprylic (Caprylic Acid)',
    'Axit Capric (Capric Acid)',
    'Axit Undecylenic (Undecylenic Acid)',
    'Axit Malic (Malic Acid)',
    'Axit Tartaric (Tartaric Acid)',
    'Axit Citric (Citric Acid)',
    'Axit Ascorbic (Vitamin C)',
    'Axit Folic (Folic Acid)',
    'Axit Pantothenic (Pantothenic Acid)',

    // Peptide và Protein
    'Copper Peptide (Peptide Đồng)',
    'Matrixyl (Peptide Ma trận)',
    'Argireline (Peptide Botox)',
    'Palmitoyl Pentapeptide-4 (Matrixyl)',
    'Palmitoyl Tripeptide-1 (Matrixyl)',
    'Palmitoyl Tetrapeptide-7 (Matrixyl)',
    'Acetyl Hexapeptide-8 (Argireline)',
    'Acetyl Octapeptide-3 (SNAP-8)',
    'Acetyl Decapeptide-3 (SNAP-10)',
    'Palmitoyl Oligopeptide (Matrixyl)',
    'Palmitoyl Dipeptide-5 (Matrixyl)',
    'Palmitoyl Tripeptide-5 (Matrixyl)',
    'Palmitoyl Tetrapeptide-3 (Matrixyl)',
    'Palmitoyl Hexapeptide-12 (Matrixyl)',
    'Palmitoyl Heptapeptide-27 (Matrixyl)',
    'Collagen (Protein)',
    'Elastin (Protein)',
    'Keratin (Protein)',
    'Silk Protein (Protein Tơ)',
    'Wheat Protein (Protein Lúa mì)',
    'Soy Protein (Protein Đậu nành)',
    'Rice Protein (Protein Gạo)',
    'Oat Protein (Protein Yến mạch)',
    'Corn Protein (Protein Ngô)',
    'Milk Protein (Protein Sữa)',

    // Ceramide và Lipid
    'Ceramide NP (Xeramit NP)',
    'Ceramide AP (Xeramit AP)',
    'Ceramide EOP (Xeramit EOP)',
    'Ceramide EOS (Xeramit EOS)',
    'Ceramide NS (Xeramit NS)',
    'Ceramide NG (Xeramit NG)',
    'Ceramide AS (Xeramit AS)',
    'Ceramide AG (Xeramit AG)',
    'Phytosphingosine (Phytosphingosin)',
    'Sphingosine (Sphingosin)',
    'Cholesterol (Cholesterol)',
    'Squalane (Squalan)',
    'Squalene (Squalen)',
    'Phytosterol (Phytosterol)',
    'Beta-Sitosterol (Beta-Sitosterol)',

    // Chiết xuất thực vật
    'Centella Asiatica (Rau má)',
    'Green Tea Extract (Chiết xuất trà xanh)',
    'Aloe Vera (Nha đam)',
    'Chamomile Extract (Chiết xuất hoa cúc)',
    'Calendula Extract (Chiết xuất cúc vạn thọ)',
    'Lavender Extract (Chiết xuất oải hương)',
    'Rosemary Extract (Chiết xuất hương thảo)',
    'Sage Extract (Chiết xuất xô thơm)',
    'Thyme Extract (Chiết xuất húng tây)',
    'Mint Extract (Chiết xuất bạc hà)',
    'Peppermint Extract (Chiết xuất bạc hà cay)',
    'Eucalyptus Extract (Chiết xuất bạch đàn)',
    'Tea Tree Extract (Chiết xuất tràm trà)',
    'Witch Hazel Extract (Chiết xuất cây phỉ)',
    'Ginkgo Biloba Extract (Chiết xuất bạch quả)',
    'Ginseng Extract (Chiết xuất nhân sâm)',
    'Ginger Extract (Chiết xuất gừng)',
    'Turmeric Extract (Chiết xuất nghệ)',
    'Licorice Extract (Chiết xuất cam thảo)',
    'Marshmallow Extract (Chiết xuất thục quỳ)',
    'Comfrey Extract (Chiết xuất lưu ly)',
    'Plantain Extract (Chiết xuất mã đề)',
    'Dandelion Extract (Chiết xuất bồ công anh)',
    'Burdock Extract (Chiết xuất ngưu bàng)',
    'Nettle Extract (Chiết xuất tầm ma)',
    'Horsetail Extract (Chiết xuất đuôi ngựa)',
    'Yarrow Extract (Chiết xuất cỏ thi)',
    'Elderberry Extract (Chiết xuất cơm cháy)',
    'Bilberry Extract (Chiết xuất việt quất)',
    'Cranberry Extract (Chiết xuất nam việt quất)',
    'Blueberry Extract (Chiết xuất dâu xanh)',
    'Strawberry Extract (Chiết xuất dâu tây)',
    'Raspberry Extract (Chiết xuất mâm xôi)',
    'Blackberry Extract (Chiết xuất mâm xôi đen)',
    'Goji Berry Extract (Chiết xuất kỷ tử)',
    'Acai Berry Extract (Chiết xuất acai)',
    'Pomegranate Extract (Chiết xuất lựu)',
    'Grape Extract (Chiết xuất nho)',
    'Apple Extract (Chiết xuất táo)',
    'Pear Extract (Chiết xuất lê)',
    'Peach Extract (Chiết xuất đào)',
    'Apricot Extract (Chiết xuất mơ)',
    'Plum Extract (Chiết xuất mận)',
    'Cherry Extract (Chiết xuất anh đào)',
    'Orange Extract (Chiết xuất cam)',
    'Lemon Extract (Chiết xuất chanh)',
    'Lime Extract (Chiết xuất chanh xanh)',
    'Grapefruit Extract (Chiết xuất bưởi)',
    'Tangerine Extract (Chiết xuất quýt)',
    'Mandarin Extract (Chiết xuất quýt đường)',
    'Pomelo Extract (Chiết xuất bưởi)',
    'Kumquat Extract (Chiết xuất quất)',
    'Bergamot Extract (Chiết xuất cam bergamot)',
    'Yuzu Extract (Chiết xuất quýt Nhật)',
    'Calamansi Extract (Chiết xuất chanh dây)',
    'Passion Fruit Extract (Chiết xuất chanh dây)',
    'Guava Extract (Chiết xuất ổi)',
    'Mango Extract (Chiết xuất xoài)',
    'Papaya Extract (Chiết xuất đu đủ)',
    'Pineapple Extract (Chiết xuất dứa)',
    'Banana Extract (Chiết xuất chuối)',
    'Coconut Extract (Chiết xuất dừa)',
    'Avocado Extract (Chiết xuất bơ)',
    'Olive Extract (Chiết xuất ô liu)',
    'Almond Extract (Chiết xuất hạnh nhân)',
    'Walnut Extract (Chiết xuất óc chó)',
    'Pecan Extract (Chiết xuất hồ đào)',
    'Cashew Extract (Chiết xuất điều)',
    'Pistachio Extract (Chiết xuất hồ trăn)',
    'Macadamia Extract (Chiết xuất mắc ca)',
    'Hazelnut Extract (Chiết xuất phỉ)',
    'Brazil Nut Extract (Chiết xuất hạt Brazil)',
    'Pine Nut Extract (Chiết xuất thông)',
    'Sunflower Seed Extract (Chiết xuất hạt hướng dương)',
    'Pumpkin Seed Extract (Chiết xuất hạt bí)',
    'Sesame Seed Extract (Chiết xuất hạt mè)',
    'Flax Seed Extract (Chiết xuất hạt lanh)',
    'Chia Seed Extract (Chiết xuất hạt chia)',
    'Quinoa Extract (Chiết xuất diêm mạch)',
    'Amaranth Extract (Chiết xuất rau dền)',
    'Buckwheat Extract (Chiết xuất kiều mạch)',
    'Millet Extract (Chiết xuất kê)',
    'Sorghum Extract (Chiết xuất cao lương)',
    'Barley Extract (Chiết xuất lúa mạch)',
    'Oat Extract (Chiết xuất yến mạch)',
    'Wheat Extract (Chiết xuất lúa mì)',
    'Rye Extract (Chiết xuất lúa mạch đen)',
    'Rice Extract (Chiết xuất gạo)',
    'Corn Extract (Chiết xuất ngô)',
    'Potato Extract (Chiết xuất khoai tây)',
    'Sweet Potato Extract (Chiết xuất khoai lang)',
    'Carrot Extract (Chiết xuất cà rốt)',
    'Beetroot Extract (Chiết xuất củ dền)',
    'Radish Extract (Chiết xuất củ cải)',
    'Turnip Extract (Chiết xuất củ cải)',
    'Parsnip Extract (Chiết xuất củ cải)',
    'Rutabaga Extract (Chiết xuất củ cải)',
    'Celery Extract (Chiết xuất cần tây)',
    'Fennel Extract (Chiết xuất thì là)',
    'Parsley Extract (Chiết xuất mùi tây)',
    'Cilantro Extract (Chiết xuất ngò)',
    'Basil Extract (Chiết xuất húng quế)',
    'Oregano Extract (Chiết xuất kinh giới)',
    'Marjoram Extract (Chiết xuất kinh giới)',
    'Thyme Extract (Chiết xuất húng tây)',
    'Sage Extract (Chiết xuất xô thơm)',
    'Rosemary Extract (Chiết xuất hương thảo)',
    'Lavender Extract (Chiết xuất oải hương)',
    'Mint Extract (Chiết xuất bạc hà)',
    'Peppermint Extract (Chiết xuất bạc hà cay)',
    'Spearmint Extract (Chiết xuất bạc hà)',
    'Lemon Balm Extract (Chiết xuất tía tô)',
    'Catnip Extract (Chiết xuất bạc hà mèo)',
    'Horehound Extract (Chiết xuất bạc hà)',
    'Hyssop Extract (Chiết xuất hương thảo)',
    'Savory Extract (Chiết xuất húng tây)',
    'Tarragon Extract (Chiết xuất ngải giấm)',
    'Dill Extract (Chiết xuất thì là)',
    'Chervil Extract (Chiết xuất mùi tây)',
    'Chives Extract (Chiết xuất hẹ)',
    'Garlic Extract (Chiết xuất tỏi)',
    'Onion Extract (Chiết xuất hành)',
    'Shallot Extract (Chiết xuất hành tím)',
    'Leek Extract (Chiết xuất tỏi tây)',
    'Scallion Extract (Chiết xuất hành lá)',
    'Chive Extract (Chiết xuất hẹ)',
    'Garlic Chive Extract (Chiết xuất hẹ)',
    'Ramp Extract (Chiết xuất tỏi rừng)',
    'Wild Garlic Extract (Chiết xuất tỏi rừng)',
    'Wild Onion Extract (Chiết xuất hành rừng)',
    'Wild Leek Extract (Chiết xuất tỏi tây rừng)',
    'Wild Chive Extract (Chiết xuất hẹ rừng)',
    'Wild Garlic Chive Extract (Chiết xuất hẹ rừng)',
    'Wild Ramp Extract (Chiết xuất tỏi rừng)',
    'Wild Scallion Extract (Chiết xuất hành lá rừng)',
    'Wild Shallot Extract (Chiết xuất hành tím rừng)',
    'Wild Onion Chive Extract (Chiết xuất hành hành lá rừng)',
    'Wild Chive Leek Extract (Chiết xuất hẹ tỏi tây rừng)',
    'Wild Ramp Chive Extract (Chiết xuất tỏi rừng hẹ)',
    'Wild Scallion Chive Extract (Chiết xuất hành lá hẹ rừng)',
    'Wild Shallot Chive Extract (Chiết xuất hành tím hẹ rừng)',
    'Wild Onion Garlic Extract (Chiết xuất hành tỏi rừng)',
    'Wild Leek Garlic Extract (Chiết xuất tỏi tây tỏi rừng)',
    'Wild Ramp Garlic Extract (Chiết xuất tỏi rừng tỏi)',
    'Wild Scallion Garlic Extract (Chiết xuất hành lá tỏi rừng)',
    'Wild Shallot Garlic Extract (Chiết xuất hành tím tỏi rừng)',
    'Wild Onion Leek Extract (Chiết xuất hành tỏi tây rừng)',
    'Wild Chive Leek Extract (Chiết xuất hẹ tỏi tây rừng)',
    'Wild Ramp Leek Extract (Chiết xuất tỏi rừng tỏi tây)',
    'Wild Scallion Leek Extract (Chiết xuất hành lá tỏi tây rừng)',
    'Wild Shallot Leek Extract (Chiết xuất hành tím tỏi tây rừng)',
    'Wild Onion Ramp Extract (Chiết xuất hành tỏi rừng)',
    'Wild Chive Ramp Extract (Chiết xuất hẹ tỏi rừng)',
    'Wild Garlic Ramp Extract (Chiết xuất tỏi tỏi rừng)',
    'Wild Scallion Ramp Extract (Chiết xuất hành lá tỏi rừng)',
    'Wild Shallot Ramp Extract (Chiết xuất hành tím tỏi rừng)',
    'Wild Onion Scallion Shallot Extract (Chiết xuất hành hành lá hành tím rừng)',
    'Wild Chive Garlic Leek Extract (Chiết xuất hẹ tỏi tỏi tây rừng)',
    'Wild Chive Garlic Ramp Extract (Chiết xuất hẹ tỏi tỏi rừng)',
    'Wild Chive Garlic Scallion Extract (Chiết xuất hẹ tỏi hành lá rừng)',
    'Wild Chive Garlic Shallot Extract (Chiết xuất hẹ tỏi hành tím rừng)',
    'Wild Chive Leek Ramp Extract (Chiết xuất hẹ tỏi tây tỏi rừng)',
    'Wild Chive Leek Scallion Extract (Chiết xuất hẹ tỏi tây hành lá rừng)',
    'Wild Chive Leek Shallot Extract (Chiết xuất hẹ tỏi tây hành tím rừng)',
    'Wild Chive Ramp Scallion Extract (Chiết xuất hẹ tỏi rừng hành lá)',
    'Wild Garlic Leek Ramp Extract (Chiết xuất tỏi tỏi tây tỏi rừng)',
    'Wild Garlic Leek Ramp Shallot Extract (Chiết xuất tỏi tỏi tây tỏi rừng hành tím)',
    'Wild Garlic Leek Scallion Shallot Extract (Chiết xuất tỏi tỏi tây hành lá hành tím rừng)',
    'Wild Leek Ramp Scallion Shallot Extract (Chiết xuất tỏi tây tỏi rừng hành lá hành tím)',
    'Wild Onion Chive Garlic Leek Ramp Extract (Chiết xuất hành hẹ tỏi tỏi tây tỏi rừng)',
    'Wild Onion Chive Garlic Leek Scallion Extract (Chiết xuất hành hẹ tỏi tỏi tây hành lá rừng)',
    'Wild Onion Chive Garlic Leek Shallot Extract (Chiết xuất hành hẹ tỏi tỏi tây hành tím rừng)',
    'Wild Onion Chive Garlic Ramp Scallion Extract (Chiết xuất hành hẹ tỏi tỏi rừng hành lá)',
    'Wild Onion Chive Garlic Ramp Shallot Extract (Chiết xuất hành hẹ tỏi tỏi rừng hành tím)',
    'Wild Onion Chive Garlic Scallion Shallot Extract (Chiết xuất hành hẹ tỏi hành lá hành tím rừng)',
    'Wild Onion Chive Leek Ramp Scallion Extract (Chiết xuất hành hẹ tỏi tây tỏi rừng hành lá)',
    'Wild Onion Chive Leek Ramp Shallot Extract (Chiết xuất hành hẹ tỏi tây tỏi rừng hành tím)',
    'Wild Onion Chive Leek Scallion Shallot Extract (Chiết xuất hành hẹ tỏi tây hành lá hành tím rừng)',
    'Wild Onion Garlic Leek Ramp Scallion Extract (Chiết xuất hành tỏi tỏi tây tỏi rừng hành lá)',
    'Wild Onion Garlic Leek Ramp Shallot Extract (Chiết xuất hành tỏi tỏi tây tỏi rừng hành tím)',
    'Wild Onion Garlic Leek Scallion Shallot Extract (Chiết xuất hành tỏi tỏi tây hành lá hành tím rừng)',
    'Wild Chive Garlic Leek Ramp Scallion Extract (Chiết xuất hẹ tỏi tỏi tây tỏi rừng hành lá)',
    'Wild Chive Garlic Leek Ramp Shallot Extract (Chiết xuất hẹ tỏi tỏi tây tỏi rừng hành tím)',
    'Wild Chive Garlic Leek Scallion Shallot Extract (Chiết xuất hẹ tỏi tỏi tây hành lá hành tím rừng)',
    'Wild Garlic Leek Ramp Scallion Shallot Extract (Chiết xuất tỏi tỏi tây tỏi rừng hành lá hành tím)',
    'Wild Onion Chive Garlic Leek Ramp Scallion Extract (Chiết xuất hành hẹ tỏi tỏi tây tỏi rừng hành lá)',
    'Wild Onion Chive Garlic Leek Ramp Shallot Extract (Chiết xuất hành hẹ tỏi tỏi tây tỏi rừng hành tím)',
    'Wild Onion Chive Garlic Leek Scallion Shallot Extract (Chiết xuất hành hẹ tỏi tỏi tây hành lá hành tím rừng)',
    'Wild Chive Garlic Leek Ramp Scallion Shallot Extract (Chiết xuất hẹ tỏi tỏi tây tỏi rừng hành lá hành tím)',
    'Wild Onion Chive Garlic Leek Ramp Scallion Shallot Extract (Chiết xuất hành hẹ tỏi tỏi tây tỏi rừng hành lá hành tím)'
  ];

  const commonUsageInstructions = [
    'Rửa mặt sạch với sữa rửa mặt',
    'Thoa một lượng vừa đủ lên da',
    'Massage nhẹ nhàng theo chiều kim đồng hồ',
    'Sử dụng 2 lần/ngày (sáng và tối)',
    'Tránh vùng mắt và vùng môi',
    'Thoa kem chống nắng sau khi sử dụng',
    'Không sử dụng khi da đang bị tổn thương',
    'Thử nghiệm trên vùng da nhỏ trước khi sử dụng',
    'Bảo quản nơi khô ráo, thoáng mát',
    'Tránh ánh nắng trực tiếp',
    'Sử dụng sau bước toner',
    'Sử dụng trước bước dưỡng ẩm',
    'Sử dụng sau bước serum',
    'Sử dụng trước bước kem dưỡng',
    'Sử dụng sau bước tẩy tế bào chết',
    'Sử dụng sau bước làm sạch',
    'Sử dụng sau bước cân bằng da',
    'Sử dụng sau bước làm dịu da',
    'Sử dụng sau bước làm sáng da',
    'Sử dụng sau bước làm se khít lỗ chân lông'
  ];

  const expirationOptions = [
    '12 tháng kể từ ngày sản xuất',
    '18 tháng kể từ ngày sản xuất',
    '24 tháng kể từ ngày sản xuất',
    '36 tháng kể từ ngày sản xuất',
    '6 tháng sau khi mở nắp',
    '12 tháng sau khi mở nắp',
    '18 tháng sau khi mở nắp',
    '24 tháng sau khi mở nắp',
    'Không có hạn sử dụng',
    'Xem ngày trên bao bì',
    '3 tháng sau khi mở nắp',
    '9 tháng sau khi mở nắp',
    '15 tháng sau khi mở nắp',
    '21 tháng sau khi mở nắp',
    '30 tháng sau khi mở nắp',
    '48 tháng sau khi mở nắp',
    '60 tháng sau khi mở nắp',
    '72 tháng sau khi mở nắp',
    '84 tháng sau khi mở nắp',
    '96 tháng sau khi mở nắp'
  ];

  const sizeWeightOptions = [
    '30ml',
    '50ml',
    '100ml',
    '150ml',
    '200ml',
    '250ml',
    '300ml',
    '400ml',
    '500ml',
    '30g',
    '50g',
    '100g',
    '150g',
    '200g',
    '250g',
    '300g',
    '400g',
    '500g',
    '1kg',
    '2kg'
  ];

  const commonKeywords = [
    'skincare',
    'dưỡng da',
    'trị mụn',
    'dưỡng ẩm',
    'làm sáng da',
    'chống lão hóa',
    'se khít lỗ chân lông',
    'làm mờ thâm',
    'dưỡng trắng',
    'cấp ẩm',
    'làm dịu da',
    'làm sạch da',
    'tẩy tế bào chết',
    'trị nám',
    'trị thâm',
    'trị sẹo',
    'trị mụn đầu đen',
    'trị mụn đầu trắng',
    'trị mụn viêm',
    'trị mụn bọc',
    'trị mụn ẩn',
    'trị mụn cám',
    'trị mụn trứng cá',
    'trị mụn bọc mủ',
    'trị mụn bọc viêm',
    'trị mụn bọc sưng',
    'trị mụn bọc đỏ',
    'trị mụn bọc đau',
    'trị mụn bọc ngứa',
    'trị mụn bọc rát'
  ];

  const shippingReturnOptions = [
    'Miễn phí vận chuyển toàn quốc',
    'Miễn phí vận chuyển cho đơn từ 500k',
    'Miễn phí vận chuyển cho đơn từ 1 triệu',
    'Miễn phí vận chuyển cho đơn từ 2 triệu',
    'Miễn phí vận chuyển cho đơn từ 3 triệu',
    'Miễn phí vận chuyển cho đơn từ 5 triệu',
    'Đổi trả trong 7 ngày',
    'Đổi trả trong 14 ngày',
    'Đổi trả trong 30 ngày',
    'Hoàn tiền 100% nếu không hài lòng',
    'Bảo hành chính hãng 12 tháng',
    'Bảo hành chính hãng 24 tháng',
    'Bảo hành chính hãng 36 tháng',
    'Hỗ trợ đổi size',
    'Hỗ trợ đổi màu',
    'Không áp dụng đổi trả với sản phẩm đã mở',
    'Không áp dụng đổi trả với sản phẩm đã sử dụng',
    'Không áp dụng đổi trả với sản phẩm đã hết hạn',
    'Không áp dụng đổi trả với sản phẩm đã hỏng',
    'Không áp dụng đổi trả với sản phẩm đã mất tem'
  ];

  const additionalOptions = [
    'Tặng kèm sản phẩm dùng thử',
    'Tặng kèm quà tặng sinh nhật',
    'Tặng kèm voucher giảm giá',
    'Tặng kèm hộp đựng sản phẩm',
    'Tặng kèm hướng dẫn sử dụng',
    'Tặng kèm bông tẩy trang',
    'Tặng kèm khăn mặt',
    'Tặng kèm bàn chải',
    'Tặng kèm túi đựng',
    'Tặng kèm sổ tay',
    'Tặng kèm bút',
    'Tặng kèm móc khóa',
    'Tặng kèm thẻ thành viên',
    'Tặng kèm thẻ tích điểm',
    'Tặng kèm thẻ giảm giá',
    'Tặng kèm thẻ quà tặng',
    'Tặng kèm thẻ khách hàng thân thiết',
    'Tặng kèm thẻ VIP',
    'Tặng kèm thẻ hội viên',
    'Tặng kèm thẻ thành viên vàng'
  ];

  // Hàm lưu form data vào localStorage
  const saveFormDraft = (values) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving form draft:', error);
    }
  };

  // Hàm xóa form draft
  const clearFormDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasDraft(false);
  };

  // Hàm load form draft
  const loadFormDraft = () => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        form.setFieldsValue(parsedDraft);
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error loading form draft:', error);
    }
  };

  // Kiểm tra và load draft khi component mount
  useEffect(() => {
    loadFormDraft();
  }, []);

  // Lưu form data khi có thay đổi
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const formValues = form.getFieldsValue();
      if (Object.keys(formValues).length > 0) {
        saveFormDraft(formValues);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoryService.getAllCategories();
        if (response && response.data && response.data.data) {
          setCategories(response.data.data);
        } else {
          setCategories([]);
          message.error('Không thể tải danh mục sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('Không thể tải danh mục sản phẩm');
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await productService.getAllBrands();
        setBrands(response.data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        message.error('Không thể tải danh sách thương hiệu');
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await tagService.getAllTags();
        if (response && response.data && response.data.data) {
          setTags(response.data.data);
        } else {
          setTags([]);
          message.error('Không thể tải danh sách tags');
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        message.error('Không thể tải danh sách tags');
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Form values:', values);

      // Validate images
      if (!values.media?.mainImage?.[0]?.originFileObj) {
        throw new Error('Vui lòng tải lên ảnh chính cho sản phẩm');
      }

      const mainImage = values.media.mainImage[0];
      const galleryImages = values.media.galleryImages || [];

      // Validate total images
      if (galleryImages.length > 5) {
        throw new Error('Tối đa chỉ được tải lên 5 ảnh gallery');
      }

      // Validate total size
      const totalSize = [mainImage, ...galleryImages].reduce((sum, file) => sum + file.originFileObj.size, 0);
      if (totalSize > 30 * 1024 * 1024) {
        throw new Error('Tổng kích thước ảnh không được vượt quá 30MB');
      }

      // Format data
      const basicInformation = {
        productName: values.basicInformation.productName,
        sku: values.basicInformation.sku,
        status: 'active',
        brand: values.basicInformation.brand,
        categoryIds: values.basicInformation.categoryIds || [],
        tagIds: values.basicInformation.tagIds || []
      };

      const pricingAndInventory = {
        originalPrice: Number(values.pricingAndInventory.originalPrice),
        salePrice: Number(values.pricingAndInventory.salePrice),
        currency: 'VND',
        stockQuantity: Number(values.pricingAndInventory.stockQuantity),
        unit: values.pricingAndInventory.unit
      };

      const description = {
        shortDescription: values.description.shortDescription,
        detailedDescription: values.description.detailedDescription,
        features: values.description.features || [],
        ingredients: values.description.ingredients || [],
        usageInstructions: values.description.usageInstructions || '',
        expiration: values.description.expiration || ''
      };

      const technicalDetails = {
        specifications: values.technicalDetails.specifications || [],
        dimensions: values.technicalDetails.dimensions || {},
        weight: values.technicalDetails.weight || {},
        sizeOrWeight: values.technicalDetails.sizeOrWeight || '',
        suitableSkinTypes: values.technicalDetails.suitableSkinTypes || [],
        origin: values.technicalDetails.origin || '',
        certifications: values.technicalDetails.certifications || []
      };

      const seo = {
        metaTitle: values.seo.metaTitle || '',
        metaDescription: values.seo.metaDescription || '',
        keywords: values.seo.keywords || [],
        urlSlug: values.seo.urlSlug || ''
      };

      const policy = {
        warranty: values.policy.warranty || '',
        returnPolicy: values.policy.returnPolicy || '',
        shippingPolicy: values.policy.shippingPolicy || '',
        additionalOptions: values.policy.additionalOptions || '',
        shippingReturnWarranty: values.policy.shippingReturnWarranty || ''
      };

      // Create FormData
      const formData = new FormData();

      // Add all images to a single field
      formData.append('images', mainImage.originFileObj);
      galleryImages.forEach(image => {
        formData.append('images', image.originFileObj);
      });

      // Add other data as JSON strings
      formData.append('basicInformation', JSON.stringify(basicInformation));
      formData.append('pricingAndInventory', JSON.stringify(pricingAndInventory));
      formData.append('description', JSON.stringify(description));
      formData.append('technicalDetails', JSON.stringify(technicalDetails));
      formData.append('seo', JSON.stringify(seo));
      formData.append('policy', JSON.stringify(policy));

      // Debug FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await productService.createProduct(formData);
      console.log('Product created successfully:', response);
      message.success('Thêm sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng muốn xóa draft
  const handleClearDraft = () => {
    Modal.confirm({
      title: 'Xóa bản nháp',
      content: 'Bạn có chắc chắn muốn xóa bản nháp này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => {
        clearFormDraft();
        form.resetFields();
        message.success('Đã xóa bản nháp');
      }
    });
  };

  return (
    <div className="add-product-container" style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
      <Card title="Thêm sản phẩm mới" className="add-product-card" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(25,118,210,0.07)', border: '1.5px solid #e3f2fd', marginBottom: 32 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          scrollToFirstError
          initialValues={{
            description: {
              ingredients: [],
              usageInstructions: '',
              expiration: ''
            },
            technicalDetails: {
              sizeOrWeight: '',
              suitableSkinTypes: [],
              origin: '',
              certifications: []
            },
            seo: {
              keywords: [],
              metaTitle: '',
              metaDescription: '',
              urlSlug: ''
            },
            policy: {
              additionalOptions: '',
              shippingReturnWarranty: ''
            }
          }}
          onValuesChange={(_, allValues) => saveFormDraft(allValues)}
        >
          {/* Thông tin cơ bản */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Thông tin cơ bản</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'productName']}
                label="Tên sản phẩm"
                rules={productNameRules}
                tooltip="Tên sản phẩm phải là duy nhất trong hệ thống"
              >
                <Input
                  placeholder="Acne Clear Gel"
                  onChange={(e) => {
                    const sku = generateSKU(e.target.value);
                    form.setFieldsValue({
                      basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        sku: sku
                      }
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'sku']}
                label="SKU"
                rules={skuRules}
                tooltip="Mã SKU sẽ được tự động tạo từ tên sản phẩm, bạn có thể chỉnh sửa. SKU phải là duy nhất và chỉ chứa chữ cái thường, số và dấu gạch ngang"
              >
                <Input
                  placeholder="acne-clear-gel"
                  onChange={(e) => {
                    // Chuyển đổi input thành chữ thường và chỉ cho phép các ký tự hợp lệ
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    form.setFieldsValue({
                      basicInformation: {
                        ...form.getFieldValue('basicInformation'),
                        sku: value
                      }
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'brand']}
                label="Thương hiệu"
                rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}
                tooltip="Chọn hoặc nhập tên thương hiệu sản phẩm"
              >
                <Select
                  showSearch
                  placeholder="Chọn hoặc nhập thương hiệu"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {brands.map(brand => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'categoryIds']}
                label="Danh mục sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                tooltip="Chọn ít nhất một danh mục cho sản phẩm"
              >
                <Select
                  mode="multiple"
                  allowClear
                  loading={loadingCategories}
                  placeholder="Chọn danh mục"
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['basicInformation', 'tagIds']}
                label="Tags"
                tooltip="Chọn hoặc thêm tags cho sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn hoặc nhập tags"
                  allowClear
                  loading={loadingTags}
                  optionFilterProp="children"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {tags.map((tag) => (
                    <Option key={tag._id} value={tag._id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Form.Item name={['basicInformation', 'status']} hidden>
              <Input />
            </Form.Item>
          </Row>

          {/* Giá và Tồn kho */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Giá sản phẩm và tồn kho</Divider>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'originalPrice']}
                label="Giá gốc"
                rules={priceRules}
                tooltip="Giá gốc của sản phẩm trước khi giảm giá"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="500000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'salePrice']}
                label="Giá bán/Ưu đãi"
                rules={priceRules}
                tooltip="Giá bán cuối cùng cho khách hàng, phải nhỏ hơn hoặc bằng giá gốc"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="450000"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'stockQuantity']}
                label="Tồn kho"
                rules={stockRules}
                tooltip="Số lượng sản phẩm hiện có trong kho"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="150" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['pricingAndInventory', 'unit']}
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                tooltip="Đơn vị tính của sản phẩm (ví dụ: chai, hộp, ml, g)"
              >
                <Select
                  showSearch
                  placeholder="Chọn hoặc nhập đơn vị"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {units.map(unit => (
                    <Option key={unit} value={unit}>{unit}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Form.Item name={['pricingAndInventory', 'currency']} hidden>
              <Input />
            </Form.Item>
          </Row>

          {/* Media */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Hình ảnh</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Form.Item
                  label="Hình ảnh chính"
                  name={['media', 'mainImage']}
                  rules={[{ required: true, message: 'Vui lòng tải hình ảnh chính' }]}
                  tooltip="Hình ảnh chính của sản phẩm, kích thước tối đa 5MB"
                  valuePropName="fileList"
                  getValueFromEvent={e => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    listType="picture-card"
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith('image/');
                      if (!isImage) {
                        message.error('Chỉ chấp nhận file hình ảnh!');
                        return Upload.LIST_IGNORE;
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error('Hình ảnh không được vượt quá 5MB!');
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                    maxCount={1}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Form.Item
                  label="Thư viện ảnh"
                  name={['media', 'galleryImages']}
                  tooltip="Tối đa 5 ảnh phụ, mỗi ảnh không quá 5MB, tổng dung lượng không quá 30MB"
                  valuePropName="fileList"
                  getValueFromEvent={e => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    listType="picture-card"
                    multiple
                    maxCount={5}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith('image/');
                      if (!isImage) {
                        message.error('Chỉ chấp nhận file hình ảnh!');
                        return Upload.LIST_IGNORE;
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error('Hình ảnh không được vượt quá 5MB!');
                        return Upload.LIST_IGNORE;
                      }
                      return false;
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Mô tả sản phẩm */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Mô tả sản phẩm</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['description', 'shortDescription']}
                label="Mô tả ngắn"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả ngắn' },
                  { max: 200, message: 'Mô tả ngắn không được vượt quá 200 ký tự' }
                ]}
                tooltip="Mô tả ngắn gọn về sản phẩm, tối đa 200 ký tự"
              >
                <TextArea
                  rows={3}
                  maxLength={200}
                  showCount
                  placeholder="Kem trị mụn & trị nám giúp làm sạch, ngăn ngừa mụn và giảm thâm nám, phù hợp với da mụn, da nhạy cảm."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'detailedDescription']}
                label="Mô tả chi tiết"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả chi tiết' },
                  { max: 3000, message: 'Mô tả chi tiết không được vượt quá 3000 ký tự' }
                ]}
                tooltip="Mô tả chi tiết về công dụng và đặc điểm của sản phẩm, tối đa 3000 ký tự"
              >
                <TextArea
                  rows={3}
                  maxLength={3000}
                  showCount
                  placeholder="Sản phẩm được chiết xuất từ các thành phần tự nhiên, hỗ trợ điều trị mụn và làm mờ vết nám."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'features']}
                label="Đặc điểm"
                rules={[
                  { required: true, message: 'Vui lòng nhập đặc điểm sản phẩm' },
                  { max: 1000, message: 'Danh sách đặc điểm không được vượt quá 1000 ký tự' }
                ]}
                tooltip="Liệt kê các đặc điểm chính của sản phẩm, phân cách bằng dấu phẩy"
              >
                <TextArea
                  rows={2}
                  maxLength={1000}
                  showCount
                  placeholder="Trà xanh, Cam thảo, Chiết xuất tràm trà, Vitamin E, và các thành phần tự nhiên khác"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'ingredients']}
                label="Thành phần"
                rules={[
                  { required: true, message: 'Vui lòng nhập thành phần sản phẩm' }
                ]}
                tooltip="Liệt kê các thành phần chính của sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập thành phần"
                  allowClear
                  tokenSeparators={[',']}
                  options={commonIngredients.map(ingredient => ({
                    label: ingredient,
                    value: ingredient
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'usageInstructions']}
                label="Hướng dẫn sử dụng"
                rules={[
                  { required: true, message: 'Vui lòng nhập hướng dẫn sử dụng' }
                ]}
                tooltip="Hướng dẫn chi tiết cách sử dụng sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập hướng dẫn sử dụng"
                  allowClear
                  tokenSeparators={[',']}
                  options={commonUsageInstructions.map(instruction => ({
                    label: instruction,
                    value: instruction
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['description', 'expiration']}
                label="Ngày hết hạn"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời hạn sử dụng' }
                ]}
                tooltip="Thời hạn sử dụng của sản phẩm"
              >
                <Select
                  placeholder="Chọn thời hạn sử dụng"
                  allowClear
                  options={expirationOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông số kỹ thuật */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Thông số kỹ thuật</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'sizeOrWeight']}
                label="Kích thước / Trọng lượng"
                rules={[
                  { required: true, message: 'Vui lòng nhập kích thước hoặc trọng lượng' }
                ]}
                tooltip="Ví dụ: 30ml, 50g, 100ml"
              >
                <Select
                  placeholder="Chọn kích thước/trọng lượng"
                  allowClear
                  options={sizeWeightOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'suitableSkinTypes']}
                label="Loại da phù hợp"
                rules={[
                  { required: true, message: 'Vui lòng chọn loại da phù hợp' }
                ]}
                tooltip="Chọn các loại da phù hợp với sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn loại da"
                  allowClear
                  options={skinTypes.map(type => ({
                    label: type,
                    value: type
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'origin']}
                label="Xuất xứ"
                rules={[
                  { required: true, message: 'Vui lòng nhập xuất xứ' },
                  { max: 100, message: 'Xuất xứ không được vượt quá 100 ký tự' }
                ]}
                tooltip="Nước sản xuất sản phẩm"
              >
                <Input placeholder="VietNam" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['technicalDetails', 'certifications']}
                label="Chứng nhận chất lượng"
                tooltip="Chọn các chứng nhận chất lượng của sản phẩm"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn chứng nhận"
                  allowClear
                  options={certifications.map(cert => ({
                    label: cert,
                    value: cert
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* SEO */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>SEO</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={['seo', 'keywords']}
                label="Từ khóa/Tags"
                rules={[
                  { required: true, message: 'Vui lòng nhập từ khóa' }
                ]}
                tooltip="Nhập các từ khóa liên quan đến sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập từ khóa"
                  allowClear
                  tokenSeparators={[',']}
                  options={commonKeywords.map(keyword => ({
                    label: keyword,
                    value: keyword
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['seo', 'metaTitle']}
                label="Meta Title"
                rules={[{ max: 60, message: 'Meta title không được vượt quá 60 ký tự' }]}
                tooltip="Tiêu đề hiển thị trên kết quả tìm kiếm, tối đa 60 ký tự"
              >
                <Input placeholder="Nhập meta title" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['seo', 'metaDescription']}
                label="Meta Description"
                rules={[{ max: 160, message: 'Meta description không được vượt quá 160 ký tự' }]}
                tooltip="Mô tả ngắn hiển thị trên kết quả tìm kiếm, tối đa 160 ký tự"
              >
                <Input placeholder="Nhập meta description" />
              </Form.Item>
            </Col>
          </Row>

          {/* Chính sách & Tùy chọn */}
          <Divider orientation="left" style={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 600 }}>Chính sách & Tùy chọn</Divider>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name={['policy', 'shippingReturnWarranty']}
                label="Chính sách vận chuyển & Đổi trả"
                rules={[
                  { required: true, message: 'Vui lòng nhập chính sách vận chuyển và đổi trả' }
                ]}
                tooltip="Mô tả chính sách vận chuyển và đổi trả sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập chính sách"
                  allowClear
                  tokenSeparators={[',']}
                  options={shippingReturnOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['policy', 'additionalOptions']}
                label="Tùy chọn bổ sung"
                rules={[
                  { required: true, message: 'Vui lòng nhập tùy chọn bổ sung' }
                ]}
                tooltip="Các tùy chọn hoặc dịch vụ bổ sung khi mua sản phẩm"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập tùy chọn bổ sung"
                  allowClear
                  tokenSeparators={[',']}
                  options={additionalOptions.map(option => ({
                    label: option,
                    value: option
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} style={{ borderRadius: 24, background: '#1976d2', borderColor: '#1976d2', fontWeight: 600, minWidth: 140 }}>Thêm sản phẩm</Button>
              <Button onClick={() => navigate('/admin/products')} style={{ borderRadius: 24, fontWeight: 600, minWidth: 100 }}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddProduct;