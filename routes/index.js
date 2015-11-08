var router = require('express').Router();
var TutorialRequest = require('../models/TutorialRequest');
var Utils = require('../utils');
var MW = Utils.Middlewares;
//router.use(MW.fauxUser(2));

router.get('/', function(req, res) {
  res.render('script', {
    js_id:'index',
    js: 'index',
    user: req.user ? JSON.stringify(req.user) : ''
  });
});

router.get('/tutorial-request', function(req, res) {
  res.render('script', {
    js_id:'requestform',
    js: 'requestform',
    user: req.user ? JSON.stringify(req.user) : ''
  });
});

router.get('/tutorial-request/:permalink', (req, res, next) =>
    Utils.API.getByPermalink(TutorialRequest, req, res, next)
);

router.use((req, res, next) => {
  if (req.payload) {
    res.render('script', {
      js_id:'requestview',
      js: 'requestview',
      user: req.user ? JSON.stringify(req.user) : '',
      json: JSON.stringify(req.payload)
    });
  } else {
    next();
  }
})

module.exports = router;
