const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        50,
        'A tour  must not exceed 50 characters',
      ],
      minlength: [
        10,
        'A tour  must have at least 10 characters',
      ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A tour must have a maximum group size',
      ],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either: easy, medium or difficult',
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // this value of 'this' wont exists for update operations
        },
        message: 'Price Discount must be lower than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this porperty wont be given in the output
    },
    startDates: [Date],
    slug: {
      type: String,
      default: '',
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      // this is an embedded geo location document
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // embedding documents, each item in the array will be a user(guide) guide
    guides: [
      // this is referencing
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // required for geo spatial queries

// virtual properties do not persist in the database
// virtual properties cannot be used in query searches
// these are derived when the document is fetched from the database
tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(2) * 1;
});

// virtual populate, to get all reviews for a particular tour
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
  justOne: false, // if true, it will return only one document from the reviews array
});

// DOCUMENT MIDDLEWARE
//
// pre save - means it will be called before a document is saved or create in the database
// but wont run for insert many documents, update commands
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function (next) {
  console.log('saving document in database');
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (id) => await User.findById(id)
//   );

//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// pre update
// Pre-findOneAndUpdate middleware to calculate and set priceInEUR
tourSchema.pre('findOneAndUpdate', function (next) {
  // console.log(this.getUpdate());
  console.log('...document updated 👌');
  next();
});

tourSchema.post('save', function () {
  console.log('document saved into the database');
});

// QUERY MIDDLEWARE
// before the query is executed
tourSchema.pre('find', function (next) {
  console.log('Tour Query middleware: pre find 👽👽');
  this.start = Date.now();
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  console.log('********Populating Guides');

  this.populate({
    path: 'guides', // will poputate this field
    select: '-__v -role', // fileds can be also excluded
  });

  next();
});

// after the query is executed and the document returned
tourSchema.post('find', function (docs, next) {
  console.log(
    'Tour Query middleware: post find 👽👽,  Query executed in: ' +
      (Date.now() - this.start) +
      ' - ms'
  );
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE
// befor the aggregation is executed

tourSchema.pre('aggregate', function (next) {
  // the pipeline is an array of objects so add a step to the beginning of the array
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });

  next();
});

// this will create a colection(if not already present) Tour for in the Database
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// // a document to be added to the collection Tour
// const testTour = new Tour({
//   name: 'Himalayas',
//   rating: 4.7,
//   price: 2950,
// });

// // this will save the document to the collection Tour

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.error('ERROR ✨ ' + err.message);
//   });

// tours -> reviews (1: many, [parent referencing])
// users -> reviews( 1: many, [parent referencing])
// tours -> locations (few:few, [embedding])
// tours -> users(tour guides) (few:few, [child referencing])
// booking(tourId, userID)
