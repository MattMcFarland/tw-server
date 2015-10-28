"use strict";

const
  Document = require('camo').Document,
  Utils    = require('../utils');

class Tag extends Document {
  constructor() {
    super('tags');
    this.schema({
      times_used: { type: Number, default: 1},
      name: {type: String },
      last_used_date: { type: Date, default: Date.now },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      author: {type: Object },
      editor: {type: Object },
      is_pending: { type: Boolean, default: true },
      is_approved: { type: Boolean, default: false },
      removed: { type: Boolean, default: false }
    });
  }

  get DTO () {
    return {
      id: this.id,
      name: this.name,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      is_pending: this.is_pending,
      is_approved: this.is_approved,
      removed: this.removed
    }
  }
  get authorName () {
    if (!this.author) {
      return '';
    }
    return this.author.fullName;
  }

  get editorName () {
    if (!this.editor) {
      return '';
    }
    return this.editor.fullName;
  }

  get authorUrl () {
    if (!this.author) {
      return '';
    }
    return 'users/' + Utils.Users.getId(this.author);
  }

  get editorUrl () {
    if (!this.editor) {
      return '';
    }
    return 'users/' + Utils.Users.getId(this.editor);
  }
  approveOrDeny (decision) {
    return new Promise((resolve, reject) => {
      if (decision !== "deny" && decision !== "approve") {
        reject("invalid decision must be approve or deny");
      }
      if (this.is_pending) {
        this.is_pending = false;
        this.is_approved = (decision === "approve");
        this.save()
          .then((i) => {
            resolve({
              "is_approved": this.is_approved,
              "reason": "new"
            });
          }).catch((e) => reject(e));
      } else {
        resolve({
          "is_approved": this.is_approved,
          "reason": "not pending"
        })
      }
    })
  }


  edit (editor, data) {
    return new Promise((resolve, reject) => {
      this.editor = editor;
      this.updated_at = Date.now();
      this.name = data.name;
      this.save()
        .then(tag => resolve(tag))
        .catch((e) => reject(e))
    });
  }


  removeOrUndoRemove (editor) {
    return new Promise((resolve, reject) => {
      this.updated_at = Date.now();
      this.editor = editor;
      this.removed = !this.removed;
      this.save()
        .then((tag) => resolve(tag))
        .catch((e) => reject(e))
    });
  }

}

module.exports = Tag;
