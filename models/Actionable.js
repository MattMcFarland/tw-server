"use strict";
// Base Model
const
  _        = require('lodash'),
  Base     = require('./Base'),
  Comment  = require('./Comment'),
  Utils    = require('../utils');

class Actionable extends Base {
  constructor(name) {
    super(name);

    this.comments = {
      type: [Comment]
    };

  }

  addComment (author, message) {
    return new Promise((resolve, reject) => {
      Comment.create({
        author,
        message: Utils.xss(message)
      }).save().then((comment) => {
        this.comments.push(comment);
        this.save()
          .then(() => resolve(comment))
          .catch((e) => reject(e))
      }).catch((e) => reject(e))
    });
  }

}

module.exports = Actionable;
