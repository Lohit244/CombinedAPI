class apiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const excludelist = ["page", "limit", "sort", "fields"];
    const queryString1 = { ...this.queryString };
    excludelist.forEach((el) => delete queryString1[el]);
    let queryStr = JSON.stringify(queryString1);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * 10;
    this.query = this.query.skip(skip).limit(10);
    return this;
  }
}
module.exports = apiFeatures;
