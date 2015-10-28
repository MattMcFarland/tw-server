"use strict";

const
  Utils = require('./index'),
  ObjectID = require('mongodb').ObjectID;

exports.getAll = (M, res) => {
  return M.loadMany()
    .then((array) => res.json(array.map( m => m.DTO )))
    .catch((e) => Utils.Log.error(e));
};

exports.getById = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => res.json(m.DTO))
    .catch((e) => Utils.Log.error(e));
};

exports.addToDB = (M, req, res) => {
  var create = (data) => M.create(Object.assign(data, {author: req.user}))
      .save()
      .then(doc => res.json(doc.DTO))
      .catch(e => Utils.Log.error(e));

  if (req.body.title) {
    Utils.createPermalink(M, req.body.title)
      .then((permalink) => {
        return create(Object.assign(req.body, { permalink }));
      }).catch(e => Utils.Log.error(e));
  } else {
    return create(req.body);
  }
};

exports.update = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.edit(req.user, req.body)
        .then(doc => res.json(doc.DTO))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.flag = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.addOrRemoveFlag(req.user, req.body.flagType)
        .then(f => res.json(f))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.vote = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.createOrUpdateVote(req.user, req.body.direction)
        .then(v => res.json(v))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.addComment = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.addComment(req.user, req.body.message)
        .then(com => res.json(com.DTO))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.delete = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.removeOrUndoRemove(req.user)
        .then(doc => res.json(doc.dto))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.addSolution = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.addSolution(req.user, req.body)
        .then(com => res.json(com.DTO))
        .catch(e => res.json(e))
    }).catch(e => Utils.Log.error(e));
};

exports.getByPermalink = (M, req, res) => {
  return M.loadOne({permalink: req.body.permalink})
    .then((m) => res.json(m.DTO))
    .catch((e) => Utils.Log.error(e));
};
