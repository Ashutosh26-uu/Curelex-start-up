const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthcare.com' },
    update: {},
    create: {
      email: 'admin@healthcare.com',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1234567890',
        },
      },
    },
  });

  // Create Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@healthcare.com' },
    update: {},
    create: {
      email: 'doctor@healthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567891',
        },
      },
      doctor: {
        create: {
          doctorId: 'DOC-001',
          specialization: 'General Medicine',
          licenseNumber: 'LIC-12345',
          experience: 10,
          consultationFee: 150.0,
          qualification: 'MD',
        },
      },
    },
  });

  // Create Patient
  const patientPassword = await bcrypt.hash('patient123', 12);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@healthcare.com' },
    update: {},
    create: {
      email: 'patient@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      profile: {
        create: {
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+1234567892',
          gender: 'FEMALE',
        },
      },
      patient: {
        create: {
          patientId: 'PAT-001',
          emergencyContact: 'John Doe',
          bloodGroup: 'O+',
        },
      },
    },
  });

  // Create Ashutosh Admin User
  const ashutoshPassword = await bcrypt.hash('admin@123', 12);
  const ashutosh = await prisma.user.upsert({
    where: { email: 'ashutosh@curelex.com' },
    update: {},
    create: {
      email: 'ashutosh@curelex.com',
      password: ashutoshPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Ashutosh',
          lastName: 'Mishra',
          phone: '+919876543210',
        },
      },
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('🔑 Login credentials:');
  console.log('Ashutosh Admin: ashutosh@curelex.com / admin@123');
  console.log('Admin: admin@healthcare.com / admin123');
  console.log('Doctor: doctor@healthcare.com / doctor123');
  console.log('Patient: patient@healthcare.com / patient123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });