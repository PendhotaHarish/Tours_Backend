const express = require('express');
const path = require('path');
const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.get('/getMe', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadPhotoUser,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get('/userImage/:imageName', (req, res) => {
  const imageName = req.params.imageName;

  // Sanitize the input to prevent directory traversal attacks
  const sanitizedImageName = path.basename(imageName);

  // Resolve the absolute path of the image
  const imagePath = path.resolve(
    __dirname,
    './../public/img/users/',
    sanitizedImageName
  );

  // Set the correct Content-Type based on the file extension
  res.type(path.extname(imagePath));

  // Send the file
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
});

module.exports = router;
