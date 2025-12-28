const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('TempPass123!', 12);
  const doctorPassword = await bcrypt.hash('DocPass123!', 12);
  const patientPassword = await bcrypt.hash('PatPass123!', 12);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'ashutosh@curelex.com' },
    update: {},
    create: {
      email: 'ashutosh@curelex.com',
      password: await bcrypt.hash('admin@123', 12),
      role: 'ADMIN',
      isActive: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Ashutosh',
          lastName: 'Mishra',
          phone: '+919876543210',
          gender: 'MALE',
          address: 'Admin Office, Healthcare Platform',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'IN',
        },
      },
      officer: {
        create: {
          officerId: 'ADMIN001',
          department: 'Administration',
          position: 'System Administrator',
        },
      },
    },
  });

  // Create Sample Doctor
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@healthcare.com' },
    update: {},
    create: {
      email: 'doctor@healthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      isActive: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar',
          phone: '+919876543211',
          gender: 'MALE',
          dateOfBirth: new Date('1980-05-15'),
          address: 'Medical Complex, Sector 1',
          city: 'Delhi',
          state: 'Delhi',
          country: 'IN',
        },
      },
      doctor: {
        create: {
          doctorId: 'DOC001',
          specialization: 'Cardiology',
          licenseNumber: 'MED123456',
          experience: 15,
          consultationFee: 500.0,
          qualification: 'MBBS, MD Cardiology',
          hospital: 'City General Hospital',
          isAvailable: true,
        },
      },
    },
  });

  // Create Sample Junior Doctor
  const juniorDoctorUser = await prisma.user.upsert({
    where: { email: 'junior@healthcare.com' },
    update: {},
    create: {
      email: 'junior@healthcare.com',
      password: doctorPassword,
      role: 'JUNIOR_DOCTOR',
      isActive: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Dr. Priya',
          lastName: 'Sharma',
          phone: '+919876543212',
          gender: 'FEMALE',
          dateOfBirth: new Date('1990-08-20'),
          address: 'Medical Complex, Sector 2',
          city: 'Delhi',
          state: 'Delhi',
          country: 'IN',
        },
      },
      doctor: {
        create: {
          doctorId: 'JDOC001',
          specialization: 'General Medicine',
          licenseNumber: 'MED789012',
          experience: 3,
          consultationFee: 300.0,
          qualification: 'MBBS',
          hospital: 'City General Hospital',
          isAvailable: true,
        },
      },
    },
  });

  // Create Sample Patient
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@healthcare.com' },
    update: {},
    create: {
      email: 'patient@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      isActive: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Amit',
          lastName: 'Patel',
          phone: '+919876543213',
          gender: 'MALE',
          dateOfBirth: new Date('1985-12-10'),
          address: 'Residential Complex, Block A',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'IN',
        },
      },
      patient: {
        create: {
          patientId: 'PAT001',
          emergencyContact: '+919876543214',
          emergencyPhone: '+919876543214',
          bloodGroup: 'O+',
          allergies: 'None',
          chronicConditions: 'Hypertension',
          insuranceNumber: 'INS123456789',
          insuranceProvider: 'Health Insurance Corp',
          status: 'ASSIGNED',
        },
      },
    },
  });

  // Create CEO User
  const ceoUser = await prisma.user.upsert({
    where: { email: 'ceo@healthcare.com' },
    update: {},
    create: {
      email: 'ceo@healthcare.com',
      password: hashedPassword,
      role: 'CEO',
      isActive: true,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: 'Vikram',
          lastName: 'Singh',
          phone: '+919876543215',
          gender: 'MALE',
          address: 'Executive Office, Healthcare Platform',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'IN',
        },
      },
      officer: {
        create: {
          officerId: 'CEO001',
          department: 'Executive',
          position: 'Chief Executive Officer',
        },
      },
    },
  });

  // Assign Doctor to Patient
  await prisma.doctorPatientAssignment.create({
    data: {
      doctorId: doctorUser.doctor.id,
      patientId: patientUser.patient.id,
      assignedBy: adminUser.id,
      isActive: true,
    },
  });

  // Create Sample Appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 30,
      status: 'SCHEDULED',
      meetLink: 'https://meet.google.com/sample-link',
      notes: 'Regular checkup appointment',
    },
  });

  // Create Sample Vitals
  await prisma.vital.createMany({
    data: [
      {
        patientId: patientUser.patient.id,
        doctorId: doctorUser.doctor.id,
        type: 'BLOOD_PRESSURE',
        value: '120/80',
        unit: 'mmHg',
        recordedBy: doctorUser.id,
        notes: 'Normal blood pressure reading',
      },
      {
        patientId: patientUser.patient.id,
        doctorId: doctorUser.doctor.id,
        type: 'HEART_RATE',
        value: '72',
        unit: 'bpm',
        recordedBy: doctorUser.id,
        notes: 'Normal heart rate',
      },
      {
        patientId: patientUser.patient.id,
        doctorId: doctorUser.doctor.id,
        type: 'TEMPERATURE',
        value: '98.6',
        unit: '°F',
        recordedBy: doctorUser.id,
        notes: 'Normal body temperature',
      },
    ],
  });

  // Create Sample Medical History
  await prisma.medicalHistory.create({
    data: {
      patientId: patientUser.patient.id,
      condition: 'Hypertension',
      diagnosis: 'Essential Hypertension',
      treatment: 'Lifestyle modification and medication',
      severity: 'MILD',
      diagnosedAt: new Date('2023-01-15'),
      isActive: true,
    },
  });

  // Create Sample Prescription
  await prisma.prescription.create({
    data: {
      patientId: patientUser.patient.id,
      doctorId: doctorUser.doctor.id,
      medication: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take with food in the morning',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser.id,
        type: 'APPOINTMENT_REMINDER',
        title: 'Upcoming Appointment',
        message: 'You have an appointment tomorrow with Dr. Rajesh Kumar',
        status: 'SENT',
        sentAt: new Date(),
      },
      {
        userId: doctorUser.id,
        type: 'NEW_PATIENT',
        title: 'New Patient Assigned',
        message: 'Patient Amit Patel has been assigned to you',
        status: 'SENT',
        sentAt: new Date(),
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Sample Credentials:');
  console.log('==========================================');
  console.log('Admin: ashutosh@curelex.com / admin@123');
  console.log('Doctor: doctor@healthcare.com / DocPass123!');
  console.log('Junior Doctor: junior@healthcare.com / DocPass123!');
  console.log('Patient: patient@healthcare.com / PatPass123!');
  console.log('CEO: ceo@healthcare.com / TempPass123!');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });