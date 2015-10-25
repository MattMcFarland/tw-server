"use strict";

const
  Document = require('camo').Document,
  Utils    = require('../utils');

class Tag extends Document {
  constructor() {
    super('tags');
    this.schema({
      times_used: { type: Number},
      name: {type: String },
      last_used_date: String,
      created_at: { type: String, default: Date.now },
      updated_at: { type: String, default: Date.now },
      author: {type: Object },
      editor: {type: Object },
      is_pending: { type: Boolean, default: true },
      is_approved: { type: Boolean, default: false },
      removed: { type: Boolean, default: false }
    });
  }

  approve (editor) {
    return new Promise((resolve, reject) => {
      this.updated_at = Date.now();
      this.editor = editor;
      this.is_pending = false;
      this.is_approved = true;
      this.save()
        .then((tag) => resolve(tag))
        .catch((e) => reject(e))
    });
  }

  deny (editor) {
    return new Promise((resolve, reject) => {
      this.updated_at = Date.now();
      this.editor = editor;
      this.is_pending = false;
      this.is_approved = false;
      this.save()
        .then((tag) => resolve(tag))
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
