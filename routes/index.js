var router = require('express').Router();

router.get('/', function(req, res) {
  res.render('script', { js_id:'index', js: 'index', user: req.user ? (req.user) : '' });
});

router.get('/tutorial-request', function(req, res) {
  res.render('script', { js_id:'requestform', js: 'requestform', user: req.user ? (req.user) : '' });
});

router.get('/tutorial-request/:permalink', function(req, res) {
  res.render('script', { js_id:'requestview', js: 'requestview', user: req.user ? (req.user) : '' });
});


module.exports = router;
