const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = function (id) {
  const token = jwt.sign(
    { id: id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  return token;
};

const createSendToken = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 24 * 60
    ),
    httpOnly: true, // browser cannot modify the cookie, not even destroy it
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true; // sent on secure connections only i.e https
  }

  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async function (
  req,
  res,
  next
) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  // delete newUser.password;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // 1) Check if the email and password exists

  if (!email || !password) {
    return next(
      new AppError('please provide email and password', 400)
    );
  }

  // 2) Check if the user exists and password is correct
  const user = await User.findOne({ email }).select(
    '+password'
  );

  // match the password against the encrypted password

  let correct;
  if (user) {
    correct = await user.correctPassword(
      password,
      user.password
    );
  }

  if (!user || !correct) {
    return next(
      new AppError('Invalid email or password', 401)
    );
  }

  user.password = undefined;

  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // // 3) if everything is ok, send the token to the client
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user,
  //   },
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  // 2) Validate the token, jwt.verify will throw and error if the verify is failed

  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) Check if the user still exists

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(new AppError('User no longer exists', 401));
  }

  // 4) Check if user changed password after the JWT was issued
  // come up logic for this => the token cannot be issued before the passowrd is changed

  req.user = currentUser;

  res.locals.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return catchAsync(async function (req, res, next) {
    // get the logged in user role
    // if role is in allowed roles then proceed else reject the request

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to access this route',
          403
        )
      );
    }

    next();
  });
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    // 1)get user based on posted email
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return next(
        new AppError('There is not user with email', 404)
      );
    }

    // 2)generate the random token and as email

    const resetToken = user.createPasswordResetToken();

    console.log('⛔' + resetToken);

    await user.save({ validateBeforeSave: false });

    // 3)send the reset token via email

    console.log(req.get('host'));
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    res.status(200).json({
      status: 'success',
      message:
        'Click on url to reset password valid for 10min, please igonre is not required',
      resetURL,
    });
  }
);

exports.resetPassword = catchAsync(async function (
  req,
  res,
  next
) {
  console.log('⛔' + req.params.token);

  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('⛔' + hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    return next(
      new AppError('Token is invalid or expired', 400)
    );
  }

  // 3) update the user password changedPasswordAt property for the user

  console.log(user);
  user.password = req.body.password;
  user.email = user.email;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  // 4) log the user in , send the JWT

  const token = signToken(user._id);

  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.updatePassord = catchAsync(async function (
  req,
  res,
  next
) {
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  const passwordConfirm = req.body.passwordConfirm;

  if (!password || !newPassword || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide a existing password',
        400
      )
    );
  }

  // 1) get the user form the collection

  const user = await User.findById(req.user._id).select(
    '+password'
  );

  // 2) check if the given password is correct

  const correct = await user.correctPassword(
    password,
    user.password
  );

  if (!correct) {
    return next(new AppError('Invalid password', 401));
  }

  // 3) updat the password

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save(); // execute the query
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: { user: user },
  });

  // 4) log the user in, sent JWT token
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    // if no cookie then no loggen in user
    return next();
  }

  // verify the token
  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user is in the database

  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next();
  }

  // there is a logged in user
  // add the user info into the template
  res.locals.user = currentUser;

  console.log('YAY !!!!! logged in');

  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
