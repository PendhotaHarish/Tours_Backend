const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NOD_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  //   const newUsers = await User.create({
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //     passwordConfirm: req.body.passwordConfirm,
  //   });
  const newUsers = await User.create(req.body);
  createSendToken(newUsers, 201, res);
  // const token = signToken(newUsers._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUsers,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email and password', 401));
  }
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //check token exits or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //verify token
  if (!token) {
    return next(new AppError('You have not login. please login', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //user deleted account
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("user doesn't belong to this token anymore", 401));
  }

  // freshUser.changePasswordAfter(decoded.iat);
  //check if user changed password
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('user has changed password. please login again', 401)
    );
  }

  //grant access to protect router
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you don't have access to this data", 403));
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('The user not found in data', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  console.log(resetURL);
  const message = `forgot password then please patch the requested by confirm password to ${resetURL}.\n if you not forgot password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token will valid 10 mins',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpire = undefined),
      await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was error in sending the email. please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('token is invalid or expire', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('oldPassword incorrect', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
