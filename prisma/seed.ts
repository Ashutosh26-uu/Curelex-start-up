import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1234567890',
        },
      },
    },
  });

  // Create CEO
  const ceoPassword = await bcrypt.hash('ceo123', 12);
  const ceo = await prisma.user.create({
    data: {
      email: 'ceo@healthcare.com',
      password: ceoPassword,
      role: 'CEO',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567891',
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

  // Create Sample Doctor
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@healthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
      profile: {
        create: {
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          phone: '+1234567892',
        },
      },
      doctor: {
        create: {
          doctorId: 'DOC-001',
          specialization: 'Cardiology',
          licenseNumber: 'LIC-12345',
          experience: 10,
          consultationFee: 150,
          qualification: 'MD, Cardiology',
          hospital: 'Healthcare Center',
        },
      },
    },
  });

  // Create Sample Patient
  const patientPassword = await bcrypt.hash('patient123', 12);
  const patient = await prisma.user.create({
    data: {
      email: 'patient@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Williams',
          phone: '+1234567893',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'Female',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
        },
      },
      patient: {
        create: {
          patientId: 'PAT-001',
          emergencyContact: 'Bob Williams',
          emergencyPhone: '+1234567894',
          bloodGroup: 'O+',
          allergies: 'None',
          chronicConditions: 'None',
          insuranceNumber: 'INS-12345',
          insuranceProvider: 'HealthCare Plus',
        },
      },
    },
  });

  // Create Sample Nurse
  const nursePassword = await bcrypt.hash('nurse123', 12);
  const nurse = await prisma.user.create({
    data: {
      email: 'nurse@healthcare.com',
      password: nursePassword,
      role: 'NURSE',
      profile: {
        create: {
          firstName: 'Mary',
          lastName: 'Davis',
          phone: '+1234567895',
        },
      },
    },
  });

  // Assign Doctor to Patient
  const doctorRecord = await prisma.doctor.findUnique({ where: { userId: doctor.id } });
  const patientRecord = await prisma.patient.findUnique({ where: { userId: patient.id } });
  
  await prisma.doctorPatientAssignment.create({
    data: {
      doctorId: doctorRecord.id,
      patientId: patientRecord.id,
      assignedBy: admin.id,
    },
  });

  // Create Sample Appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 1);
  appointmentDate.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      scheduledAt: appointmentDate,
      duration: 30,
      status: 'SCHEDULED',
      meetLink: 'https://meet.google.com/sample-link',
      notes: 'Regular checkup',
    },
  });

  // Create Sample Vitals
  await prisma.vital.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      type: 'BLOOD_PRESSURE',
      value: '120/80',
      unit: 'mmHg',
      recordedBy: doctor.id,
      notes: 'Normal blood pressure',
    },
  });

  await prisma.vital.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      type: 'HEART_RATE',
      value: '72',
      unit: 'bpm',
      recordedBy: doctor.id,
      notes: 'Normal heart rate',
    },
  });

  // Create Sample Prescription
  await prisma.prescription.create({
    data: {
      patientId: patientRecord.id,
      doctorId: doctorRecord.id,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take with food',
      status: 'ACTIVE',
    },
  });

  // Create Sample Medical History
  await prisma.medicalHistory.create({
    data: {
      patientId: patientRecord.id,
      condition: 'Hypertension',
      diagnosis: 'Essential hypertension',
      treatment: 'Lifestyle changes and medication',
      severity: 'Mild',
      diagnosedAt: new Date('2023-01-15'),
    },
  });

  // Create Sample Notifications
  await prisma.notification.create({
    data: {
      userId: patient.id,
      type: 'WELCOME',
      title: 'Welcome to Healthcare Platform',
      message: 'Welcome Alice! Your account has been created successfully.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: doctor.id,
      type: 'SYSTEM',
      title: 'New Patient Assignment',
      message: 'You have been assigned to patient Alice Williams',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Sample accounts created:');
  console.log('Admin: admin@healthcare.com / admin123');
  console.log('CEO: ceo@healthcare.com / ceo123');
  console.log('Doctor: doctor@healthcare.com / doctor123');
  console.log('Patient: patient@healthcare.com / patient123');
  console.log('Nurse: nurse@healthcare.com / nurse123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });