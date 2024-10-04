const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const viewRouter = require(`./routes/viewRoutes`);
const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utils/appError');

const app = express();

// set the TEMPLATE engine

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
console.log('🐧🐧🐧' + process.env.NODE_ENV);

// app.use(helmet()); // secure http headers middleware

// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy-Report-Only',
//     'default-src *; font-src *; img-src *; script-src *; style-src *; frame-src *;script-src-elem *;'
//   );
//   next();
// });
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    'default-src *; script-src *; style-src *; img-src *; connect-src *; font-src *; frame-src *; worker-src *; object-src *; media-src *; frame-ancestors *;'
  );
  next();
});

// Use Helmet to set CSP headers

// Use Helmet to set CSP headers

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limit, 100 requrest from same ip in one hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message:
    'Too many requests from this IP, please try again in an hour',
});

// apply rate limit middleware
app.use('/api', limiter);

// middleware to parse JSON request bodies
app.use(express.json({ limit: '10kb' }));

// middleware to parse cookies
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization agains XSS
app.use(xss());

// prevent parameter pollution attacks
app.use(hpp());

// serve static files from the public directory
app.use(express.static(`${__dirname}/public/`));

// Middleware to  add request times to the request object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// 2) ROUTES

/* 
app.get('/api/v1/tours', getAllTours);
// add ? to make a paramater optional '/api/v1/tours/:id?'
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);
*/

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // tour router is a middleware
app.use('/api/v1/users', userRouter); // user router is a middleware
app.use('/api/v1/reviews', reviewRouter); // review router is a middleware

// handle unhandled routes
app.all('*', (req, res, next) => {
  const msg =
    'Your are errored on rotue: ' + req.originalUrl;
  const statusCode = 404;
  next(new AppError(msg, statusCode));
});

// Global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
