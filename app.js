require('dotenv').config()

const createError = require('http-errors');
const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const logger = require('morgan');
const passport = require('passport');
const User = require('./models/user');
const seedPosts = require('./seeds');

seedPosts();

// Require routes
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const reviewsRouter = require('./routes/reviews');

const app = express();

//Open a connection to the database
mongoose.connect('mongodb://localhost:27017/surf-shop', {useNewUrlParser: true, useCreateIndex: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log(`we're connected!`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
// Set public assets directory
app.use(express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Configure passport and session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set local variable middleware
app.use(function(req,res,next) {
  req.user = {
    '_id' : '5d1d6f598d46a3339ce340c0',
    'username': 'pjoshi1591'
  }
  res.locals.currentUser = req.user;
  res.locals.title = 'Surf Shop';
  res.locals.success = req.session.success || '';
  delete req.session.success;
  res.locals.error = req.session.error || '';
  delete req.session.error;
  next();
});

// Mount routes
app.use('/', indexRouter);
app.use('/posts',postsRouter);
app.use('/posts/:id/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err);
  req.session.error = err.message
  res.redirect('back');
});


module.exports = app;
