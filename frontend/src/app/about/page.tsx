'use client';
import Navbar from '../../components/layout/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              About Our Team
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Meet the experts behind Curelex Health Tech
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">CEO</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chief Executive Officer</h3>
              <p className="text-gray-600 mb-4">Leading the vision and strategy for digital healthcare transformation.</p>
              <p className="text-sm text-gray-500">15+ years in healthcare technology</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">CTO</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chief Technology Officer</h3>
              <p className="text-gray-600 mb-4">Architecting scalable and secure healthcare technology solutions.</p>
              <p className="text-sm text-gray-500">12+ years in software engineering</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">CMO</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chief Medical Officer</h3>
              <p className="text-gray-600 mb-4">Ensuring clinical excellence and medical workflow optimization.</p>
              <p className="text-sm text-gray-500">20+ years in clinical practice</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">CFO</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chief Financial Officer</h3>
              <p className="text-gray-600 mb-4">Managing financial strategy and sustainable growth initiatives.</p>
              <p className="text-sm text-gray-500">18+ years in healthcare finance</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-xl font-bold">DEV</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Development Team</h3>
              <p className="text-gray-600 mb-4">Expert developers building robust healthcare applications.</p>
              <p className="text-sm text-gray-500">Full-stack development specialists</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-xl font-bold">QA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600 mb-4">Ensuring the highest standards of software quality and reliability.</p>
              <p className="text-sm text-gray-500">Healthcare compliance experts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}