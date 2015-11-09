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
// api.use(MW.fauxUser(2));

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



api.post('/account',
  MW.authenticate(1), (req, res, next) => {
    req.user.givenName = req.body.givenName;
    req.user.surname = req.body.surname;
    req.user.email = req.body.email;

    req.user.save();
    req.payload = ({
      givenName: req.user.givenName,
      surname: req.user.surname,
      email: req.user.email
    });

  }
);


// append to user history

api.use((req, res, next) => {
  var extras = {};
  if (req.method !== "GET" && req.method !== "DELETE") {
    if (req.payload && req.user) {
      var addToArray = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        action: req.action,
        target: req.target,
        url: req.actionurl
      }
      if (!req.user.customData.history) {
        req.user.customData.history = [].push(addToArray);
      } else {
        req.user.customData.history.push(addToArray);
      }

      req.user.save((err, data) => {
        if (err) {
          Utils.Log.error(err);
          next();
        }
        next();
      });
    } else {
      next();
    }
  } else {
    next();
  }
})

// send payload to client
api.use((req, res, next) => {
  if (req.payload) {
    res.json(req.payload);
  } else {
    next();
  }
})

module.exports = api;
