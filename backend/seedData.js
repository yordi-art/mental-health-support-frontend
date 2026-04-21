const mongoose = require('mongoose');
require('dotenv').config();

const User      = require('./models/User');
const Therapist = require('./models/Therapist');

const MONGO_URI = process.env.MONGODB_URI;

// ─── Seed Data ────────────────────────────────────────────────────────────────

const ADMIN = {
  name: 'Admin',
  email: 'admin@mindbridge.com',
  password: 'Admin@1234',
  role: 'admin',
};

const CLIENTS = [
  { name: 'Alice Johnson',  email: 'alice@example.com',  password: 'Client@1234', role: 'client' },
  { name: 'Bob Smith',      email: 'bob@example.com',    password: 'Client@1234', role: 'client' },
  { name: 'Carol Williams', email: 'carol@example.com',  password: 'Client@1234', role: 'client' },
];

const THERAPISTS = [
  {
    user: { name: 'Dr. Sarah Ahmed',   email: 'sarah@mindbridge.com',   password: 'Therapist@1234', role: 'therapist' },
    profile: {
      specialization:  ['Clinical Psychology', 'Psychotherapy'],
      experienceYears: 10,
      bio:             'Experienced clinical psychologist specializing in depression, anxiety, and trauma therapy.',
      workplace:       'MindBridge Wellness Center',
      hourlyRate:      800,
      languages:       ['English', 'Amharic'],
      education: { degreeType: 'Doctorate', field: 'Clinical Psychology', institution: 'Addis Ababa University', graduationYear: 2013 },
      competency: { hasCOC: true, examPassed: true },
      license: { licenseNumber: 'LIC-CP-001', issuingAuthority: 'Ministry of Health', issueDate: new Date('2015-01-01'), licenseExpiryDate: new Date('2027-01-01') },
      verification: { status: 'VERIFIED', confidence: 97, verifiedAt: new Date() },
      availability: [
        { day: 'monday',    startTime: '09:00', endTime: '17:00' },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'friday',    startTime: '09:00', endTime: '13:00' },
      ],
      rating: 4.9, reviewCount: 24,
    }
  },
  {
    user: { name: 'Dr. Michael Tesfaye', email: 'michael@mindbridge.com', password: 'Therapist@1234', role: 'therapist' },
    profile: {
      specialization:  ['Therapy', 'CBT', 'Psychotherapy'],
      experienceYears: 7,
      bio:             'Licensed therapist with expertise in cognitive behavioral therapy and anxiety disorders.',
      workplace:       'Serenity Mental Health Clinic',
      hourlyRate:      650,
      languages:       ['English', 'Amharic', 'Oromo'],
      education: { degreeType: 'Master', field: 'Counseling', institution: 'Jimma University', graduationYear: 2016 },
      competency: { hasCOC: true, examPassed: true },
      license: { licenseNumber: 'LIC-TH-002', issuingAuthority: 'Regional Bureau of Health', issueDate: new Date('2017-03-01'), licenseExpiryDate: new Date('2026-03-01') },
      verification: { status: 'VERIFIED', confidence: 94, verifiedAt: new Date() },
      availability: [
        { day: 'tuesday',   startTime: '10:00', endTime: '18:00' },
        { day: 'thursday',  startTime: '10:00', endTime: '18:00' },
        { day: 'saturday',  startTime: '09:00', endTime: '14:00' },
      ],
      rating: 4.7, reviewCount: 18,
    }
  },
  {
    user: { name: 'Dr. Hana Girma', email: 'hana@mindbridge.com', password: 'Therapist@1234', role: 'therapist' },
    profile: {
      specialization:  ['Counseling', 'General Counseling', 'Wellness Coaching'],
      experienceYears: 5,
      bio:             'Compassionate counselor focused on stress management, life transitions, and personal growth.',
      workplace:       'Hope Counseling Center',
      hourlyRate:      500,
      languages:       ['English', 'Amharic'],
      education: { degreeType: 'Master', field: 'Psychology', institution: 'Bahir Dar University', graduationYear: 2018 },
      competency: { hasCOC: true, examPassed: false },
      license: { licenseNumber: 'LIC-CO-003', issuingAuthority: 'Ministry of Health', issueDate: new Date('2019-06-01'), licenseExpiryDate: new Date('2026-06-01') },
      verification: { status: 'VERIFIED', confidence: 91, verifiedAt: new Date() },
      availability: [
        { day: 'monday',    startTime: '08:00', endTime: '16:00' },
        { day: 'tuesday',   startTime: '08:00', endTime: '16:00' },
        { day: 'wednesday', startTime: '08:00', endTime: '16:00' },
        { day: 'thursday',  startTime: '08:00', endTime: '16:00' },
      ],
      rating: 4.6, reviewCount: 12,
    }
  },
  {
    user: { name: 'Dr. Yonas Bekele', email: 'yonas@mindbridge.com', password: 'Therapist@1234', role: 'therapist' },
    profile: {
      specialization:  ['Psychiatry', 'Clinical Psychology', 'Trauma Therapy'],
      experienceYears: 15,
      bio:             'Senior psychiatrist with 15 years of experience treating severe mental health conditions.',
      workplace:       'Addis Mental Health Hospital',
      hourlyRate:      1200,
      languages:       ['English', 'Amharic'],
      education: { degreeType: 'Doctorate', field: 'Clinical Psychology', institution: 'Black Lion Hospital', graduationYear: 2008 },
      competency: { hasCOC: true, examPassed: true },
      license: { licenseNumber: 'LIC-PS-004', issuingAuthority: 'Ministry of Health', issueDate: new Date('2009-01-01'), licenseExpiryDate: new Date('2028-01-01') },
      verification: { status: 'VERIFIED', confidence: 99, verifiedAt: new Date() },
      availability: [
        { day: 'monday',    startTime: '09:00', endTime: '15:00' },
        { day: 'wednesday', startTime: '09:00', endTime: '15:00' },
        { day: 'friday',    startTime: '09:00', endTime: '15:00' },
      ],
      rating: 4.8, reviewCount: 41,
    }
  },
  {
    user: { name: 'Dr. Meron Tadesse', email: 'meron@mindbridge.com', password: 'Therapist@1234', role: 'therapist' },
    profile: {
      specialization:  ['Clinical Counseling', 'Licensed Therapy', 'CBT'],
      experienceYears: 8,
      bio:             'Licensed therapist specializing in moderate to severe depression and relationship issues.',
      workplace:       'Harmony Therapy Center',
      hourlyRate:      700,
      languages:       ['English', 'Amharic', 'Tigrinya'],
      education: { degreeType: 'Master', field: 'Clinical Psychology', institution: 'Mekelle University', graduationYear: 2015 },
      competency: { hasCOC: true, examPassed: true },
      license: { licenseNumber: 'LIC-LC-005', issuingAuthority: 'Regional Bureau of Health', issueDate: new Date('2016-09-01'), licenseExpiryDate: new Date('2027-09-01') },
      verification: { status: 'VERIFIED', confidence: 95, verifiedAt: new Date() },
      availability: [
        { day: 'tuesday',   startTime: '09:00', endTime: '17:00' },
        { day: 'thursday',  startTime: '09:00', endTime: '17:00' },
        { day: 'saturday',  startTime: '10:00', endTime: '15:00' },
      ],
      rating: 4.5, reviewCount: 29,
    }
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB Atlas\n');

  // Admin
  const existingAdmin = await User.findOne({ email: ADMIN.email });
  if (existingAdmin) {
    console.log('⚠️  Admin already exists — skipping');
  } else {
    await new User(ADMIN).save();
    console.log('✅ Admin created         →', ADMIN.email, '/ Admin@1234');
  }

  // Clients
  for (const c of CLIENTS) {
    const exists = await User.findOne({ email: c.email });
    if (exists) { console.log(`⚠️  Client already exists — skipping ${c.email}`); continue; }
    await new User(c).save();
    console.log('✅ Client created        →', c.email, '/ Client@1234');
  }

  // Therapists
  for (const t of THERAPISTS) {
    const exists = await User.findOne({ email: t.user.email });
    if (exists) { console.log(`⚠️  Therapist already exists — skipping ${t.user.email}`); continue; }

    const userDoc = await new User(t.user).save();
    await new Therapist({ userId: userDoc._id, ...t.profile }).save();
    console.log('✅ Therapist created     →', t.user.email, '/ Therapist@1234');
  }

  console.log('\n─────────────────────────────────────────');
  console.log('🎉 Seed complete!\n');
  console.log('  Admin      → admin@mindbridge.com   / Admin@1234');
  console.log('  Clients    → alice@example.com      / Client@1234');
  console.log('  Therapists → sarah@mindbridge.com   / Therapist@1234');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
