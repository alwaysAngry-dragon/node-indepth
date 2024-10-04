const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(
          value
        );
      },
      message: 'Please enter a valid email address',
    },
  },
  photo: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', `lead-guide`],
    default: 'user', // default role is 'user' if not specified
    required: [true, 'Role is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 4,
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    required: [true, 'Confirm Password is required'],
    validate: {
      // does not run on updates
      validator: function (value) {
        return this.password === value;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChanged: {
    type: Date,
    // default: Date.now(),
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// DOCUMENT MIDDLEWARE
// pre save middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    // return if the password in not modified
    return next();
  }

  this.password = await bcrypt.hash(this.password, 6);

  this.passwordConfirm = undefined; // removing a field

  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, async function (next) {
  // 'this' points to the current query

  console.log('🤼🤼 pre find user query 🤼🤼');

  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE MIDDLEWARE
// will be available in all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

// Instance method
userSchema.methods.changePasswordAfter = async function (
  JWTTimestamp
) {
  if (this.passwordChanged) {
    console(this.passwordChanged, JWTTimestamp);
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires =
    Date.now() + 10 * 60 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
