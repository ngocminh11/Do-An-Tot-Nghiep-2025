require('dotenv').config();
const OpenAI = require('openai');
const Product = require('../Models/Products');
const Tag = require('../Models/Tags');
const Category = require('../Models/Categories');
const Post = require('../Models/Posts');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// PROMPT CHI TIẾT & ĐẦY ĐỦ (cho phép trả lời dài)
const SYSTEM_PROMPT = `
Bạn là chuyên gia tư vấn mỹ phẩm cho website CoCo. Hãy trả lời CHI TIẾT và ĐẦY ĐỦ theo cấu trúc:
1. Phân tích loại da/vấn đề (2-3 câu)
2. Nhóm sản phẩm cần dùng và lý do
3. Quy trình chăm sóc chi tiết (sáng/tối)
4. Thành phần chính, công dụng và lưu ý quan trọng
5. Gợi ý sản phẩm cụ thể (nếu có)
6. Khuyến nghị bác sĩ và cảnh báo khi cần
7. Lời khuyên bổ sung và tips chăm sóc

* Giọng văn: Chuyên nghiệp, thân thiện, dễ hiểu
* Có thể sử dụng thuật ngữ chuyên môn nhưng giải thích rõ ràng
* Trả lời đầy đủ, không bỏ sót thông tin quan trọng
* Sử dụng **bold** để nhấn mạnh các từ khóa quan trọng
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
      'basicInformation.status': 'Hiển Thị',
      $or: [
        { 'technicalDetails.suitableSkinTypes': { $in: foundKeywords } },
        { 'basicInformation.tagIds': { $in: tagIds } },
        { 'technicalDetails.ingredients': { $in: foundKeywords } }
      ]
    })
      .limit(2)
      .populate({
        path: 'detailId',
        select: 'description media',
      })
      .lean();
  }

  return products.map(p => ({
    name: p.basicInformation.productName,
    url: `/product/${p.basicInformation.seo?.urlSlug || p._id}`,
    mainImageId: p.basicInformation.mainImageId,
    shortDescription: p.detailId && p.detailId.description && p.detailId.description.shortDescription
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
    max_tokens: 1000, // Tăng độ dài để cho phép trả lời chi tiết
    temperature: 0.1, // Tăng tính chính xác
  });

  return {
    reply: completion.choices[0].message.content,
    products
  };
}

module.exports = { askOpenAI };