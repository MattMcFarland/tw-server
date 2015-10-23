"use strict";

const
  Base     = require('./Base'),
  Utils    = require('../utils');

class Comment extends Base {
  constructor() {
    super('comments');
    this.message = String;
  }

  edit (editor, data, callback) {
    try {
      this.editor = editor;
      this.updated_at = Date.now;
      this.message = data.message;
      this.save().then((i) => callback(null, i));
    } catch (e) {
      Utils.Log.error(e);
      callback(e)
    }
  }

}

module.exports = Comment;
