const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate filled value: ${value} please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token please login again', 401);
const handleExpireError = () => new AppError('Token expire login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error :', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //console.log(err);
    let error = {
      ...err,
      name: err.name,
      message: err.message,
      path: err.path,
      value: err.value,
      code: err.code,
    };
    console.log(error.name);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    console.log(error.code);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleExpireError(error);
    sendErrorProd(error, res);
  }
};
