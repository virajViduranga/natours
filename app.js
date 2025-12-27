const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');




const app = express();
const toursRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');
const reviewsRoute = require('./routes/reviewRoute');
const viewsRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoute');


const AppError = require('./utils/appError');

const globalErrorHandler = require ('./controllers/errorConterller');
 
const limiter = rateLimit({
 max: 100,
 windowMs : 60 * 60 * 1000,
 message : 'Too many requests.Please try again in one hour'
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));


if (process.env.NODE_ENV === 'production') {
  const helmet = require('helmet');
  app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://cdnjs.cloudflare.com'
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com'
      ],

      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com'
      ],

      imgSrc: [
        "'self'",
        'data:',
        'https://*.mapbox.com'
      ],

      connectSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://cdnjs.cloudflare.com'
      ],

      workerSrc: [
        "'self'",
        'blob:'
      ]
    }
  })
);
 
}

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],

//       scriptSrc: [
//         "'self'",
//         'https://api.mapbox.com',
//         'https://cdnjs.cloudflare.com'
//       ],

//       styleSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         'https://api.mapbox.com',
//         'https://fonts.googleapis.com'
//       ],

//       fontSrc: [
//         "'self'",
//         'https://fonts.gstatic.com'
//       ],

//       imgSrc: [
//         "'self'",
//         'data:',
//         'https://*.mapbox.com'
//       ],

//       connectSrc: [
//         "'self'",
//         'https://api.mapbox.com',
//         'https://cdnjs.cloudflare.com'
//       ],

//       workerSrc: [
//         "'self'",
//         'blob:'
//       ]
//     }
//   })
// );

app.use('/api' , limiter);


// Body parser, put data from body to req.body
app.use(express.json({limit : '10kb'}));
app.use(cookieParser());

//data sanitization
// app.use(mongoSanitize());
// app.use(xss()); //html ekka ena js script clean krnna
app.use(hpp({
     whitelist : ['duration','price','ratingsQuantity', 'ratingsAverage','maxGroupSize']
}));

app.use(express.static(`${__dirname}/public`));

//undefined routs


// app.get('/api/v1/tours' , getAllTours);
// app.get('/api/v1/tours/:id' , getToursById);
// app.post('/api/v1/tours' , createNewTour);
// app.patch('/api/v1/tours/:id', updateTours );
// app.delete('/api/v1/tours/:id', deleteTour);
     
     app.use('/', viewsRouter);
     app.use('/api/v1/tours', toursRouter);
     app.use('/api/v1/users', usersRouter);
     app.use('/api/v1/reviews', reviewsRoute);
     app.use('/api/v1/bookings', bookingRouter);


     app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});


     app.use(globalErrorHandler);

    module.exports = app;