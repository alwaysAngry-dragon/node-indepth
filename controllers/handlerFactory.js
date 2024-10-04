const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(
      req.params.id
    );

    if (!doc) {
      return next(new AppError('Document not found', 404)); // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  // 404 Not Found error handling in catchAsync middleware  //
    }

    console.log('XXXXXXX');
    res.status(204).json({ status: 'success', data: null });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
