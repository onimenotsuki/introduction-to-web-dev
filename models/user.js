const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let userSchema = mongoose.Schema({
  local: {
    email: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});

// Generating a hash before save password
userSchema.pre('save', (next) => {
  if (this.password) {
    this.password = this.generateHash(this.password);
  }

  next();
});

userSchema.methods.generateHash = (password) => bcrypt.hashSync(password, 10);

// Checking if password is valid
userSchema.methods.verifyPassword = (password, user_password) => bcrypt.compareSync(password, user_password);

module.exports = mongoose.model('User', userSchema);
