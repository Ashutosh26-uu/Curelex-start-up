'use client';
import Navbar from '../../components/layout/Navbar';
import styles from './page.module.css';

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Watermark */}
      <div className={`fixed inset-0 opacity-5 pointer-events-none z-0 ${styles.backgroundImage}`} />
      <Navbar />
      <div className="relative z-10">
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Our Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive healthcare technology solutions
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Patient Portal */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Patient Portal</h3>
                <p className="text-gray-600 mb-6">Access your medical records, book appointments, and manage your healthcare journey.</p>
                
                <div className="space-y-4">
                  <a
                    href="/patient-login"
                    className="block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Login as Patient
                  </a>
                  <a
                    href="/register?type=patient"
                    className="block w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Register as Patient
                  </a>
                </div>
                
                <div className="mt-6 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Patient Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Book appointments online</li>
                    <li>• View medical history</li>
                    <li>• Access prescriptions</li>
                    <li>• Track vital signs</li>
                    <li>• Secure messaging with doctors</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Staff Portal */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Staff Portal</h3>
                <p className="text-gray-600 mb-6">Healthcare professionals and administrative staff access portal.</p>
                
                <div className="space-y-4">
                  <a
                    href="/staff-login"
                    className="block w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Login as Staff
                  </a>
                </div>
                
                <div className="mt-6 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Staff Roles:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Doctors & Junior Doctors</li>
                    <li>• Nurses & Medical Staff</li>
                  </ul>
                </div>
              </div>
            </div>


          </div>

          {/* Additional Services */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Platform Features</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Telemedicine</h4>
                <p className="text-sm text-gray-600">Video consultations and remote patient monitoring</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h4>
                <p className="text-sm text-gray-600">Comprehensive reporting and business intelligence</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Secure Platform</h4>
                <p className="text-sm text-gray-600">HIPAA compliant with end-to-end encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}