const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');


const catchAsync = require('../utils/catchAsync');

const signToken = id =>{
    return jwt.sign(
        {id : id}, 
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_IN})
};

const CreateSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
 const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
        httpOnly : true
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token ,cookieOptions );

    user.password = undefined; //userta password eka penwanne na
    res.status(statusCode).json({
        status : "success",
        token,
        data :{
            user
        }
    });
}
exports.signUp = catchAsync(async (req,res,next) =>{
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
         role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    CreateSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req,res,next) =>{
    const {email,password} = req.body;
    if(!email || !password){
       return next(new AppError('please provide email and password',400));
    }

    //checking if the user and password exits
    const user = await User.findOne({email : email}).select('+password');

    if(!user || !(await user.correctPassword(password,user.password))){
       return next(new AppError('Incorrect email or password',401));
    }

    CreateSendToken(user,201,res);
});

exports.protect = catchAsync(async (req,res,next) =>{
    //1 getting token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    
    if(!token){
        return next(new AppError('You are not logged in!',401));
    }
    //2 verifying token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    //3 check if user still exists
    const freshUser = await  User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('User does not exist',401));
    }
    //4check whether the user changed the password after JWT issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User changed password recently.please login again'));
    }
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
    
});

//only for rendered pages, so no errors
exports.isLoggedIn = async (req,res,next) =>{
    
    //1 getting token and check if it's there
    if(req.cookies.jwt){
        try{
    //2 verifying token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    //3 check if user still exists
    const freshUser = await  User.findById(decoded.id);
    if(!freshUser){
        return next();
    }
    //4check whether the user changed the password after JWT issued
    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next();
    }

    //There is a loggedIn user
    res.locals.user = freshUser;
    return next();
}catch(err){
    return next();
}
    
    }
    
    next();

}
exports.logout = (req,res) =>{
    res.cookie('jwt','logout',{
        expires: new Date(Date.now() +10 *1000),
        httpOnly:true
    });
    res.status(200).json({status :'success'});
}

exports.restrictTo = (...roles) =>{ 
    return (req,res,next) =>{
    if(!roles.includes(req.user.role)){
        return next(new AppError('You do not have permission to perform this action', 401));
    }
    next();
}
}
exports.forgotPassword = catchAsync(async(req,res,next) =>{
    // 1 get the user
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return next(new AppError('User not found',401));
    }
    // 2 generating random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});

    //sending to the user email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `forgot password? submit a patch request with your new password & password confirm to ${resetUrl}`;
    
   try{
    // await sendEmail({
    //     email : user.email,
    //     subject : 'your password token.only valid for 10 mins',
    //     message: message

    // });

    await new Email(user,resetUrl).sendPasswordRest();
    res.status(200).json({
        status : "success",
        message : 'token sent to email!'
    });}catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave : false});
        next(new AppError('Error occurred while sending the email! try again later! ',500));

    }
}
);

exports.resetPassword = catchAsync(async(req,res,next) =>{
   //1 get the user according to the token
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({passwordResetToken : hashedToken,passwordResetExpires:{$gt :Date.now()}});

   if(!user){
    return  next(new AppError('Invalid or Expired Token',400));
   }
  

   //2 if the token isn't expired & there is a user, set the new password

    user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();

   //3 update changedAt property
   
   
   //4 log in the user, send JWT

   CreateSendToken(user,201,res);
    
}
);

exports.updatePassword = catchAsync(async(req,res,next) =>{
   //1 get the user from the collection
  
   const user = await User.findById(req.user.id).select('+password');
 

   //2 check if posted password is correct
   if(!await (user.correctPassword(req.body.passwordCurrent,user.password))){
    return  next(new AppError('Invalid current password',401));
   }

   //3 update the password
  user.password =req.body.password;
  user.passwordConfirm = req.user.passwordConfirm;
   

   //4 log in the user, send JWT

  CreateSendToken(user,201,res);
    
}
);