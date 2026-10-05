const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Runs after express-validator chains; responds 400 with the first error message. */
function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest(errors[0].message, errors));
}

/** Strictly validates that req.params[name] is a valid MongoDB ObjectId. */
function validateObjectId(name = 'id') {
  return (req, _res, next) => {
    const value = req.params[name];
    if (!mongoose.Types.ObjectId.isValid(value) || String(new mongoose.Types.ObjectId(value)) !== value) {
      return next(ApiError.badRequest('Invalid ID'));
    }
    next();
  };
}

module.exports = { validate, validateObjectId };
