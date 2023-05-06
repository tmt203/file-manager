// MODULES
const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const csrf = require('@dr.pogodin/csurf');
const cors = require('cors');

const AppError = require('./utils/appError');
const helpers = require('./utils/helpers');
const globalErrorHandler = require('./controllers/errorController');
const viewRoutes = require('./routes/viewRoutes');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const testRoutes = require('./routes/testRoutes');

// INIT
const app = express();

// MIDDLEWARES

// Configure morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('tiny'));
}

// Cors
app.use(cors({
  origin: 'localhost:3000',
  exposedHeaders: ['X-CSRF-Token']
}));

// Configure handlebars template engine
app.engine('hbs', hbs.engine({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers,
}));
app.set('view engine', 'hbs');
app.set('views', `${__dirname}/views`);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'users')));

// Handle data of form submission
app.use(express.urlencoded({ extended: false }));

// Read request of body as json format
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// CSRF
// if (process.env.NODE_ENV === 'production') {
//   app.use(csrf({ cookie: true }));
// }

// Session
app.use(session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false, // Avoid create new session every request
  saveUninitialized: true, // Save a new session if it has not yet been assigned an ID
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hours
    // secure: true, // For HTTPS using
  }
}));

// Flash message
app.use(flash());

// Always run middleware first
app.use((req, res, next) => {

  // Convert cookie's expire time to Jakarta Time
  req.session.cookie._expires = new Date(req.session.cookie._expires)
    .toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

  // Store src's folder path in req.vars.root to re-use later
  req.vars = { root: __dirname };

  next();
});

// Routes
app.use('/', viewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

app.use('/test', testRoutes);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// EXPORT
module.exports = app;