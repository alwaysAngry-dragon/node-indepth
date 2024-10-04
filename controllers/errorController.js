// error handling middleware function

const AppError = require('./../utils/appError');

const serErrorDev = (err, res, req) => {
  console.log('🚫🚫🚫🚫🚫');
  console.log(process.env.NODE_ENV);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      err,
    });
  } else {
    console.log('++++++++++++++++' + err.message);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    console.log('❌❌❌❌❌');
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('❌❌❌❌❌');
    console.log(err.message);
    res.status(500).json({
      status: 'error',
      message:
        'Something went wrong, please try again later.',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate value  : ${err.keyValue.name}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = err.message;
  console.log('❌❌❌❌❌');
  console.log(err.message);
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  message = 'Login Filed || Please Login';
  return new AppError(message, 401);
};

module.exports = (err, req, res, next) => {
  console.log(err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // console.log(err);

  if (process.env.NODE_ENV === 'development') {
    serErrorDev(err, res, req);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (
      err.name === 'JsonWebTokenError' ||
      err.name === 'TokenExpiredError'
    ) {
      error = handleJWTError(err);
    }
    sendErrorProduction(error, res);
  }
};
