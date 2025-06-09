// Mock data for the application
export const mockUsers = [
    {
        _id: "1",
        roleId: "1",
        email: "admin@cocoo.com",
        passwordHash: "$2a$10$...",
        status: "active",
        createdAt: "2025-05-24T04:00:00Z",
        lastLogin: "2025-05-24T04:15:00Z"
    },
    {
        _id: "2",
        roleId: "2",
        email: "user@example.com",
        passwordHash: "$2a$10$...",
        status: "active",
        createdAt: "2025-05-24T04:00:00Z",
        lastLogin: "2025-05-24T04:15:00Z"
    }
];

export const mockUserDetails = [
    {
        _id: "1",
        userId: "1",
        fullName: "Admin User",
        phoneNumber: "0901234567",
        dateOfBirth: "1990-01-01T00:00:00Z",
        gender: "male",
        addresses: [
            {
                addressId: "1",
                label: "Office",
                fullAddress: "123 Admin Street",
                city: "Ho Chi Minh",
                district: "District 1",
                ward: "Ben Nghe",
                isDefault: true
            }
        ]
    },
    {
        _id: "2",
        userId: "2",
        fullName: "Nguyễn Văn A",
        phoneNumber: "0909876543",
        dateOfBirth: "1995-01-01T00:00:00Z",
        gender: "male",
        addresses: [
            {
                addressId: "2",
                label: "Home",
                fullAddress: "456 User Street",
                city: "Ho Chi Minh",
                district: "District 2",
                ward: "An Phu",
                isDefault: true
            }
        ]
    }
];

export const mockRoles = [
    {
        _id: "1",
        name: "admin",
        description: "Quản trị viên hệ thống"
    },
    {
        _id: "2",
        name: "customer",
        description: "Khách hàng"
    }
];

export const mockPermissions = [
    {
        _id: "1",
        name: "manageUsers",
        description: "Quyền quản lý người dùng"
    },
    {
        _id: "2",
        name: "manageProducts",
        description: "Quyền quản lý sản phẩm"
    }
];

export const mockRolePermissions = [
    {
        _id: "1",
        roleId: "1",
        permissionId: "1"
    },
    {
        _id: "2",
        roleId: "1",
        permissionId: "2"
    }
];

export const mockProducts = [
    {
        _id: "1",
        name: "Serum Vitamin C Chống Lão Hóa",
        description: "Serum Vitamin C giúp làm sáng da, mờ thâm và chống lão hóa hiệu quả.",
        brand: "The Ordinary",
        categoryId: "1",
        price: 250000,
        stockQuantity: 50,
        attributes: {
            volume: "30ml",
            skinType: ["da dầu", "da hỗn hợp", "da thường"]
        },
        imageUrls: [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80"
        ],
        viewCount: 1200,
        purchaseCount: 300,
        averageRating: 4.8,
        tags: ["vitamin c", "serum", "chống lão hóa"],
        status: "published",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T11:00:00Z"
    },
    {
        _id: "2",
        name: "Kem Dưỡng Ẩm Hyaluronic Acid",
        description: "Kem dưỡng ẩm chuyên sâu với Hyaluronic Acid giúp da căng mịn, ẩm mượt.",
        brand: "Neutrogena",
        categoryId: "65f1a2b3c4d5e6f7g8h9i0j1",
        price: 350000,
        stockQuantity: 30,
        attributes: {
            volume: "50ml",
            skinType: ["da khô", "da hỗn hợp", "da thường"]
        },
        imageUrls: [
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80"
        ],
        viewCount: 800,
        purchaseCount: 150,
        averageRating: 4.5,
        tags: ["dưỡng ẩm", "hyaluronic acid", "kem dưỡng"],
        status: "published",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T11:00:00Z"
    },
    {
        _id: "3",
        name: "Tẩy Tế Bào Chết AHA/BHA",
        description: "Tẩy tế bào chết hóa học với AHA/BHA giúp làm sáng da và se khít lỗ chân lông.",
        brand: "Paula's Choice",
        categoryId: "1",
        price: 450000,
        stockQuantity: 25,
        attributes: {
            volume: "30ml",
            skinType: ["da dầu", "da hỗn hợp"]
        },
        imageUrls: [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80"
        ],
        viewCount: 600,
        purchaseCount: 100,
        averageRating: 4.7,
        tags: ["tẩy tế bào chết", "aha", "bha"],
        status: "published",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T11:00:00Z"
    },
    {
        _id: "4",
        name: "Kem Chống Nắng SPF50+",
        description: "Kem chống nắng quang phổ rộng bảo vệ da khỏi tia UVA/UVB.",
        brand: "La Roche-Posay",
        categoryId: "65f1a2b3c4d5e6f7g8h9i0j1",
        price: 550000,
        stockQuantity: 40,
        attributes: {
            volume: "50ml",
            skinType: ["mọi loại da"]
        },
        imageUrls: [
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80"
        ],
        viewCount: 1500,
        purchaseCount: 400,
        averageRating: 4.9,
        tags: ["chống nắng", "spf50", "bảo vệ da"],
        status: "published",
        createdAt: "2025-05-20T10:00:00Z",
        updatedAt: "2025-05-21T11:00:00Z"
    }
];

export const mockCategories = [
    {
        _id: "1",
        name: "Serum Dưỡng Da",
        description: "Các loại serum chuyên sâu cho việc chăm sóc da mặt.",
        parentId: null,
        imageUrl: "https://example.com/category_serum.jpg"
    }
];

export const mockCarts = [
    {
        _id: "1",
        userId: "2",
        items: [
            {
                productId: "1",
                quantity: 2,
                priceAtAddition: 250000,
                note: "Xin thêm gói quà tặng kèm theo."
            }
        ],
        discountCodeApplied: "SUMMERFLASH10",
        subTotal: 500000,
        discountAmount: 50000,
        totalPrice: 450000,
        updatedAt: "2025-05-24T04:10:00Z"
    }
];

export const mockOrders = [
    {
        _id: "1",
        userId: "2",
        cartSnapshot: {
            items: [
                {
                    productId: "1",
                    productName: "Serum Vitamin C",
                    quantity: 2,
                    pricePerUnit: 250000
                }
            ],
            subTotal: 500000,
            discountAmount: 50000
        },
        shippingInformation: {
            recipientName: "Nguyễn Thị B",
            phoneNumber: "0912345678",
            address: "456 Đường XYZ, Phường LMN, Quận UVW, TP.HCM",
            city: "Hồ Chí Minh",
            district: "Quận UVW",
            ward: "Phường LMN",
            shippingFee: 30000
        },
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "pending_confirmation",
        totalAmount: 480000,
        discountCodeUsed: "SUMMERFLASH10",
        customerNote: "Giao hàng vào giờ hành chính, vui lòng gọi trước.",
        internalNote: "Khách hàng VIP, ưu tiên xử lý.",
        createdAt: "2025-05-24T04:12:00Z",
        updatedAt: "2025-05-24T04:15:00Z"
    }
];

export const mockDiscounts = [
    {
        _id: "1",
        code: "SUMMERFLASH10",
        description: "Giảm giá 10% cho tất cả đơn hàng mùa hè.",
        discountType: "percentage",
        discountValue: 10,
        maxDiscountAmount: 100000,
        minOrderValue: 200000,
        startDate: "2025-06-01T00:00:00Z",
        endDate: "2025-06-30T23:59:59Z",
        usageLimitPerCode: 1000,
        usageLimitPerUser: 1,
        currentUsageCount: 50,
        isActive: true
    }
];

export const mockCampaigns = [
    {
        _id: "1",
        title: "Summer Sale",
        description: "Giảm giá lên đến 50% cho tất cả sản phẩm",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
        startDate: "2025-06-01T00:00:00Z",
        endDate: "2025-06-30T23:59:59Z",
        status: "active"
    },
    {
        _id: "2",
        title: "New Arrivals",
        description: "Khám phá bộ sưu tập mới nhất của chúng tôi",
        imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1880&q=80",
        startDate: "2025-05-01T00:00:00Z",
        endDate: "2025-12-31T23:59:59Z",
        status: "active"
    }
];

export const mockReviews = [
    {
        _id: "1",
        userId: "2",
        productId: "1",
        orderId: "1",
        rating: 5,
        commentTitle: "Rất hài lòng!",
        commentBody: "Sản phẩm tuyệt vời, chất lượng tốt, giao hàng nhanh. Sẽ tiếp tục ủng hộ shop!",
        imageUrls: ["https://example.com/review_img1.jpg"],
        isVerifiedPurchase: true,
        helpfulVotes: 10,
        createdAt: "2025-05-23T10:00:00Z",
        status: "approved"
    }
];

export const mockArticles = [
    {
        _id: "1",
        title: "Bí quyết chăm sóc da dầu mùa hè hiệu quả",
        slug: "bi-quyet-cham-soc-da-dau-mua-he",
        content: "<p>Nội dung chi tiết của bài viết...</p>",
        excerpt: "Một vài mẹo nhỏ giúp bạn kiểm soát lượng dầu trên da...",
        authorId: "1",
        category: "Chăm sóc da",
        tags: ["da dầu", "mùa hè", "chăm sóc da"],
        featuredImageUrl: "https://example.com/article_featured.jpg",
        status: "published",
        viewCount: 500,
        publishedAt: "2025-05-22T14:00:00Z",
        updatedAt: "2025-05-23T09:00:00Z"
    }
];

export const mockFAQs = [
    {
        _id: "1",
        category: "Giao hàng",
        question: "Thời gian giao hàng dự kiến là bao lâu?",
        answer: "<p>Thời gian giao hàng dự kiến từ 2-5 ngày làm việc...</p>",
        sortOrder: 1
    }
];

export const mockSupportTickets = [
    {
        _id: "1",
        userId: "2",
        guestEmail: "guest@example.com",
        subject: "Vấn đề về đơn hàng #ORD123456",
        message: "Tôi muốn hỏi về tình trạng đơn hàng của mình...",
        priority: "high",
        status: "open",
        assignedAgentId: "1",
        createdAt: "2025-05-24T03:00:00Z",
        updatedAt: "2025-05-24T03:15:00Z",
        resolutionDetails: "Đã liên hệ khách hàng và giải quyết xong."
    }
];

export const mockRevenueReports = [
    {
        _id: "1",
        reportDate: "2025-05-23T00:00:00Z",
        dailyRevenue: 10000000,
        totalOrders: 50,
        generatedAt: "2025-05-24T01:00:00Z"
    }
];

export const mockProductStats = [
    {
        _id: "1",
        productId: "1",
        periodStartDate: "2025-05-01T00:00:00Z",
        periodEndDate: "2025-05-31T23:59:59Z",
        totalViews: 12500,
        totalPurchases: 320,
        conversionRate: 2.56,
        totalRevenueGenerated: 80000000
    }
];

export const mockUserLogs = [
    {
        _id: "1",
        userId: "2",
        activityType: "viewed_product",
        productId: "1",
        categoryId: "1",
        searchKeyword: "kem chống nắng",
        timestamp: "2025-05-24T10:30:00Z",
        deviceInfo: {
            type: "mobile",
            os: "iOS"
        },
        location: {
            city: "Hà Nội"
        }
    }
];

export const mockTags = [
    { _id: '1', name: 'Skincare', description: 'Products for skincare routines' },
    { _id: '2', name: 'Makeup', description: 'Cosmetic products for face, eyes, lips' },
    { _id: '3', name: 'Hair', description: 'Hair care treatments and products' },
    { _id: '4', name: 'Fragrance', description: 'Perfumes and scented products' },
]; 