const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting enterprise database seed...');

  const hashedPassword = await bcrypt.hash('admin@123', 12);
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const patientPassword = await bcrypt.hash('patient123', 12);

  // Create Admin User with enhanced security
  const adminUser = await prisma.user.upsert({
    where: { email: 'ashutosh@curelex.com' },
    update: {},
    create: {
      email: 'ashutosh@curelex.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      twoFactorEnabled: false,
      loginCount: 0,
      failedLoginAttempts: 0,
      profile: {
        create: {
          firstName: 'Ashutosh',
          lastName: 'Mishra',
          phone: '+91-9876543210',
          gender: 'Male',
        },
      },
    },
  });

  // Create Doctor User
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@healthcare.com' },
    update: {},
    create: {
      email: 'doctor@healthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      twoFactorEnabled: false,
      loginCount: 0,
      failedLoginAttempts: 0,
      profile: {
        create: {
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          phone: '+91-9876543212',
          gender: 'Female',
        },
      },
      doctor: {
        create: {
          doctorId: 'DOC-001',
          specialization: 'General Medicine',
          licenseNumber: 'MED-12345',
          experience: 10,
          consultationFee: 500,
          isAvailable: true,
        },
      },
    },
  });

  // Create Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@healthcare.com' },
    update: {},
    create: {
      email: 'patient@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      isActive: true,
      twoFactorEnabled: false,
      loginCount: 0,
      failedLoginAttempts: 0,
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Davis',
          phone: '+91-9876543215',
          gender: 'Female',
        },
      },
      patient: {
        create: {
          patientId: 'PAT-001',
          emergencyContact: 'Bob Davis',
          emergencyPhone: '+91-9876543216',
          bloodGroup: 'O+',
          allergies: 'None',
          status: 'ACTIVE',
        },
      },
    },
  });

  // Create additional users for testing
  const users = [
    {
      email: 'nurse@healthcare.com',
      password: hashedPassword,
      role: 'NURSE',
      firstName: 'Mary',
      lastName: 'Brown',
      phone: '+91-9876543214',
    },
    {
      email: 'ceo@healthcare.com',
      password: hashedPassword,
      role: 'CEO',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+91-9876543211',
    },
    {
      email: 'junior.doctor@healthcare.com',
      password: doctorPassword,
      role: 'JUNIOR_DOCTOR',
      firstName: 'Dr. Mike',
      lastName: 'Wilson',
      phone: '+91-9876543213',
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: true,
        twoFactorEnabled: false,
        loginCount: 0,
        failedLoginAttempts: 0,
        profile: {
          create: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            gender: userData.firstName.includes('Dr.') ? 'Male' : 'Female',
          },
        },
        ...(userData.role === 'CEO' && {
          officer: {
            create: {
              officerId: 'CEO-001',
              department: 'Executive',
              position: 'CEO',
            },
          },
        }),
        ...(userData.role === 'JUNIOR_DOCTOR' && {
          doctor: {
            create: {
              doctorId: 'DOC-002',
              specialization: 'Internal Medicine',
              licenseNumber: 'MED-12346',
              experience: 3,
              consultationFee: 300,
              isAvailable: true,
            },
          },
        }),
      },
    });
  }

  console.log('✅ Enterprise database seeded successfully!');
  console.log('\n🔐 Enhanced Security Features:');
  console.log('• Account lockout after 5 failed attempts');
  console.log('• Session management and tracking');
  console.log('• Login history and audit trails');
  console.log('• IP address and device tracking');
  console.log('• Secure password hashing (bcrypt)');
  console.log('• JWT with session validation');
  
  console.log('\n📋 Login Credentials:');
  console.log('👨💼 Admin: ashutosh@curelex.com / admin@123');
  console.log('👨⚕️ Doctor: doctor@healthcare.com / doctor123');
  console.log('👤 Patient: patient@healthcare.com / patient123');
  console.log('👩⚕️ Nurse: nurse@healthcare.com / admin@123');
  console.log('👨💼 CEO: ceo@healthcare.com / admin@123');
  console.log('👨⚕️ Junior Doctor: junior.doctor@healthcare.com / doctor123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });