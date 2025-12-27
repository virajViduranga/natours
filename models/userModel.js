const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

 

 const validator = require('validator');

 const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : [true,'A User must have a name'],
        trim : true
    },
    email:{
        type : String,
        required : [true,'A User must have a email'],
        unique : true,
        lowercase: true,
        validate : [validator.isEmail, "Invalid Email Format!"]
    },
    photo:{
        type : String,
        default:'default.jpeg'
    },
    role:{
        type : String,
        enum : ['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type : String,
        required : [true,'A User must have a password'],
        minLength : 8,
        select : false
    },
    passwordConfirm:{
        type : String,
        required : [true,'A User must have a passwordConfirm'],
        validate:{
            validator : function(el){
                return el === this.password;
            },
            message : 'Passwords Does not match'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active :{
        type : Boolean,
        default : true,
        select : false
    }
 });

 userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
 });

 userSchema.pre('save', function(next) {
  // Only run if password was modified AND not new user
  if (!this.isModified('password') || this.isNew) return next();

  // Set passwordChangedAt to one second before token issue
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/ , function(next){
    this.find({active : {$ne : false}});
    next();
})


    userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
        return await bcrypt.compare(candidatePassword,userPassword);
    }
   userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

 userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

 userSchema.index({ email: 1 }, { unique: true });
 const User = mongoose.model('User', userSchema);
 module.exports = User;