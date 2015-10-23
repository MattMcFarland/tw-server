const
  api = require('express').Router(),
  TutorialRequest = require('../models/TutorialRequest'),
  Dog = require('../models/Dog'),
  Utils = require ('../utils');



api.get('/tutorial-requests', function(req, res) {
  TutorialRequest.loadMany()
    .then((tr) => {
      res.json(tr);
    })
    .catch((e) => Utils.Log.error(e));
});

api.get('/tutorial-requests/:id', function(req, res) {
  TutorialRequest.loadOne({id: req.params.id })
    .then((tr) => {
      res.json(tr);
    })
    .catch((e) => Utils.Log.error(e));
});

api.post('/tutorial-requests', function(req, res) {
  TutorialRequest.create(req.body)
    .save()
    .then((t) => {res.json(t)})
    .catch((e) => Utils.Log.error(e));
});

api.put('/tutorial-requests/:id', function(req, res) {
  TutorialRequest.loadOneAndUpdate({id: req.params.id}, req.body).save().then((tr) => { res.json(tr) });
});







api.get('/dogs', function(req, res) {
  Dog.loadMany().then((tr) => {
    res.json(tr);
  });
});

api.post('/dogs', function (req, res) {
  var lassie = Dog.create({
    name: req.body.name,
    breed: req.body.breed
  });

  lassie.save().then(function(l) {
    res.json(l);
  });
});
module.exports = api;
