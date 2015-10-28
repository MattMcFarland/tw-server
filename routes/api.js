const
  api = require('express').Router(),
  TutorialRequest = require('../models/TutorialRequest'),
  TutorialSolution = require('../models/TutorialSolution'),
  Comment = require('../models/Comment'),
  Utils = require ('../utils'),
  MW = Utils.Middlewares;

function createEndpoints(path, model) {

  api.get(path, (req, res, next) =>
    Utils.API.getAll(model, res, next));

  api.get(path + '/:id', (req, res, next) =>
    Utils.API.getById(model, req, res, next, Comment));

  api.post(path, MW.fauxUser(5), MW.authenticate(1),  (req, res, next) =>
    Utils.API.addToDB(model, req, res, next));

  api.put(path + '/:id',  MW.fauxUser(5), MW.authenticate(2, model),  (req, res, next) =>
    Utils.API.update(model, req, res, next));

  api.put(path + '/:id/flag',  MW.fauxUser(5), MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.flag(model, req, res, next));

  api.put(path + '/:id/vote',  MW.fauxUser(5), MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.vote(model, req, res, next));

  api.put(path + '/:id/comment',  MW.fauxUser(5), MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.addComment(model, req, res, next));

  api.delete(path + '/:id',  MW.fauxUser(5), MW.authenticate(2, model),  (req, res, next) =>
    Utils.API.delete(model, req, res, next));
}


createEndpoints('/tutorial-requests', TutorialRequest);
createEndpoints('/tutorial-solutions', TutorialSolution);
createEndpoints('/comments', Comment);


api.put('/tutorial-requests/:id/solution',
  MW.fauxUser(5), MW.authenticate(1), (req, res, next) =>
    Utils.API.addSolution(TutorialRequest, req, res, next)
);

api.get('/tutorial-requests/:permalink', (req, res, next) =>
    Utils.API.getByPermalink(TutorialRequest, req, res, next)
);


api.use((err, req, res, next) => {
  var data;
  if (err.status) {
    data = Object.assign(err, {
      method: req.method,
      url: req.protocol + '://' + req.get('host') + req.originalUrl,
      request: {
        body: req.body || {},
        params: req.params || {} }
    });
    res.status(err.status).json(data);
  } else {
    next();
  }

});

module.exports = api;
