class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let queryObj = Object.assign({}, this.queryString);

    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
    ];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
        return '$' + match;
      })
    );

    // console.log(queryStr);

    this.query = this.query.find(queryStr);
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // default sort
    }
    return this;
  }

  fieldLimiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');

      this.query = this.query.select(fields); // only these fields will be returned
    } else {
      this.query = this.query.select('-__v'); // all fields except __v will be returned
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 ?? 1;
    const limit = this.queryString.limit * 1 ?? 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error('This page does not exists');
    //   }
    // }
  }
}

module.exports = APIFeatures;
