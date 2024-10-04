const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

function filteredBody(obj, ...allowedFields) {
  const filteredObj = {};
  allowedFields.forEach((item) => {
    if (obj.hasOwnProperty(item)) {
      filteredObj[item] = obj[item];
    }
  });
  return filteredObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'Route not defined use /signup instead to create a new user',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.deleteUser = (req, res) => {
  // Only andmins can permenantely delete users
  res.status(500).json({
    status: 'error',
    message: 'Route not defined',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user POSTs password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Update user document

  const filteredObj = filteredBody(
    req.body,
    'name',
    'email'
  );

  // console.log(filteredObj);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    filteredObj,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'User data updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
