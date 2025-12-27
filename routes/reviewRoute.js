const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');


const router = express.Router({mergeParams : true});


router.use(authController.protect);
router.route('/')
    .get(reviewController.getAllReviews)
    .post( authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createNewReview);

    // router.route('/:id')
    // .get(tourController.getToursById)
    // .patch(tourController.updateTours)
    // .delete(authController.protect,
    //   authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

    router.route('/:id').delete(authController.restrictTo('user','admin'),reviewController.deleteReview)
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user','admin'),reviewController.updateReview);
    module.exports = router;