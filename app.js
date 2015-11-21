// Main Modules
const
  bodyParser = require('body-parser'),
  compression = require('compression'),
  timeout = require('connect-timeout'),
  cookieParser = require('cookie-parser'),
  express = require('express'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  path = require('path'),
  stormpath = require('express-stormpath');

// App Modules
const
  Utils = require('./utils'),
  app   = express(),
  api   = require('./routes/api'),
  index = require('./routes/index'),
  scrape = require('./routes/scrape');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(timeout('15s'));

app.use(Utils.Middlewares.timeOut());


app.use(stormpath.init(app, {
  website: true,
  expand: {
    customData: true,
    groups: true
  }
}));

//mongoose.set('debug', true);

var deepPopulate = require('mongoose-deep-populate')(mongoose);


mongoose.connect(
  'mongodb://' +
  process.env.MONGO_USER + ':' +
  process.env.MONGO_PASSWORD + '@' +
  process.env.MONGO_URL
)

app.use(compression({level:7}));
app.set('views', path.join(__dirname, 'node_modules/@mattmcfarland/tw-client/views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null ) {
    res.redirect(301, 'https://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();
  }
});

app.use (function (req, res, next) {
  if (req.secure) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    if (app.get('env') === 'development') {
      next ();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  }
});

app.use(express.static(path.join(__dirname, 'node_modules/@mattmcfarland/tw-client/public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/@mattmcfarland/tw-client/dist/js')));
app.use('/style', express.static(path.join(__dirname, 'node_modules/@mattmcfarland/tw-client/dist/style')));

app.use('/', index);

app.use('/api', api);
app.use('/_api/scrape', scrape);
/*
app.use(usergroup);

app.use('/api', api.root);
app.use('/api/scrape', api.scrape);
app.use('/api/tags', api.tags);
app.use('/api/comment', api.comment);
app.use('/api/tutorialRequests', api.tutorialRequests);
app.use('/api/tutorialRequest', api.tutorialRequest);
app.use('/api/tutorialSolution', api.tutorialSolution);
*/

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  err.request = {
    body: req.body || {},
    params: req.params || {}
  };
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {

    console.log(err);
    res.status(err.status || 500);
    res.send("error", {
      status: err.status || 500,
      request: {
        body: req.body || {},
        params: req.params || {}
      },
      message: err.message,
      error: err
    });

  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {

  res.status(err.status || 500);
  res.send("error", {
    status: err.status || 500,
    error: {}
  });
});


module.exports = app;
