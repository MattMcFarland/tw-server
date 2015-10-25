"use strict";

const Base = require('./Base');

class Comment extends Base {
  constructor() {
    super('comments');
    this.message = String;
    this.comments = [Comment];
  }
  edit (editor, data) {
    return new Promise((resolve, reject) => {
      this.editor = editor;
      this.updated_at = Date.now();
      this.message = data.message;
      this.save()
        .then(comment => resolve(comment))
        .catch((e) => reject(e))
    });
  }
}

module.exports = Comment;
