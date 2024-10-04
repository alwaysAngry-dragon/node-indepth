const express = require('express');

const reviewRouter = require('./../routes/reviewRoutes');
const {
  createReview,
} = require('./../controllers/reviewController');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
  aliasTopFiveTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
} = require('./../controllers/tourController');

const {
  protect,
  restrictTo,
} = require('./../controllers/authController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter); // sending this path to another router

// Middleware to log the tour ID before processing the request
// This middleware will be executed only when the '/:id' parameter is present in the URL
// router.param('id', checkId);

router
  .route('/')
  .get(getAllTours)
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    createTour
  );

router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, getMonthlyPlan);

router
  .route('/top-5-tours')
  .get(aliasTopFiveTours, getAllTours);

router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
  )
  .get(getToursWithin);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

module.exports = router;
