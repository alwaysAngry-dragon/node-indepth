const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

//
// exports.checkBody = (req, res, next) => {
//   const { name, duration } = req.body;

//   if (!name || !duration) {
//     return res.status(400).json({
//       status: 'fail',
//       message:
//         'Missing required fields: name or duration',
//     });
//   }
//   next();
// };
//

exports.aliasTopFiveTours = async (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields =
    'name,price,ratingsAverae,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //   console.log(req.requestTime);
  //   console.log(new Date(req.requestTime).toLocaleString());

  //  Build the query string
  // Model.find returns a query
  let features = new APIFeatures(Tour.find(), req.query);

  features.filter().sorting().fieldLimiting().pagination();

  // Execute the query
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours },
  });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = catchAsync(async (req, res, next) => {
  console.log(req.body);

  // create a new document on the model/collectin
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('Tour not found', 404)); // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  //
//   }

//   console.log('XXXXXXX');
//   res.status(204).json({ status: 'success', data: null });
// });

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(
  async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverae: { $gte: 4.3 },
        },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverae' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  }
);

exports.getMonthlyPlan = catchAsync(
  async (req, res, next) => {
    const year = req.params.year * 1;

    if (year < 1000) {
      throw new Error('Invalid year: ' + year);
    }

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
    ]);

    let length = plan.length;

    res.status(200).json({
      status: 'success',
      data: { length, plan: plan },
    });
  }
);

exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius =
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // Radius in kilometers

    if (!lat || !lng)
      return next(
        new AppError('Please provide a location', 400)
      );

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius],
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  }
);
