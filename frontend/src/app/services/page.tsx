'use client';
import Navbar from '../../components/layout/Navbar';

export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Telemedicine Platform</h3>
              <p className="text-gray-600 mb-4">Complete virtual consultation platform with video calls, appointment scheduling, and digital prescriptions.</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Video consultations</li>
                <li>• Appointment management</li>
                <li>• Digital prescriptions</li>
                <li>• Medical records</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Management System</h3>
              <p className="text-gray-600 mb-4">Comprehensive patient data management with medical history, vitals tracking, and care coordination.</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Patient registration</li>
                <li>• Medical history tracking</li>
                <li>• Vital signs monitoring</li>
                <li>• Care coordination</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Healthcare Analytics</h3>
              <p className="text-gray-600 mb-4">Advanced analytics and reporting tools for healthcare administrators and decision makers.</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Performance metrics</li>
                <li>• Patient analytics</li>
                <li>• Revenue tracking</li>
                <li>• System monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}