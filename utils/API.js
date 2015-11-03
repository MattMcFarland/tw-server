"use strict";

const
  _ = require('lodash'),
  Utils = require('./index'),
  Tag = require('../models/Tag');

exports.getAll = (M, req, res, next) => {
  var limit = req.query.limit || 10;
  var page = req.query.page || 1;
  var skip = (page - 1) * limit
  var query = {
    removed: { $ne: true }
  }
  if (req.query.showpositive) {
    query.score = { $gt: 0 }
  }
  if (req.query.$where) {
    query.$where = req.query.$where
  }

  return M.find(query)
    .skip(skip)
    .limit(limit)
    .sort({created_at: -1})
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
      } else {
        req.payload = model.DTO(req.user);
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
      console.log('creating new data', data);
      M.create(data, (err, nd) => {
        if (err) {
          abort(err);
        } else {
          req.payload = nd.DTO(req.user);
          next();
        }
      })
  };

  if (req.body.title) {
    Utils.createPermalink(M, req.body.title)
      .then((permalink) => {

        if (req.body.tags) {

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

  var abort = (e) => {
    Utils.Log.error(e);
    next(Utils.error.badRequest(e))
  }

  return M.findById(req.params.id).populate('tags')
    .exec((err, doc) => {

      var doUpdate = (data) => {
        console.log('updating data', data);
        doc.edit(data).then((nd) => {
          req.payload = nd.DTO(req.user);
          next();
        })
      };

      if (err) {
        abort(err);
      } else {
        if (req.body.tags) {

          Utils.createOrEditTags(req.body.tags).then((tags) => {
            req.body.tags = [].concat(tags);
            return doUpdate(Object.assign(
              req.body,
              {
                editor: req.user
              }
            ));
          }).catch(abort)

        } else {
          return doUpdate(Object.assign(
            req.body,
            {
              editor: req.user
            }
          ));
        }
      }
    })
};

exports.flag = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        doc.addOrRemoveFlag(req.user, req.body.flagType)
          .then(f => {
            req.payload = f;
            next();
          })
          .catch(e => next(Utils.error.badRequest(e)))
      }
    })
};

exports.vote = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        doc.createOrUpdateVote(req.user, req.body.direction)
          .then(v => {
            console.log('here be the v', v);
            req.payload = v;
            next();
          })
          .catch(e => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          })
      }
    })
};

exports.addComment = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        doc.addComment(req.user, req.body.message)
          .then(doc => {
            req.payload = doc.DTO(req.user);
            next();
          })
          .catch(e => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          })
      }
    })
};

exports.delete = (M, req, res, next) => {
    return M.findById(req.params.id)
      .exec((err, doc) => {
        if (err) {
          Utils.Log.error(err);
          Utils.error.badRequest(err);
        } else {
          doc.removeOrUndoRemove(req.user, req.body.message)
            .then(doc => {
              req.payload = doc.DTO(req.user);
              next();
            })
            .catch(e => next(Utils.error.badRequest(e)))
        }
      })

};

exports.addSolution = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        doc.addSolution(req.user, req.body)
          .then(doc => {
            req.payload = doc.DTO(req.user);
            next();
          })
          .catch(e => next(Utils.error.badRequest(e)))
      }
    })
};

exports.getByPermalink = (M, req, res, next) => {
  return M.findOne({permalink: req.params.permalink})
    .populate('tags')
    .populate('comments')
    .populate('solutions')
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        req.payload = doc.DTO(req.user);
        next();
      }
    })
};


exports.judgeTag = (M, req, res, next) => {
  return M.findById(req.params.id)
    .exec((err, doc) => {
      if (err) {
        Utils.Log.error(err);
        Utils.error.badRequest(err);
      } else {
        doc.approveOrDeny(req.user, req.body.decision)
          .then(v => {
            req.payload = v;
            next();
          })
          .catch(e => next(Utils.error.badRequest(e)))
      }
    })
};
