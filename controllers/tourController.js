const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');






const multerStorage = multer.memoryStorage();

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

exports.uploadTourImage = upload.fields(
   [ {name: 'imageCover',maxCount:1},
    {name:'images', maxCount : 3}

   ]
)
exports.resizeTourPhoto = catchAsync(async(req,res,next)=>{
    if(!req.files.imageCover || !req.files.images) return next();

     const imageCoverfilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${imageCoverfilename}`);
    req.body.imageCover = imageCoverfilename;


    req.body.images = [];
    await Promise.all(
    req.files.images.array.map(async(el,i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

        await sharp(el.buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${filename}`);

    req.body.images.push(filename);

    }));

    
    next();

});

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) ;

// exports.checkId = (req, res,next,val) =>{
//     if(req.params.id * 1 > tours.length){
//        return res.status(404).json({
//             status : 'failed',
//             message : "Invalid id"
//         })
//     }
//     next();
// }

// exports.checkBody = (req, res,next) =>{
//     if( !req.body.name || !req.body.price){
//        return res.status(400).json({
//             status : 'fail',
//             message : "Missing body information"
//         })
//     }
//     next();
// }




exports.aliasTours = (req,res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,summary,difficulty';
    next();
}
// exports.getAllTours = catchAsync(async (req , res, next) =>{
// //    try{

//     // const queryObj = qs.parse(req.query);

//     // const excludeFields = ['page','sort', 'limit', 'fields'];
//     // excludeFields.forEach(el => delete queryObj[el]);


//     // // //advance filter
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

//     // let query =  Tour.find(JSON.parse(queryStr));
   
//     //sorting
//     // if(req.query.sort){
//     //     const sortBy = req.query.sort.split(',').join(' ');
//     //     query = query.sort(sortBy);

//     // }else{
//     //     query = query.sort('-createdAt');
//     // }

//     //limiting fields
//     // if(req.query.fields){
//     //     const fields = req.query.fields.split(',').join(' ');
//     //     query = query.select(fields);

//     // }else{
//     //     query = query.select('-__v');
//     // }

//     //pagination
//     // const page = req.query.page *1 || 1;
//     // const limit = req.query.limit *1 || 100;
//     // const skip = (page -1) * limit;
//     // query = query.skip(skip).limit(limit);
//     // if(req.query.page){
//     //    const numTours = await Tour.countDocuments();
//     //     if(skip >= numTours) throw new Error('This page does not exist');
//     // }

//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

//     const tours = await features.query;

//     res.json({
//         status : 'success',
//         data :{
//             tours : tours
//         }
//     });
// // }catch(err){
// //         res.status(400).json({
// //             status : "fail",
// //             message : err
// //         });
// //     }
   
// } );


exports.getToursById = factory.getOne(Tour, {path : 'reviews'});
exports.getAllTours = factory.getAll(Tour);


exports.createNewTour = factory.createOne(Tour);

// exports.createNewTour = catchAsync(async (req,res,next) =>{
    // const newId = tours[tours.length -1].id + 1;

    // const newTours = Object.assign({id : newId} , req.body);

    // tours.push(newTours);

    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err =>{
        
    // });
   
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//             status : "success",
//             data :{
//                 tour : newTour
//             }
            
//         });
  
// });



exports.updateTours = factory.updateOne(Tour);


exports.deleteTour = factory.deleteOne(Tour);


// exports.deleteTour = catchAsync(async (req,res,next) =>{
    
//      const tour = await Tour.findByIdAndDelete(req.params.id);
//     if(!tour){
//     return next(new AppError('No tour found with that Id', 404));
//     }

//  res.status(204).json({
//         status : 'success',
//         data : null
//     });

// });

exports.getTourStats = catchAsync(async (req,res,next) =>{
    
        const stats = await Tour.aggregate([
            {$match :{
                ratingsAverage : {$gte : 4.5}
            }},
            {$group :{
                _id : null,
                //_id : '$difficulty',
                numOfTours : { $sum : 1 },
                avgRatings : {$avg : '$ratingsAverage'},
                numOfRatings : {$sum : '$ratingsQuantity'},
                avgPrice : {$avg : '$price'},
                minPrice : {$min : '$price'},
                maxPrice : {$max : '$price'},

            }}
        ]);

        res.status(200).json({
            status : "success",
            data : {
                stats
            }
        });

    
})

exports.getMonthlyPlan = catchAsync(async (req,res,next) =>{
   

        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {$unwind : '$startDates'},
            {$match :
                {startDates : {
                    $gte : new Date(`${year}-01-01`),
                    $lte : new Date(`${year}-12-31`)
                }}
            },
            {
                $group :{
                    _id : { $month :'$startDates'},
                    numOfToursStarts : {$sum : 1},
                    tours : {$push : '$name'}
                }
            },
            {$addFields :{month : '$_id'}},
             {
                $project : {
                    _id : 0
                }
            },
            {
                $sort : { numOfToursStarts : -1}
            }
        ]);

        res.status(200).json({
            status : "success",
            data : {
                plan
            }
        });

   
} );

exports.getToursWithin = catchAsync(async (req,res,next) =>{

    const {distance , latlng,unit} = req.params;
    const [lat, lng] = latlng.split(',');
    if(!lat || !lng){
        next(new AppError('please provide latitude and longitude in lat,lng format',400));
    }

    const radius = unit ==='mi' ? distance/3963.2 : distance/6378.1;


    const tours = await Tour.find({
        startLocation :{
            $geoWithin :{$centerSphere :[[lng,lat], radius]}
        }
    });


    res.status(200).json({
            status : "success",
            data : {
                data: tours
            }
        });

} );

exports.getDistances =  catchAsync(async (req,res,next) =>{

     const { latlng,unit} = req.params;
    const [lat, lng] = latlng.split(',');
    if(!lat || !lng){
        next(new AppError('please provide latitude and longitude in lat,lng format',400));
    }

    const multiplier = unit ==='mi' ? 0.000621371 : 0.001;
    const distances = await Tour.aggregate([
        {$geoNear:{
            near :{
                type:'Point',
                coordinates :[lng  *1,lat *1]
            },
            distanceField : 'distance',
            distanceMultiplier : multiplier
        }},
       { $project :
         { distance:1, name:1 }
        }

    ]);

     res.status(200).json({
            status : "success",
            data : {
                data: distances
            }
        });

});
