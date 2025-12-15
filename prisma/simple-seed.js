const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin@123', 12);
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const patientPassword = await bcrypt.hash('patient123', 12);

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
      password: doctorPassword,
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
      password: patientPassword,
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
  console.log('👨💼 Admin: ashutosh@curelex.com / admin@123');
  console.log('👨⚕️ Doctor: doctor@healthcare.com / doctor123');
  console.log('👤 Patient: patient@healthcare.com / patient123');
  console.log('👩⚕️ Nurse: nurse@healthcare.com / admin@123');
  console.log('👨💼 CEO: ceo@healthcare.com / admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });