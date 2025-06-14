const Product = require('../Models/Product');
const Category = require('../Models/Category');

// Knowledge base for cosmetics
const cosmeticKnowledge = {
    skinTypes: {
        normal: {
            description: "Da thường có độ cân bằng tốt, không quá khô cũng không quá nhờn.",
            recommendations: [
                "Sử dụng sữa rửa mặt dịu nhẹ",
                "Dưỡng ẩm nhẹ nhàng",
                "Kem chống nắng hàng ngày"
            ]
        },
        dry: {
            description: "Da khô thường thiếu độ ẩm, dễ bong tróc và nhăn nheo.",
            recommendations: [
                "Sử dụng sữa rửa mặt không chứa xà phòng",
                "Dưỡng ẩm đậm đặc",
                "Tẩy tế bào chết nhẹ nhàng 1-2 lần/tuần"
            ]
        },
        oily: {
            description: "Da dầu thường tiết nhiều dầu, dễ bị mụn và bóng nhờn.",
            recommendations: [
                "Sử dụng sữa rửa mặt kiểm soát dầu",
                "Dưỡng ẩm không chứa dầu",
                "Tẩy tế bào chết 2-3 lần/tuần"
            ]
        },
        combination: {
            description: "Da hỗn hợp có vùng T-zone dầu và vùng má khô.",
            recommendations: [
                "Sử dụng sản phẩm cân bằng",
                "Dưỡng ẩm phù hợp từng vùng",
                "Tẩy tế bào chết 1-2 lần/tuần"
            ]
        }
    },
    concerns: {
        acne: {
            description: "Mụn trứng cá là tình trạng viêm nang lông do bã nhờn và vi khuẩn.",
            recommendations: [
                "Sử dụng sản phẩm chứa BHA/Salicylic Acid",
                "Dưỡng ẩm không chứa dầu",
                "Tẩy trang kỹ lưỡng"
            ]
        },
        aging: {
            description: "Lão hóa da biểu hiện qua nếp nhăn, chảy xệ và mất độ đàn hồi.",
            recommendations: [
                "Sử dụng sản phẩm chứa Retinol",
                "Dưỡng ẩm đậm đặc",
                "Kem chống nắng hàng ngày"
            ]
        },
        pigmentation: {
            description: "Sạm nám là tình trạng tăng sắc tố melanin trên da.",
            recommendations: [
                "Sử dụng sản phẩm chứa Vitamin C",
                "Kem chống nắng SPF 50+",
                "Tẩy tế bào chết nhẹ nhàng"
            ]
        }
    },
    ingredients: {
        "Vitamin C": {
            benefits: "Làm sáng da, chống oxy hóa, kích thích collagen",
            products: ["Serum Vitamin C", "Kem dưỡng Vitamin C"]
        },
        "Retinol": {
            benefits: "Chống lão hóa, tái tạo tế bào, giảm nếp nhăn",
            products: ["Serum Retinol", "Kem dưỡng Retinol"]
        },
        "Hyaluronic Acid": {
            benefits: "Dưỡng ẩm sâu, làm căng da, giảm nếp nhăn",
            products: ["Serum HA", "Kem dưỡng HA"]
        },
        "Niacinamide": {
            benefits: "Kiểm soát dầu, làm sáng da, giảm mụn",
            products: ["Serum Niacinamide", "Kem dưỡng Niacinamide"]
        }
    }
};

class ChatbotService {
    constructor() {
        this.context = {};
    }

    // Analyze user message and determine intent
    async analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Check for skin type queries
        for (const [type, info] of Object.entries(cosmeticKnowledge.skinTypes)) {
            if (lowerMessage.includes(type) || lowerMessage.includes('da ' + type)) {
                return {
                    intent: 'skin_type',
                    type: type,
                    data: info
                };
            }
        }

        // Check for skin concerns
        for (const [concern, info] of Object.entries(cosmeticKnowledge.concerns)) {
            if (lowerMessage.includes(concern) || lowerMessage.includes('mụn') || lowerMessage.includes('lão hóa') || lowerMessage.includes('sạm')) {
                return {
                    intent: 'skin_concern',
                    concern: concern,
                    data: info
                };
            }
        }

        // Check for ingredient queries
        for (const [ingredient, info] of Object.entries(cosmeticKnowledge.ingredients)) {
            if (lowerMessage.includes(ingredient.toLowerCase())) {
                return {
                    intent: 'ingredient',
                    ingredient: ingredient,
                    data: info
                };
            }
        }

        // Check for product recommendations
        if (lowerMessage.includes('sản phẩm') || lowerMessage.includes('recommend') || lowerMessage.includes('gợi ý')) {
            return {
                intent: 'product_recommendation',
                data: await this.getProductRecommendations(message)
            };
        }

        // Default response
        return {
            intent: 'general',
            data: {
                message: "Tôi có thể giúp gì cho bạn về chăm sóc da và mỹ phẩm?"
            }
        };
    }

    // Get product recommendations based on user needs
    async getProductRecommendations(message) {
        try {
            // Search products based on message
            const products = await Product.find({
                $or: [
                    { name: { $regex: message, $options: 'i' } },
                    { description: { $regex: message, $options: 'i' } }
                ]
            }).limit(3);

            if (products.length > 0) {
                return {
                    message: "Dựa trên nhu cầu của bạn, tôi gợi ý các sản phẩm sau:",
                    products: products
                };
            }

            return {
                message: "Tôi không tìm thấy sản phẩm phù hợp. Bạn có thể cho biết thêm về nhu cầu của mình không?"
            };
        } catch (error) {
            console.error('Error getting product recommendations:', error);
            return {
                message: "Xin lỗi, tôi đang gặp vấn đề khi tìm kiếm sản phẩm. Bạn có thể thử lại sau không?"
            };
        }
    }

    // Generate response based on analysis
    async generateResponse(analysis) {
        switch (analysis.intent) {
            case 'skin_type':
                return {
                    content: `Về da ${analysis.type}: ${analysis.data.description}\n\nGợi ý chăm sóc:\n${analysis.data.recommendations.map(rec => `- ${rec}`).join('\n')}`,
                    type: 'bot'
                };

            case 'skin_concern':
                return {
                    content: `Về ${analysis.concern}: ${analysis.data.description}\n\nGợi ý chăm sóc:\n${analysis.data.recommendations.map(rec => `- ${rec}`).join('\n')}`,
                    type: 'bot'
                };

            case 'ingredient':
                return {
                    content: `${analysis.ingredient}:\nLợi ích: ${analysis.data.benefits}\n\nSản phẩm phổ biến:\n${analysis.data.products.map(prod => `- ${prod}`).join('\n')}`,
                    type: 'bot'
                };

            case 'product_recommendation':
                if (analysis.data.products) {
                    return {
                        content: `${analysis.data.message}\n\n${analysis.data.products.map(prod => `- ${prod.name}: ${prod.price.toLocaleString('vi-VN')} VNĐ`).join('\n')}`,
                        type: 'bot'
                    };
                }
                return {
                    content: analysis.data.message,
                    type: 'bot'
                };

            default:
                return {
                    content: "Tôi có thể giúp bạn về:\n- Tư vấn loại da\n- Chăm sóc da\n- Thành phần mỹ phẩm\n- Gợi ý sản phẩm\n\nBạn cần tư vấn về vấn đề gì?",
                    type: 'bot'
                };
        }
    }

    // Process user message and generate response
    async processMessage(message) {
        const analysis = await this.analyzeMessage(message);
        return await this.generateResponse(analysis);
    }
}

module.exports = new ChatbotService(); 