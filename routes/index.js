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
    user: req.user ? JSON.stringify(req.user) : '',
    title: 'Tutorials Wanted!',
    content: 'Find, submit and request tutorials here',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png"
  });
});

router.get('/category/:category_name', function(req, res) {
  res.render('script', {
    js_id:'index',
    js: 'index',
    title: 'Tutorials about ' + req.params.category_name,
    content: 'Find, submit, and request tutorials about ' + req.params.category_name,
    user: req.user ? JSON.stringify(req.user) : '',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png"
  });
});


router.get('/tutorial-request', function(req, res) {
  res.render('script', {
    js_id:'requestform',
    js: 'requestform',
    title: 'Request a tutorial',
    content: 'What kind of tutorial are you looking for? fill out the form and get help',
    user: req.user ? JSON.stringify(req.user) : '',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png"
  });
});

router.get('/tutorial-request/:permalink', (req, res, next) =>
    Utils.API.getByPermalink(TutorialRequest, req, res, next)
);


router.get('/account', (req, res, next) => {
  res.render('script', {
    js_id: 'account',
    js: 'account',
    title: 'Account',
    user: req.user ? JSON.stringify(req.user) : ''
  });
})


router.get('/users/dummy', (req, res, next) => {
  res.render('script', {
    js_id: 'profile',
    js: 'profile',
    title: 'Profile',
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
          json: JSON.stringify(data.body),
          url: "https://wanted-tuts.com/" + req.path,
          thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png"
        })
      }
    });
});


router.get('/about', (req, res, next) => {
  res.render('page-about', {
    js_id:'page',
    js: 'page',
    user: req.user ? JSON.stringify(req.user) : '',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png",
    title: 'About wanted-tuts.com',
    content: "It's the about us page"
  })
});

router.get('/terms-of-use', (req, res, next) => {
  res.render('page-tou', {
    js_id:'page',
    js: 'page',
    user: req.user ? JSON.stringify(req.user) : '',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png",
    title: 'WANTED-TUTS: Terms of Use',
    content: "It's the Terms of use page!"
  })
});

router.get('/privacy', (req, res, next) => {
  res.render('page-privacy', {
    js_id:'page',
    js: 'page',
    user: req.user ? JSON.stringify(req.user) : '',
    url: "https://wanted-tuts.com/" + req.path,
    thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png",
    title: 'WANTED-TUTS: Privacy Policy',
    content: "It's the Privacy Policy Page"
  })
});


router.use((req, res, next) => {
  if (req.payload) {
    res.render('script', {
      js_id:'requestview',
      js: 'requestview',
      user: req.user ? JSON.stringify(req.user) : '',
      json: JSON.stringify(req.payload),
      data: req.payload,
      title: req.payload.title,
      content: req.payload.content,
      url: "https://wanted-tuts.com/" + req.path,
      thumbnail: "https://wanted-tuts.com/img/wt-logo-2.png"
    });
  } else {
    next();
  }
})

module.exports = router;
