'use client';
import Navbar from '../../components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="text-blue-600">Curelex</span> Health Tech
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Modern, Connected, and Reliable Digital Healthcare Ecosystem
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              About Curelex Health Tech Pvt. Ltd.
            </h2>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="text-lg text-gray-600 space-y-6">
              <p>
                Curelex Health Tech Pvt. Ltd. is dedicated to building a modern, connected, and reliable digital healthcare ecosystem. We develop secure and user-friendly platforms that bring patients, doctors, diagnostic services, and corporate healthcare teams into a single, integrated environment. Our solutions are designed to simplify medical workflows, improve coordination, and support informed decisions at every stage of care.
              </p>
              <p>
                With a strong focus on engineering excellence, data security, and practical healthcare requirements, Curelex delivers systems that enhance efficiency and elevate the overall standard of patient experience. Our commitment is to make healthcare more accessible, transparent, and technologically advanced for individuals and institutions alike.
              </p>
              <p className="text-xl font-semibold text-blue-600">
                At Curelex, we believe that technology should empower people to take control of their health with confidence—anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Healthcare Solutions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive digital healthcare platform designed for modern medical practice
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Management</h3>
              <p className="text-gray-600">Complete patient registration, medical history tracking, and profile management system.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Portal</h3>
              <p className="text-gray-600">Advanced tools for doctors to manage patients, create prescriptions, and track appointments.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Comprehensive analytics and reporting for healthcare administrators and executives.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}