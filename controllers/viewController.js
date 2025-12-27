const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getOverview = catchAsync( async (req,res,next)=>{
    //1 get tour data
    const tours = await Tour.find();
          res.status(200).render('overview',{
            title:'All Tours',
            tours
          });
     });

exports.getTourDetails = catchAsync( async (req,res,next)=>{
        
        const tour = await Tour.findOne({ slug: req.params.slug })
  .populate({
    path: 'guides',
    select: 'name photo role'
  })
  .populate({
    path: 'reviews',
    select: 'review rating',
    populate: {
      path: 'user',
      select: 'name photo'
    }
  });
  if(!tour){
    return next(new AppError('Tour name is not found!',404));
  }
          res.status(200).render('tour',{
               title:`${tour.name}`,
               tour
          });
     });

exports.getLogin = (req,res)=>{
 
      res.status(200).render('login',{
            title:'Login',
          });
     

 }
 exports.getAccount = (req,res)=>{
  res.status(200).render('account',{
            title:'Account',
          });

 }

 exports.getMyTours = catchAsync( async (req,res,next)=>{

    const bookings = await Booking.find({user : req.user.id});

    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({_id:{$in : tourIds}});

    res.status(200).render('overview',{
      title: 'My Tours',
      tours
    });

 });