const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');


// const multerStorage = multer.diskStorage({
//     destination: (req,file,cb)=>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();//uda vidihata ek paratma disk ekt save krna eka risky

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image!, please upload only images',400),false);
    }
}
const upload = multer({
    storage : multerStorage,
    fileFilter: multerFilter
});

exports.resizeUserPhoto = catchAsync(async(req,res,next)=>{
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`);
    next();

});
exports.uploadUserPhoto = upload.single('public/img/users');

const filterObj = (obj,...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el =>{
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        } 
});
return newObj;
    }
  


exports.updateMe = catchAsync( async (req,res,next) =>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('You can not change password here!Use updatepassword url'));
    }
   const filteredBody = filterObj(req.body,'name','email');
   if(req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new : true,
            runValidators : true
        }
    );

    res.status(200).json({
        status : 'success',
        data :{
           user :updatedUser
        }
    });
});

exports.deleteMe = catchAsync( async (req,res,next) =>{
   
   await User.findByIdAndUpdate(
        req.user.id,
        {active : false}
    );

    res.status(204).json({
        status : 'success',
        data :{
           
        }
    });
});

exports.createNewUser = (req,res) => {
    res.status(500).json({
        status : "Please use sign up for create a user",
        
    })
}
exports.getMe = (req,res,next) =>{
 req.params.id = req.user.id;
 next();
}

exports.getAllUsers = factory.getAll(User);
exports.getUsersById = factory.getOne(User);

//Don't update password with this function
exports.updateUsers = factory.updateOne(User);

exports.deleteUsers = factory.deleteOne(User);