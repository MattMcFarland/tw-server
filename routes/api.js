const
  api = require('express').Router(),
  TutorialRequest = require('../models/TutorialRequest'),
  TutorialSolution = require('../models/TutorialSolution'),
  Comment = require('../models/Comment'),
  Utils = require ('../utils');

function createEndpoints(path, model) {

  api.get(path, (req, res) =>
    Utils.API.getAll(model, res));

  api.get(path + '/:id', (req, res) =>
    Utils.API.getById(model, req, res, Comment));

  api.post(path,  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.addToDB(model, req, res));

  api.put(path + '/:id',  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.update(model, req, res));

  api.put(path + '/:id/flag',  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.flag(model, req, res));

  api.put(path + '/:id/vote',  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.vote(model, req, res));

  api.put(path + '/:id/comment',  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.addComment(model, req, res));

  api.delete(path + '/:id',  Utils.Middlewares.authenticate,  (req, res) =>
    Utils.API.delete(model, req, res));
}


createEndpoints('/tutorial-requests', TutorialRequest);
createEndpoints('/tutorial-solutions', TutorialSolution);
createEndpoints('/comments', Comment);


api.put('/tutorial-requests/:id/solution',
  Utils.Middlewares.authenticate, (req, res) =>
    Utils.API.addSolution(TutorialRequest, req, res)
);

api.get('/tutorial-requests/:permalink', (req, res) =>
    Utils.API.getByPermalink(TutorialRequest, req, res)
);


module.exports = api;
