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

    this.comments = [Comment];

  }

  addComment (author, message, callback) {
    try {
      this.comments.push(Comment.create({
        author,
        message: Utils.xss(message)
      }));
      this.save((i)=>callback(null, i));
    } catch (e) {
      Utils.Log.error(e);
      callback(e, null);
    }
  }

}

module.exports = Actionable;
