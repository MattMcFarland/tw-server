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
  var
    create = (data) => M.create(data)
    .save()
    .then((t) => {res.json(t.DTO)})
    .catch((e) => Utils.Log.error(e));

  if (req.body.title) {
    Utils.createPermalink(M, req.body.title, (err, res) => {
      if (err) {
        Utils.Log.error(err);
      } else {
        return create(Object.assign(req.body, {permalink: res}));
      }
    });
  } else {
    return create(req.body);
  }
};

exports.update = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.edit(req.user, req.body, (err, dto) => {
        if (err) {
          Utils.Log.error(err);
          return;
        }
        res.json(dto);
      })
    })
    .catch((e) => Utils.Log.error(e));
};

exports.flag = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.addOrRemoveFlag(req.user, req.body.flagType, (err, dto) => {
        if (err) {
          Utils.Log.error(err);
          return;
        }
        res.json(dto);
      })
    })
    .catch((e) => Utils.Log.error(e));
};

exports.vote = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.createOrUpdateVote(req.user, req.body.direction, (err, dto) => {
        if (err) {
          Utils.Log.error(err);
          return;
        }
        res.json(dto);
      })
    })
    .catch((e) => Utils.Log.error(e));
};

exports.comment = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.addComment(req.user, req.body.message, (err, dto) => {
        if (err) {
          Utils.Log.error(err);
          return;
        }
        res.json(dto);
      })
    })
    .catch((e) => Utils.Log.error(e));
};

exports.delete = (M, req, res) => {
  return M.loadOne({_id: ObjectID(req.params.id)})
    .then((m) => {
      m.removeOrUndoRemove(req.user, (err, dto) => {
        if (err) {
          Utils.Log.error(err);
          return;
        }
        res.json(dto);
      })
    })
    .catch((e) => Utils.Log.error(e));
};

