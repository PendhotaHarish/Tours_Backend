const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globaLErrorHandler = require('./controllers/errorControllers');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// //serving static files
// app.use(express.static(path.join(__dirname, 'public')));

//global middlewares
//security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests form this IP. please try again after 1 hour',
});
app.use('/api', limiter);

//data sanitization of nosql query injection
app.use(mongoSanitize());
//data sanitization of xss
app.use(xss());

//preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//reading body data in to req.body
app.use(express.json({ limit: '10kb' }));

// //serving static files
// app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('hello from middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The forest hiker',
//     user: 'Harish',
//   });
// });

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  // status: 'fail',
  // message: `can't find ${req.originalUrl} in the server!`,
  // const err = new Error(`can't find ${req.originalUrl} in the server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} in the server!`, 404));
});

app.use(globaLErrorHandler);
module.exports = app;

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// };
// const getTour = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);

//   if (id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'this id is not present',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };
// const createTour = (req, res) => {
//   // console.log(req.body);
//   // res.send('done');
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

// const updateTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'this id is not there...',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<update data here...>',
//     },
//   });
// };

// const deleteTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'this id is not there...',
//     });
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//   });
// };
// const getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//   });
// };
// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//   });
// };
// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//   });
// };
// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Internal server error',
//   });
// };

// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(createTour);

// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post(createUser);

// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);

//   app.route('/api/v1/tours').get(getAllTours).post(createTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);

// app
//   .route('/api/v1/Users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// app.get('/api/v1/tours', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// app.get('/api/v1/tours/:id', (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);

//   if (id > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'this id is not present',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

// app.post('/api/v1/tours', (req, res) => {
//   // console.log(req.body);
//   // res.send('done');
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// });

// app.patch('/api/v1/tours/:id', (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'this id is not there...',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<update data here...>',
//     },
//   });
// });

// app.delete('/api/v1/tours/:id', (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'this id is not there...',
//     });
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'hello from server side...', app: 'hello' });
// });

// app.post('/', (req, res) => {
//   res.send('you change data here');
// });

// const port = 3000;
// app.listen(port, () => {
//   console.log(`server running on the port number ${port}....`);
// });
