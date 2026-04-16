const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@mindbridge.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = new User({
    name: 'Admin',
    email: 'admin@mindbridge.com',
    password: 'Admin@1234',
    role: 'admin',
  });

  await admin.save();

  console.log('✅ Admin created successfully');
  console.log('   Email:    admin@mindbridge.com');
  console.log('   Password: Admin@1234');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
