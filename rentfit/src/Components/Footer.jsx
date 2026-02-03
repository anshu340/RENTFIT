import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-10 md:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {/* Company Info */}
        <div>
          <h2 className="text-purple-500 text-2xl font-bold mb-4">RentFit</h2>
          <p className="text-sm leading-relaxed mb-4">
            Revolutionizing fashion with sustainable rental solutions. Rent premium clothing for any occasion while contributing to a more sustainable future.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-3">
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded flex items-center justify-center transition-colors">
              <FaFacebookF className="text-white text-sm" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded flex items-center justify-center transition-colors">
              <FaTwitter className="text-white text-sm" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded flex items-center justify-center transition-colors">
              <FaInstagram className="text-white text-sm" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded flex items-center justify-center transition-colors">
              <FaLinkedinIn className="text-white text-sm" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browseClothes" className="hover:text-white transition-colors">Browse Clothes</Link></li>
            <li><Link to="/donate" className="hover:text-white transition-colors">Donate Items</Link></li>
            <li><Link to="/locations" className="hover:text-white transition-colors">Find Locations</Link></li>
            <li><Link to="/about#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <div>
          © 2025 RentFit. All rights reserved.
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;