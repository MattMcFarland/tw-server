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
      name: this.name,
      author: this.author,
      editor: this.editor,
      is_pending: this.is_pending,
      is_approved: this.is_approved,
      removed: this.removed

    }
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
