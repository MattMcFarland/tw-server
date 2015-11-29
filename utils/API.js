"use strict";

const
  _ = require('lodash'),
  Utils = require('./index'),
  Tag = require('../models/Tag');

exports.getAll = (M, req, res, next) => {
  var limit = req.query.limit || 10;
  var page = req.query.page || 1;
  var sortObj = req.query.sortBy === "score" ? {score: -1} : {created_at: -1}
  var skip = (page - 1) * limit;
  var filterBy = req.query.filterBy;
  var category = req.query.category;
  var getBest = function () { return obj.solutions.length > 0; }
  var getWanted = function () { return obj.solutions.length === 0; }
  var getApps = function () { return obj.category === "apps"; }
  var getGaming = function () { return obj.category === "gaming"; }
  var getGameDev = function () { return obj.category === "gamedev"; }
  var getWebDev = function () { return obj.category === "webdev"; }

  var query = {
    removed: { $ne: true }
  }
  if (req.query.showpositive) {
    query.score = { $gt: 0 };
  }
  if (req.query.filterBy !== "latest" && req.query.category === "all") {
    query.$where = filterBy === "best" ? getBest: filterBy === "wanted" ? getWanted : null;

  } else if (req.query.filterBy === "latest" && req.query.category !== "all") {
    query.$where = category === "apps" ? getApps :
      category === "gaming" ? getGaming :
        category === "gamedev" ? getGameDev :
          category === "webdev" ? getWebDev : null;

  } else if (req.query.filterBy !== "latest" && req.query.category !== "all") {
    query.$and = [
      {
        $where: filterBy === "best" ? getBest : filterBy === "wanted" ? getWanted : null
      },
      {
        $where: category === "apps" ? getApps :
          category === "gaming" ? getGaming :
            category === "gamedev" ? getGameDev :
              category === "webdev" ? getWebDev : null
      }
    ]
  }

  console.log(query);

  return M.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .populate('tags')
    .populate('solutions')
    .populate('comments')
    .exec((err, data) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        req.payload = data.map(m => m.DTO(req.user));
        next();
      }
    })
};
exports.getById = (M, req, res, next, Comment) => {
  return M.findOne({_id: req.params.id})
    .populate('comments')
    .populate('solutions')
    .populate('tags')
    .exec((err, model) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else if (model) {
        req.payload = model.DTO(req.user);
        next();
      } else {
        next();
      }
    })
};
exports.addToDB = (M, req, res, next) => {

  // DRY error handler
  var abort = (e) => {
    Utils.Log.error(e);
    next(Utils.error.badRequest(e))
  }

  var create = (data) => {
      //console.log('creating new data', data);
      M.create(data, (err, nd) => {
        if (err) {
          abort(err);
        } else {
          req.payload = nd.DTO(req.user);
          req.action = "createNew" + req.payload.type;
          req.target = req.payload.id;
          req.actionurl = "/tutorial-request/" + req.payload.permalink;
          next();
        }
      })
  };
  if (req.body.content) {
    req.body.content = Utils.xss(req.body.content);
  }
  if (req.body.title) {
    req.body.title = Utils.xss(req.body.title);
    Utils.createPermalink(M, req.body.title)
      .then((permalink) => {

        if (req.body.tags) {
          req.body.tags = Utils.xss(req.body.tags);
          Utils.createOrEditTags(req.body.tags).then((tags) => {
            req.body.tags = [].concat(tags);
            return create(Object.assign(
              req.body,
              {
                author: req.user,
                permalink
              }
            ));
          }).catch(abort)

        } else {
          return create(Object.assign(
            req.body,
            {
              author: req.user,
              permalink
            }
          ));
        }

      }).catch(abort)

  } else {
    return create(req.body);
  }
};
exports.update = (M, req, res, next) => {
  console.log('[update] [1] perform update >>>', req.params.id);

  var abort = (e) => {
    Utils.Log.error(e);
    next(Utils.error.badRequest(e))
  }

  return M.findById(req.params.id).populate('tags')
    .exec((err, doc) => {

      console.log('[update] [2] doc found >>>', doc.id);
      var doUpdate = (data) => {
        console.log('[update] [4] run edit method ');
        //console.log('updating data', data);
        doc.edit(data).then((nd) => {
          console.log('[update] [5] edit method complete ');
          req.payload = nd.DTO(req.user);
          req.action = "update" + req.payload.type;
          req.target = req.payload.id;
          if (req.payload.type === "TutorialRequest") {
            req.actionurl = req.body.rootUrl
          } else {
            req.actionurl = req.body.rootUrl + '#' + req.payload.type.toLowerCase() + '-' + req.target
          }

          next();
        })
      };

      if (err) {
        abort(err);
      } else if (doc) {
        if (req.body.formData.tags) {

          Utils.createOrEditTags(req.body.formData.tags).then((tags) => {
            req.body.formData.tags = [].concat(tags);
            return doUpdate(Object.assign(
              req.body.formData,
              {
                editor: req.user
              }
            ));
          }).catch(abort)

        } else {
          console.log('[update] [3] update body >>>', req.body.formData);
          return doUpdate(Object.assign(
            req.body.formData,
            {
              editor: req.user
            }
          ));
        }
      } else {
        next();
      }
    })
};
exports.flag = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else if (doc) {
        doc.addOrRemoveFlag(req.user, req.body.flagType)
          .then(f => {
            req.payload = f;
            next();
          })
          .catch(e => next(Utils.error.badRequest(e)))
      } else {
        next();
      }
    })
};
exports.vote = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else if (doc) {
        doc.createOrUpdateVote(req.user, req.body.direction)
          .then(v => {
            //console.log('here be the v', v);
            req.payload = v;
            req.target = req.params.id;

            if (req.body.direction) {
              if (req.payload.userVote === 1 && req.body.direction === "up") {
                req.action = "voteUp"
              } else if (req.payload.userVote === 0 && req.body.direction === "up") {
                req.action = "undoVoteUp"
              } else if (req.payload.userVote === -1 && req.body.direction === "down") {
                req.action = "voteDown"
              } else if (req.payload.userVote === 0 && req.body.direction === "down") {
                req.action = "undoVoteDown"
              }
            }
            if (req.path.indexOf('request') > -1) {
              req.actionurl = req.body.rootUrl
            } else if (req.path.indexOf('solution') > -1) {
              req.actionurl = req.body.rootUrl + '#' + 'tutorialsolution-' + req.target
            } else if (req.path.indexOf('comment') > -1) {
              req.actionurl = req.body.rootUrl + '#' + 'comment-' + req.target
            }
            next();
          })
          .catch(e => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          })
      } else {
        next();
      }
    })
};

// TODO: Add exception handler if id is not found
exports.addComment = (M, req, res, next) => {
  if (!req.body.message) {
    Utils.Log.error('req.body.message is undefined');
    next(Utils.error.badRequest('req.body.message is undefined'))
  }
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        next(Utils.error.badRequest(err));
      } else if (doc) {
        doc.addComment(req.user, req.body.message)
          .then(doc => {
            req.payload = doc.DTO(req.user);

            if (req.path.indexOf('request') > -1) {
              req.action = "addCommentToTutorialRequest";
            } else if (req.path.indexOf('solution') > -1) {
              req.action = "addCommentToTutorialSolution";
            }
            req.target = req.params.id;
            if (req.payload.type === "TutorialRequest") {
              req.actionurl = req.body.rootUrl
            } else {
              req.actionurl = req.body.rootUrl + '#' + 'comment-' + req.target
            }
            next();
          })
          .catch(e => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          })
      } else {
        next();
      }
    })
};
exports.delete = (M, req, res, next) => {
    return M.findById(req.params.id)
      .exec((err, doc) => {
        if (err) {
          Utils.Log.error(err);
          Utils.error.badRequest(err);
        } else if (doc) {
          doc.removeOrUndoRemove(req.user, req.body.message)
            .then(doc => {
              req.payload = doc.DTO(req.user);
              next();
            })
            .catch(e => next(Utils.error.badRequest(e)))
        } else {
          next();
        }
      })

};
exports.addSolution = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else if (doc) {
        doc.addSolution(req.user, req.body.formData)
          .then(doc => {
            req.payload = doc.DTO(req.user);
            req.action = "addSolution";
            req.target = req.params.id;
            req.actionurl = req.body.rootUrl + '#' + 'tutorialsolution-' + req.target
            next();
          })
          .catch(e => next(Utils.error.badRequest(e)))
      } else {
        next();
      }
    })
};
exports.getByPermalink = (M, req, res, next) => {
  return M.findOne({permalink: req.params.permalink})
    .populate('tags')
    .populate('comments')
    .populate('solutions')
    .deepPopulate('solutions.comments')
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        if (doc && doc.DTO) {
          req.payload = doc.DTO(req.user);
          next();
        } else {
          next();
        }
      }
    })
};
exports.judgeTag = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else if (doc) {
        doc.approveOrDeny(req.user, req.body.decision)
          .then(v => {
            req.payload = v;
            next();
          })
          .catch(e => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          })
      } else {
        next();
      }
    })
};

