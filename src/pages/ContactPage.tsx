import React from "react";

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">📞 Liên hệ với MyShop</h1>
      <p className="text-center text-gray-600 mb-8">
        Nếu bạn có thắc mắc hoặc cần hỗ trợ, hãy để lại thông tin bên dưới.
        Chúng tôi sẽ phản hồi sớm nhất có thể 
      </p>

      {/* Thông tin liên hệ */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-3">Thông tin cửa hàng</h2>
        <p className="text-gray-700 ">Địa chỉ: An Phú Đông , Quận 12, TP.HCM</p>
        <p className="text-gray-700">Điện thoại: 0909 888 999</p>
        <p className="text-gray-700">Email: Nhom7@myshop.vn</p>
        <p className="text-gray-700">Giờ mở cửa: 8:00 - 21:00 (Thứ 2 - CN)</p>
      </div>

      {/* Form liên hệ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Cảm ơn bạn! Tin nhắn của bạn đã được gửi.");
        }}
        className="bg-gray-100 p-6 rounded-xl shadow-md mb-8"
      >
        <div>
          <label className="block font-medium mb-1">Họ và tên</label>
          <input
            type="text"
            required
            placeholder="Nhập họ tên..."
            className="w-full p-2 border rounded mb-4"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            required
            placeholder="Nhập email..."
            className="w-full p-2 border rounded "
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Nội dung</label>
          <textarea
            required
            rows={4}
            placeholder="Nhập nội dung tin nhắn..."
            className="w-full p-2 border rounded "
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Gửi tin nhắn
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
