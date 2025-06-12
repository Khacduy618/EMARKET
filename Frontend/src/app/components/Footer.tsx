// components/Footer.tsx

import Link from 'next/link';
import { FiSend } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    // Thay đổi màu nền của footer thành bg-gray-900 (rất tối) để tương phản với bg-gray-200 của body
    // và giữ màu chữ chính là text-white.
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        {/* Phần nội dung chính của footer - Chia 5 cột trên màn hình lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Cột 1: Exclusive */}
          <div>
            <h2 className="font-bold text-xl mb-4">Exclusive</h2>
            <h3 className="text-lg font-semibold mb-2">Subscribe</h3>
            <p className="text-gray-400 text-sm mb-4">Get 10% off your first order</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                // Điều chỉnh màu nền input: bg-gray-800 (tối hơn chút so với nền footer)
                // và placeholder-gray-400 để dễ đọc trên nền input tối
                className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none w-full placeholder-gray-400"
              />
              {/* Nút gửi vẫn giữ bg-white text-black để nổi bật */}
              <button className="bg-white text-black px-3 py-2 rounded-r-md flex items-center justify-center">
                <FiSend size={20} />
              </button>
            </div>
          </div>

          {/* Cột 2: Support */}
          <div>
            <h2 className="font-bold text-xl mb-4">Support</h2>
            <p className="text-gray-400 text-sm mb-2">111 Bijoy sarani, Dhaka,</p>
            <p className="text-gray-400 text-sm mb-2">DH 1515, Bangladesh.</p>
            <p className="text-gray-400 text-sm mb-2">
              <a href="mailto:exclusive@gmail.com" className="hover:text-gray-300">exclusive@gmail.com</a>
            </p>
            <p className="text-gray-400 text-sm">
              <a href="tel:+88015888889999" className="hover:text-gray-300">+88015-88888-9999</a>
            </p>
          </div>

          {/* Cột 3: Account */}
          <div>
            <h2 className="font-bold text-xl mb-4">Account</h2>
            <ul>
              <li className="mb-2"><Link href="/my-account" className="text-gray-400 hover:text-gray-300">My Account</Link></li>
              <li className="mb-2"><Link href="/login-register" className="text-gray-400 hover:text-gray-300">Login / Register</Link></li>
              <li className="mb-2"><Link href="/cart" className="text-gray-400 hover:text-gray-300">Cart</Link></li>
              <li className="mb-2"><Link href="/wishlist" className="text-gray-400 hover:text-gray-300">Wishlist</Link></li>
              <li className="mb-2"><Link href="/shop" className="text-gray-400 hover:text-gray-300">Shop</Link></li>
            </ul>
          </div>

          {/* Cột 4: Quick Link */}
          <div>
            <h2 className="font-bold text-xl mb-4">Quick Link</h2>
            <ul>
              <li className="mb-2"><Link href="/privacy-policy" className="text-gray-400 hover:text-gray-300">Privacy Policy</Link></li>
              <li className="mb-2"><Link href="/terms-of-use" className="text-gray-400 hover:text-gray-300">Terms Of Use</Link></li>
              <li className="mb-2"><Link href="/faq" className="text-gray-400 hover:text-gray-300">FAQ</Link></li>
              <li className="mb-2"><Link href="/contact" className="text-gray-400 hover:text-gray-300">Contact</Link></li>
            </ul>
          </div>

          {/* Cột 5: Download App */}
          <div>
            <h2 className="font-bold text-xl mb-4">Download App</h2>
            <p className="text-gray-400 text-xs mb-4">Save $3 with App New User Only</p>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://via.placeholder.com/100x100?text=QR+Code" alt="QR Code" className="w-24 h-24" />
              <div className="flex flex-col gap-2">
                <Link href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10" />
                </Link>
                <Link href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10" />
                </Link>
              </div>
            </div>
            {/* Social Media Icons - vẫn giữ text-white và hover:text-gray-400 để nổi bật trên nền tối */}
            <div className="flex gap-4 mt-6">
              <Link href="#" className="text-white hover:text-gray-400"><FaFacebookF size={24} /></Link>
              <Link href="#" className="text-white hover:text-gray-400"><FaTwitter size={24} /></Link>
              <Link href="#" className="text-white hover:text-gray-400"><FaInstagram size={24} /></Link>
              <Link href="#" className="text-white hover:text-gray-400"><FaLinkedinIn size={24} /></Link>
            </div>
          </div>
        </div>

        {/* Đường kẻ và Copyright */}
        {/* Thay đổi màu border thành gray-700 để phù hợp với nền tối của footer */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>© Copyright Rimel 2022. All right reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;