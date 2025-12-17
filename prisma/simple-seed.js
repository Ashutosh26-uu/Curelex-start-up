const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seed...');

    // Use environment variables for passwords or generate secure defaults
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'TempPass123!';
    const doctorPassword = process.env.SEED_DOCTOR_PASSWORD || 'DocPass123!';
    const patientPassword = process.env.SEED_PATIENT_PASSWORD || 'PatPass123!';
    
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    const hashedDoctorPassword = await bcrypt.hash(doctorPassword, 12);
    const hashedPatientPassword = await bcrypt.hash(patientPassword, 12);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'ashutosh@curelex.com' },
    update: {},
    create: {
      email: 'ashutosh@curelex.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
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
      password: hashedDoctorPassword,
      role: 'DOCTOR',
      isActive: true,
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
      password: hashedPatientPassword,
      role: 'PATIENT',
      isActive: true,
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

  // Create Nurse User
  await prisma.user.upsert({
    where: { email: 'nurse@healthcare.com' },
    update: {},
    create: {
      email: 'nurse@healthcare.com',
      password: hashedPassword,
      role: 'NURSE',
      isActive: true,
      profile: {
        create: {
          firstName: 'Mary',
          lastName: 'Brown',
          phone: '+91-9876543214',
          gender: 'Female',
        },
      },
    },
  });

  // Create CEO User
  await prisma.user.upsert({
    where: { email: 'ceo@healthcare.com' },
    update: {},
    create: {
      email: 'ceo@healthcare.com',
      password: hashedPassword,
      role: 'CEO',
      isActive: true,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+91-9876543211',
          gender: 'Male',
        },
      },
      officer: {
        create: {
          officerId: 'CEO-001',
          department: 'Executive',
          position: 'CEO',
        },
      },
    },
  });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👨💼 Admin: ashutosh@curelex.com / [Check SEED_DEFAULT_PASSWORD env var]');
    console.log('👨⚕️ Doctor: doctor@healthcare.com / [Check SEED_DOCTOR_PASSWORD env var]');
    console.log('👤 Patient: patient@healthcare.com / [Check SEED_PATIENT_PASSWORD env var]');
    console.log('👩⚕️ Nurse: nurse@healthcare.com / [Check SEED_DEFAULT_PASSWORD env var]');
    console.log('👨💼 CEO: ceo@healthcare.com / [Check SEED_DEFAULT_PASSWORD env var]');
  } catch (error) {
    console.error('❌ Seed operation failed:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });