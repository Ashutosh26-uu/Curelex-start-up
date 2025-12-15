'use client';
import { useState } from 'react';

export default function StaffLogin() {
  const [selectedRole, setSelectedRole] = useState('');

  const staffRoles = [
    { id: 'DOCTOR', name: 'Doctor', description: 'Senior medical practitioners' },
    { id: 'JUNIOR_DOCTOR', name: 'Junior Doctor', description: 'Resident and junior medical staff' },
  ];

  const handleRoleLogin = (role: string) => {
    if (role === 'DOCTOR') {
      window.location.href = `/doctor-login`;
    } else if (role === 'JUNIOR_DOCTOR') {
      window.location.href = `/junior-doctor-login`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Staff Portal</h1>
          <p className="text-lg text-gray-600">Medical professionals access portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {staffRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500"
              onClick={() => handleRoleLogin(role.id)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${role.id === 'DOCTOR' ? 'bg-green-600' : 'bg-blue-600'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-white text-lg font-bold">
                    {role.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                <button className={`w-full ${role.id === 'DOCTOR' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-md transition-colors`}>
                  Login as {role.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Not medical staff?</p>
          <div className="space-x-4">
            <a
              href="/patient-login"
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              Patient Portal
            </a>
            <a
              href="/home"
              className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}