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
    Utils.API.getById(model, req, res));

  api.post(path, (req, res) =>
    Utils.API.create(model, req, res));

  api.put(path + '/:id', (req, res) =>
    Utils.API.update(model, req, res));

  api.put(path + '/:id/flag', (req, res) =>
    Utils.API.flag(model, req, res));

  api.put(path + '/:id/vote', (req, res) =>
    Utils.API.vote(model, req, res));

  api.put(path + '/:id/comment', (req, res) =>
    Utils.API.comment(model, req, res));

  api.delete(path + '/:id', (req, res) =>
    Utils.API.delete(model, req, res));
}

createEndpoints('/tutorial-requests', TutorialRequest);
createEndpoints('/tutorial-solutions', TutorialSolution);
createEndpoints('/comments', Comment);

module.exports = api;
