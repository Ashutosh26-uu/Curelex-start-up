import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/images/crelex.jpg" 
                alt="Curelex Logo" 
                className="h-10 w-auto mr-3"
              />
              <div>
                <span className="text-xl font-bold text-blue-400">Curelex</span>
                <span className="text-sm text-gray-300 ml-2">Health Tech</span>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Telemedicine that feels like offline care. Bridging rural and urban healthcare through hybrid e-clinic solutions.
            </p>
            <p className="text-sm text-gray-400">
              Contact.curelex@gmail.com | +91 89578 09085
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/home" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">Home</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">Services</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">About Team</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:translate-x-1 inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Connect With Us</h3>
            <div className="flex space-x-3">
              {/* Facebook */}
              <a 
                href="https://facebook.com/curelex" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative p-3 bg-gray-800 rounded-full transition-all duration-300 hover:bg-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25" 
                aria-label="Follow us on Facebook"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Facebook
                </div>
              </a>

              {/* Twitter */}
              <a 
                href="https://twitter.com/curelex" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative p-3 bg-gray-800 rounded-full transition-all duration-300 hover:bg-sky-500 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/25" 
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Twitter
                </div>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/company/curelex" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative p-3 bg-gray-800 rounded-full transition-all duration-300 hover:bg-blue-700 hover:scale-110 hover:shadow-lg hover:shadow-blue-700/25" 
                aria-label="Follow us on LinkedIn"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  LinkedIn
                </div>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/curelex" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative p-3 bg-gray-800 rounded-full transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25" 
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Instagram
                </div>
              </a>

              {/* YouTube */}
              <a 
                href="https://youtube.com/@curelex" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative p-3 bg-gray-800 rounded-full transition-all duration-300 hover:bg-red-600 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25" 
                aria-label="Follow us on YouTube"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  YouTube
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Curelex Health Tech Pvt. Ltd. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}