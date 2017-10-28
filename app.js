const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const engine = require('consolidate');
const index = require('./routes/index');
const privacy = require('./routes/privacy');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const morgan = require('morgan');
const session = require('express-session');

// Dependencies for authentication and authorization
const passport = require('passport');

const configDB = require('./config/database');
require('dotenv').config();     // Get ENV variables
const app = express();

// configuration of MongoDB
mongoose.connect(configDB.uri, { useMongoClient: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
  console.log('Connection with database succeeded');
});

app.use(morgan('dev'));         // logger
app.use(cookieParser());        // read cookies (neede for auth)

// Using passport configuration
require('./config/passport')(passport);

// Change view engine to nunjucks with consolidate
app.engine('html', engine.nunjucks);

// view engine setup
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join('dist')));
app.use(session({ secret: process.env.SECRET }));
app.use(passport.initialize());
app.use(passport.session());    // persistent login sessions
app.use(flash());

require('./routes/passport.js')(app, passport);
app.use('/', index);
app.use('/', privacy);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
