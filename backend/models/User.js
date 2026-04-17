const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * users collection
 * Used by: LoginPage, RegisterPage, ProfilePage, AuthContext,
 *          AdminUsersPage, TherapistCard (userId.name/email/profileImage)
 */
const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true, minlength: 6 },
  role:           { type: String, enum: ['client', 'therapist', 'admin'], default: 'client' },

  // ProfilePage fields
  phone:          { type: String, trim: true, default: null },
  gender:         { type: String, enum: ['male', 'female', 'other'], default: null },
  dateOfBirth:    { type: Date, default: null },
  profileImage:   { type: String, default: null },          // URL
  emergencyContact: { type: String, trim: true, default: null },

  // ProfilePage notification toggles
  notificationPreferences: {
    appointments: { type: Boolean, default: true },
    assessments:  { type: Boolean, default: true },
    payments:     { type: Boolean, default: true },
    tips:         { type: Boolean, default: false }
  },

  isActive:       { type: Boolean, default: true },
  createdAt:      { type: Date, default: Date.now },
  updatedAt:      { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  this.updatedAt = Date.now();
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', userSchema);
