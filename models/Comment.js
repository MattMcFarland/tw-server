"use strict";

const Base = require('./Base');

class Comment extends Base {
  constructor() {
    super('comments');
    this.message = String;
    this.comments = [Comment];
  }

  get DTO () {
    return Object.assign(this._values, {
      id: this.id,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      flags: this.flags,
      score: this.tallyVotes()
    })
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
