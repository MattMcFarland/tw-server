var router = require('express').Router();
var TutorialRequest = require('../models/TutorialRequest');
var Utils = require('../utils');
var request = require('superagent');
var MW = Utils.Middlewares;


//router.use(MW.fauxUser(2));

router.get('/', function(req, res) {
  res.render('script', {
    js_id:'index',
    js: 'index',
    user: req.user ? JSON.stringify(req.user) : ''
  });
});

router.get('/category/:category_name', function(req, res) {
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


router.get('/account', (req, res, next) => {
  res.render('script', {
    js_id: 'account',
    js: 'account',
    user: req.user ? JSON.stringify(req.user) : ''
  });
})


router.get('/users/dummy', (req, res, next) => {
  res.render('script', {
    js_id: 'profile',
    js: 'profile',
    user: req.user ? JSON.stringify(req.user) : '',
    json: JSON.stringify({fullName: 'Dummy Profile Page (Fake User)'})
  })
});

router.get('/users/:id', (req, res, next) => {

  request.get('https://api.stormpath.com/v1/accounts/' + req.params.id)
    .set('Accept', 'application/json')
    .query({expand: 'groups,customData'})
    .auth(process.env.STORMPATH_API_KEY_ID, process.env.STORMPATH_API_KEY_SECRET)
    .end((err, data) => {
      console.log('END', err, data);
      if (err) {
        Utils.Log.error('error ocurred hitting stormpath', err)
        next(err)
      } else {
        res.render('script', {
          js_id: 'profile',
          js: 'profile',
          user: req.user ? JSON.stringify(req.user) : '',
          json: JSON.stringify(data.body)
        })
      }
    });
});




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
