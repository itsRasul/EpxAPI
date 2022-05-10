const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
    minlength: [3, 'name user must be more than 3 character'],
    maxlength: [50, 'name user must be less than 50 character'],
  },
  userName: {
    type: String,
    minlength: [3, 'name user must be more than 3 character'],
    maxlength: [50, 'name user must be less than 50 character'],
    unique: [true, 'this userName has been used already by another user'],
    required: [true, 'user must have a userName'],
  },
  email: {
    type: String,
    required: [true, 'user must have a email!'],
    unique: [true, 'this email has been used already by another user'],
    validate: {
      validator: validator.isEmail,
      message: 'email is invalid!',
    },
  },
  password: {
    type: String,
    required: [true, 'please enter your password'],
    minlength: [8, 'password must be more than 8 character!'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please enter your passwordConfirm'],
    minlength: [8, 'confirmPassword must be more than 8 character'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'passwords are not the same!',
    },
  },
  photo: {
    type: String,
    default: 'default.png',
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordChangedAt: Date,
  resetPassword: String,
  resetPasswordExpires: Date,
});

// hash password
userSchema.pre('save', async function (next) {
  // this points to crrent doc
  if (!this.isModified('password')) return next();
  // hash password
  this.password = await bcrypt.hash(this.password, 12);
  // we don't need to have passwordConfirm anymore
  this.passwordConfirm = undefined;

  next();
});
// in instance method ,this points to currentDoc, and instance methods are available in intance of model (Documents)
userSchema.methods.comparePassword = async (plainPass, hashedPass) =>
  await bcrypt.compare(plainPass, hashedPass);

userSchema.methods.changedPasswordAfterTokenIssued = function (JWTIssuedAtTimeStamp) {
  if (!this.passwordChangedAt) {
    // user has never changed his password, so token always be valid in this step
    return false;
  }
  const passwordChangedAtTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
  return passwordChangedAtTimeStamp > JWTIssuedAtTimeStamp;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
