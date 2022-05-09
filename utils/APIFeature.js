class APIFeature {
  constructor(query, queryString) {
    // query is query object that goes to the DB => Usr.find()
    // queryString is object that express made from the string that client has entered for querying
    //  => {name: 'example', price: {$gt: 1000 }}

    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // queryString can be like => {name: 'example', price: { gt: 1000 }, sort: '+price,-createdAt', fields: 'name,email'}
    const queryObj = { ...this.queryString };
    // to remove 'sort', 'limit', 'page', 'fields' we made an seprate object to manipulate main queryString and remove those fields
    const exclude = ['sort', 'limit', 'page', 'fields'];
    exclude.forEach(el => delete queryObj[el]);
    // queryObj is like: {name: 'example', price: { gt: 1000 }}
    // point: the mein queryString didn't change because we manipulate clone object

    // we should add $ charecter to gt|gte|lt|lte, because it work this way
    const queryStr = JSON.stringify(queryObj);
    queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    // queryStr like this: '{name: 'example', price: { $gt: 1000 }}'
    // it's ready to query
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      // now sort is: price,createdAt
      // we wanna turn it to: price createdAt
      var sortBy = this.queryString.sort.split(',').join(' ');
    } else {
      // default sort
      var sortBy = 'createdAt';
    }

    this.query = this.query.sort(sortBy);

    return this;
  }

  paginate() {
    if (this.queryString.page) {
      const page = Number(this.queryString.page) || 1;
      const limit = Number(this.queryString.limit) || 12;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }

  limit() {
    if (this.queryString.limit) {
      const limit = Number(this.queryString.limit);
      this.query = this.query.limit(limit);
    }

    return this;
  }

  fields() {
    if (this.queryString.fields) {
      // fields: name,email
      // we wanna make it: name email
      var fields = this.queryString.fields.split(',').join(' ');
    } else {
      var fields = '-__v';
    }
    this.query = this.query.select(fields);

    return this;
  }
}

module.exports = APIFeature;
