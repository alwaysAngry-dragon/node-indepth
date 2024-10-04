const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review field is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating field is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User field is required'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Tour field is required'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create index, each combination of tour and user hase to be unique
// i.e one user can have one review per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// query middleware to popupate user and tour references

reviewSchema.pre(/^find/, function (next) {
  console.log(
    '---- The review find query middleware -----'
  );

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  next();
});

// STATIC methods are called on the model

reviewSchema.statics.calcAverageRating = async function (
  tourID
) {
  // 'this' points to the current model

  console.log('calculating average rating on tour model');

  const stats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourID, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating.toFixed(2),
  });
};

// Document middleware

reviewSchema.post('save', function () {
  // 'this' points to the current document i.e a review document
  this.constructor.calcAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// 8777061439
