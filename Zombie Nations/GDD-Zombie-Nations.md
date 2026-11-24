Game Design Document - Zombie Nations

Phiên bản: 0.2 Prototype+

1. Tóm tắt
Zombie Nations

Zombie Nations là game chiến thuật quản lý quốc gia hậu tận thế zombie.

Người chơi không chọn quốc gia có sẵn, mà tự tạo quốc gia của riêng mình, thiết kế cờ, lãnh đạo dân số, phát triển kinh tế, mở rộng lãnh thổ và chống lại mối đe dọa zombie đang lan rộng khắp thế giới.

Game kết hợp:

Grand Strategy
Turn-Based Strategy
Nation Building
Zombie Apocalypse
Exploration
Trải nghiệm cốt lõi

Người chơi phải liên tục đưa ra những quyết định khó khăn:

Cứu dân hay tuyển quân?
Phát triển kinh tế hay xây công sự?
Chống zombie hay mở rộng lãnh thổ?
Dành tài nguyên cho hiện tại hay nghiên cứu tương lai?
Core Fantasy

Người chơi phải cảm thấy mình là:

Người lãnh đạo cuối cùng của một quốc gia đang cố gắng sinh tồn giữa ngày tận thế.

Mỗi quyết định đều mang theo hậu quả lâu dài.

Một quyết định sai có thể khiến cả quốc gia sụp đổ.

2. Unique Selling Point (USP)

Zombie Nations khác với các game chiến thuật truyền thống ở ba điểm:

1. Tự tạo quốc gia

Người chơi tự thiết kế:

Tên quốc gia
Quốc kỳ
Màu sắc
Khẩu hiệu
2. Fog of Apocalypse

Thế giới bị che phủ bởi màn sương thông tin.

Người chơi không biết:

Quốc gia nào còn tồn tại
Khu vực nào đã bị zombie chiếm
Nơi nào còn người sống

Mọi thứ phải được khám phá.

3. Zombie là thế lực toàn cầu

Zombie không phải quái vật đứng yên.

Zombie:

Lan nhiễm
Chiếm lãnh thổ
Phá hủy quốc gia
Tạo Zombie Province
Hình thành Zombie Horde
3. Bối cảnh

Năm 2035.

Một loại virus chưa rõ nguồn gốc bùng phát trên toàn cầu.

Trong vài tháng:

Chính phủ các nước sụp đổ
Hệ thống kinh tế ngừng hoạt động
Hàng tỷ người thiệt mạng

Chỉ còn những cộng đồng sống sót.

Từ đống đổ nát của nền văn minh cũ, các quốc gia mới bắt đầu xuất hiện.

Người chơi sẽ lãnh đạo một trong số đó.

4. Phạm vi Prototype
Có trong prototype
Bản đồ 20 tỉnh.
5 quốc gia.
Hệ thống lượt.
Tiền.
Dân số.
Lương thực.
Quân đội.
Nghiên cứu.
Walker Zombie.
Zombie Province.
Chiến tranh.
AI.
Thiết kế quốc kỳ.
Điều kiện chiến thắng.
Chưa có trong prototype
Runner.
Tank.
Mutant.
Zombie Horde.
Ngoại giao.
Thương mại.
Gián điệp.
Multiplayer.
Drone.
Radar.
Vệ tinh.
Sự kiện thế giới.
5. Chu trình lượt

Một lượt tương ứng một tháng.

Thứ tự xử lý
Nhận thu nhập.
Tạo lương thực.
Tiêu thụ lương thực.
Tính lây nhiễm.
Zombie hành động.
Người chơi hành động.
AI hành động.
Xử lý chiến tranh.
Cập nhật dân số.
Cập nhật nghiên cứu.
Kiểm tra điều kiện chiến thắng.
6. Hệ thống tỉnh

Mỗi tỉnh có:

Thuộc tính	Ý nghĩaID	Định danh
Tên	Tên tỉnh
Chủ sở hữu	Quốc gia kiểm soát
Dân số	Nguồn lao động
Kinh tế	Thu nhập
Quân đội	Phòng thủ/tấn công
Hạ tầng	Hỗ trợ phát triển
Nhiễm	Mức độ zombie
Lương thực	Dự trữ
Danh sách tỉnh kề	Hỗ trợ di chuyển
7. Hệ thống quốc gia

Mỗi quốc gia gồm:

Tên
Quốc kỳ
Màu quốc gia
Khẩu hiệu
Tiền
Lương thực
Nghiên cứu
Dân số
Danh sách tỉnh sở hữu
8. Thiết kế quốc kỳ

Người chơi có thể tự tạo quốc kỳ.

Bố cục

Các mẫu cơ bản:

3 sọc ngang
3 sọc dọc
Chữ thập
Đường chéo
Góc tam giác
Trung tâm hình tròn
Màu

Tối đa:

4 màu
Biểu tượng

Nhóm biểu tượng:

Quân sự
Kiếm
Khiên
Đại bàng
Ngôi sao
Sinh tồn
Cây
Mặt trời
Địa cầu
Zombie
Đầu lâu
Biohazard
Virus
Khoa học
Nguyên tử
Vệ tinh
Robot
Dữ liệu lưu
{
  "layout": "horizontal",
  "colors": ["black","red","black"],
  "symbol": "biohazard"
}

9. Hệ thống Fog of Apocalypse
Mục tiêu

Người chơi không nhìn thấy toàn bộ bản đồ.

Có thể nhìn thấy
Lãnh thổ của mình
Tỉnh đã khám phá
Không thể nhìn thấy
Quốc gia xa
Quân đội xa
Zombie xa
Công nghệ quan sát

Level 1:

Chỉ thấy lãnh thổ

Level 2:

Thấy tỉnh lân cận

Level 3:

Trinh sát

Level 4:

Radar

Level 5:

Drone

Level 6:

Vệ tinh
10. Tài nguyên
Tiền

Khởi đầu:

100

Dùng cho:

Xây dựng
Nghiên cứu
Tuyển quân
Dân số

Nguồn:

Lao động
Lính
Lương thực

Khởi đầu:

80

Quân đội

Dùng để:

Phòng thủ
Tấn công
Nghiên cứu

Khởi đầu:

10

Dùng mở công nghệ.

11. Công nghệ Prototype
Công nghệ	Yêu cầuKiểm dịch nâng cao	20
Hạ tầng y tế	40
Vũ khí chống zombie	60
Hệ thống cảnh báo sớm	80
Vaccine thử nghiệm	100
12. Công thức cân bằng
Thu nhập
Thu nhập
=
Dân số / 100
+ Kinh tế
+ Hạ tầng / 5

Duy trì quân
1 tiền
=
10 quân

Tiêu thụ lương thực
Dân số / 100
+ Quân đội / 50

Lây nhiễm
Nhiễm thêm
=
Zombie lân cận / 10000
- Kiểm dịch / 10
- Hạ tầng / 20


Giới hạn:

0 - 100

Sức mạnh quân đội
Sức mạnh
=
Quân số
× (1 + Công nghệ /100)
× (1 + Hạ tầng /100)


Phòng thủ:

+20%

13. Hành động
Xây kinh tế
Giá: 25 tiền
+5 kinh tế
Xây hạ tầng
Giá: 30 tiền
+5 hạ tầng
Tuyển quân
Giá: 2 tiền / 10 quân
Nghiên cứu
Giá: 20 tiền
+8 nghiên cứu
Kiểm dịch
Giá: 15 tiền
-15 nhiễm
Di chuyển quân
Chỉ giữa các tỉnh kề nhau
Tấn công
Chỉ tấn công tỉnh kề nhau
14. Hệ thống Zombie
Walker

Thuộc tính:

Chậm
Đông
Lây nhiễm cơ bản
Mức nhiễm
Nhiễm	Trạng thái0-20	An toàn
21-50	Nguy hiểm
51-80	Khẩn cấp
81-99	Sắp sụp đổ
100	Zombie Province
Zombie Province

Khi đạt 100% nhiễm:

Ngừng tạo thu nhập
Ngừng tăng dân
Chuyển thành vùng zombie
Sinh Walker
Tấn công tỉnh lân cận
15. Chiến tranh
Quy trình
Tính sức mạnh hai bên.
Thêm dao động ngẫu nhiên ±10%.
Tính xác suất chiến thắng.
Áp dụng tổn thất.
Chuyển quyền kiểm soát tỉnh.
Tổn thất

Không bên nào mất quá:

40%


trong một trận ở prototype.

16. AI

Ưu tiên:

Kiểm dịch.
Phòng thủ.
Tuyển quân.
Xây kinh tế.
Tấn công.
Loại AI
Aggressive

Ưu tiên chiến tranh.

Economic

Ưu tiên phát triển.

Survivalist

Ưu tiên chống zombie.

17. Lưu dữ liệu

Auto Save:

Cuối mỗi lượt.

Lưu:

Quốc gia.
Tỉnh.
Zombie.
Công nghệ.
Quốc kỳ.
Điều kiện chiến thắng.
18. Điều kiện chiến thắng
Quân sự

Chiếm:

12/20 tỉnh


trong 3 lượt liên tiếp.

Sinh tồn

Tồn tại đến lượt 20.

Khoa học

100 nghiên cứu.

Hoàn thành Vaccine Thử Nghiệm.

Liên Hiệp Nhân Loại
Không còn Zombie Province.
Nhiễm toàn cầu < 10%.
Thua
Không còn tỉnh.
Dân số bằng 0.
19. Luồng giao diện
Main Menu
↓
Create Nation
↓
Flag Creator
↓
Nation Setup
↓
World Map
↓
Turn Gameplay
↓
Victory / Defeat

20. Tiêu chí thành công Prototype

Prototype đạt yêu cầu nếu:

✅ Có ít nhất một Zombie Province xuất hiện.

✅ Người chơi luôn có tối thiểu hai lựa chọn chiến thuật mỗi lượt.

✅ AI có khả năng thắng người chơi.

✅ Không có chiến lược áp đảo tuyệt đối.

✅ Một ván hoàn thành trong khoảng 15-30 phút.

✅ 100 trận mô phỏng cho ra nhiều kết quả khác nhau.

21. Roadmap
Version 0.1
Bản đồ
Quốc gia
Walker
Chiến tranh
AI
Version 0.2
Runner
Tank
Công nghệ mở rộng
Version 0.3
Fog of Apocalypse hoàn chỉnh
Radar
Drone
Version 0.4
Ngoại giao
Thương mại
Liên minh
Version 0.5
Multiplayer
Tình báo
Gián điệp
Version 1.0
Zombie Horde
Thế giới tồn tại lâu dài
Bản đồ lớn
Quốc gia do người chơi tạo hoàn toàn
Hệ sinh thái zombie hoàn chỉnh

Đánh giá hiện tại: Đây đã là GDD đủ chi tiết để bắt đầu kiến trúc dữ liệu và xây dựng prototype đầu tiên. Từ thời điểm này, giá trị lớn nhất không còn là thêm ý tưởng, mà là chơi thử và kiểm chứng xem vòng lặp gameplay có thực sự vui hay không. 🚀🧟🌍