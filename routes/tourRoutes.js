const express = require('express');
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
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'leadGuide'),
    tourController.deleteTour
  );

//nested routes
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReviews
//   );

module.exports = router;
