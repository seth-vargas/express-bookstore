const { validate } = require("jsonschema");
const bookSchema = require("../schemas/book.json");
const ExpressError = require("../expressError");

const validateJSON = (req, res, next) => {
  const result = validate(req.body, bookSchema);
  if (!result.valid) {
    const listOfErrors = result.errors.map((error) => error.stack);
    return next(new ExpressError(listOfErrors, 400))
  }
  return next()
};

module.exports = validateJSON;
