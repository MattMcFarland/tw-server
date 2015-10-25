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

    var mecomments = this._values.comments.map((com) => {
      if (com.DTO) {
        return com.DTO;
      } else {
        console.log('yarr me comment', com);
        return Comment.loadOne({_id: com})
      }
    });
    console.log('yar');
    return Promise.all(mecomments).then((tharBeTheComments) => {
      console.log('promise complete ????', tharBeTheComments);
      return Object.assign(this._values, {
        populated: true,
        id: this.id,
        authorName: this.authorName,
        authorUrl: this.authorUrl,
        editorName: this.editorName,
        editorUrl: this.editorUrl,
        flags: this.flags,
        score: this.tallyVotes(),
        comments: tharBeTheComments
      })
    });

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
