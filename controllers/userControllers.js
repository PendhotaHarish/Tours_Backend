const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Factor = require('./../controllers/handlerFactor');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for update password. please use /updatePassword',
        400
      )
    );
  }
  const filterBody = filterObj(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const deleteUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getUser = Factor.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
exports.getAllUsers = Factor.getAll(User);
exports.updateUser = Factor.updateOne(User);
exports.deleteUser = Factor.deleteOne(User);
