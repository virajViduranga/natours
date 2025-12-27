const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');




const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// TEMPORARY checkout booking route
router.get(
  '/checkout-session/:tourId',
  bookingController.createBookingCheckout
);



 router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);




 module.exports = router;