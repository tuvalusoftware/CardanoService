const errorConstants = require('./errorConstants');

class CustomError extends Error {
  constructor(code) {
    super();
    this.error_code = code;
    this.message = errorConstants[code] || 'Something went wrong';
  }
}

exports.CustomError = CustomError;