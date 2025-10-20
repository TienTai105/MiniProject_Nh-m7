import React from "react";
import banner from "../assets/Banner.jpg";

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">👟 Về Chúng Tôi</h1>
      <p className="text-lg text-gray-700 ">
        Chào mừng bạn đến với <span className="font-semibold text-blue-600">MyShop</span> —
        nơi mang đến cho bạn những sản phẩm thời trang chất lượng nhất gồm
        <span className="font-semibold"> giày, dép, và quần áo</span> phong cách hiện đại.
      </p>

      <p className="text-gray-600 mb-6">
        Chúng tôi tin rằng thời trang không chỉ là vẻ bề ngoài, mà còn thể hiện phong cách
        và cá tính của bạn. Với đội ngũ trẻ trung, MyShop luôn cập nhật xu hướng mới nhất,
        đảm bảo mỗi sản phẩm đều đáp ứng tiêu chí <strong>“Đẹp - Chất - Hợp túi tiền”</strong>.
      </p>

      <img
        src={banner}
        alt="Shop banner"
        className="mx-auto rounded-xl shadow-lg w-full max-w-2xl mb-8"
      />

      <p className="text-gray-600 ">
        Cảm ơn bạn đã tin tưởng và đồng hành cùng <span className="font-semibold">MyShop</span>
        Hãy khám phá bộ sưu tập mới nhất của chúng tôi trong mục{" "}
        <a href="/collection" className="text-blue-500 hover:underline">
          Bộ sưu tập
        </a>{" "}
        ngay nhé!
      </p>
    </div>
  );
};

export default AboutPage;
