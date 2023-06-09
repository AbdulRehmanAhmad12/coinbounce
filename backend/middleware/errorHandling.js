const { ValidationError } = require("joi");

const errorHandler = (err, req, res, next) => {
  //default error
  let status = 500;
  let data = {
    message: "Internal Server Error",
  };

  if (err instanceof ValidationError) {
    status = 401;
    data = err.message;
    return res.status(status).json(data);
  }

  if (err.status) {
    status = err.status;
  }

  if (err.message) {
    data = err.message;
  }

  return res.status(status).json(data);
};

module.exports = errorHandler;