const vietnamAddressData = {
    "An Giang": {
        "Thành phố Long Xuyên": ["Phường Mỹ Bình", "Phường Mỹ Long", "Phường Đông Xuyên", "Phường Mỹ Xuyên", "Phường Bình Đức", "Phường Mỹ Phước", "Phường Bình Khánh", "Phường Mỹ Quý"],
        "Thành phố Châu Đốc": ["Phường Châu Phú A", "Phường Châu Phú B", "Phường Núi Sam", "Phường Vĩnh Mỹ", "Xã Vĩnh Tế", "Xã Vĩnh Châu"],
        "Huyện An Phú": ["Thị trấn An Phú", "Xã Khánh An", "Xã Khánh Bình", "Xã Quốc Thái", "Xã Nhơn Hội", "Xã Phú Hội", "Xã Phước Hưng"],
        "Huyện Châu Phú": ["Thị trấn Cái Dầu", "Xã Khánh Hòa", "Xã Mỹ Đức", "Xã Mỹ Phú", "Xã Ô Long Vỹ", "Xã Vĩnh Thạnh Trung"],
        "Huyện Châu Thành": ["Thị trấn An Châu", "Xã An Hòa", "Xã Bình Hòa", "Xã Cần Đăng", "Xã Vĩnh Hanh", "Xã Vĩnh Bình"],
        "Huyện Phú Tân": ["Thị trấn Phú Mỹ", "Xã Long Hòa", "Xã Phú Lâm", "Xã Phú Long", "Xã Phú Thạnh", "Xã Tân Hòa"],
        "Huyện Tân Châu": ["Phường Long Châu", "Phường Long Phú", "Phường Long Sơn", "Xã Long Hưng", "Xã Phú Lộc", "Xã Vĩnh Xương"]
    },
    "Bà Rịa - Vũng Tàu": {
        "Thành phố Vũng Tàu": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"],
        "Thành phố Bà Rịa": ["Phường Phước Trung", "Phường Long Hương", "Phường Long Tâm", "Phường Long Toàn", "Phường Kim Dinh", "Phường Long Hương", "Xã Hòa Long", "Xã Tân Hưng"],
        "Huyện Châu Đức": ["Thị trấn Ngãi Giao", "Xã Bàu Chinh", "Xã Bình Ba", "Xã Suối Nghệ", "Xã Xà Bang", "Xã Cù Bị", "Xã Láng Lớn"],
        "Huyện Xuyên Mộc": ["Thị trấn Phước Bửu", "Xã Bông Trang", "Xã Bưng Riềng", "Xã Hòa Bình", "Xã Tân Lâm", "Xã Xuyên Mộc", "Xã Bình Châu"],
        "Huyện Đất Đỏ": ["Thị trấn Đất Đỏ", "Xã Phước Hải", "Xã Phước Long Thọ", "Xã Long Tân", "Xã Láng Dài"],
        "Huyện Tân Thành": ["Thị trấn Phú Mỹ", "Xã Châu Pha", "Xã Hắc Dịch", "Xã Mỹ Xuân", "Xã Sông Xoài", "Xã Tân Hải"]
    },
    "Bạc Liêu": {
        "Thành phố Bạc Liêu": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 7", "Phường 8", "Phường Nhà Mát", "Xã Hiệp Thành", "Xã Vĩnh Trạch", "Xã Vĩnh Trạch Đông"],
        "Huyện Hồng Dân": ["Thị trấn Ngan Dừa", "Xã Ninh Thạnh Lợi", "Xã Ninh Thạnh Lợi A", "Xã Lộc Ninh", "Xã Vĩnh Lộc", "Xã Vĩnh Lộc A"],
        "Huyện Phước Long": ["Thị trấn Phước Long", "Xã Vĩnh Phú Đông", "Xã Vĩnh Phú Tây", "Xã Phước Long", "Xã Hưng Phú", "Xã Vĩnh Thanh"],
        "Huyện Vĩnh Lợi": ["Thị trấn Châu Hưng", "Xã Châu Hưng A", "Xã Châu Thới", "Xã Long Thạnh", "Xã Vĩnh Mỹ A", "Xã Vĩnh Mỹ B"],
        "Huyện Giá Rai": ["Thị trấn Giá Rai", "Thị trấn Hộ Phòng", "Xã Phong Tân", "Xã Phong Thạnh Đông", "Xã Phong Thạnh Tây"]
    },
    "Bắc Giang": {
        "Thành phố Bắc Giang": ["Phường Hoàng Văn Thụ", "Phường Trần Nguyên Hãn", "Phường Ngô Quyền", "Phường Trần Phú", "Phường Mỹ Độ", "Phường Lê Lợi", "Xã Dĩnh Kế", "Xã Song Khê"],
        "Huyện Yên Thế": ["Thị trấn Bố Hạ", "Thị trấn Cầu Gồ", "Xã Tân Tiến", "Xã Đồng Tiến", "Xã Đồng Tâm", "Xã Tam Hiệp", "Xã An Thượng"],
        "Huyện Lục Ngạn": ["Thị trấn Chũ", "Xã Biển Động", "Xã Cấm Sơn", "Xã Biên Sơn", "Xã Kiên Lao", "Xã Thanh Hải", "Xã Hồng Giang"],
        "Huyện Sơn Động": ["Thị trấn An Châu", "Xã Tây Yên Tử", "Xã Vân Sơn", "Xã Hữu Sản", "Xã Long Sơn", "Xã Thanh Luận"],
        "Huyện Lục Nam": ["Thị trấn Đồi Ngô", "Thị trấn Lục Nam", "Xã Lục Sơn", "Xã Bảo Đài", "Xã Trường Sơn", "Xã Cẩm Lý"]
    },
    "Bắc Kạn": {
        "Thành phố Bắc Kạn": ["Phường Đức Xuân", "Phường Nguyễn Thị Minh Khai", "Phường Sông Cầu", "Phường Phùng Chí Kiên", "Xã Dương Quang", "Xã Nông Thượng", "Xã Xuất Hóa"],
        "Huyện Ba Bể": ["Thị trấn Chợ Rã", "Xã Quảng Khê", "Xã Mỹ Phương", "Xã Hoàng Trĩ", "Xã Đồng Phúc", "Xã Cao Thượng"],
        "Huyện Ngân Sơn": ["Thị trấn Nà Phặc", "Xã Thượng Ân", "Xã Bằng Vân", "Xã Cốc Đán", "Xã Trung Hòa", "Xã Đức Vân"],
        "Huyện Chợ Đồn": ["Thị trấn Bằng Lũng", "Xã Bình Trung", "Xã Lương Bằng", "Xã Nam Cường", "Xã Yên Mỹ"],
        "Huyện Na Rì": ["Thị trấn Yến Lạc", "Xã Cư Lễ", "Xã Dương Sơn", "Xã Văn Học", "Xã Quang Phong"]
    },
    "Bắc Ninh": {
        "Thành phố Bắc Ninh": ["Phường Vệ An", "Phường Tiền An", "Phường Đại Phúc", "Phường Ninh Xá", "Phường Suối Hoa", "Phường Võ Cường", "Phường Kinh Bắc"],
        "Huyện Quế Võ": ["Thị trấn Phố Mới", "Xã Việt Thống", "Xã Đại Xuân", "Xã Nhân Hòa", "Xã Bằng An", "Xã Phượng Mao", "Xã Chi Lăng"],
        "Huyện Tiên Du": ["Thị trấn Lim", "Xã Phú Lâm", "Xã Nội Duệ", "Xã Liên Bão", "Xã Hiên Vân", "Xã Việt Đoàn"],
        "Huyện Gia Bình": ["Thị trấn Gia Bình", "Xã Xuân Lai", "Xã Đông Cứu", "Xã Đại Bái", "Xã Quỳnh Phú"],
        "Huyện Thuận Thành": ["Thị trấn Hồ", "Xã An Bình", "Xã Song Giang", "Xã Đình Tổ", "Xã Trí Quả"]
    },
    "Bến Tre": {
        "Thành phố Bến Tre": ["Phường Phú Khương", "Phường Phú Tân", "Phường 8", "Phường 6", "Phường 4", "Phường 5", "Xã Mỹ Thạnh An", "Xã Nhơn Thạnh"],
        "Huyện Châu Thành": ["Thị trấn Châu Thành", "Xã Tân Thạch", "Xã Qưới Sơn", "Xã An Khánh", "Xã Giao Long", "Xã Phú Túc", "Xã Phú Đức"],
        "Huyện Mỏ Cày Bắc": ["Thị trấn Mỏ Cày", "Xã Định Thủy", "Xã Đa Phước Hội", "Xã Tân Hội", "Xã Bình Khánh", "Xã An Thạnh"],
        "Huyện Giồng Trôm": ["Thị trấn Giồng Trôm", "Xã Châu Hòa", "Xã Lương Hòa", "Xã Lương Quới", "Xã Phong Nẫm"],
        "Huyện Ba Tri": ["Thị trấn Ba Tri", "Xã Tân Xuân", "Xã Vĩnh Hòa", "Xã Tân Thủy", "Xã An Ngãi Trung"]
    },
    "Bình Định": {
        "Thành phố Quy Nhơn": ["Phường Lê Hồng Phong", "Phường Trần Hưng Đạo", "Phường Lê Lợi", "Phường Trần Phú", "Phường Ngô Mây", "Phường Thị Nại", "Phường Nhơn Bình"],
        "Huyện An Nhơn": ["Thị trấn Bình Định", "Xã Nhơn An", "Xã Nhơn Hạnh", "Xã Nhơn Hậu", "Xã Nhơn Phong", "Xã Nhơn Mỹ"],
        "Huyện Hoài Nhơn": ["Thị trấn Bồng Sơn", "Xã Hoài Châu", "Xã Hoài Châu Bắc", "Xã Hoài Hải", "Xã Hoài Hương", "Xã Hoài Xuân"],
        "Huyện Tuy Phước": ["Thị trấn Tuy Phước", "Thị trấn Diêu Trì", "Xã Phước Sơn", "Xã Phước Hưng", "Xã Phước Thuận"],
        "Huyện Phù Mỹ": ["Thị trấn Bình Dương", "Thị trấn Phù Mỹ", "Xã Mỹ Đức", "Xã Mỹ Thọ", "Xã Mỹ Lợi"]
    },
    "Bình Dương": {
        "Thành phố Thủ Dầu Một": ["Phường Chánh Nghĩa", "Phường Hiệp Thành", "Phường Phú Cường", "Phường Phú Hòa", "Phường Phú Lợi", "Phường Phú Thọ", "Phường Tân An"],
        "Thành phố Dĩ An": ["Phường Dĩ An", "Phường Tân Bình", "Phường Tân Đông Hiệp", "Phường Bình An", "Phường Bình Thắng", "Phường Đông Hòa"],
        "Thành phố Thuận An": ["Phường Lái Thiêu", "Phường Bình Chuẩn", "Phường Thuận Giao", "Phường An Phú", "Phường Hưng Định"],
        "Huyện Bắc Tân Uyên": ["Thị trấn Tân Thành", "Xã Thường Tân", "Xã Bình Mỹ", "Xã Đất Cuốc", "Xã Hiếu Liêm", "Xã Tân Định"],
        "Huyện Phú Giáo": ["Thị trấn Phước Vĩnh", "Xã An Linh", "Xã An Long", "Xã An Thái", "Xã Tam Lập"]
    },
    "Bình Phước": {
        "Thành phố Đồng Xoài": ["Phường Tân Đồng", "Phường Tân Bình", "Phường Tân Xuân", "Phường Tân Thiện", "Phường Tân Thành", "Xã Tiến Thành"],
        "Huyện Bình Long": ["Thị trấn Chơn Thành", "Xã Thành Tâm", "Xã Minh Lập", "Xã Quang Minh", "Xã Minh Hưng", "Xã Minh Long"],
        "Huyện Phú Riềng": ["Xã Bình Sơn", "Xã Bình Tân", "Xã Bình Thắng", "Xã Long Bình", "Xã Long Hưng", "Xã Long Tân"],
        "Huyện Bù Đăng": ["Thị trấn Đức Phong", "Xã Đường 10", "Xã Minh Hưng", "Xã Nghĩa Bình", "Xã Bom Bo"],
        "Huyện Lộc Ninh": ["Thị trấn Lộc Ninh", "Xã Lộc Hưng", "Xã Lộc Hiệp", "Xã Lộc Thuận", "Xã Lộc Quang"]
    },
    "Bình Thuận": {
        "Thành phố Phan Thiết": ["Phường Phú Thủy", "Phường Phú Trinh", "Phường Phú Tài", "Phường Mũi Né", "Phường Hàm Tiến", "Phường Xuân An", "Phường Thanh Hải"],
        "Huyện Hàm Thuận Bắc": ["Thị trấn Ma Lâm", "Thị trấn Phú Long", "Xã Hồng Liêm", "Xã Thuận Hòa", "Xã Đông Tiến", "Xã Hàm Trí"],
        "Huyện Tánh Linh": ["Thị trấn Lạc Tánh", "Xã Bắc Ruộng", "Xã Nghị Đức", "Xã La Ngâu", "Xã Huy Khiêm", "Xã Đức Bình"],
        "Huyện Hàm Tân": ["Thị trấn Tân Nghĩa", "Thị trấn Tân Minh", "Xã Sơn Mỹ", "Xã Tân Phúc", "Xã Tân Đức"],
        "Huyện Đức Linh": ["Thị trấn Võ Xu", "Thị trấn Đức Tài", "Xã Đa Kai", "Xã Mê Pu", "Xã Đức Hạnh"]
    },
    "Cà Mau": {
        "Thành phố Cà Mau": ["Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 1", "Phường 2", "Xã An Xuyên"],
        "Huyện Cái Nước": ["Thị trấn Cái Nước", "Xã Thạnh Phú", "Xã Lương Thế Trân", "Xã Phú Hưng", "Xã Tân Hưng", "Xã Hưng Mỹ"],
        "Huyện Đầm Dơi": ["Thị trấn Đầm Dơi", "Xã Tạ An Khương", "Xã Tạ An Khương Đông", "Xã Trần Phán", "Xã Tân Trung", "Xã Quách Phẩm"],
        "Huyện U Minh": ["Thị trấn U Minh", "Xã Khánh An", "Xã Khánh Hội", "Xã Khánh Tiến", "Xã Nguyễn Phích"],
        "Huyện Thới Bình": ["Thị trấn Thới Bình", "Xã Biển Bạch", "Xã Tân Bằng", "Xã Trí Lực", "Xã Trí Phải"]
    },
    "Cần Thơ": {
        "Quận Ninh Kiều": ["Phường An Bình", "Phường An Hòa", "Phường Cái Khế", "Phường Hưng Lợi", "Phường Xuân Khánh", "Phường Thới Bình"],
        "Quận Bình Thủy": ["Phường An Thới", "Phường Bình Thủy", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền", "Phường Trà An"],
        "Quận Cái Răng": ["Phường Lê Bình", "Phường Phú Thứ", "Phường Tân Phú", "Phường Thường Thạnh", "Phường Hưng Phú", "Phường Hưng Thạnh"],
        "Quận Ô Môn": ["Phường Châu Văn Liêm", "Phường Thới Hòa", "Phường Thới Long", "Phường Phước Thới", "Phường Thới An", "Phường Thới Thuận"],
        "Huyện Phong Điền": ["Thị trấn Phong Điền", "Xã Nhơn Ái", "Xã Giai Xuân", "Xã Tân Thới", "Xã Trường Long", "Xã Mỹ Khánh"],
        "Huyện Cờ Đỏ": ["Thị trấn Cờ Đỏ", "Xã Thới Hưng", "Xã Đông Hiệp", "Xã Đông Thắng", "Xã Thới Đông", "Xã Thới Xuân"]
    },
    "Cao Bằng": {
        "Thành phố Cao Bằng": ["Phường Sông Bằng", "Phường Sông Hiến", "Phường Hợp Giang", "Phường Tân Giang", "Phường Ngọc Xuân", "Xã Vĩnh Quang"],
        "Huyện Bảo Lâm": ["Thị trấn Pác Miầu", "Xã Đức Hạnh", "Xã Lý Bôn", "Xã Nam Cao", "Xã Vĩnh Quang", "Xã Thái Học"],
        "Huyện Hạ Lang": ["Thị trấn Thanh Nhật", "Xã Quốc Toản", "Xã Xuân Nội", "Xã Cô Ngân", "Xã Thị Hoa", "Xã Đức Quang"],
        "Huyện Trùng Khánh": ["Thị trấn Trùng Khánh", "Xã Đàm Thủy", "Xã Chí Viễn", "Xã Lăng Hiếu", "Xã Cao Chương"],
        "Huyện Bảo Lạc": ["Thị trấn Bảo Lạc", "Xã Hưng Đạo", "Xã Cốc Pàng", "Xã Xuân Trường", "Xã Hồng Trị"]
    },
    "Đà Nẵng": {
        "Quận Hải Châu": ["Phường Thanh Bình", "Phường Thuận Phước", "Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II", "Phường Phước Ninh", "Phường Bình Thuận"],
        "Quận Thanh Khê": ["Phường Xuân Hà", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Tam Thuận", "Phường Tân Chính", "Phường Vĩnh Trung"],
        "Quận Sơn Trà": ["Phường Thọ Quang", "Phường Nại Hiên Đông", "Phường Mân Thái", "Phường An Hải Bắc", "Phường An Hải Tây", "Phường Phước Mỹ"],
        "Quận Ngũ Hành Sơn": ["Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hòa Hải", "Phường Hòa Quý", "Phường Bắc Mỹ An"],
        "Quận Liên Chiểu": ["Phường Hòa Hiệp Bắc", "Phường Hòa Hiệp Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Khánh Nam", "Phường Hòa Minh"],
        "Huyện Hòa Vang": ["Xã Hòa Bắc", "Xã Hòa Liên", "Xã Hòa Ninh", "Xã Hòa Sơn", "Xã Hòa Nhơn", "Xã Hòa Phú"]
    },
    "Đắk Lắk": {
        "Thành phố Buôn Ma Thuột": ["Phường Tân Lập", "Phường Tân Hòa", "Phường Tân An", "Phường Thống Nhất", "Phường Thành Nhất", "Phường Tân Lợi", "Phường Ea Tam"],
        "Huyện Buôn Đôn": ["Thị trấn Buôn Đôn", "Xã Ea Huar", "Xã Ea Wer", "Xã Tân Hòa", "Xã Krông Na", "Xã Ea Bar"],
        "Huyện Ea Súp": ["Thị trấn Ea Súp", "Xã Ia Lốp", "Xã Ia Rvê", "Xã Ea Rốk", "Xã Ya Tờ Mốt", "Xã Cư KBang"],
        "Huyện Krông Pắk": ["Thị trấn Phước An", "Xã Ea Yông", "Xã Hòa An", "Xã Ea Kly", "Xã Ea Kênh", "Xã Hòa Tiến"],
        "Huyện Cư M'gar": ["Thị trấn Quảng Phú", "Xã Ea Pôk", "Xã Cuôr Đăng", "Xã Cư Dliê M'nông", "Xã Ea KPam", "Xã Ea M'DRóh"]
    },
    "Đắk Nông": {
        "Thành phố Gia Nghĩa": ["Phường Nghĩa Đức", "Phường Nghĩa Thành", "Phường Nghĩa Phú", "Phường Nghĩa Tân", "Phường Nghĩa Trung", "Xã Quảng Thành"],
        "Huyện Cư Jút": ["Thị trấn Ea T'Ling", "Xã Đắk Wil", "Xã Ea Pô", "Xã Nam Dong", "Xã Tâm Thắng", "Xã Trúc Sơn"],
        "Huyện Đắk Mil": ["Thị trấn Đắk Mil", "Xã Đắk Lao", "Xã Đắk Gằn", "Xã Đức Mạnh", "Xã Đắk N'Drót", "Xã Long Sơn"],
        "Huyện Krông Nô": ["Thị trấn Đắk Mâm", "Xã Nam Xuân", "Xã Buôn Choah", "Xã Đắk Drô", "Xã Nam Đà"],
        "Huyện Tuy Đức": ["Thị trấn Đắk Búk So", "Xã Quảng Tâm", "Xã Đắk R'Tíh", "Xã Đắk Ngo", "Xã Quảng Tân"]
    },
    "Điện Biên": {
        "Thành phố Điện Biên Phủ": ["Phường Mường Thanh", "Phường Nam Thanh", "Phường Thanh Bình", "Phường Noong Bua", "Phường Him Lam", "Xã Thanh Minh"],
        "Huyện Điện Biên": ["Thị trấn Tuần Giáo", "Xã Phình Sáng", "Xã Rạng Đông", "Xã Mùn Chung", "Xã Nà Sáy", "Xã Mường Mùn"],
        "Huyện Mường Chà": ["Thị trấn Mường Chà", "Xã Xá Tổng", "Xã Mường Tùng", "Xã Hừa Ngài", "Xã Huổi Mí", "Xã Pa Ham"],
        "Huyện Tủa Chùa": ["Thị trấn Tủa Chùa", "Xã Huổi Só", "Xã Xín Chải", "Xã Tả Sìn Thàng", "Xã Lao Xả Phình"],
        "Huyện Mường Nhé": ["Xã Mường Nhé", "Xã Mường Toong", "Xã Quảng Lâm", "Xã Sen Thượng", "Xã Chung Chải"]
    },
    "Đồng Nai": {
        "Thành phố Biên Hòa": ["Phường Tân Phong", "Phường Tân Biên", "Phường Hố Nai", "Phường Tân Hòa", "Phường Tân Hiệp", "Phường Trảng Dài", "Phường An Bình"],
        "Thành phố Long Khánh": ["Phường Xuân An", "Phường Xuân Bình", "Phường Xuân Hòa", "Phường Phú Bình", "Xã Bàu Sen", "Xã Bàu Trâm"],
        "Huyện Vĩnh Cửu": ["Thị trấn Vĩnh An", "Xã Bình Hòa", "Xã Thạnh Phú", "Xã Thiện Tân", "Xã Tân Bình", "Xã Bình Lợi"],
        "Huyện Trảng Bom": ["Thị trấn Trảng Bom", "Xã Thanh Bình", "Xã Cây Gáo", "Xã Bàu Hàm", "Xã Sông Thao"],
        "Huyện Thống Nhất": ["Thị trấn Dầu Giây", "Xã Gia Tân 1", "Xã Gia Tân 2", "Xã Gia Kiệm", "Xã Quang Trung"]
    },
    "Đồng Tháp": {
        "Thành phố Cao Lãnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 11", "Xã Mỹ Ngãi"],
        "Thành phố Sa Đéc": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Xã Tân Khánh Đông", "Xã Tân Phú Đông"],
        "Huyện Châu Thành": ["Thị trấn Cái Tàu Hạ", "Xã An Hiệp", "Xã An Nhơn", "Xã Tân Nhuận Đông", "Xã Tân Bình", "Xã Tân Phú Trung"],
        "Huyện Lai Vung": ["Thị trấn Lai Vung", "Xã Tân Dương", "Xã Hòa Thành", "Xã Long Hậu", "Xã Tân Thành"],
        "Huyện Tam Nông": ["Thị trấn Tràm Chim", "Xã Hoà Bình", "Xã Tân Công Sính", "Xã Phú Đức", "Xã Phú Thọ"]
    },
    "Gia Lai": {
        "Thành phố Pleiku": ["Phường Yên Đỗ", "Phường Diên Hồng", "Phường Ia Kring", "Phường Hội Thương", "Phường Hội Phú", "Phường Phù Đổng"],
        "Huyện Chư Păh": ["Thị trấn Ia Ly", "Xã Ia Mơ Nông", "Xã Ia Kreng", "Xã Đăk Tơ Ver", "Xã Hà Tây", "Xã Ia Ka"],
        "Huyện Mang Yang": ["Thị trấn Kon Dơng", "Xã Ayun", "Xã Đak Jơ Ta", "Xã Đak Ta Ley", "Xã Hra", "Xã Đăk Yă"],
        "Huyện Kbang": ["Thị trấn Kbang", "Xã Kon Pne", "Xã Đăk Roong", "Xã Sơn Lang", "Xã KRong"],
        "Huyện Đắk Đoa": ["Thị trấn Đắk Đoa", "Xã Hà Đông", "Xã Đắk Sơmei", "Xã Kon Gang", "Xã Tân Bình"]
    },
    "Hà Giang": {
        "Thành phố Hà Giang": ["Phường Minh Khai", "Phường Nguyễn Trãi", "Phường Ngọc Hà", "Xã Ngọc Đường", "Xã Phương Thiện", "Xã Phương Độ"],
        "Huyện Đồng Văn": ["Thị trấn Đồng Văn", "Xã Phó Bảng", "Xã Lũng Cú", "Xã Má Lé", "Xã Sính Lủng", "Xã Sảng Tủng"],
        "Huyện Mèo Vạc": ["Thị trấn Mèo Vạc", "Xã Thượng Phùng", "Xã Pải Lủng", "Xã Xín Cái", "Xã Pả Vi", "Xã Giàng Chu Phìn"],
        "Huyện Yên Minh": ["Thị trấn Yên Minh", "Xã Thắng Mố", "Xã Phú Lũng", "Xã Sủng Tráng", "Xã Bạch Đích"],
        "Huyện Quản Bạ": ["Thị trấn Tam Sơn", "Xã Lùng Tám", "Xã Quyết Tiến", "Xã Đông Hà", "Xã Cán Tỷ"]
    },
    "Hà Nam": {
        "Thành phố Phủ Lý": ["Phường Lê Hồng Phong", "Phường Quang Trung", "Phường Hai Bà Trưng", "Phường Lam Hạ", "Phường Liêm Chính", "Xã Liêm Chung"],
        "Huyện Duy Tiên": ["Thị trấn Hòa Mạc", "Xã Mộc Nam", "Xã Duy Minh", "Xã Tiên Nội", "Xã Tiên Ngoại", "Xã Tiên Tân"],
        "Huyện Kim Bảng": ["Thị trấn Quế", "Xã Liên Sơn", "Xã Thi Sơn", "Xã Thanh Sơn", "Xã Kiện Khê", "Xã Tân Sơn"],
        "Huyện Lý Nhân": ["Thị trấn Vĩnh Trụ", "Xã Hợp Lý", "Xã Chính Lý", "Xã Đồng Lý", "Xã Văn Lý"],
        "Huyện Thanh Liêm": ["Thị trấn Tân Thanh", "Xã Thanh Tân", "Xã Thanh Hải", "Xã Thanh Nghị", "Xã Thanh Thủy"]
    },
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cống Vị", "Phường Liễu Giai", "Phường Nguyễn Trung Trực"],
        "Quận Hoàn Kiếm": ["Phường Phúc Tân", "Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào", "Phường Hàng Bồ"],
        "Quận Hai Bà Trưng": ["Phường Nguyễn Du", "Phường Bạch Đằng", "Phường Phạm Đình Hổ", "Phường Lê Đại Hành", "Phường Đồng Nhân", "Phường Phố Huế"],
        "Quận Đống Đa": ["Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Láng Thượng", "Phường Ô Chợ Dừa", "Phường Văn Chương"],
        "Quận Tây Hồ": ["Phường Thụy Khuê", "Phường Bưởi", "Phường Xuân La", "Phường Phú Thượng", "Phường Nhật Tân", "Phường Tứ Liên"],
        "Quận Cầu Giấy": ["Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Mai Dịch", "Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Quan Hoa"],
        "Quận Thanh Xuân": ["Phường Thanh Xuân Bắc", "Phường Thanh Xuân Nam", "Phường Kim Giang", "Phường Nhân Chính", "Phường Thượng Đình", "Phường Khương Trung"],
        "Huyện Đông Anh": ["Thị trấn Đông Anh", "Xã Xuân Nộn", "Xã Tiên Dương", "Xã Uy Nỗ", "Xã Vân Hà", "Xã Võng La"]
    },
    "Hà Tĩnh": {
        "Thành phố Hà Tĩnh": ["Phường Bắc Hà", "Phường Nam Hà", "Phường Trần Phú", "Phường Tân Giang", "Phường Đại Nài", "Xã Thạch Trung"],
        "Huyện Hương Khê": ["Thị trấn Hương Khê", "Xã Phú Gia", "Xã Gia Phố", "Xã Phú Phong", "Xã Hương Đô", "Xã Hương Trạch"],
        "Huyện Thạch Hà": ["Thị trấn Thạch Hà", "Xã Ngọc Sơn", "Xã Thạch Hải", "Xã Thạch Kênh", "Xã Thạch Sơn", "Xã Thạch Đài"],
        "Huyện Cẩm Xuyên": ["Thị trấn Cẩm Xuyên", "Thị trấn Thiên Cầm", "Xã Cẩm Hòa", "Xã Cẩm Dương", "Xã Cẩm Bình"],
        "Huyện Kỳ Anh": ["Thị trấn Kỳ Anh", "Xã Kỳ Thượng", "Xã Kỳ Hải", "Xã Kỳ Thọ", "Xã Kỳ Tân"]
    },
    "Hải Dương": {
        "Thành phố Hải Dương": ["Phường Bình Hàn", "Phường Phạm Ngũ Lão", "Phường Nguyễn Trãi", "Phường Nhị Châu", "Phường Quang Trung", "Phường Tân Bình"],
        "Huyện Cẩm Giàng": ["Thị trấn Cẩm Giàng", "Thị trấn Lai Cách", "Xã Cẩm Hưng", "Xã Cẩm Hoàng", "Xã Cẩm Văn", "Xã Cẩm Vũ"],
        "Huyện Kim Thành": ["Thị trấn Phú Thái", "Xã Lai Vu", "Xã Cộng Hòa", "Xã Thượng Vũ", "Xã Cổ Dũng", "Xã Việt Hưng"],
        "Huyện Thanh Hà": ["Thị trấn Thanh Hà", "Xã Phượng Hoàng", "Xã Thanh Xuân", "Xã Thanh Khê", "Xã Hồng Lạc"],
        "Huyện Gia Lộc": ["Thị trấn Gia Lộc", "Xã Thống Nhất", "Xã Yết Kiêu", "Xã Gia Tân", "Xã Tân Tiến"]
    },
    "Hải Phòng": {
        "Quận Hồng Bàng": ["Phường Hoàng Văn Thụ", "Phường Hùng Vương", "Phường Minh Khai", "Phường Quán Toan", "Phường Sở Dầu", "Phường Thượng Lý"],
        "Quận Ngô Quyền": ["Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ", "Phường Cầu Tre", "Phường Lạc Viên", "Phường Đông Khê"],
        "Quận Lê Chân": ["Phường Cát Dài", "Phường Đằng Giang", "Phường Đông Khê", "Phường Dư Hàng", "Phường Hàng Kênh", "Phường Kênh Dương"],
        "Quận Hải An": ["Phường Đằng Hải", "Phường Đằng Lâm", "Phường Nam Hải", "Phường Thành Tô", "Phường Tràng Cát", "Phường Cát Bi"],
        "Quận Kiến An": ["Phường Bắc Sơn", "Phường Đồng Hòa", "Phường Lãm Hà", "Phường Nam Sơn", "Phường Ngọc Sơn", "Phường Trần Thành Ngọ"],
        "Huyện An Dương": ["Thị trấn An Dương", "Xã Lê Thiện", "Xã Đại Bản", "Xã An Hồng", "Xã Hồng Phong", "Xã An Đồng"],
        "Huyện Tiên Lãng": ["Thị trấn Tiên Lãng", "Xã Tiên Minh", "Xã Tiên Thanh", "Xã Tiên Thắng", "Xã Tiên Cường"]
    },
    "Hậu Giang": {
        "Thành phố Vị Thanh": ["Phường I", "Phường III", "Phường IV", "Phường V", "Phường VII", "Xã Vị Tân", "Xã Hỏa Tiến"],
        "Huyện Châu Thành": ["Thị trấn Ngã Sáu", "Xã Đông Thạnh", "Xã Phú An", "Xã Phú Hữu", "Xã Phú Tân", "Xã Tân Phú Thạnh"],
        "Huyện Long Mỹ": ["Thị trấn Long Mỹ", "Xã Long Bình", "Xã Long Trị", "Xã Lương Nghĩa", "Xã Lương Tâm", "Xã Tân Phú"],
        "Huyện Phụng Hiệp": ["Thị trấn Kinh Cùng", "Thị trấn Cây Dương", "Xã Hòa Mỹ", "Xã Thạnh Hòa", "Xã Hòa An"],
        "Huyện Vị Thủy": ["Thị trấn Nàng Mau", "Xã Vị Trung", "Xã Vị Đông", "Xã Vị Thắng", "Xã Vĩnh Thuận Tây"]
    },
    "Hòa Bình": {
        "Thành phố Hòa Bình": ["Phường Tân Thịnh", "Phường Thịnh Lang", "Phường Hữu Nghị", "Phường Tân Hòa", "Phường Phương Lâm", "Xã Thống Nhất"],
        "Huyện Cao Phong": ["Thị trấn Cao Phong", "Xã Bình Thanh", "Xã Thung Nai", "Xã Bắc Phong", "Xã Thu Phong", "Xã Đông Phong"],
        "Huyện Kim Bôi": ["Thị trấn Bo", "Xã Đú Sáng", "Xã Hợp Tiến", "Xã Mỵ Hòa", "Xã Nam Thượng", "Xã Cuối Hạ"],
        "Huyện Lạc Sơn": ["Thị trấn Vụ Bản", "Xã Quý Hòa", "Xã Miền Đồi", "Xã Mỹ Thành", "Xã Tuân Đạo"],
        "Huyện Mai Châu": ["Thị trấn Mai Châu", "Xã Xăm Khòe", "Xã Chiềng Châu", "Xã Tân Thành", "Xã Pà Cò"]
    },
    "Hưng Yên": {
        "Thành phố Hưng Yên": ["Phường Hiến Nam", "Phường An Tảo", "Phường Lê Lợi", "Phường Minh Khai", "Phường Quang Trung", "Xã Bảo Khê"],
        "Huyện Kim Động": ["Thị trấn Lương Bằng", "Xã Nghĩa Dân", "Xã Toàn Thắng", "Xã Vĩnh Xá", "Xã Phạm Ngũ Lão", "Xã Đồng Thanh"],
        "Huyện Yên Mỹ": ["Thị trấn Yên Mỹ", "Xã Giai Phạm", "Xã Nghĩa Hiệp", "Xã Đồng Than", "Xã Ngọc Long", "Xã Liêu Xá"],
        "Huyện Văn Giang": ["Thị trấn Văn Giang", "Xã Xuân Quan", "Xã Cửu Cao", "Xã Phụng Công", "Xã Long Hưng"],
        "Huyện Khoái Châu": ["Thị trấn Khoái Châu", "Xã Đông Tảo", "Xã Bình Minh", "Xã Dạ Trạch", "Xã Tân Dân"]
    },
    "Khánh Hòa": {
        "Thành phố Nha Trang": ["Phường Lộc Thọ", "Phường Ngọc Hiệp", "Phường Vĩnh Hải", "Phường Vĩnh Phước", "Phường Phương Sài", "Phường Phước Tân"],
        "Thành phố Cam Ranh": ["Phường Cam Phúc Bắc", "Phường Cam Phúc Nam", "Phường Cam Lộc", "Phường Cam Phú", "Phường Ba Ngòi", "Xã Cam Thịnh Đông"],
        "Huyện Diên Khánh": ["Thị trấn Diên Khánh", "Xã Diên Lâm", "Xã Diên Điền", "Xã Diên Xuân", "Xã Diên Sơn", "Xã Diên Thọ"],
        "Huyện Vạn Ninh": ["Thị trấn Vạn Giã", "Xã Đại Lãnh", "Xã Vạn Phú", "Xã Vạn Long", "Xã Vạn Bình"],
        "Huyện Ninh Hòa": ["Thị trấn Ninh Hòa", "Xã Ninh Sơn", "Xã Ninh Tây", "Xã Ninh Thượng", "Xã Ninh An"]
    },
    "Kiên Giang": {
        "Thành phố Rạch Giá": ["Phường Vĩnh Thanh Vân", "Phường Vĩnh Thanh", "Phường Vĩnh Quang", "Phường Vĩnh Hiệp", "Phường Vĩnh Bảo", "Phường An Hòa"],
        "Huyện Phú Quốc": ["Thị trấn Dương Đông", "Thị trấn An Thới", "Xã Hàm Ninh", "Xã Dương Tơ", "Xã Bãi Thơm", "Xã Gành Dầu"],
        "Huyện Hà Tiên": ["Phường Tô Châu", "Phường Đông Hồ", "Xã Thuận Yên", "Xã Mỹ Đức", "Xã Tiên Hải", "Xã Pháo Đài"],
        "Huyện Giồng Riềng": ["Thị trấn Giồng Riềng", "Xã Thạnh Hưng", "Xã Thạnh Phước", "Xã Ngọc Thành", "Xã Ngọc Chúc"],
        "Huyện U Minh Thượng": ["Thị trấn Minh Thuận", "Xã Vĩnh Hòa", "Xã Vĩnh Bình Bắc", "Xã An Minh Bắc", "Xã Hòa Chánh"]
    },
    "Kon Tum": {
        "Thành phố Kon Tum": ["Phường Thắng Lợi", "Phường Nguyễn Trãi", "Phường Thống Nhất", "Phường Lê Lợi", "Phường Trần Hưng Đạo", "Xã Đăk Cấm"],
        "Huyện Đắk Glei": ["Thị trấn Đắk Glei", "Xã Đắk Plô", "Xã Đắk Man", "Xã Đắk Nhoong", "Xã Đắk Pék", "Xã Mường Hoong"],
        "Huyện Ngọc Hồi": ["Thị trấn Plei Kần", "Xã Đắk Ang", "Xã Đắk Dục", "Xã Đắk Nông", "Xã Đắk Xú", "Xã Sa Loong"],
        "Huyện Kon Plông": ["Xã Đắk Nên", "Xã Đắk Ring", "Xã Măng Buk", "Xã Măng Cành", "Xã Hiếu"],
        "Huyện Kon Rẫy": ["Thị trấn Đắk Rve", "Xã Đắk Kôi", "Xã Đắk Pne", "Xã Đắk Ruồng", "Xã Đắk Tờ Re"]
    },
    "Lai Châu": {
        "Thành phố Lai Châu": ["Phường Quyết Thắng", "Phường Tân Phong", "Phường Đoàn Kết", "Xã San Thàng", "Xã Nậm Loỏng", "Xã Sùng Phài"],
        "Huyện Phong Thổ": ["Thị trấn Phong Thổ", "Xã Sì Lở Lầu", "Xã Mồ Sì San", "Xã Pa Vây Sử", "Xã Vàng Ma Chải", "Xã Tông Qua Lìn"],
        "Huyện Tam Đường": ["Thị trấn Tam Đường", "Xã Thèn Sin", "Xã Tả Lèng", "Xã Giang Ma", "Xã Hồ Thầu", "Xã Bình Lư"],
        "Huyện Sìn Hồ": ["Thị trấn Sìn Hồ", "Xã Chăn Nưa", "Xã Pa Tần", "Xã Phìn Hồ", "Xã Làng Mô"],
        "Huyện Mường Tè": ["Thị trấn Mường Tè", "Xã Thu Lũm", "Xã Ka Lăng", "Xã Tá Bạ", "Xã Pa ủ"]
    },
    "Lâm Đồng": {
        "Thành phố Đà Lạt": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"],
        "Thành phố Bảo Lộc": ["Phường 1", "Phường 2", "Phường B'Lao", "Phường Lộc Phát", "Phường Lộc Tiến", "Xã Đạm Bri"],
        "Huyện Đức Trọng": ["Thị trấn Liên Nghĩa", "Xã Hiệp An", "Xã Liên Hiệp", "Xã Hiệp Thạnh", "Xã Ninh Gia", "Xã Tân Hội"],
        "Huyện Lâm Hà": ["Thị trấn Đinh Văn", "Thị trấn Nam Ban", "Xã Đan Phượng", "Xã Tân Thanh", "Xã Gia Lâm"],
        "Huyện Đơn Dương": ["Thị trấn D'Ran", "Thị trấn Thạnh Mỹ", "Xã Lạc Xuân", "Xã Đạ Ròn", "Xã Tu Tra"]
    },
    "Lạng Sơn": {
        "Thành phố Lạng Sơn": ["Phường Chi Lăng", "Phường Hoàng Văn Thụ", "Phường Tam Thanh", "Phường Vĩnh Trại", "Phường Đông Kinh", "Xã Hoàng Đồng"],
        "Huyện Tràng Định": ["Thị trấn Thất Khê", "Xã Khánh Long", "Xã Đoàn Kết", "Xã Quốc Khánh", "Xã Vĩnh Tiến", "Xã Tân Tiến"],
        "Huyện Bình Gia": ["Thị trấn Bình Gia", "Xã Hưng Đạo", "Xã Minh Khai", "Xã Hoa Thám", "Xã Hoàng Văn Thụ", "Xã Thiện Hòa"],
        "Huyện Văn Lãng": ["Thị trấn Na Sầm", "Xã  Hoàng Văn Thụ", "Xã Thanh Long", "Xã Hồng Việt", "Xã Tân Mỹ"],
        "Huyện Cao Lộc": ["Thị trấn Đồng Đăng", "Thị trấn Cao Lộc", "Xã Bảo Lâm", "Xã Thanh Lòa", "Xã Hợp Thành"]
    },
    "Lào Cai": {
        "Thành phố Lào Cai": ["Phường Duyên Hải", "Phường Lào Cai", "Phường Cốc Lếu", "Phường Kim Tân", "Phường Bắc Lệnh", "Xã Vạn Hòa"],
        "Huyện Sa Pa": ["Thị trấn Sa Pa", "Xã Sa Pả", "Xã Ý Tý", "Xã Tả Phìn", "Xã Trung Chải", "Xã Bản Hồ"],
        "Huyện Bắc Hà": ["Thị trấn Bắc Hà", "Xã Lùng Cải", "Xã Lùng Phình", "Xã Tả Van Chư", "Xã Tà Chải", "Xã Bản Phố"],
        "Huyện Mường Khương": ["Thị trấn Mường Khương", "Xã Tung Chung Phố", "Xã Dìn Chin", "Xã Tả Gia Khâu", "Xã Nấm Lư"],
        "Huyện Si Ma Cai": ["Thị trấn Si Ma Cai", "Xã Sín Chéng", "Xã Lùng Thẩn", "Xã Cán Cấu", "Xã Sán Chải"]
    },
    "Long An": {
        "Thành phố Tân An": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7"],
        "Huyện Bến Lức": ["Thị trấn Bến Lức", "Xã Thạnh Lợi", "Xã Lương Bình", "Xã Thạnh Hòa", "Xã Lương Hòa", "Xã Tân Hòa"],
        "Huyện Đức Hòa": ["Thị trấn Đức Hòa", "Thị trấn Hậu Nghĩa", "Xã Lộc Giang", "Xã An Ninh Đông", "Xã An Ninh Tây", "Xã Mỹ Hạnh Bắc"],
        "Huyện Tân Trụ": ["Thị trấn Tân Trụ", "Xã Bình Trinh Đông", "Xã Đức Tân", "Xã Nhựt Ninh", "Xã Quê Mỹ Thạnh"],
        "Huyện Cần Đước": ["Thị trấn Cần Đước", "Xã Long Trạch", "Xã Mỹ Lệ", "Xã Phước Đông", "Xã Long Hựu Tây"]
    },
    "Nam Định": {
        "Thành phố Nam Định": ["Phường Hạ Long", "Phường Lộc Vượng", "Phường Cửa Bắc", "Phường Cửa Nam", "Phường Trần Đăng Ninh", "Phường Văn Miếu"],
        "Huyện Mỹ Lộc": ["Thị trấn Mỹ Lộc", "Xã Mỹ Hà", "Xã Mỹ Tiến", "Xã Mỹ Thắng", "Xã Mỹ Trung", "Xã Mỹ Tân"],
        "Huyện Vụ Bản": ["Thị trấn Gôi", "Xã Minh Thuận", "Xã Hiển Khánh", "Xã Tân Khánh", "Xã Hợp Hưng", "Xã Liên Minh"],
        "Huyện Ý Yên": ["Thị trấn Lâm", "Xã Yên Nghĩa", "Xã Yên Ninh", "Xã Yên Khang", "Xã Yên Phương"],
        "Huyện Nam Trực": ["Thị trấn Nam Giang", "Xã Nam Mỹ", "Xã Điền Xá", "Xã Nam Thanh", "Xã Nam Toàn"]
    },
    "Nghệ An": {
        "Thành phố Vinh": ["Phường Hưng Bình", "Phường Hưng Phúc", "Phường Hưng Dũng", "Phường Cửa Nam", "Phường Quang Trung", "Phường Lê Lợi"],
        "Huyện Quỳnh Lưu": ["Thị trấn Cầu Giát", "Xã Quỳnh Thắng", "Xã Quỳnh Tân", "Xã Quỳnh Châu", "Xã Tân Sơn", "Xã Quỳnh Văn"],
        "Huyện Diễn Châu": ["Thị trấn Diễn Châu", "Xã Diễn Lâm", "Xã Diễn Đoài", "Xã Diễn Trường", "Xã Diễn Yên", "Xã Diễn Hồng"],
        "Huyện Nghi Lộc": ["Thị trấn Quán Hành", "Xã Nghi Văn", "Xã Nghi Yên", "Xã Nghi Tiến", "Xã Nghi Hưng"],
        "Huyện Anh Sơn": ["Thị trấn Anh Sơn", "Xã Thành Sơn", "Xã Đỉnh Sơn", "Xã Hùng Sơn", "Xã Tào Sơn"]
    },
    "Ninh Bình": {
        "Thành phố Ninh Bình": ["Phường Đông Thành", "Phường Tân Thành", "Phường Thanh Bình", "Phường Vân Giang", "Phường Bích Đào", "Phường Nam Bình"],
        "Huyện Hoa Lư": ["Thị trấn Thiên Tôn", "Xã Ninh Hải", "Xã Ninh Thắng", "Xã Ninh Vân", "Xã Ninh An", "Xã Trường Yên"],
        "Huyện Tam Điệp": ["Thị trấn Tam Điệp", "Phường Tân Bình", "Phường Bắc Sơn", "Phường Nam Sơn", "Xã Yên Sơn", "Xã Quang Sơn"],
        "Huyện Kim Sơn": ["Thị trấn Phát Diệm", "Thị trấn Bình Minh", "Xã Hồi Ninh", "Xã Xuân Thiện", "Xã Ân Hòa"],
        "Huyện Yên Mô": ["Thị trấn Yên Thịnh", "Xã Yên Mỹ", "Xã Yên Hưng", "Xã Yên Thành", "Xã Yên Thắng"]
    },
    "Ninh Thuận": {
        "Thành phố Phan Rang - Tháp Chàm": ["Phường Đô Vinh", "Phường Kinh Dinh", "Phường Văn Hải", "Phường Thanh Sơn", "Phường Bảo An", "Phường Mỹ Hương"],
        "Huyện Ninh Hải": ["Thị trấn Khánh Hải", "Xã Vĩnh Hải", "Xã Phương Hải", "Xã Tân Hải", "Xã Xuân Hải", "Xã Hộ Hải"],
        "Huyện Ninh Phước": ["Thị trấn Phước Dân", "Xã Phước Sơn", "Xã Phước Thái", "Xã Phước Hậu", "Xã An Hải", "Xã Phước Hữu"],
        "Huyện Thuận Bắc": ["Thị trấn Tân Sơn", "Xã Lợi Hải", "Xã Bắc Sơn", "Xã Bắc Phong", "Xã Công Hải"],
        "Huyện Thuận Nam": ["Thị trấn Phước Nam", "Xã Phước Diêm", "Xã Cà Ná", "Xã Nhị Hà", "Xã Phước Dinh"]
    },
    "Phú Thọ": {
        "Thành phố Việt Trì": ["Phường Nông Trang", "Phường Tiên Cát", "Phường Vân Cơ", "Phường Thanh Miếu", "Phường Bạch Hạc", "Phường Minh Nông"],
        "Huyện Lâm Thao": ["Thị trấn Hùng Sơn", "Thị trấn Lâm Thao", "Xã Tiên Kiên", "Xã Hợp Hải", "Xã Sơn Dương", "Xã Cao Xá"],
        "Huyện Thanh Thủy": ["Thị trấn Thanh Thủy", "Xã Sơn Thủy", "Xã Bảo Yên", "Xã Đoan Hạ", "Xã Đồng Luận", "Xã Hoàng Xá"],
        "Huyện Cẩm Khê": ["Thị trấn Sông Thao", "Xã Tiên Lương", "Xã Tuy Lộc", "Xã Ngô Xá", "Xã Phương Xá"],
        "Huyện Đoan Hùng": ["Thị trấn Đoan Hùng", "Xã Chí Đám", "Xã Hùng Long", "Xã Vân Đồn", "Xã Phúc Lai"]
    },
    "Phú Yên": {
        "Thành phố Tuy Hòa": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7"],
        "Huyện Đông Hòa": ["Thị trấn Hòa Hiệp Trung", "Xã Hòa Tâm", "Xã Hòa Xuân Đông", "Xã Hòa Hiệp Bắc", "Xã Hòa Thành", "Xã Hòa Xuân Nam"],
        "Huyện Sông Cầu": ["Thị trấn Sông Cầu", "Xã Xuân Lộc", "Xã Xuân Bình", "Xã Xuân Cảnh", "Xã Xuân Thịnh", "Xã Xuân Phương"],
        "Huyện Tuy An": ["Thị trấn Chí Thạnh", "Xã An Ninh Đông", "Xã An Ninh Tây", "Xã An Dân", "Xã An Định"],
        "Huyện Tây Hòa": ["Thị trấn Phú Thứ", "Xã Hòa Mỹ Đông", "Xã Hòa Mỹ Tây", "Xã Hòa Thành", "Xã Hòa Phong"]
    },
    "Quảng Bình": {
        "Thành phố Đồng Hới": ["Phường Bắc Lý", "Phường Nam Lý", "Phường Đồng Phú", "Phường Bắc Nghĩa", "Phường Đức Ninh Đông", "Xã Quang Phú"],
        "Huyện Bố Trạch": ["Thị trấn Hoàn Lão", "Thị trấn Nông trường Việt Trung", "Xã Xuân Trạch", "Xã Mỹ Trạch", "Xã Tân Trạch", "Xã Liên Trạch"],
        "Huyện Lệ Thủy": ["Thị trấn Kiến Giang", "Thị trấn Nông trường Lệ Ninh", "Xã An Thủy", "Xã Phong Thủy", "Xã Sơn Thủy", "Xã Ngư Thủy"],
        "Huyện Quảng Ninh": ["Thị trấn Quán Hàu", "Xã Võ Ninh", "Xã Lương Ninh", "Xã Vạn Ninh", "Xã Duy Ninh"],
        "Huyện Minh Hóa": ["Thị trấn Quy Đạt", "Xã Hóa Tiến", "Xã Hóa Hợp", "Xã Xuân Hóa", "Xã Yên Hóa"]
    },
    "Quảng Nam": {
        "Thành phố Hội An": ["Phường Minh An", "Phường Tân An", "Phường Cẩm Phô", "Phường Thanh Hà", "Phường Sơn Phong", "Xã Cẩm Châu"],
        "Thành phố Tam Kỳ": ["Phường An Xuân", "Phường An Sơn", "Phường Trường Xuân", "Phường Tân Thạnh", "Phường Hòa Thuận", "Xã Tam Phú"],
        "Huyện Đại Lộc": ["Thị trấn Ái Nghĩa", "Xã Đại Sơn", "Xã Đại Lãnh", "Xã Đại Hưng", "Xã Đại Hồng", "Xã Đại Cường"],
        "Huyện Thăng Bình": ["Thị trấn Hà Lam", "Xã Bình Triều", "Xã Bình Giang", "Xã Bình Trung", "Xã Bình Định"],
        "Huyện Tiên Phước": ["Thị trấn Tiên Kỳ", "Xã Tiên Sơn", "Xã Tiên Hà", "Xã Tiên Cảnh", "Xã Tiên Mỹ"]
    },
    "Quảng Ngãi": {
        "Thành phố Quảng Ngãi": ["Phường Chánh Lộ", "Phường Nghĩa Chánh", "Phường Trần Phú", "Phường Lê Hồng Phong", "Phường Trần Hưng Đạo", "Phường Nguyễn Nghiêm"],
        "Huyện Bình Sơn": ["Thị trấn Châu Ổ", "Xã Bình Thạnh", "Xã Bình Đông", "Xã Bình Chánh", "Xã Bình Nguyên", "Xã Bình Trị"],
        "Huyện Sơn Tịnh": ["Thị trấn Sơn Tịnh", "Xã Tịnh Bắc", "Xã Tịnh Giang", "Xã Tịnh Đông", "Xã Tịnh Thiện", "Xã Tịnh Trà"],
        "Huyện Tư Nghĩa": ["Thị trấn La Hà", "Xã Nghĩa Điền", "Xã Nghĩa Thương", "Xã Nghĩa Hiệp", "Xã Nghĩa Kỳ"],
        "Huyện Lý Sơn": ["Xã An Vĩnh", "Xã An Hải", "Xã An Bình"]
    },
    "Quảng Ninh": {
        "Thành phố Hạ Long": ["Phường Hồng Gai", "Phường Bạch Đằng", "Phường Hồng Hà", "Phường Tuần Châu", "Phường Việt Hưng", "Phường Hùng Thắng"],
        "Thành phố Cẩm Phả": ["Phường Cẩm Thủy", "Phường Cẩm Thạch", "Phường Cẩm Thành", "Phường Cẩm Trung", "Phường Cẩm Bình", "Phường Cẩm Đông"],
        "Thành phố Uông Bí": ["Phường Thanh Sơn", "Phường Bắc Sơn", "Phường Quang Trung", "Phường Trưng Vương", "Phường Nam Khê", "Xã Thượng Yên Công"],
        "Huyện Vân Đồn": ["Thị trấn Cái Rồng", "Xã Đông Xá", "Xã Bình Dân", "Xã Vạn Yên", "Xã Hạ Long"],
        "Huyện Cô Tô": ["Thị trấn Cô Tô", "Xã Đồng Tiến", "Xã Thanh Lân"]
    },
    "Quảng Trị": {
        "Thành phố Đông Hà": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Xã Hải Lệ"],
        "Thị xã Quảng Trị": ["Phường 1", "Phường 2", "Phường 3", "Xã Triệu Thượng", "Xã Triệu Đại", "Xã Triệu Thuận"],
        "Huyện Vĩnh Linh": ["Thị trấn Hồ Xá", "Thị trấn Bến Quan", "Xã Vĩnh Tú", "Xã Vĩnh Chấp", "Xã Trung Nam", "Xã Kim Thạch"],
        "Huyện Hải Lăng": ["Thị trấn Diên Sanh", "Xã Hải An", "Xã Hải Ba", "Xã Hải Quế", "Xã Hải Quy"],
        "Huyện Đakrông": ["Thị trấn Krông Klang", "Xã Mò Ó", "Xã Hướng Hiệp", "Xã Đakrông", "Xã Tà Long"]
    },
    "Sóc Trăng": {
        "Thành phố Sóc Trăng": ["Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 8", "Phường 9", "Xã Vĩnh Phước"],
        "Huyện Kế Sách": ["Thị trấn Kế Sách", "Xã An Lạc Thôn", "Xã Xuân Hòa", "Xã Phong Nẫm", "Xã An Lạc Tây", "Xã Thới An Hội"],
        "Huyện Mỹ Tú": ["Thị trấn Huỳnh Hữu Nghĩa", "Xã Hưng Phú", "Xã Mỹ Hương", "Xã Mỹ Thuận", "Xã Mỹ Tú", "Xã Thuận Hưng"],
        "Huyện Mỹ Xuyên": ["Thị trấn Mỹ Xuyên", "Xã Đại Tâm", "Xã Tham Đôn", "Xã Thạnh Phú", "Xã Gia Hòa 1"],
        "Huyện Ngã Năm": ["Thị trấn Ngã Năm", "Xã Long Tân", "Xã Vĩnh Quới", "Xã Vĩnh Biên", "Xã Mỹ Bình"]
    },
    "Sơn La": {
        "Thành phố Sơn La": ["Phường Chiềng Lề", "Phường Tô Hiệu", "Phường Quyết Thắng", "Phường Quyết Tâm", "Xã Chiềng Cơi", "Xã Hua La"],
        "Huyện Quỳnh Nhai": ["Xã Mường Giàng", "Xã Chiềng Bằng", "Xã Mường Chiên", "Xã Cà Nàng", "Xã Chiềng Khay", "Xã Mường Giôn"],
        "Huyện Thuận Châu": ["Thị trấn Thuận Châu", "Xã Phổng Lái", "Xã Mường é", "Xã Chiềng Pha", "Xã Chiềng La", "Xã Bó Mười"],
        "Huyện Mộc Châu": ["Thị trấn Mộc Châu", "Thị trấn NT Mộc Châu", "Xã Chiềng Sơn", "Xã Tân Hợp", "Xã Qui Hướng"],
        "Huyện Yên Châu": ["Thị trấn Yên Châu", "Xã Chiềng Đông", "Xã Sặp Vạt", "Xã Viêng Lán", "Xã Chiềng Pằn"]
    },
    "Tây Ninh": {
        "Thành phố Tây Ninh": ["Phường 2", "Phường 3", "Phường 4", "Phường 1", "Phường Hiệp Ninh", "Xã Thạnh Tân"],
        "Huyện Tân Biên": ["Thị trấn Tân Biên", "Xã Tân Lập", "Xã Thạnh Bắc", "Xã Tân Bình", "Xã Thạnh Bình", "Xã Tân Phong"],
        "Huyện Trảng Bàng": ["Thị trấn Trảng Bàng", "Xã Đôn Thuận", "Xã Hưng Thuận", "Xã Lộc Hưng", "Xã Gia Lộc", "Xã An Hòa"],
        "Huyện Gò Dầu": ["Thị trấn Gò Dầu", "Xã Thanh Phước", "Xã Bàu Đồn", "Xã Phước Thạnh", "Xã Phước Đông"],
        "Huyện Châu Thành": ["Thị trấn Châu Thành", "Xã Hảo Đước", "Xã Đồng Khởi", "Xã Thái Bình", "Xã An Cơ"]
    },
    "Thái Bình": {
        "Thành phố Thái Bình": ["Phường Kỳ Bá", "Phường Quang Trung", "Phường Phú Khánh", "Phường Tiền Phong", "Phường Trần Lãm", "Xã Vũ Chính"],
        "Huyện Quỳnh Phụ": ["Thị trấn Quỳnh Côi", "Xã An Khê", "Xã An Đồng", "Xã Quỳnh Hoa", "Xã Quỳnh Lâm", "Xã Quỳnh Ngọc"],
        "Huyện Tiền Hải": ["Thị trấn Tiền Hải", "Xã Đông Trà", "Xã Đông Long", "Xã Đông Quí", "Xã Vũ Lăng", "Xã Nam Thịnh"],
        "Huyện Kiến Xương": ["Thị trấn Thanh Nê", "Xã Trà Giang", "Xã Quốc Tuấn", "Xã Vũ Đông", "Xã An Bình"],
        "Huyện Thái Thụy": ["Thị trấn Diêm Điền", "Xã Thụy Trình", "Xã Thụy Dân", "Xã Thụy Hải", "Xã Thụy Xuân"]
    },
    "Thái Nguyên": {
        "Thành phố Thái Nguyên": ["Phường Hoàng Văn Thụ", "Phường Trưng Vương", "Phường Quang Trung", "Phường Phan Đình Phùng", "Phường Túc Duyên", "Xã Phúc Xuân"],
        "Thành phố Sông Công": ["Phường Bách Quang", "Phường Cải Đan", "Phường Lương Châu", "Phường Mỏ Chè", "Phường Thắng Lợi", "Xã Bá Xuyên"],
        "Huyện Định Hóa": ["Thị trấn Chợ Chu", "Xã Phúc Chu", "Xã Tân Dương", "Xã Đồng Thịnh", "Xã Kim Sơn", "Xã Lam Vỹ"],
        "Huyện Phổ Yên": ["Thị trấn Ba Hàng", "Xã Bắc Sơn", "Xã Minh Đức", "Xã Nam Tiến", "Xã Tân Hương"],
        "Huyện Võ Nhai": ["Thị trấn Đình Cả", "Xã Sảng Mộc", "Xã Nghinh Tường", "Xã Thần Xa", "Xã Vũ Chấn"]
    },
    "Thanh Hóa": {
        "Thành phố Thanh Hóa": ["Phường Ba Đình", "Phường Lam Sơn", "Phường Ngọc Trạo", "Phường Điện Biên", "Phường Phú Sơn", "Phường Quảng Thắng"],
        "Thị xã Bỉm Sơn": ["Phường Ba Đình", "Phường Bắc Sơn", "Phường Đông Sơn", "Phường Lam Sơn", "Phường Ngọc Trạo", "Phường Quảng Tiến"],
        "Thị xã Sầm Sơn": ["Phường Bắc Sơn", "Phường Trung Sơn", "Phường Trường Sơn", "Phường Quảng Cư", "Xã Quảng Tiến"],
        "Huyện Nga Sơn": ["Thị trấn Nga Sơn", "Xã Nga Vịnh", "Xã Nga An", "Xã Nga Phú", "Xã Nga Điền", "Xã Nga Tân"],
        "Huyện Hà Trung": ["Thị trấn Hà Trung", "Xã Hà Long", "Xã Hà Vinh", "Xã Hà Bắc", "Xã Hà Lai"]
    },
    "Thừa Thiên Huế": {
        "Thành phố Huế": ["Phường Phú Hội", "Phường Phú Nhuận", "Phường Tây Lộc", "Phường Thuận Lộc", "Phường Gia Hội", "Phường Phú Hậu"],
        "Thị xã Hương Thủy": ["Phường Phú Bài", "Xã Thủy Vân", "Xã Thủy Thanh", "Xã Thủy Dương", "Xã Thủy Phương", "Phường Thủy Châu"],
        "Thị xã Hương Trà": ["Phường Tứ Hạ", "Xã Hương Thọ", "Xã Hương Toàn", "Xã Hương Vân", "Xã Hương Vinh"],
        "Huyện Phú Vang": ["Thị trấn Phú Đa", "Xã Vinh Xuân", "Xã Phú Hải", "Xã Vinh Thanh", "Xã Vinh An", "Xã Phú Diên"],
        "Huyện A Lưới": ["Thị trấn A Lưới", "Xã Hồng Thủy", "Xã Hồng Vân", "Xã Hồng Hạ", "Xã A Roàng"]
    },
    "Tiền Giang": {
        "Thành phố Mỹ Tho": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Xã Đạo Thạnh"],
        "Huyện Cái Bè": ["Thị trấn Cái Bè", "Xã Hậu Mỹ Bắc B", "Xã Hậu Mỹ Bắc A", "Xã Mỹ Trung", "Xã Hậu Mỹ Trinh", "Xã Hậu Mỹ Phú"],
        "Huyện Châu Thành": ["Thị trấn Tân Hiệp", "Xã Tân Hội Đông", "Xã Tân Hương", "Xã Tân Lý Đông", "Xã Nhị Bình", "Xã Tân Lý Tây"],
        "Huyện Gò Công": ["Thị trấn Gò Công", "Xã Long Hòa", "Xã Bình Đông", "Xã Bình Xuân", "Xã Tân Trung"],
        "Huyện Tân Phước": ["Thị trấn Mỹ Phước", "Xã Hưng Thạnh", "Xã Mỹ Phước", "Xã Tân Hòa Đông", "Xã Thạnh Tân"]
    },
    "Trà Vinh": {
        "Thành phố Trà Vinh": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Xã Long Đức"],
        "Huyện Càng Long": ["Thị trấn Càng Long", "Xã Mỹ Cẩm", "Xã An Trường A", "Xã An Trường", "Xã Huyền Hội", "Xã Tân An"],
        "Huyện Châu Thành": ["Thị trấn Châu Thành", "Xã Hảo Đước", "Xã Đồng Khởi", "Xã Thái Bình", "Xã An Cơ", "Xã Biên Giới"],
        "Huyện Tiểu Cần": ["Thị trấn Tiểu Cần", "Xã Tân Hòa", "Xã Tập Ngãi", "Xã Ngãi Hùng", "Xã Tân Hùng"],
        "Huyện Cầu Kè": ["Thị trấn Cầu Kè", "Xã Hòa Ân", "Xã Châu Điền", "Xã An Phú Tân", "Xã Phong Phú"]
    },
    "Tuyên Quang": {
        "Thành phố Tuyên Quang": ["Phường Tân Quang", "Phường Minh Xuân", "Phường Nông Tiến", "Phường Ỷ La", "Xã An Tường", "Xã Lưỡng Vượng"],
        "Huyện Nà Hang": ["Thị trấn Nà Hang", "Xã Sinh Long", "Xã Thượng Giáp", "Xã Thượng Nông", "Xã Côn Lôn", "Xã Đà Vị"],
        "Huyện Chiêm Hóa": ["Thị trấn Vĩnh Lộc", "Xã Kiên Đài", "Xã Xuân Quang", "Xã Phúc Sơn", "Xã Minh Quang", "Xã Trung Hà"],
        "Huyện Hàm Yên": ["Thị trấn Tân Yên", "Xã Yên Thuận", "Xã Bạch Xa", "Xã Minh Khương", "Xã Yên Lâm"],
        "Huyện Sơn Dương": ["Thị trấn Sơn Dương", "Xã Trung Yên", "Xã Minh Thanh", "Xã Tân Trào", "Xã Hợp Hòa"]
    },
    "Vĩnh Long": {
        "Thành phố Vĩnh Long": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 9", "Phường 5", "Xã Tân Hòa"],
        "Huyện Long Hồ": ["Thị trấn Long Hồ", "Xã Đồng Phú", "Xã Bình Hòa Phước", "Xã Hòa Ninh", "Xã An Bình", "Xã Thanh Đức"],
        "Huyện Mang Thít": ["Thị trấn Cái Nhum", "Xã An Phước", "Xã Chánh An", "Xã Tân An Hội", "Xã Tân Long", "Xã Tân Long Hội"],
        "Huyện Vũng Liêm": ["Thị trấn Vũng Liêm", "Xã Tân Quới Trung", "Xã Quới Thiện", "Xã Quới An", "Xã Trung Chánh"],
        "Huyện Tam Bình": ["Thị trấn Tam Bình", "Xã Tân Lộc", "Xã Phú Thịnh", "Xã Hậu Lộc", "Xã Hòa Thạnh"]
    },
    "Vĩnh Phúc": {
        "Thành phố Vĩnh Yên": ["Phường Đồng Tâm", "Phường Hội Hợp", "Phường Khai Quang", "Phường Liên Bảo", "Phường Ngô Quyền", "Xã Định Trung"],
        "Thành phố Phúc Yên": ["Phường Xuân Hòa", "Phường Đồng Xuân", "Phường Phúc Thắng", "Xã Ngọc Thanh", "Xã Cao Minh"],
        "Huyện Yên Lạc": ["Thị trấn Yên Lạc", "Xã Đồng Cương", "Xã Đồng Văn", "Xã Bình Định", "Xã Trung Nguyên", "Xã Tam Hồng"],
        "Huyện Bình Xuyên": ["Thị trấn Hương Canh", "Thị trấn Gia Khánh", "Xã Trung Mỹ", "Xã Bá Hiến", "Xã Thiện Kế", "Xã Hương Sơn"],
        "Huyện Lập Thạch": ["Thị trấn Lập Thạch", "Xã Quang Sơn", "Xã Ngọc Mỹ", "Xã Sơn Đông", "Xã Bàn Giản"]
    },
    "Yên Bái": {
        "Thành phố Yên Bái": ["Phường Nguyễn Thái Học", "Phường Đồng Tâm", "Phường Minh Tân", "Phường Yên Thịnh", "Xã Âu Lâu", "Xã Tuy Lộc"],
        "Huyện Văn Yên": ["Thị trấn Mậu A", "Xã Lang Thíp", "Xã Châu Quế Thượng", "Xã Châu Quế Hạ", "Xã An Bình", "Xã Đại Sơn"],
        "Huyện Trấn Yên": ["Thị trấn Cổ Phúc", "Xã Tân Đồng", "Xã Báo Đáp", "Xã Đào Thịnh", "Xã Việt Thành", "Xã Hòa Cuông"],
        "Huyện Văn Chấn": ["Thị trấn Sơn Thịnh", "Xã Suối Bu", "Xã Suối Giàng", "Xã Nậm Búng", "Xã Sơn Lương"],
        "Huyện Mù Cang Chải": ["Thị trấn Mù Cang Chải", "Xã Chế Cu Nha", "Xã La Pán Tẩn", "Xã Dế Xu Phình", "Xã Cao Phạ"]
    }
};

export default vietnamAddressData;