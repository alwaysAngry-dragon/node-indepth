const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async function (
  req,
  res,
  next
) {
  let filter = {};

  if (req.params.tourId) {
    filter = { tour: req.parmas.tourId };
  }

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

// get all review for a particular user

exports.getAllUserReviews = catchAsync(async function (
  req,
  res,
  next
) {
  const reviews = await Review.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

// get all reviews for a particular tour

exports.getAllTourReviews = catchAsync(async function (
  req,
  res,
  next
) {
  const reviews = await Review.find({
    tour: req.params.tourId,
  });
  res.status(200).json({
    status: 'success tour reviews',
    results: reviews.length,
    data: { reviews },
  });
});

// create a new review for a particular tour

exports.createReview = catchAsync(async function (
  req,
  res,
  next
) {
  // get the user id from the token
  // get the tourId from the parameter

  const newReview = await Review.create({
    user: req.user._id,
    tour: req.params.tourId,
    review: req.body.review,
    rating: req.body.rating,
  });

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

exports.updateReview = catchAsync(
  async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!review) {
      return next(
        new AppError('No review found with that ID', 404)
      );
    }

    // calling a static method on the model
    Review.calcAverageRating(review.tour);

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  }
);

exports.deleteReview = factory.deleteOne(Review);
