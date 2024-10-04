const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get all the tour data from the collection

  const tours = await Tour.find();

  // 2) Build the template

  // 3) Render the template using the tour data

  res
    .status(200)
    .render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    fields: 'review rating user', // Corrected 'fields' to 'select'
  });

  if (!tour) {
    return next(
      new AppError('There is no tour  with that name', 404)
    );
  }

  res
    .status(200)
    .render('tour', { tour, title: tour.name });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', { title: 'Login' });
});

exports.getUserAccount = catchAsync(
  async (req, res, next) => {
    res
      .status(200)
      .render('account', { title: 'Your Account' });
  }
);
