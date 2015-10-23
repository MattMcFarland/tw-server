// Main Modules
const
  bodyParser = require('body-parser'),
  compression = require('compression'),
  cookieParser = require('cookie-parser'),
  express = require('express'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  camo = require('camo'),
  path = require('path'),
  stormpath = require('express-stormpath'),
  Dog = require('./models/Dog');

// App Modules
const
  app   = express(),
  api   = require('./routes/api'),
  index = require('./routes/index');

app.use(stormpath.init(app, {
  application: "https://api.stormpath.com/v1/applications/5Bi5Y8savIbPgT8JX8nYwO",
  secretKey: "UB@(KAKn[}%}+2TM8^9e+miEFG|@2bVAmAJf#HP-",
  expandCustomData: true,
  expandGroups: true
}));

camo.connect(
  'mongodb://' +
  process.env.MONGO_USER + ':' +
  process.env.MONGO_PASSWORD + '@' +
  process.env.MONGO_URL
).then((db) => {
    app.set('db', db);
    console.log('Connected to database...');
});

app.use(compression({level:9}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/@mattmcfarland/tw-client/dist')));

app.use('/', index);
app.use('/api', api);
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
