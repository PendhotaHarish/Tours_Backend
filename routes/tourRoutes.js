const express = require('express');
const path = require('path');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewControllers');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
//param middleware
// router.param('id', tourController.checkId);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-five-cheap')
  .get(tourController.aliasingTopTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'leadGuide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithIn);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'leadGuide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'leadGuide'),
    tourController.uploadTourImages,
    tourController.resizeToursImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leadGuide'),
    tourController.deleteTour
  );

router.get('/uploads/:imageName', (req, res) => {
  const imageName = req.params.imageName;

  // Sanitize the input to prevent directory traversal attacks
  const sanitizedImageName = path.basename(imageName);

  // Resolve the absolute path of the image
  const imagePath = path.resolve(
    __dirname,
    './../public/img/tours/',
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

//nested routes
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReviews
//   );

module.exports = router;
