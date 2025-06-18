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
        _id: '1',
        name: 'Sữa rửa mặt dưỡng ẩm',
        price: 250000,
        imageUrls: ['/images/products/product1.jpg'],
        averageRating: 4.5
    },
    {
        _id: '2',
        name: 'Kem dưỡng da ban đêm',
        price: 350000,
        imageUrls: ['/images/products/product2.jpg'],
        averageRating: 4.8
    },
    {
        _id: '3',
        name: 'Toner cân bằng da',
        price: 280000,
        imageUrls: ['/images/products/product3.jpg'],
        averageRating: 4.3
    },
    {
        _id: '4',
        name: 'Serum vitamin C',
        price: 450000,
        imageUrls: ['/images/products/product4.jpg'],
        averageRating: 4.7
    },
    {
        _id: '5',
        name: 'Kem chống nắng',
        price: 320000,
        imageUrls: ['/images/products/product5.jpg'],
        averageRating: 4.6
    }
];

export const mockCategories = [
    {
        _id: '1',
        name: 'Chăm sóc da',
        slug: 'cham-soc-da'
    },
    {
        _id: '2',
        name: 'Trang điểm',
        slug: 'trang-diem'
    },
    {
        _id: '3',
        name: 'Dưỡng tóc',
        slug: 'duong-toc'
    },
    {
        _id: '4',
        name: 'Nước hoa',
        slug: 'nuoc-hoa'
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
        _id: '1',
        title: 'Khuyến mãi mùa hè',
        imageUrl: '/images/campaigns/campaign1.jpg'
    },
    {
        _id: '2',
        title: 'Ưu đãi tháng 6',
        imageUrl: '/images/campaigns/campaign2.jpg'
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

export const mockPosts = [
    {
        _id: '1',
        title: 'Cách chăm sóc da mùa hè',
        excerpt: 'Những bí quyết giúp làn da luôn tươi sáng trong mùa hè',
        imageUrl: '/images/posts/post1.jpg',
        createdAt: '2024-03-15'
    },
    {
        _id: '2',
        title: 'Top 5 serum dưỡng da tốt nhất',
        excerpt: 'Khám phá những serum dưỡng da được ưa chuộng nhất',
        imageUrl: '/images/posts/post2.jpg',
        createdAt: '2024-03-10'
    },
    {
        _id: '3',
        title: 'Xu hướng làm đẹp 2024',
        excerpt: 'Cập nhật những xu hướng làm đẹp mới nhất năm 2024',
        imageUrl: '/images/posts/post3.jpg',
        createdAt: '2024-03-05'
    }
]; 