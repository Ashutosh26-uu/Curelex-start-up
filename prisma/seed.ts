import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password
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

  // Create CEO User
  const ceoUser = await prisma.user.upsert({
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

  // Create Junior Doctor User
  const juniorDoctorUser = await prisma.user.upsert({
    where: { email: 'junior.doctor@healthcare.com' },
    update: {},
    create: {
      email: 'junior.doctor@healthcare.com',
      password: doctorPassword,
      role: 'JUNIOR_DOCTOR',
      isActive: true,
      profile: {
        create: {
          firstName: 'Dr. Mike',
          lastName: 'Wilson',
          phone: '+91-9876543213',
          gender: 'Male',
        },
      },
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
    },
  });

  // Create Nurse User
  const nurseUser = await prisma.user.upsert({
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

  // Create another Patient
  const patient2User = await prisma.user.upsert({
    where: { email: 'patient2@healthcare.com' },
    update: {},
    create: {
      email: 'patient2@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      isActive: true,
      profile: {
        create: {
          firstName: 'Robert',
          lastName: 'Miller',
          phone: '+91-9876543217',
          gender: 'Male',
        },
      },
      patient: {
        create: {
          patientId: 'PAT-002',
          emergencyContact: 'Jane Miller',
          emergencyPhone: '+91-9876543218',
          bloodGroup: 'A+',
          allergies: 'Penicillin',
          status: 'ACTIVE',
        },
      },
    },
  });

  // Assign Doctor to Patients
  await prisma.doctorPatientAssignment.createMany({
    data: [
      {
        doctorId: doctorUser.doctor!.id,
        patientId: patientUser.patient!.id,
        assignedBy: adminUser.id,
      },
      {
        doctorId: doctorUser.doctor!.id,
        patientId: patient2User.patient!.id,
        assignedBy: adminUser.id,
      },
    ],
    skipDuplicates: true,
  });

  // Create Sample Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patientUser.patient!.id,
        doctorId: doctorUser.doctor!.id,
        scheduledAt: tomorrow,
        duration: 30,
        status: 'SCHEDULED',
        notes: 'Regular checkup',
        meetLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        patientId: patient2User.patient!.id,
        doctorId: doctorUser.doctor!.id,
        scheduledAt: nextWeek,
        duration: 45,
        status: 'SCHEDULED',
        notes: 'Follow-up consultation',
        meetLink: 'https://meet.google.com/xyz-uvwx-yzab',
      },
    ],
    skipDuplicates: true,
  });

  // Create Sample Vitals
  await prisma.vital.createMany({
    data: [
      {
        patientId: patientUser.patient!.id,
        doctorId: doctorUser.doctor!.id,
        type: 'BLOOD_PRESSURE',
        value: '120/80',
        unit: 'mmHg',
        recordedBy: nurseUser.id,
        notes: 'Normal blood pressure',
      },
      {
        patientId: patientUser.patient!.id,
        doctorId: doctorUser.doctor!.id,
        type: 'HEART_RATE',
        value: '72',
        unit: 'bpm',
        recordedBy: nurseUser.id,
        notes: 'Normal heart rate',
      },
      {
        patientId: patient2User.patient!.id,
        doctorId: doctorUser.doctor!.id,
        type: 'BLOOD_PRESSURE',
        value: '130/85',
        unit: 'mmHg',
        recordedBy: nurseUser.id,
        notes: 'Slightly elevated',
      },
    ],
    skipDuplicates: true,
  });

  // Create Sample Medical History
  await prisma.medicalHistory.createMany({
    data: [
      {
        patientId: patientUser.patient!.id,
        condition: 'Hypertension',
        diagnosis: 'Essential hypertension',
        treatment: 'Lifestyle modifications and medication',
        severity: 'Mild',
        diagnosedAt: new Date('2023-01-15'),
      },
      {
        patientId: patient2User.patient!.id,
        condition: 'Diabetes Type 2',
        diagnosis: 'Type 2 Diabetes Mellitus',
        treatment: 'Metformin and diet control',
        severity: 'Moderate',
        diagnosedAt: new Date('2022-06-10'),
      },
    ],
    skipDuplicates: true,
  });

  // Create Sample Prescriptions
  await prisma.prescription.createMany({
    data: [
      {
        patientId: patientUser.patient!.id,
        doctorId: doctorUser.doctor!.id,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food',
        status: 'ACTIVE',
      },
      {
        patientId: patient2User.patient!.id,
        doctorId: doctorUser.doctor!.id,
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '90 days',
        instructions: 'Take with meals',
        status: 'ACTIVE',
      },
    ],
    skipDuplicates: true,
  });

  // Create Sample Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser.id,
        type: 'APPOINTMENT',
        title: 'Upcoming Appointment',
        message: 'You have an appointment tomorrow at 10:00 AM',
      },
      {
        userId: doctorUser.id,
        type: 'APPOINTMENT',
        title: 'New Appointment',
        message: 'New appointment scheduled with Alice Davis',
      },
      {
        userId: adminUser.id,
        type: 'SYSTEM',
        title: 'System Update',
        message: 'Healthcare platform updated successfully',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Created users:');
  console.log('👨‍💼 Admin: ashutosh@curelex.com / admin@123');
  console.log('👨‍⚕️ Doctor: doctor@healthcare.com / doctor123');
  console.log('👩‍⚕️ Junior Doctor: junior.doctor@healthcare.com / doctor123');
  console.log('👩‍⚕️ Nurse: nurse@healthcare.com / admin@123');
  console.log('👤 Patient: patient@healthcare.com / patient123');
  console.log('👤 Patient 2: patient2@healthcare.com / patient123');
  console.log('👨‍💼 CEO: ceo@healthcare.com / admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });