// only logged in users can comment
const express = require('express');

const {
  protect,
} = require('./../controllers/authController');

const {
  createReview,
  getAllTourReviews,
  getAllUserReviews,
  getAllReviews,
  deleteReview,
  updateReview,
} = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

// get all reviews
// post a review

router
  .route('/')
  .get(getAllReviews)
  .post(protect, createReview);

router
  .route('/userReviews')
  .get(protect, getAllUserReviews);

router.get('/:tourId', protect, getAllTourReviews);

router
  .route('/:id')
  .delete(protect, deleteReview)
  .patch(protect, updateReview);

module.exports = router;
