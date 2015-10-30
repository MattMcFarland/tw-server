const
  api = require('express').Router(),
  Tag = require('../models/Tag'),
  TutorialRequest = require('../models/TutorialRequest'),
  TutorialSolution = require('../models/TutorialSolution'),
  Comment = require('../models/Comment'),
  Utils = require ('../utils'),
  MW = Utils.Middlewares;

function createEndpoints(path, model) {

  api.get(path, (req, res, next) =>
    Utils.API.getAll(model, req, res, next));

  api.get(path + '/:id', (req, res, next) =>
    Utils.API.getById(model, req, res, next, Comment));

  api.post(path, MW.authenticate(1),  (req, res, next) =>
    Utils.API.addToDB(model, req, res, next));

  api.put(path + '/:id', MW.authenticate(2, model),  (req, res, next) =>
    Utils.API.update(model, req, res, next));

  api.put(path + '/:id/flag', MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.flag(model, req, res, next));

  api.put(path + '/:id/vote', MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.vote(model, req, res, next));

  api.put(path + '/:id/comment', MW.authenticate(1, model),  (req, res, next) =>
    Utils.API.addComment(model, req, res, next));

  api.delete(path + '/:id', MW.authenticate(2, model),  (req, res, next) =>
    Utils.API.delete(model, req, res, next));
}

/** Add or remove faux user here */
api.use(MW.fauxUser(2));

createEndpoints('/tutorial-requests', TutorialRequest);
createEndpoints('/tutorial-solutions', TutorialSolution);
createEndpoints('/comments', Comment);





api.put('/tutorial-requests/:id/solution',
 MW.authenticate(1, TutorialRequest), (req, res, next) =>
    Utils.API.addSolution(TutorialRequest, req, res, next)
);

api.get('/tutorial-requests/permalink/:permalink', (req, res, next) =>
    Utils.API.getByPermalink(TutorialRequest, req, res, next)
);

api.get('/tags/:id', (req, res, next) =>
    Utils.API.getById(Tag, req, res, next)
);

api.put('/tags/:id',
  MW.authenticate(2, Tag), (req, res, next) =>
    Utils.API.update(Tag, req, res, next)
);

api.delete('/tags/:id',
  MW.authenticate(2, Tag), (req, res, next) =>
    Utils.API.delete(Tag, req, res, next)
);

api.put('/tags/:id/judge',
  MW.authenticate(2, Tag, false), (req, res, next) =>
    Utils.API.judgeTag(Tag, req, res, next)
);



api.use((req, res, next) => {
  if (req.payload) {
    res.json(req.payload);
  } else {
    next();
  }
})

module.exports = api;
