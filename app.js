var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);

var publicRoutes = require('./routes/index');
var listings = require('./routes/listings');
var auth = require('./routes/auth');
var privateRoutes = require('./routes/privateRoutes');

var CONFIG = require('./config');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.locals.pretty = true;

app.use(expressSession({
  secret: CONFIG.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ url: CONFIG.DB.URL })
}));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make the user session variable available to all templates
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  res.locals.localMode = CONFIG.USE_LOCAL_ASSETS;
  next();
});

app.use('/', publicRoutes);
app.use('/', auth);
app.use('/api/listings', listings);
app.use('/', privateRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
