const express = require('express');
const tourController = require('../controllers/tourController');
const reviewRoute = require('./reviewRoute');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// router.param('id' , tourController.checkId);
router.route('/top-cheap').get(tourController.aliasTours, tourController.getAllTours);


router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect,
      authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);
router.use('/:tourId/reviews', reviewRoute);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

router.route('/')
    .get(tourController.getAllTours)
    .post(authController.protect,authController.restrictTo('admin', 'lead-guide'), tourController.createNewTour);

    router.route('/:id')
    .get(tourController.getToursById)
    .patch(authController.protect,
      authController.restrictTo('admin','lead-guide'),
      tourController.uploadTourImage,
      tourController.resizeTourPhoto,
      tourController.updateTours)
    .delete(authController.protect,
      authController.restrictTo('admin','lead-guide'),tourController.deleteTour);


      router.route('/:tourId/reviews')
      .post(authController.protect,
        authController.restrictTo('user'),
        reviewController.createNewReview
      );
    module.exports = router;
