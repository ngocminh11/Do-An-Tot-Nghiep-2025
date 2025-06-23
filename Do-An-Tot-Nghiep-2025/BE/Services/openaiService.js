const { OpenAIApi, Configuration } = require('openai');
const Product = require('../Models/Products');
const Feedback = require('../Models/Feedback');

let openai = null;
try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });
    openai = new OpenAIApi(configuration);
} catch (e) {
    openai = null;
}

// Lấy danh sách sản phẩm từ database
async function getAllProductsFromDB() {
    try {
        const products = await Product.find({ 'basicInformation.status': 'active' });
        return products;
    } catch (err) {
        console.error('Lỗi lấy sản phẩm từ DB:', err);
        return [];
    }
}

const fallbackResponses = {
    greetings: [
        "Xin chào! 😊 Mình là trợ lý ảo của CoCo - thương hiệu mỹ phẩm thiên nhiên hàng đầu Việt Nam. Bạn đang quan tâm sản phẩm nào hay cần tư vấn về vấn đề da ạ?",
        "Chào bạn! Mình là trợ lý tư vấn mỹ phẩm CoCo. Bạn cần giúp gì hôm nay?",
        "Chào bạn! CoCo luôn sẵn sàng tư vấn để bạn có làn da đẹp. Bạn đang gặp vấn đề gì về da?",
        "Xin chào! Rất vui được gặp bạn. Bạn cần tư vấn sản phẩm nào của CoCo?",
        "Chào mừng bạn đến với CoCo! Bạn cần tìm sản phẩm chăm sóc da nào?"
    ],
    
    skinType: {
        "da khô": [
            "Da khô nên dùng bộ sản phẩm cấp ẩm chuyên sâu của CoCo gồm: 1. Sữa rửa mặt dịu nhẹ, 2. Serum HA cấp nước, 3. Kem dưỡng ẩm Ceramide. Dùng sáng và tối sau khi làm sạch da.",
            "Với da khô, bạn cần cấp ẩm sâu. Bộ dưỡng ẩm chuyên sâu CoCo với serum HA và kem dưỡng Ceramide sẽ giúp da bạn mềm mại suốt ngày.",
            "Da khô dễ bị bong tróc? Hãy thử bộ sản phẩm dành riêng cho da khô của CoCo gồm sữa rửa mặt dịu nhẹ, serum HA và kem dưỡng Ceramide nhé!",
            "Để cải thiện da khô, bạn nên dùng sản phẩm chứa Hyaluronic Acid và Ceramide. CoCo có serum HA và kem dưỡng ẩm Ceramide dành riêng cho da khô.",
            "Da khô cần được chăm sóc đặc biệt. Bộ sản phẩm cấp ẩm của CoCo sẽ cung cấp độ ẩm suốt 72h, giúp da bạn mềm mịn."
        ],
        "da dầu": [
            "Da dầu nên dùng bộ kiềm dầu - se khít lỗ chân lông của CoCo: 1. Sữa rửa mặt Tea Tree, 2. Toner cân bằng da, 3. Serum Niacinamide, 4. Kem dưỡng kiềm dầu không nhờn.",
            "Kiểm soát dầu nhờn với bộ sản phẩm da dầu CoCo: sữa rửa mặt Tea Tree giúp làm sạch sâu, serum Niacinamide giảm tiết dầu và kem dưỡng không gây bít tắc lỗ chân lông.",
            "Da dầu thường gặp vấn đề bóng nhờn và lỗ chân lông to. Bộ sản phẩm CoCo cho da dầu sẽ giúp bạn kiểm soát dầu, se khít lỗ chân lông và ngừa mụn.",
            "Đừng lo lắng về da dầu! Bộ sản phẩm CoCo dành cho da dầu với chiết xuất Tea Tree và Niacinamide sẽ giúp da bạn sạch dầu, thông thoáng suốt ngày.",
            "Da dầu cần làm sạch nhẹ nhàng và kiểm soát bã nhờn. Sữa rửa mặt Tea Tree của CoCo kết hợp serum Niacinamide sẽ là giải pháp hoàn hảo cho bạn."
        ],
        "da hỗn hợp": [
            "Da hỗn hợp nên dùng bộ sản phẩm điều tiết dầu nhờn vùng chữ T và cấp ẩm vùng má của CoCo: sữa rửa mặt dịu nhẹ, toner cân bằng, serum HA cho vùng khô và serum Niacinamide cho vùng dầu.",
            "Chăm sóc da hỗn hợp đòi hỏi sự tinh tế. Bộ sản phẩm CoCo cho da hỗn hợp sẽ giúp bạn kiểm soát dầu vùng chữ T và cấp ẩm vùng má một cách hiệu quả.",
            "Da hỗn hợp cần chăm sóc riêng biệt từng vùng. Vùng chữ T nên dùng serum Niacinamide kiềm dầu, vùng má dùng serum HA cấp ẩm. CoCo có đủ bộ sản phẩm dành cho bạn!",
            "Bạn có da hỗn hợp? Đừng lo, CoCo có giải pháp: sữa rửa mặt dịu nhẹ cho toàn mặt, toner cân bằng, serum Niacinamide cho vùng chữ T và kem dưỡng HA cho vùng má.",
            "Da hỗn hợp là loại da khó chiều nhất! Hãy thử bộ sản phẩm chuyên biệt cho da hỗn hợp của CoCo để có làn da cân bằng."
        ],
        "da nhạy cảm": [
            "Với da nhạy cảm, CoCo có dòng sản phẩm SensiCare không chứa hương liệu, cồn hay chất bảo quản gây kích ứng. Bộ sản phẩm gồm: sữa rửa mặt dịu nhẹ, toner làm dịu và kem dưỡng phục hồi.",
            "Da nhạy cảm cần sản phẩm lành tính. Dòng SensiCare của CoCo với thành phần tự nhiên, không hương liệu, không cồn sẽ giúp da bạn dịu nhẹ, giảm kích ứng.",
            "Đừng để da nhạy cảm ngăn bạn có làn da đẹp! Bộ sản phẩm SensiCare của CoCo được thiết kế riêng cho da nhạy cảm, giúp làm dịu và phục hồi hàng rào bảo vệ da.",
            "Da bạn dễ đỏ, ngứa? Hãy dùng dòng sản phẩm SensiCare của CoCo. Với thành phần chiết xuất từ nha đam và rau má, sản phẩm sẽ làm dịu da ngay lập tức.",
            "CoCo hiểu làn da nhạy cảm cần sự chăm sóc đặc biệt. Dòng SensiCare không chứa 10 chất gây kích ứng phổ biến, an toàn tuyệt đối cho da bạn."
        ],
        "mụn": [
            "Để trị mụn hiệu quả, bạn nên dùng combo: 1. Gel rửa mặt Salicylic Acid, 2. Toner Tea Tree, 3. Serum trị mụn BHA, 4. Kem dưỡng không gây bít tắc lỗ chân lông.",
            "Mụn sẽ không còn là nỗi lo với bộ sản phẩm trị mụn CoCo: gel rửa mặt Salicylic Acid làm sạch sâu lỗ chân lông, serum BHA tiêu diệt vi khuẩn gây mụn và kem dưỡng không gây bít tắc.",
            "Bộ sản phẩm trị mụn của CoCo với chiết xuất Tea Tree và Salicylic Acid giúp giảm mụn đến 90% chỉ sau 4 tuần sử dụng.",
            "Đánh bay mụn với bộ đôi thần thánh của CoCo: serum trị mụn BHA và kem dưỡng ngừa mụn. Kết hợp gel rửa mặt Salicylic Acid để làm sạch sâu.",
            "Mụn đầu đen, mụn sưng viêm? Hãy thử bộ sản phẩm trị mụn của CoCo. Với thành phần BHA và Tea Tree, sản phẩm sẽ làm sạch lỗ chân lông, giảm viêm và ngừa mụn quay lại."
        ],
        "thâm": [
            "Để làm mờ thâm, bạn nên dùng serum Vitamin C 15% của CoCo vào buổi sáng và serum Niacinamide vào buổi tối. Kết hợp kem chống nắng hàng ngày để ngăn thâm mới.",
            "Vết thâm lâu năm sẽ mờ đi nhanh chóng với bộ đôi serum Vitamin C và Niacinamide của CoCo. Sử dụng đều đặn 2 lần/ngày trong 4 tuần.",
            "CoCo có giải pháp toàn diện cho da thâm: serum Vitamin C làm sáng da ban ngày, serum Retinol tái tạo da ban đêm và kem dưỡng ẩm khóa ẩm.",
            "Đừng lo lắng về vết thâm! Serum làm sáng da của CoCo với 15% Vitamin C sẽ giúp da bạn đều màu chỉ sau 2 tuần sử dụng.",
            "Bộ sản phẩm trị thâm CoCo gồm: tẩy tế bào chết AHA 2 lần/tuần, serum Vitamin C hàng ngày và mặt nạ dưỡng sáng 2 lần/tuần."
        ],
        "nám": [
            "Da nám cần chăm sóc đặc biệt với serum Vitamin C 20% của CoCo vào buổi sáng và serum Tranexamic Acid vào buổi tối. Luôn dùng kem chống nắng SPF50+.",
            "Đối với nám da, CoCo khuyên dùng bộ sản phẩm chuyên biệt: serum giảm nám với thành phần Tranexamic Acid, kem dưỡng ẩm chứa Niacinamide và kem chống nắng vật lý.",
            "Nám da sẽ được cải thiện đáng kể với liệu trình 3 bước của CoCo: làm sạch sâu, serum đặc trị nám và dưỡng ẩm khóa ẩm. Sử dụng liên tục 8 tuần.",
            "Serum trị nám CoCo với công nghệ độc quyền chứa 5% Tranexamic Acid và 3% Niacinamide sẽ làm mờ vết nám chỉ sau 1 liệu trình.",
            "Để trị nám hiệu quả, ngoài dùng serum đặc trị, bạn cần tránh nắng tuyệt đối. Kem chống nắng SPF50+ PA++++ của CoCo sẽ bảo vệ da bạn tối ưu."
        ],
        "lão hóa": [
            "Chống lão hóa với bộ sản phẩm CoCo: serum Retinol ban đêm, serum Vitamin C ban ngày và kem dưỡng peptide. Kết hợp mặt nạ collagen 2 lần/tuần.",
            "Để da căng mịn, giảm nếp nhăn, hãy thử bộ chống lão hóa của CoCo gồm: serum Retinol 0.5%, kem dưỡng peptide và kem mắt chuyên sâu.",
            "CoCo có giải pháp toàn diện cho da lão hóa: serum tăng sinh collagen, kem dưỡng chứa peptide và mặt nạ vàng 24K. Sử dụng đều đặn để da trẻ hóa.",
            "Serum chống lão hóa CoCo với 10% Vitamin C + 2% Retinol sẽ giúp da bạn căng bóng, giảm nếp nhăn chỉ sau 4 tuần.",
            "Bộ sản phẩm phục hồi da lão hóa của CoCo gồm: sữa rửa mặt dịu nhẹ, toner cân bằng, serum phục hồi và kem dưỡng ban đêm. Dùng liên tục 8 tuần."
        ]
    },
    
    productInfo: {
        "serum vitamin c": [
            "Serum Vitamin C 15% của CoCo giúp làm sáng da, mờ thâm nám. Cách dùng: 3-4 giọt thoa đều mặt mỗi sáng trước kem dưỡng.",
            "Serum Vitamin C 15% từ CoCo với công nghệ bền vững, thẩm thấu nhanh, giúp da sáng mịn chỉ sau 2 tuần. Thoa mỗi sáng trước kem dưỡng.",
            "Bạn muốn da sáng hồng? Serum Vitamin C 15% của CoCo chứa L-Ascorbic Acid tinh khiết, kết hợp Vitamin E và Ferulic Acid, giúp chống oxy hóa và làm sáng da hiệu quả.",
            "Serum Vitamin C CoCo là sản phẩm best-seller. Với 15% Vitamin C dạng ổn định, serum giúp làm đều màu da, mờ thâm và chống lão hóa.",
            "Đánh bay vết thâm với Serum Vitamin C 15% của CoCo. Sản phẩm dành cho mọi loại da, kể cả da nhạy cảm. Thoa mỗi sáng để có kết quả tốt nhất."
        ],
        "kem chống nắng": [
            "Kem chống nắng vật lý SPF50+ PA++++ của CoCo không cồn, không nhờn rít, bảo vệ da tối ưu. Dùng lượng đồng xu mỗi sáng sau dưỡng da.",
            "Kem chống nắng CoCo SPF50+ PA++++ với thành phần lành tính, bảo vệ da khỏi UVA/UVB. Không gây bít tắc lỗ chân lông, không vệt trắng.",
            "Chống nắng là bước không thể thiếu! Kem chống nắng vật lý lai hóa học SPF50+ của CoCo bảo vệ toàn diện, thẩm thấu nhanh, không nhờn rít.",
            "Kem chống nắng CoCo SPF50+ PA++++ phù hợp mọi loại da, kể cả da nhạy cảm. Sản phẩm không chứa cồn, không hương liệu, an toàn tuyệt đối.",
            "Bảo vệ da khỏi tác hại của ánh nắng với kem chống nắng SPF50+ của CoCo. Sản phẩm chống thấm nước, không trôi khi đổ mồ hôi, dùng được cả khi đi biển."
        ],
        "kem dưỡng ẩm": [
            "Kem dưỡng ẩm HA + Ceramide của CoCo cấp ẩm 72h, phù hợp mọi loại da. Dùng sáng và tối sau serum.",
            "Kem dưỡng ẩm CoCo với Hyaluronic Acid và Ceramide giúp da căng mọng, khóa ẩm suốt 72h. Sản phẩm không gây bít tắc lỗ chân lông.",
            "Da bạn khô ráp? Kem dưỡng ẩm HA + Ceramide của CoCo sẽ cung cấp độ ẩm tức thì, giúp da mềm mịn, căng bóng.",
            "Kem dưỡng ẩm CoCo dành cho mọi loại da, kể cả da dầu mụn. Kết cấu gel mỏng nhẹ, thẩm thấu nhanh, không gây nhờn rít.",
            "Dưỡng ẩm là bước quan trọng nhất! Kem dưỡng ẩm HA + Ceramide của CoCo sẽ phục hồi hàng rào bảo vệ da, ngăn mất nước và bảo vệ da khỏi tác nhân gây hại."
        ],
        "sữa rửa mặt": [
            "Sữa rửa mặt dịu nhẹ CoCo với thành phần từ trà xanh và lô hội, làm sạch sâu mà không gây khô da. Dùng sáng và tối.",
            "Sữa rửa mặt Tea Tree của CoCo dành cho da dầu mụn, giúp làm sạch bã nhờn, ngừa mụn hiệu quả. Dùng 2 lần/ngày.",
            "Sữa rửa mặt CoCo SensiCare dành cho da nhạy cảm, không chứa xà phòng, hương liệu, làm sạch dịu nhẹ, không gây kích ứng.",
            "Bạn cần sữa rửa mặt nào? CoCo có 3 loại: dịu nhẹ cho da khô, tea tree cho da dầu mụn, và SensiCare cho da nhạy cảm.",
            "Sữa rửa mặt tạo bọt CoCo với chiết xuất tràm trà sẽ giúp da bạn sạch sâu, thông thoáng lỗ chân lông. Dùng lượng bằng hạt đậu mỗi lần."
        ],
        "toner": [
            "Toner cân bằng da CoCo với thành phần trà xanh và HA, giúp cân bằng pH, cấp ẩm tức thì. Dùng sau khi rửa mặt.",
            "Toner Tea Tree của CoCo dành cho da dầu mụn, giúp se khít lỗ chân lông, kháng khuẩn. Dùng sáng và tối sau khi rửa mặt.",
            "Toner làm dịu da CoCo SensiCare với chiết xuất nha đam, giúp làm dịu da nhạy cảm, giảm mẩn đỏ. Không cồn, không hương liệu.",
            "Sau bước làm sạch, hãy dùng toner CoCo để cân bằng da và tăng hiệu quả hấp thụ dưỡng chất từ các bước tiếp theo.",
            "Toner CoCo với 5% Niacinamide giúp làm sáng da, giảm thâm, cân bằng dầu nhờn. Dùng 2 lần/ngày sau khi rửa mặt."
        ],
        "mặt nạ": [
            "Mặt nạ ngủ Collagen CoCo giúp phục hồi da ban đêm, cung cấp độ ẩm sâu, giúp da sáng mịn khi thức dậy. Dùng 2-3 lần/tuần.",
            "Mặt nạ đất sét CoCo giúp hút dầu thừa, làm sạch sâu lỗ chân lông. Dành cho da dầu, dùng 1-2 lần/tuần.",
            "Mặt nạ dưỡng ẩm HA CoCo cấp ẩm tức thì cho da khô ráp. Đắp 10-15 phút, 2-3 lần/tuần.",
            "Mặt nạ vàng 24K CoCo giúp trẻ hóa da, giảm nếp nhăn, căng bóng da. Dành cho da lão hóa, dùng 1-2 lần/tuần.",
            "Mặt nạ trà xanh CoCo giúp làm dịu da, giảm mẩn đỏ, cấp ẩm nhẹ. Phù hợp mọi loại da, dùng 2-3 lần/tuần."
        ],
        "tẩy trang": [
            "Dầu tẩy trang CoCo với thành phần dầu ô liu nguyên chất, làm sạch makeup nhẹ nhàng mà không gây khô da.",
            "Nước tẩy trang 3 in 1 CoCo làm sạch makeup, bã nhờn và bụi bẩn chỉ với 1 bước. Không cần rửa lại với nước.",
            "Bông tẩy trang CoCo thấm dầu tẩy trang, giúp làm sạch makeup hiệu quả. Mềm mại, không gây xước da.",
            "Tẩy trang là bước quan trọng trước khi đi ngủ. Dầu tẩy trang CoCo sẽ làm sạch mọi loại makeup kể cả waterproof.",
            "Bộ tẩy trang CoCo gồm dầu tẩy trang và nước hoa hồng sẽ giúp da bạn sạch sâu, thông thoáng lỗ chân lông."
        ]
    },
    
    usageInstructions: [
        "Các bước skincare cơ bản: 1. Làm sạch, 2. Toner, 3. Serum, 4. Kem dưỡng, 5. Chống nắng (ban ngày). Mỗi sản phẩm nên cách nhau 1-2 phút để thẩm thấu.",
        "Để sản phẩm phát huy hiệu quả, hãy dùng theo thứ tự: sữa rửa mặt → toner → serum → kem dưỡng. Ban ngày nhớ thêm kem chống nắng nhé!",
        "Bạn mới bắt đầu skincare? Hãy bắt đầu với 3 bước cơ bản: làm sạch - dưỡng ẩm - chống nắng. Sau đó mới bổ sung serum khi cần.",
        "Thứ tự dưỡng da: sản phẩm loãng nhất đến đặc nhất. Ví dụ: toner → serum dạng nước → serum dạng đặc → kem dưỡng.",
        "Lưu ý khi dùng serum Vitamin C: thoa vào buổi sáng trước kem dưỡng, tránh vùng mắt. Kết hợp kem chống nắng để tăng hiệu quả.",
        "Retinol nên dùng vào buổi tối, bắt đầu với tần suất 2 lần/tuần rồi tăng dần. Luôn dùng kem chống nắng vào ngày hôm sau.",
        "Để serum phát huy tối đa hiệu quả, hãy vỗ nhẹ cho serum thẩm thấu hoàn toàn trước khi thoa bước tiếp theo.",
        "Mặt nạ nên đắp sau bước toner, trước bước serum. Thời gian đắp từ 10-20 phút tùy loại.",
        "Kem chống nắng nên thoa sau bước dưỡng ẩm, trước khi trang điểm. Thoa lượng đủ (1/4 thìa cà phê cho mặt) và thoa lại sau 2-3 giờ.",
        "Tẩy tế bào chết vật lý nên dùng 1-2 lần/tuần, tẩy tế bào chết hóa học (AHA/BHA) dùng 2-3 lần/tuần tùy loại da."
    ],
    
    ingredients: [
        "Hyaluronic Acid (HA): Giữ ẩm, cấp nước cho da, giúp da căng mọng.",
        "Niacinamide (Vitamin B3): Làm sáng da, giảm thâm, kiểm soát dầu nhờn, thu nhỏ lỗ chân lông.",
        "Vitamin C: Chống oxy hóa, làm sáng da, mờ thâm, kích thích sản sinh collagen.",
        "Retinol (Vitamin A): Tăng tế bào mới, giảm nếp nhăn, trị mụn, làm đều màu da.",
        "Salicylic Acid (BHA): Tan trong dầu, thấm sâu lỗ chân lông, trị mụn, làm sạch da.",
        "AHA (Glycolic Acid, Lactic Acid): Tẩy tế bào chết bề mặt, làm sáng da, mờ vết thâm.",
        "Ceramide: Dưỡng ẩm, phục hồi hàng rào bảo vệ da, giảm khô ráp.",
        "Peptide: Kích thích sản sinh collagen, giảm nếp nhăn, trẻ hóa da.",
        "Tea Tree Oil: Kháng khuẩn, kháng viêm, trị mụn hiệu quả.",
        "Centella Asiatica (Cỏ mực): Làm dịu da, giảm mẩn đỏ, kích thích tái tạo da."
    ],
    
    combos: [
        "Combo da dầu mụn: Sữa rửa mặt Tea Tree + Toner Tea Tree + Serum Niacinamide + Kem dưỡng kiềm dầu",
        "Combo da khô: Sữa rửa mặt dịu nhẹ + Toner HA + Serum HA + Kem dưỡng Ceramide",
        "Combo làm sáng da: Serum Vitamin C buổi sáng + Serum Niacinamide buổi tối + Kem chống nắng SPF50+",
        "Combo chống lão hóa: Serum Retinol buổi tối + Serum Vitamin C buổi sáng + Kem dưỡng peptide",
        "Combo da nhạy cảm: Sữa rửa mặt SensiCare + Toner làm dịu + Kem dưỡng phục hồi",
        "Combo trị thâm: Serum Vitamin C + Serum Tranexamic Acid + Kem chống nắng SPF50+",
        "Combo dưỡng ẩm chuyên sâu: Serum HA + Mặt nạ dưỡng ẩm + Kem dưỡng Ceramide",
        "Combo se khít lỗ chân lông: Toner BHA + Serum Niacinamide + Mặt nạ đất sét"
    ],
    
    promotions: [
        "Hiện CoCo đang có chương trình mua 2 tặng 1 cho tất cả serum. Áp dụng đến hết tháng này!",
        "Ưu đãi đặc biệt: Giảm 20% khi mua combo bất kỳ. Miễn phí vận chuyển đơn hàng từ 500k.",
        "Khuyến mãi cuối tuần: Mua kem dưỡng ẩm tặng kèm toner mini. Chỉ áp dụng thứ 7 và CN.",
        "Chào hè 2024: Giảm 30% toàn bộ kem chống nắng. Bảo vệ da khỏi nắng hè gay gắt!",
        "Sinh nhật CoCo: Mua 1 tặng 1 cho tất cả sản phẩm dòng SensiCare. Chương trình có hạn!",
        "Tri ân khách hàng: Tích điểm 10% cho mọi đơn hàng. Đổi quà sau 10 điểm.",
        "Freeship toàn quốc cho đơn hàng từ 300k. Áp dụng cả ngày trong tuần!",
        "Combo quà tặng hấp dẫn trị giá 800k khi mua đơn hàng từ 1.5 triệu."
    ],
    
    afterSales: [
        "Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu chưa mở hộp, còn nguyên seal.",
        "Chính sách bảo hành: Hoàn tiền 100% nếu sản phẩm không đúng chất lượng.",
        "Liên hệ hotline 1900 1234 để được hỗ trợ đổi trả. Giờ làm việc: 8h-21h hàng ngày.",
        "Bạn cần hỗ trợ về đơn hàng? Vui lòng cung cấp mã đơn hàng để mình kiểm tra giúp bạn.",
        "Sản phẩm bị lỗi? Chụp ảnh sản phẩm và gửi về email support@coco.vn, chúng tôi sẽ hỗ trợ bạn ngay.",
        "Thời gian giao hàng: 1-3 ngày với nội thành, 3-7 ngày với tỉnh thành khác. Miễn phí ship đơn từ 500k.",
        "Bạn có thể theo dõi đơn hàng tại website coco.vn theo dõi đơn hàng > nhập mã đơn hàng.",
        "Chính sách tích điểm: 1 điểm = 10.000đ. Có thể dùng điểm để giảm giá cho đơn hàng tiếp theo."
    ],
    
    fallbacks: [
        "Xin lỗi, mình chưa hiểu rõ câu hỏi của bạn. Bạn có thể cho biết bạn đang gặp vấn đề gì về da?",
        "Bạn cần tư vấn về sản phẩm nào của CoCo? Mình có thể giúp bạn tìm sản phẩm phù hợp.",
        "Bạn có thể nói rõ hơn về nhu cầu của mình không? Mình sẽ cố gắng tư vấn tốt nhất.",
        "Hiện tại mình chưa nắm rõ thắc mắc của bạn. Bạn đang quan tâm đến vấn đề da hay sản phẩm nào?",
        "Để mình tư vấn tốt hơn, bạn cho mình biết: 1. Loại da của bạn 2. Vấn đề bạn quan tâm 3. Sản phẩm bạn đang dùng (nếu có)",
        "Xin lỗi vì sự bất tiện! Bạn vui lòng mô tả ngắn gọn vấn đề bạn đang gặp phải nhé.",
        "Mình chưa hiểu ý bạn. Bạn đang cần tư vấn về cách chăm sóc da hay thông tin sản phẩm?",
        "Bạn có thể thử hỏi cách khác không? Mình sẽ cố gắng hỗ trợ bạn tốt nhất.",
        "Hiện hệ thống đang bận, bạn vui lòng cho biết loại da và vấn đề bạn đang gặp để mình tư vấn nhé.",
        "Để được tư vấn nhanh, bạn vui lòng chọn một trong các chủ đề: 1. Tư vấn da 2. Sản phẩm 3. Khuyến mãi 4. Đơn hàng"
    ],
    
    closings: [
        "Cảm ơn bạn đã chat cùng CoCo! Nếu cần thêm hỗ trợ, bạn cứ quay lại nhé. Chúc bạn ngày mới đẹp như làn da rạng rỡ!",
        "Rất vui được hỗ trợ bạn! Hy vọng bạn sẽ có trải nghiệm tuyệt vời với sản phẩm CoCo. Tạm biệt!",
        "Nếu có thắc mắc khác, bạn đừng ngại quay lại chat với mình nhé! Chúc bạn luôn xinh đẹp!",
        "Cảm ơn bạn đã tin tưởng CoCo. Đừng quên theo dõi fanpage để cập nhật khuyến mãi mới nhất!",
        "Mọi thắc mắc khác, bạn có thể liên hệ hotline 1900 1234 (8h-21h hàng ngày). Tạm biệt và hẹn gặp lại!"
    ]
};

// Hàm lấy câu trả lời ngẫu nhiên theo chủ đề
function getFallbackResponse(type, subtype = null) {
    if (!fallbackResponses[type]) {
        return "Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể nói rõ hơn không?";
    }
    
    if (subtype && fallbackResponses[type][subtype]) {
        const responses = fallbackResponses[type][subtype];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (Array.isArray(fallbackResponses[type])) {
        return fallbackResponses[type][Math.floor(Math.random() * fallbackResponses[type].length)];
    }
    
    return "Xin lỗi, tôi đang gặp chút khó khăn. Bạn vui lòng hỏi lại sau nhé!";
}

exports.generateResponse = async (messages, sessionId = null) => {
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : '';
    const isGreeting = /(chào|hello|hi|xin chào)/i.test(lastMessage);
    const isProductQuestion = /(sản phẩm|mỹ phẩm|kem|serum|toner|dưỡng|trị)/i.test(lastMessage);
    const isSkinQuestion = /(da khô|da dầu|da hỗn hợp|da nhạy cảm|mụn|thâm|nám|lão hóa)/i.test(lastMessage);
    const isUsageQuestion = /(cách dùng|sử dụng|bao lâu|liều lượng|bước)/i.test(lastMessage);

    // Hệ thống câu trả lời mẫu cho các tình huống cụ thể
    const predefinedResponses = {
        greeting: "Xin chào! 😊 Mình là trợ lý ảo của CoCo - thương hiệu mỹ phẩm thiên nhiên hàng đầu Việt Nam. Bạn đang quan tâm sản phẩm nào hay cần tư vấn về vấn đề da ạ?",
        skinType: {
            "da khô": "Da khô nên dùng bộ sản phẩm cấp ẩm chuyên sâu của CoCo gồm: 1. Sữa rửa mặt dịu nhẹ, 2. Serum HA cấp nước, 3. Kem dưỡng ẩm Ceramide. Dùng sáng và tối sau khi làm sạch da.",
            "da dầu": "Da dầu nên dùng bộ kiềm dầu - se khít lỗ chân lông của CoCo: 1. Sữa rửa mặt Tea Tree, 2. Toner cân bằng da, 3. Serum Niacinamide, 4. Kem dưỡng kiềm dầu không nhờn.",
            "da hỗn hợp": "Da hỗn hợp nên dùng bộ sản phẩm điều tiết dầu nhờn vùng chữ T và cấp ẩm vùng má của CoCo...",
            "da nhạy cảm": "Với da nhạy cảm, CoCo có dòng sản phẩm SensiCare không chứa hương liệu, cồn hay chất bảo quản gây kích ứng...",
            "mụn": "Để trị mụn hiệu quả, bạn nên dùng combo: 1. Gel rửa mặt Salicylic Acid, 2. Toner Tea Tree, 3. Serum trị mụn BHA, 4. Kem dưỡng không gây bít tắc lỗ chân lông."
        },
        productInfo: {
            "serum vitamin c": "Serum Vitamin C 15% của CoCo giúp làm sáng da, mờ thâm nám. Cách dùng: 3-4 giọt thoa đều mặt mỗi sáng trước kem dưỡng.",
            "kem chống nắng": "Kem chống nắng vật lý SPF50+ PA++++ của CoCo không cồn, không nhờn rít, bảo vệ da tối ưu. Dùng lượng đồng xu mỗi sáng sau dưỡng da.",
            "kem dưỡng ẩm": "Kem dưỡng ẩm HA + Ceramide của CoCo cấp ẩm 72h, phù hợp mọi loại da. Dùng sáng và tối sau serum."
        },
        usage: "Các bước skincare cơ bản: 1. Làm sạch, 2. Toner, 3. Serum, 4. Kem dưỡng, 5. Chống nắng (ban ngày). Mỗi sản phẩm nên cách nhau 1-2 phút để thẩm thấu.",
        fallback: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể cho biết:\n- Loại da của bạn?\n- Vấn đề da đang gặp?\n- Sản phẩm bạn quan tâm?\nTôi sẽ tư vấn cụ thể hơn ạ!"
    };

    // Lấy sản phẩm từ DB (nếu cần)
    const productsFromDB = await getAllProductsFromDB();
    // Tạo map tên sản phẩm cho truy vấn nhanh
    const productNameMap = {};
    productsFromDB.forEach(p => {
        productNameMap[p.basicInformation.productName.toLowerCase()] = p;
    });

    // Xử lý fallback khi không có OpenAI
    if (!openai) {
        if (isGreeting) {
            return getFallbackResponse('greetings');
        }
        
        if (isSkinQuestion) {
            for (const skinType in fallbackResponses.skinType) {
                if (lastMessage.includes(skinType)) {
                    return getFallbackResponse('skinType', skinType);
                }
            }
            return getFallbackResponse('skinType', 'da khô'); // Fallback mặc định
        }
        if (isProductQuestion) {
            // Ưu tiên tìm sản phẩm trong DB
            for (const name in productNameMap) {
                if (lastMessage.includes(name)) {
                    const p = productNameMap[name];
                    return `Thông tin sản phẩm "${p.basicInformation.productName}":\n- Giá: ${p.pricingAndInventory.salePrice} ${p.pricingAndInventory.currency}\n- Mô tả: ${p.description.shortDescription}\n- Thành phần: ${p.description.ingredients.join(', ')}\n- HDSD: ${p.description.usageInstructions.join(' | ')}\nBạn cần tư vấn thêm gì về sản phẩm này không?`;
                }
            }
            // Nếu không tìm thấy, fallback static
            for (const [key, response] of Object.entries(predefinedResponses.productInfo)) {
                if (lastMessage.includes(key)) return response;
            }
        }
        if (isUsageQuestion) return predefinedResponses.usage;
        // Lưu feedback nếu không trả lời tốt
        if (lastMessage && lastMessage.length > 10) {
            try {
                // Nếu đã có feedback với answer, trả về answer đó
                let existed = await Feedback.findOne({ question: lastMessage, answer: { $exists: true, $ne: null } });
                if (existed && existed.answer) {
                    return existed.answer;
                } else {
                    // Nếu có OpenAI, tự động sinh câu trả lời và lưu vào answer
                    if (openai) {
                        try {
                            let systemPrompt = `Bạn là chuyên gia tư vấn da liễu của thương hiệu mỹ phẩm CoCo. Hãy trả lời ngắn gọn, chính xác và thân thiện. Chỉ đề xuất sản phẩm của CoCo. Luôn kết thúc bằng câu hỏi mở để tiếp tục hội thoại.`;
                            const response = await openai.createChatCompletion({
                                model: "gpt-3.5-turbo",
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: lastMessage }
                                ],
                                temperature: 0.5,
                                max_tokens: 200,
                                stop: ["\n"]
                            });
                            const aiAnswer = response.data.choices[0].message.content;
                            // Lưu lại answer vào feedback
                            if (existed) {
                                existed.answer = aiAnswer;
                                await existed.save();
                            } else {
                                // Chỉ lưu nếu chưa tồn tại feedback với câu hỏi này
                                const existedFeedback = await Feedback.findOne({ question: lastMessage });
                                if (!existedFeedback) {
                                    await Feedback.create({ question: lastMessage, userSessionId: sessionId });
                                }
                            }
                            return aiAnswer;
                        } catch (err) {
                            // Nếu OpenAI lỗi, fallback như cũ
                            if (!existed) {
                                const existedFeedback = await Feedback.findOne({ question: lastMessage });
                                if (!existedFeedback) {
                                    await Feedback.create({ question: lastMessage, userSessionId: sessionId });
                                }
                            }
                        }
                    } else {
                        // Chỉ lưu nếu chưa tồn tại feedback với câu hỏi này
                        const existedFeedback = await Feedback.findOne({ question: lastMessage });
                        if (!existedFeedback) {
                            await Feedback.create({ question: lastMessage, userSessionId: sessionId });
                        }
                    }
                }
            } catch (e) { console.error('Lỗi lưu feedback:', e); }
        }
        return predefinedResponses.fallback;
    }

    try {
        // Tạo prompt tối ưu cho từng loại câu hỏi
        let systemPrompt = `Bạn là chuyên gia tư vấn da liễu của thương hiệu mỹ phẩm CoCo. 
Hãy trả lời ngắn gọn, chính xác và thân thiện. 
Chỉ đề xuất sản phẩm của CoCo. 
Luôn kết thúc bằng câu hỏi mở để tiếp tục hội thoại.`;

        if (isSkinQuestion) {
            systemPrompt += "\nƯU TIÊN: Hỏi thêm về tình trạng da cụ thể và đề xuất combo sản phẩm phù hợp.";
        }

        if (isProductQuestion) {
            systemPrompt += "\nƯU TIÊN: Mô tả ngắn công dụng, thành phần chính, hướng dẫn sử dụng cụ thể.";
        }

        if (isUsageQuestion) {
            systemPrompt += "\nƯU TIÊN: Liệt kê từng bước cụ thể, thời gian sử dụng, lưu ý quan trọng.";
        }

        // Thêm thông tin sản phẩm CoCo vào prompt
        const cocoProducts = `
DANH SÁCH SẢN PHẨM COCO:
1. Serum Vitamin C 15% - Làm sáng, mờ thâm
2. Kem dưỡng HA + Ceramide - Cấp ẩm 72h
3. Kem chống nắng SPF50+ PA++++ - Vật lý lai hóa học
4. Bộ trị mụn Tea Tree - Giảm mụn 7 ngày
5. Tẩy trang dầu Ô Liu - Dịu nhẹ cho da nhạy cảm
6. Mặt nạ ngủ Collagen - Phục hồi da ban đêm`;

        systemPrompt += cocoProducts;

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.5, // Giảm nhiệt độ để câu trả lời chính xác hơn
            max_tokens: 200,
            stop: ["\n"] // Dừng ở dòng mới để trả lời ngắn gọn
        });

        let aiResponse = response.data.choices[0].message.content;

        // Kiểm tra và điều chỉnh nếu AI đề xuất sai sản phẩm
        const invalidProductRecommendation = /(không có|chưa rõ|không biết)/i.test(aiResponse);
        const missingCocoReference = !/CoCo/i.test(aiResponse) && isProductQuestion;

        if (invalidProductRecommendation || missingCocoReference) {
            // Lưu feedback nếu AI trả lời không tốt
            if (lastMessage && lastMessage.length > 10) {
                try {
                    const existed = await Feedback.findOne({ question: lastMessage, answer: { $exists: true, $ne: null } });
                    if (existed && existed.answer) {
                        return existed.answer;
                    } else {
                        // Chỉ lưu nếu chưa tồn tại feedback với câu hỏi này
                        const existedFeedback = await Feedback.findOne({ question: lastMessage });
                        if (!existedFeedback) {
                            await Feedback.create({ question: lastMessage, userSessionId: sessionId });
                        }
                    }
                } catch (e) { console.error('Lỗi lưu feedback:', e); }
            }
            return predefinedResponses.fallback;
        }

        return aiResponse;

    } catch (error) {
        console.error('OpenAI Error:', error);
        // Fallback thông minh hơn khi có lỗi
        if (isSkinQuestion) return predefinedResponses.skinType["da khô"];
        if (isProductQuestion) return predefinedResponses.productInfo["serum vitamin c"];
        // Lưu feedback nếu có lỗi
        if (lastMessage && lastMessage.length > 10) {
            try {
                const existed = await Feedback.findOne({ question: lastMessage, answer: { $exists: true, $ne: null } });
                if (existed && existed.answer) {
                    return existed.answer;
                } else {
                    // Chỉ lưu nếu chưa tồn tại feedback với câu hỏi này
                    const existedFeedback = await Feedback.findOne({ question: lastMessage });
                    if (!existedFeedback) {
                        await Feedback.create({ question: lastMessage, userSessionId: sessionId });
                    }
                }
            } catch (e) { console.error('Lỗi lưu feedback:', e); }
        }
        return predefinedResponses.fallback;
    }
};