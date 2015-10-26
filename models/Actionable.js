"use strict";
// Base Model
const
  _        = require('lodash'),
  Base     = require('./Base'),
  Comment  = require('./Comment'),
  Utils    = require('../utils'),
  ObjectID = require('mongodb').ObjectID;

class Actionable extends Base {
  constructor(name) {
    super(name);

    this.comments = {
      type: [Comment]
    };

  }
  get DTO () {

    return Object.assign(this._values, {
      type: 'Actionable',
      id: this.id,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      flags: this.flags,
      score: this.tallyVotes(),
      comments: this.comments.DTO
    })
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
