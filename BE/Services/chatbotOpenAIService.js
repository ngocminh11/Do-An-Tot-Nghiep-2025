require('dotenv').config();
const OpenAI = require('openai');
const Product = require('../Models/Products');
const Tag = require('../Models/Tags');
const Category = require('../Models/Categories');
const Post = require('../Models/Posts');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// PROMPT NGẮN GỌN & TẬP TRUNG (đã rút gọn 70%)
const SYSTEM_PROMPT = `
Bạn là chuyên gia tư vấn mỹ phẩm cho website CoCo. Hãy trả lời NGẮN GỌN (tối đa 30 từ) theo cấu trúc:
1. Phân tích loại da/vấn đề (1-2 câu)
2. Nhóm sản phẩm cần dùng 
3. Quy trình chăm sóc (sáng/tối)
4. Thành phần chính & lưu ý
5. Gợi ý sản phẩm (nếu có)
6. Khuyến nghị bác sĩ khi cần

* Giọng văn: Chuyên nghiệp, thân thiện
* KHÔNG dùng thuật ngữ y khoa phức tạp
* Nếu không liên quan: Mời liên hệ tổng đài
`;

// TỐI ƯU TRUY VẤN SẢN PHẨM
async function findRelevantProducts(message) {
  const skinTypes = ['dầu', 'khô', 'hỗn hợp', 'nhạy cảm', 'mụn', 'lão hóa'];
  const issues = ['mụn', 'nám', 'dưỡng ẩm', 'làm sáng', 'chống nắng', 'lão hóa'];

  // Tìm từ khóa ưu tiên
  const keywords = [...skinTypes, ...issues];
  const foundKeywords = keywords.filter(k => message.toLowerCase().includes(k));

  // Truy vấn có mức độ ưu tiên
  let products = [];
  if (foundKeywords.length > 0) {
    const tags = await Tag.find({ name: { $in: foundKeywords } });
    const tagIds = tags.map(t => t._id);

    // Ưu tiên tìm theo skin type > tag > ingredients
    products = await Product.find({
      'basicInformation.status': 'active',
      $or: [
        { 'technicalDetails.suitableSkinTypes': { $in: foundKeywords } },
        { 'basicInformation.tagIds': { $in: tagIds } },
        { 'technicalDetails.ingredients': { $in: foundKeywords } }
      ]
    }).limit(2); // Giới hạn 2 sản phẩm
  }

  return products.map(p => ({
    name: p.basicInformation.productName,
    skinTypes: p.technicalDetails.suitableSkinTypes,
    url: `/product/${p.seo?.urlSlug || p._id}`
  }));
}

// TỐI ƯU HÓA TRẢ LỜI
async function askOpenAI(message) {
  // Lấy dữ liệu liên quan
  const [products, categories, tags, posts] = await Promise.all([
    findRelevantProducts(message),
    Category.find({ status: 'active' }),
    Tag.find({ status: 'active' }),
    Post.find({ status: 'published' }).sort({ createdAt: -1 }).limit(5)
  ]);

  // Thông tin website (tóm tắt từ trang About)
  const aboutCoCo = `CoCo là website mỹ phẩm uy tín, cam kết sản phẩm chất lượng, dịch vụ tận tâm, an toàn tuyệt đối. Đội ngũ chuyên nghiệp, luôn lắng nghe khách hàng. Thành lập 2020, tiên phong đổi mới, đặt lợi ích khách hàng lên hàng đầu.`;

  // Tạo context cho AI
  let context = aboutCoCo;
  context += `\n\nDanh mục: ${categories.map(c => c.name).join(', ')}`;
  context += `\nTag: ${tags.map(t => t.name).join(', ')}`;
  context += `\nBài viết nổi bật: ${posts.map(p => p.title).join(' | ')}`;
  if (products.length > 0) {
    context += `\nSản phẩm gợi ý: ${products.map(p => p.name).join(', ')}`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + '\n' + context },
      { role: 'user', content: message }
    ],
    max_tokens: 200, // Giảm 33% độ dài
    temperature: 0.3, // Tăng tính chính xác
  });

  return completion.choices[0].message.content;
}

module.exports = { askOpenAI };